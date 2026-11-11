import { Injectable, Logger } from '@nestjs/common';
import { AudienceType, Promotion, SubscriptionStatus } from '@prisma/client';
import { MessageTemplatesService } from '../commerce/message-templates.service';
import {
  isProductionAppEnv,
  isRecipientAllowed,
  messagingAllowlist,
} from '../common/app-environment';
import { PrismaService } from '../prisma/prisma.service';
import { normalizePhoneForSms } from './phone-normalize';
import {
  isAmendmentPublication,
  isOfficialProcedureStartAnnouncement,
  shortenAlertTitle,
} from '../common/promotion-content-filters';
import { resolvePublicSiteUrl } from '../common/public-site-url';
import { collectAdminEmails } from './admin-emails';
import {
  calendarDaysUntil,
  madridYmd,
  PRO_NOTIFY_SOURCE_KIND,
  type ProNotifyKind,
} from './pro-notify.util';
import { buildProNotifyCopy } from './pro-notify-copy';
import {
  displayNameOrEmpty,
  fitSmsContent,
  formatLocation,
  formatMadridDate,
  hasIncompleteRender,
  renderTemplate,
} from './message-vars';
import { prepareSms, type PreparedSms } from './sms-content';
import { promotionSmsLink, smsLink } from './short-link';
import { MESSAGE_TEMPLATE_SEEDS } from '../commerce/message-templates.defaults';
/** SMS PRO: mismos avisos que el email (si el usuario tiene SMS activado y móvil válido). */
const PRO_SMS_KINDS = new Set<ProNotifyKind>([
  'new_alert',
  'reminder_7d',
  'reminder_1d',
  'new_publication',
]);

export function describeProNotifyKind(kind: string): string {
  switch (kind) {
    case 'new_publication':
      return 'Publicación oficial: el Registre publicó un "Anunci d\'inici de procediment" y se avisa a todos los PRO verificados (email + SMS si lo tienen activado).';
    case 'new_alert':
      return 'Anuncio previo: el Registre publicó una "ALERTA: Propera adjudicació" y se avisa a todos los PRO verificados.';
    case 'reminder_7d':
      return 'Recordatorio D-7: faltan 7 días para la fecha estimada; a todos los usuarios PRO.';
    case 'reminder_1d':
      return 'Recordatorio D-1: mañana es la fecha estimada; a todos los usuarios PRO.';
    default:
      return '';
  }
}

export function describeProNotifyTrigger(trigger: string | undefined): string {
  switch (trigger) {
    case 'registre_scraper':
      return 'Automático: la revisión periódica del Registre detectó una entrada nueva.';
    case 'admin_create_promotion':
      return 'Manual: un admin creó la promoción en el backoffice.';
    case 'admin_status_change':
      return 'Manual: un admin cambió el estado de la promoción en el backoffice.';
    case 'admin_dispatch_pending':
      return 'Manual: un admin pulsó «Enviar avisos pendientes».';
    case 'admin_force_resend':
      return 'Manual: un admin forzó el reenvío.';
    case 'cron_reminder':
      return 'Automático: tarea diaria de recordatorios (08:00).';
    case 'admin_simulation':
      return 'Prueba: simulación lanzada desde el backoffice.';
    case 'pro_sms_confirmation':
      return 'Confirmación de alta de SMS PRO.';
    case 'transactional':
      return 'Email transaccional (compra, cuenta, baja…).';
    default:
      return '';
  }
}

function templateKeyToKind(key: string): ProNotifyKind {
  if (key === 'pro.new_publication') return 'new_publication';
  if (key === 'pro.reminder_7d') return 'reminder_7d';
  if (key === 'pro.reminder_1d') return 'reminder_1d';
  return 'new_alert';
}

/** Remitente alfanumérico Brevo: 3–11 letras/números (sin +34…). */
function resolveBrevoSmsSender(raw?: string) {
  const fallback = 'RadarVPOPro';
  const cleaned = (raw || fallback).replace(/[^A-Za-z0-9 ]/g, '').trim();
  if (!cleaned) return fallback;
  if (cleaned.length <= 11) return cleaned;
  const compact = cleaned.replace(/\s+/g, '');
  return (compact || fallback).slice(0, 11);
}

type ProAlertPromotion = Pick<
  Promotion,
  | 'id'
  | 'title'
  | 'municipality'
  | 'municipalityId'
  | 'province'
  | 'promotionType'
  | 'estimatedPublicationDate'
  | 'status'
>;

type BrevoEmailPayload = {
  sender: { name: string; email: string };
  to: Array<{ email: string; name?: string }>;
  subject: string;
  htmlContent: string;
};

type BrevoSmsPayload = {
  sender: string;
  recipient: string;
  content: string;
  type?: 'transactional';
};

/** Por qué se dispara un aviso PRO (se guarda en delivery_logs.context). */
export type ProNotifyTrigger =
  | 'registre_scraper'
  | 'admin_create_promotion'
  | 'admin_status_change'
  | 'admin_dispatch_pending'
  | 'admin_force_resend'
  | 'cron_reminder'
  | 'admin_simulation'
  | 'unknown';

export type DeliveryContext = {
  trigger?: string;
  kind?: string;
  templateKey?: string;
  promotionId?: string;
  promotionTitle?: string;
  location?: string;
  smsUnits?: number;
  smsSegments?: number;
  smsTruncated?: boolean;
  [key: string]: unknown;
};

type DeliveryMeta = {
  subject?: string | null;
  content?: string | null;
  context?: DeliveryContext;
};

export type ProNotifyPreview = {
  promotionId: string;
  kind: ProNotifyKind;
  title: string;
  location: string;
  wouldSend: boolean;
  skipReason?: string;
  templateKey: string;
  templateActive: boolean;
  email: { subject: string; html: string } | null;
  sms: (PreparedSms & { enabledForKind: boolean }) | null;
  recipients: { email: number; sms: number };
  explanation: string;
};

type NotifyResult = {
  skipped: boolean;
  reason?: string;
  sent: number;
  channels?: string[];
  promotionId?: string;
  title?: string;
  kind?: ProNotifyKind;
  proUsers?: number;
  emailsSent?: number;
  smsSent?: number;
};

export type ProAlertDispatchResult = {
  skipped: boolean;
  reason?: string;
  sent: number;
  configured: boolean;
  hasApiKey: boolean;
  proAlertsEnabled: boolean;
  pendingAlerts: number;
  proUsers: number;
  proUsersWithPhone: number;
  promotions: NotifyResult[];
  recentFailures: Array<{
    channel: string;
    target: string;
    errorCode: string;
    createdAt: Date;
  }>;
};

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly apiKey = process.env.BREVO_API_KEY;
  /** Remitente alfanumérico Brevo (máx. 11 chars). "RadarVPO PRO" → RadarVPOPro. */
  private readonly smsSender = resolveBrevoSmsSender(
    process.env.BREVO_SMS_SENDER,
  );
  private readonly emailSender =
    process.env.BREVO_EMAIL_SENDER || 'Radar VPO <info@radarvpo.com>';
  private readonly proAlertsEnabled =
    process.env.BREVO_PRO_ALERTS_ENABLED === 'true';
  private readonly publicSiteUrl = resolvePublicSiteUrl();

  constructor(
    private readonly prisma: PrismaService,
    private readonly templates: MessageTemplatesService,
  ) {
    if (!isProductionAppEnv() && messagingAllowlist() === null) {
      this.logger.warn(
        `APP_ENV=${process.env.APP_ENV} sin MESSAGING_ALLOWLIST: los emails/SMS no están filtrados`,
      );
    }
  }

  isProAlertsConfigured() {
    return Boolean(this.proAlertsEnabled && this.apiKey);
  }

  async getProAlertsDiagnostics() {
    const [pendingAlerts, proUsers, proUserRows, recentFailures] =
      await Promise.all([
        this.prisma.promotion.count({ where: { status: 'pending_review' } }),
        this.prisma.user.count({
          where: {
            OR: [
              { plan: 'pro' },
              {
                subscriptions: {
                  some: {
                    planKey: 'pro',
                    status: {
                      in: [
                        SubscriptionStatus.active,
                        SubscriptionStatus.trialing,
                      ],
                    },
                  },
                },
              },
            ],
          },
        }),
        this.prisma.user.findMany({
          where: {
            OR: [
              { plan: 'pro' },
              {
                subscriptions: {
                  some: {
                    planKey: 'pro',
                    status: {
                      in: [
                        SubscriptionStatus.active,
                        SubscriptionStatus.trialing,
                      ],
                    },
                  },
                },
              },
            ],
          },
          select: { phone: true },
        }),
        this.prisma.deliveryFailure.findMany({
          where: {
            OR: [
              { sourceRef: 'radar_vpo_pro' },
              { sourceRef: { startsWith: 'pro_alert:' } },
              { sourceRef: { startsWith: 'pro_sms_configured:' } },
              { channel: 'sms' },
            ],
          },
          orderBy: { createdAt: 'desc' },
          take: 8,
          select: {
            channel: true,
            target: true,
            errorCode: true,
            createdAt: true,
          },
        }),
      ]);

    const proUsersWithPhone = proUserRows.filter((user) =>
      normalizePhoneForSms(user.phone),
    ).length;

    return {
      configured: this.isProAlertsConfigured(),
      hasApiKey: Boolean(this.apiKey),
      proAlertsEnabled: this.proAlertsEnabled,
      pendingAlerts,
      proUsers,
      proUsersWithPhone,
      recentFailures: recentFailures.map((row) => ({
        channel: row.channel,
        target: row.target,
        errorCode: row.errorCode || 'UNKNOWN',
        createdAt: row.createdAt,
      })),
    };
  }

  /**
   * Previsión de próximos avisos PRO (email/SMS): listos ahora o programados
   * por fecha estimada (recordatorios D-7 / D-1).
   */
  async listUpcomingProDeliveries(limit = 60): Promise<{
    emailRecipients: number;
    smsRecipients: number;
    items: Array<{
      id: string;
      promotionId: string;
      title: string;
      location: string;
      kind: ProNotifyKind;
      channels: Array<'email' | 'sms'>;
      state: 'ready' | 'scheduled' | 'missed';
      scheduledFor: string | null;
      daysUntil: number | null;
      estimatedPublicationDate: string | null;
      emailRecipients: number;
      smsRecipients: number;
      note: string;
    }>;
  }> {
    const [proUsers, proSmsUsers, pending, publications] = await Promise.all([
      this.prisma.user.count({
        where: {
          OR: [
            { plan: 'pro' },
            {
              subscriptions: {
                some: {
                  planKey: 'pro',
                  status: {
                    in: [
                      SubscriptionStatus.active,
                      SubscriptionStatus.trialing,
                    ],
                  },
                },
              },
            },
          ],
        },
      }),
      this.prisma.user.findMany({
        where: {
          smsAlertsEnabled: true,
          OR: [
            { plan: 'pro' },
            {
              subscriptions: {
                some: {
                  planKey: 'pro',
                  status: {
                    in: [
                      SubscriptionStatus.active,
                      SubscriptionStatus.trialing,
                    ],
                  },
                },
              },
            },
          ],
        },
        select: { phone: true },
        take: 2000,
      }),
      this.prisma.promotion.findMany({
        where: { status: 'pending_review' },
        orderBy: [{ estimatedPublicationDate: 'asc' }, { createdAt: 'desc' }],
        take: 100,
        select: {
          id: true,
          title: true,
          municipality: true,
          province: true,
          estimatedPublicationDate: true,
          status: true,
        },
      }),
      this.prisma.promotion.findMany({
        where: {
          status: { in: ['published_unreviewed', 'published_reviewed'] },
          createdAt: { gte: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000) },
        },
        orderBy: { createdAt: 'desc' },
        take: 40,
        select: {
          id: true,
          title: true,
          municipality: true,
          province: true,
          estimatedPublicationDate: true,
          status: true,
        },
      }),
    ]);

    const smsRecipients = proSmsUsers.filter((user) =>
      normalizePhoneForSms(user.phone),
    ).length;
    const emailRecipients = proUsers;

    const candidates = [...pending, ...publications].filter(
      (row) => !isAmendmentPublication(row.title),
    );
    const ids = candidates.map((row) => row.id);
    const sentPosts =
      ids.length === 0
        ? []
        : await this.prisma.publishedPost.findMany({
            where: {
              sourceId: { in: ids },
              audience: AudienceType.pro,
              channel: 'brevo',
              status: 'sent',
            },
            select: { sourceId: true, sourceKind: true },
          });
    const sentKeys = new Set(
      sentPosts.map((row) => `${row.sourceKind}:${row.sourceId}`),
    );

    const items: Array<{
      id: string;
      promotionId: string;
      title: string;
      location: string;
      kind: ProNotifyKind;
      channels: Array<'email' | 'sms'>;
      state: 'ready' | 'scheduled' | 'missed';
      scheduledFor: string | null;
      daysUntil: number | null;
      estimatedPublicationDate: string | null;
      emailRecipients: number;
      smsRecipients: number;
      note: string;
    }> = [];

    const pushItem = (input: {
      promotionId: string;
      title: string;
      municipality: string | null;
      province: string | null;
      kind: ProNotifyKind;
      state: 'ready' | 'scheduled' | 'missed';
      scheduledFor: Date | null;
      daysUntil: number | null;
      estimatedPublicationDate: Date | null;
      note: string;
    }) => {
      const channels: Array<'email' | 'sms'> = ['email'];
      if (PRO_SMS_KINDS.has(input.kind)) channels.push('sms');
      items.push({
        id: `${input.kind}:${input.promotionId}`,
        promotionId: input.promotionId,
        title: input.title,
        location: formatLocation({
          municipality: input.municipality,
          province: input.province,
        }),
        kind: input.kind,
        channels,
        state: input.state,
        scheduledFor: input.scheduledFor ? madridYmd(input.scheduledFor) : null,
        daysUntil: input.daysUntil,
        estimatedPublicationDate: input.estimatedPublicationDate
          ? madridYmd(input.estimatedPublicationDate)
          : null,
        emailRecipients,
        smsRecipients: channels.includes('sms') ? smsRecipients : 0,
        note: input.note,
      });
    };

    for (const alert of pending) {
      if (isAmendmentPublication(alert.title)) continue;

      if (!sentKeys.has(`${PRO_NOTIFY_SOURCE_KIND.new_alert}:${alert.id}`)) {
        pushItem({
          promotionId: alert.id,
          title: alert.title,
          municipality: alert.municipality,
          province: alert.province,
          kind: 'new_alert',
          state: 'ready',
          scheduledFor: null,
          daysUntil: 0,
          estimatedPublicationDate: alert.estimatedPublicationDate,
          note: 'Pendiente de enviar aviso de nueva alerta (email + SMS a PRO).',
        });
      }

      if (!alert.estimatedPublicationDate) continue;
      const estimated = alert.estimatedPublicationDate;
      const days = calendarDaysUntil(estimated);

      if (!sentKeys.has(`${PRO_NOTIFY_SOURCE_KIND.reminder_7d}:${alert.id}`)) {
        if (days === 7) {
          pushItem({
            promotionId: alert.id,
            title: alert.title,
            municipality: alert.municipality,
            province: alert.province,
            kind: 'reminder_7d',
            state: 'ready',
            scheduledFor: new Date(),
            daysUntil: 7,
            estimatedPublicationDate: estimated,
            note: 'Recordatorio D-7 listo para enviar hoy (email + SMS).',
          });
        } else if (days > 7) {
          const scheduled = new Date(estimated);
          scheduled.setUTCDate(scheduled.getUTCDate() - 7);
          pushItem({
            promotionId: alert.id,
            title: alert.title,
            municipality: alert.municipality,
            province: alert.province,
            kind: 'reminder_7d',
            state: 'scheduled',
            scheduledFor: scheduled,
            daysUntil: days,
            estimatedPublicationDate: estimated,
            note: `Email + SMS cuando falten 7 días (~${madridYmd(scheduled)}).`,
          });
        } else if (days > 1) {
          pushItem({
            promotionId: alert.id,
            title: alert.title,
            municipality: alert.municipality,
            province: alert.province,
            kind: 'reminder_7d',
            state: 'missed',
            scheduledFor: null,
            daysUntil: days,
            estimatedPublicationDate: estimated,
            note: 'Ventana D-7 ya pasó sin enviar.',
          });
        }
      }

      if (!sentKeys.has(`${PRO_NOTIFY_SOURCE_KIND.reminder_1d}:${alert.id}`)) {
        if (days === 1) {
          pushItem({
            promotionId: alert.id,
            title: alert.title,
            municipality: alert.municipality,
            province: alert.province,
            kind: 'reminder_1d',
            state: 'ready',
            scheduledFor: new Date(),
            daysUntil: 1,
            estimatedPublicationDate: estimated,
            note: 'Recordatorio D-1 listo para enviar hoy (email + SMS).',
          });
        } else if (days > 1) {
          const scheduled = new Date(estimated);
          scheduled.setUTCDate(scheduled.getUTCDate() - 1);
          pushItem({
            promotionId: alert.id,
            title: alert.title,
            municipality: alert.municipality,
            province: alert.province,
            kind: 'reminder_1d',
            state: 'scheduled',
            scheduledFor: scheduled,
            daysUntil: days,
            estimatedPublicationDate: estimated,
            note: `Email + SMS cuando falte 1 día (~${madridYmd(scheduled)}).`,
          });
        } else if (days < 1) {
          pushItem({
            promotionId: alert.id,
            title: alert.title,
            municipality: alert.municipality,
            province: alert.province,
            kind: 'reminder_1d',
            state: 'missed',
            scheduledFor: null,
            daysUntil: days,
            estimatedPublicationDate: estimated,
            note: 'Ventana D-1 ya pasó sin enviar.',
          });
        }
      }
    }

    for (const publication of publications) {
      if (isAmendmentPublication(publication.title)) continue;
      if (!isOfficialProcedureStartAnnouncement(publication.title)) continue;
      if (
        sentKeys.has(
          `${PRO_NOTIFY_SOURCE_KIND.new_publication}:${publication.id}`,
        )
      ) {
        continue;
      }
      pushItem({
        promotionId: publication.id,
        title: publication.title,
        municipality: publication.municipality,
        province: publication.province,
        kind: 'new_publication',
        state: 'ready',
        scheduledFor: null,
        daysUntil: 0,
        estimatedPublicationDate: publication.estimatedPublicationDate,
        note: 'Publicación oficial pendiente de aviso PRO (email + SMS).',
      });
    }

    const rank = { ready: 0, scheduled: 1, missed: 2 } as const;
    items.sort((a, b) => {
      const byState = rank[a.state] - rank[b.state];
      if (byState !== 0) return byState;
      const aDate = a.scheduledFor || a.estimatedPublicationDate || '';
      const bDate = b.scheduledFor || b.estimatedPublicationDate || '';
      return aDate.localeCompare(bDate);
    });

    // Evitar filas duplicadas si hay promociones repetidas en BD.
    const seen = new Set<string>();
    const deduped = items.filter((item) => {
      const key = [
        item.kind,
        item.state,
        item.scheduledFor || '',
        item.estimatedPublicationDate || '',
        item.title.trim().toLowerCase(),
      ].join('|');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return {
      emailRecipients,
      smsRecipients,
      items: deduped.slice(0, Math.min(limit, 100)),
    };
  }

  getAlertsPageUrl() {
    return `${this.publicSiteUrl}/alerts`;
  }

  async notifyProUsersForPendingAlerts(
    limit = 20,
    options: { force?: boolean; trigger?: ProNotifyTrigger } = {},
  ): Promise<ProAlertDispatchResult> {
    const diagnostics = await this.getProAlertsDiagnostics();

    if (!this.isProAlertsConfigured()) {
      this.logger.log(
        'Brevo Pro alerts skipped: missing BREVO_API_KEY or BREVO_PRO_ALERTS_ENABLED=true',
      );
      return {
        ...diagnostics,
        skipped: true,
        reason: 'brevo_not_configured',
        sent: 0,
        promotions: [],
      };
    }

    const promotions = await this.prisma.promotion.findMany({
      where: { status: 'pending_review' },
      orderBy: [{ alertDetectedAt: 'desc' }, { createdAt: 'desc' }],
      take: limit,
      select: {
        id: true,
        title: true,
        municipality: true,
        province: true,
        estimatedPublicationDate: true,
      },
    });

    if (promotions.length === 0) {
      return {
        ...diagnostics,
        skipped: true,
        reason: 'no_pending_alerts',
        sent: 0,
        promotions: [],
      };
    }

    const promotionResults: NotifyResult[] = [];
    let sent = 0;

    for (const promotion of promotions) {
      const result = await this.notifyProUsersForPromotion(promotion.id, {
        force: options.force,
        trigger:
          options.trigger ??
          (options.force ? 'admin_force_resend' : 'admin_dispatch_pending'),
      });
      promotionResults.push({ ...result, title: promotion.title });
      if (!result.skipped) {
        sent += result.sent;
      }
    }

    const skippedResults = promotionResults.filter((result) => result.skipped);
    const failedResults = promotionResults.filter(
      (result) => !result.skipped && result.sent === 0,
    );

    let reason: string | undefined;
    if (sent === 0) {
      if (skippedResults.length === promotionResults.length) {
        reason = skippedResults[0]?.reason || 'all_skipped';
      } else if (failedResults.length > 0) {
        reason = 'brevo_delivery_failed';
      } else {
        reason = 'no_deliveries';
      }
    }

    return {
      ...diagnostics,
      skipped: sent === 0,
      reason,
      sent,
      promotions: promotionResults,
    };
  }

  async notifyProUsersForPromotion(
    promotionId: string,
    options: { force?: boolean; trigger?: ProNotifyTrigger } = {},
  ): Promise<NotifyResult> {
    return this.notifyProEvent(promotionId, 'new_alert', options);
  }

  async notifyProUsersForPublication(
    promotionId: string,
    options: { force?: boolean; trigger?: ProNotifyTrigger } = {},
  ): Promise<NotifyResult> {
    return this.notifyProEvent(promotionId, 'new_publication', options);
  }

  async simulateProNotificationsForPromotion(
    promotionId: string,
    options: { kinds?: ProNotifyKind[]; onlyUserId?: string } = {},
  ) {
    const diagnostics = await this.getProAlertsDiagnostics();
    const kinds: ProNotifyKind[] =
      options.kinds && options.kinds.length > 0
        ? options.kinds
        : ['new_alert', 'reminder_7d', 'reminder_1d', 'new_publication'];

    const promotionResults: NotifyResult[] = [];
    let sent = 0;

    for (const kind of kinds) {
      const result = await this.notifyProEvent(promotionId, kind, {
        simulate: true,
        onlyUserId: options.onlyUserId,
        trigger: 'admin_simulation',
      });
      promotionResults.push(result);
      if (!result.skipped) sent += result.sent;
    }

    let reason: string | undefined;
    if (sent === 0) {
      const skippedResults = promotionResults.filter((item) => item.skipped);
      const failedResults = promotionResults.filter(
        (item) => !item.skipped && item.sent === 0,
      );
      if (skippedResults.length === promotionResults.length) {
        reason = skippedResults[0]?.reason || 'all_skipped';
      } else if (failedResults.length > 0) {
        reason = 'brevo_delivery_failed';
      } else {
        reason = 'no_deliveries';
      }
    }

    return {
      ...diagnostics,
      skipped: sent === 0,
      reason,
      sent,
      promotions: promotionResults,
    };
  }

  async notifyDueReminders(): Promise<{
    sent: number;
    results: NotifyResult[];
  }> {
    if (!this.isProAlertsConfigured()) {
      return { sent: 0, results: [] };
    }

    const alerts = await this.prisma.promotion.findMany({
      where: {
        status: 'pending_review',
        estimatedPublicationDate: { not: null },
      },
      select: {
        id: true,
        title: true,
        estimatedPublicationDate: true,
      },
      take: 200,
    });

    const results: NotifyResult[] = [];
    let sent = 0;

    for (const alert of alerts) {
      if (isAmendmentPublication(alert.title)) continue;
      const days = calendarDaysUntil(alert.estimatedPublicationDate as Date);
      const kind: ProNotifyKind | null =
        days === 7 ? 'reminder_7d' : days === 1 ? 'reminder_1d' : null;
      if (!kind) continue;
      const result = await this.notifyProEvent(alert.id, kind, {
        trigger: 'cron_reminder',
      });
      results.push(result);
      if (!result.skipped) sent += result.sent;
    }

    this.logger.log(
      `PRO reminders checked=${alerts.length}, due=${results.length}, sent=${sent}`,
    );
    return { sent, results };
  }

  private async notifyProEvent(
    promotionId: string,
    kind: ProNotifyKind,
    options: {
      force?: boolean;
      simulate?: boolean;
      onlyUserId?: string;
      trigger?: ProNotifyTrigger;
    } = {},
  ): Promise<NotifyResult> {
    if (!this.isProAlertsConfigured()) {
      return {
        skipped: true,
        reason: 'brevo_not_configured',
        sent: 0,
        promotionId,
        kind,
      };
    }

    const promotion = await this.prisma.promotion.findUnique({
      where: { id: promotionId },
      select: {
        id: true,
        title: true,
        municipality: true,
        municipalityId: true,
        province: true,
        promotionType: true,
        estimatedPublicationDate: true,
        status: true,
      },
    });

    if (!promotion) {
      return { skipped: true, reason: 'not_found', sent: 0, promotionId, kind };
    }

    if (isAmendmentPublication(promotion.title)) {
      return {
        skipped: true,
        reason: 'amendment_excluded',
        sent: 0,
        promotionId,
        title: promotion.title,
        kind,
      };
    }

    if (
      kind === 'new_publication' &&
      !options.force &&
      !options.simulate &&
      !isOfficialProcedureStartAnnouncement(promotion.title)
    ) {
      return {
        skipped: true,
        reason: 'not_official_publication_announcement',
        sent: 0,
        promotionId,
        title: promotion.title,
        kind,
      };
    }

    if (!options.simulate) {
      if (kind === 'new_alert' && promotion.status !== 'pending_review') {
        return {
          skipped: true,
          reason: 'not_pending_alert',
          sent: 0,
          promotionId,
          kind,
        };
      }

      if (
        kind === 'new_publication' &&
        promotion.status !== 'published_unreviewed' &&
        promotion.status !== 'published_reviewed'
      ) {
        return {
          skipped: true,
          reason: 'not_published',
          sent: 0,
          promotionId,
          kind,
        };
      }

      if (
        (kind === 'reminder_7d' || kind === 'reminder_1d') &&
        promotion.status !== 'pending_review'
      ) {
        return {
          skipped: true,
          reason: 'not_pending_alert',
          sent: 0,
          promotionId,
          kind,
        };
      }
    }

    const sourceKind = PRO_NOTIFY_SOURCE_KIND[kind];
    const existing = options.simulate
      ? null
      : await this.prisma.publishedPost.findFirst({
          where: {
            sourceKind,
            sourceId: promotion.id,
            audience: AudienceType.pro,
            channel: 'brevo',
            status: 'sent',
          },
          select: { id: true },
        });

    if (existing && !options.force) {
      return {
        skipped: true,
        reason: 'already_sent',
        sent: 0,
        promotionId,
        title: promotion.title,
        kind,
      };
    }

    const result = await this.sendProBroadcast(
      promotion,
      kind,
      options.onlyUserId,
      options.force && options.trigger !== 'admin_simulation'
        ? 'admin_force_resend'
        : (options.trigger ?? 'unknown'),
    );
    if (result.sent > 0 && !options.simulate) {
      if (existing && options.force) {
        await this.prisma.publishedPost.update({
          where: { id: existing.id },
          data: {
            payloadJson: {
              kind,
              title: promotion.title,
              sent: result.sent,
              channels: result.channels,
              forced: true,
            },
            sentAt: new Date(),
          },
        });
      } else {
        await this.prisma.publishedPost.create({
          data: {
            sourceKind,
            sourceId: promotion.id,
            audience: AudienceType.pro,
            channel: 'brevo',
            payloadJson: {
              kind,
              title: promotion.title,
              sent: result.sent,
              channels: result.channels,
            },
            status: 'sent',
            sentAt: new Date(),
          },
        });
      }
      this.logger.log(
        `PRO ${kind} sent for ${promotion.id}: ${result.sent} deliveries (${result.channels.join(', ')})`,
      );
    } else if (result.sent === 0) {
      this.logger.warn(
        `PRO ${kind} produced zero deliveries for ${promotion.id}`,
      );
    } else {
      this.logger.log(
        `PRO ${kind} simulated for ${promotion.id}: ${result.sent} deliveries (${result.channels.join(', ')})`,
      );
    }

    return {
      skipped: result.sent === 0,
      reason:
        result.sent === 0
          ? result.proUsers === 0
            ? 'no_pro_users'
            : 'brevo_delivery_failed'
          : undefined,
      sent: result.sent,
      channels: result.channels,
      promotionId,
      title: promotion.title,
      kind,
      proUsers: result.proUsers,
      emailsSent: result.emailsSent,
      smsSent: result.smsSent,
    };
  }

  private async sendProBroadcast(
    promotion: ProAlertPromotion,
    kind: ProNotifyKind,
    onlyUserId?: string,
    trigger: ProNotifyTrigger = 'unknown',
  ) {
    const users = await this.prisma.user.findMany({
      where: onlyUserId
        ? { id: onlyUserId, emailVerifiedAt: { not: null } }
        : {
            emailVerifiedAt: { not: null },
            OR: [
              { plan: 'pro' },
              {
                subscriptions: {
                  some: {
                    planKey: 'pro',
                    status: {
                      in: [
                        SubscriptionStatus.active,
                        SubscriptionStatus.trialing,
                      ],
                    },
                  },
                },
              },
            ],
          },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        smsAlertsEnabled: true,
      },
    });

    // Sin filtro territorial ni de favoritos: todos los PRO verificados reciben
    // todos los avisos, recordatorios incluidos.
    const recipients = users;

    const channels: string[] = [];
    let sent = 0;
    let emailsSent = 0;
    let smsSent = 0;
    const copy = await this.buildProCopy(promotion, kind);
    if (!copy) {
      return {
        sent: 0,
        channels: [],
        proUsers: recipients.length,
        emailsSent: 0,
        smsSent: 0,
      };
    }

    const baseContext: DeliveryContext = {
      trigger,
      kind,
      templateKey: copy.templateKey,
      promotionId: promotion.id,
      promotionTitle: promotion.title,
      location: copy.location,
    };

    const smsEligible = recipients.some(
      (user) => user.smsAlertsEnabled && normalizePhoneForSms(user.phone),
    );
    if (smsEligible && PRO_SMS_KINDS.has(kind) && !copy.smsPrepared.ok) {
      this.logger.error(
        `PRO ${kind} SMS blocked for ${promotion.id}: ${copy.smsPrepared.reason} -> "${copy.smsPrepared.content}"`,
      );
      await this.recordDelivery({
        channel: 'sms',
        status: 'failed',
        target: 'pro_broadcast',
        sourceRef: `pro_alert:${kind}:${promotion.id}`,
        errorCode: 'SMS_BLOCKED_INVALID_CONTENT',
        detail: copy.smsPrepared.reason,
        content: copy.smsPrepared.content,
        context: {
          ...baseContext,
          smsUnits: copy.smsPrepared.units,
          smsSegments: copy.smsPrepared.segments,
          smsTruncated: copy.smsPrepared.truncated,
        },
      });
    }

    for (const user of recipients) {
      const displayName = displayNameOrEmpty(user.fullName);
      const html = this.buildSlimProEmailHtml({
        bodyHtml: copy.intro,
        pageUrl: copy.pageUrl,
      });

      const alertSourceRef = `pro_alert:${kind}:${promotion.id}`;
      const emailSent = await this.sendEmail(
        {
          sender: this.parseEmailSender(),
          to: [{ email: user.email, name: displayName || undefined }],
          subject: copy.subject,
          htmlContent: html,
        },
        alertSourceRef,
        { context: { ...baseContext, userId: user.id } },
      );
      if (emailSent) {
        sent += 1;
        emailsSent += 1;
        channels.push('email');
      }

      const wantSms =
        user.smsAlertsEnabled &&
        PRO_SMS_KINDS.has(kind) &&
        copy.smsPrepared.ok &&
        Boolean(copy.sms?.trim());
      const normalizedPhone = wantSms ? normalizePhoneForSms(user.phone) : null;
      if (normalizedPhone && copy.sms) {
        const smsSentForUser = await this.sendSms(
          {
            sender: this.smsSender,
            recipient: normalizedPhone,
            content: copy.sms,
            type: 'transactional',
          },
          alertSourceRef,
          {
            context: {
              ...baseContext,
              userId: user.id,
              smsUnits: copy.smsPrepared.units,
              smsSegments: copy.smsPrepared.segments,
              smsTruncated: copy.smsPrepared.truncated,
            },
          },
        );
        if (smsSentForUser) {
          sent += 1;
          smsSent += 1;
          channels.push('sms');
        }
      }
    }

    return {
      sent,
      channels: [...new Set(channels)],
      proUsers: recipients.length,
      emailsSent,
      smsSent,
    };
  }

  private async buildProCopy(
    promotion: ProAlertPromotion,
    kind: ProNotifyKind,
  ) {
    const title = shortenAlertTitle(promotion.title);
    const location = formatLocation({
      municipality: promotion.municipality,
      province: promotion.province,
    });
    if (!location) {
      this.logger.warn(
        `PRO ${kind} skipped for ${promotion.id}: missing location`,
      );
      return null;
    }

    const estimatedDate = formatMadridDate(promotion.estimatedPublicationDate);
    if ((kind === 'reminder_7d' || kind === 'reminder_1d') && !estimatedDate) {
      this.logger.warn(
        `PRO ${kind} skipped for ${promotion.id}: missing estimated date`,
      );
      return null;
    }

    const alertsUrl = `${this.publicSiteUrl}/alerts`;
    const promotionsUrl = `${this.publicSiteUrl}/promotions/${promotion.id}`;
    const pageUrl = kind === 'new_publication' ? promotionsUrl : alertsUrl;

    const templateKey =
      kind === 'new_publication'
        ? 'pro.new_publication'
        : kind === 'reminder_7d'
          ? 'pro.reminder_7d'
          : kind === 'reminder_1d'
            ? 'pro.reminder_1d'
            : 'pro.new_alert';
    const tpl = await this.templates.getByKey(templateKey);
    if (tpl && !tpl.active) {
      this.logger.log(`PRO ${kind} skipped: template ${templateKey} inactive`);
      return null;
    }

    const fallback = buildProNotifyCopy({
      kind,
      title,
      location,
      estimatedDate: estimatedDate || null,
      alertsUrl,
      promotionsUrl,
    });

    const vars = {
      name: '',
      email: '',
      title,
      location,
      date: estimatedDate || '',
      url: pageUrl,
      product: title,
      price: '',
      phone: '',
      access_until: '',
      billing_summary: '',
    };

    const subject =
      tpl?.emailSubject != null
        ? this.templates.render(tpl.emailSubject, vars)
        : fallback.subject;
    const intro =
      tpl?.emailBody != null
        ? this.templates.renderHtml(tpl.emailBody, vars)
        : fallback.intro;
    const smsUrl =
      kind === 'new_publication'
        ? promotionSmsLink(this.publicSiteUrl, promotion.id)
        : smsLink(this.publicSiteUrl, '/alerts');
    const smsRaw =
      tpl?.smsBody != null
        ? this.templates.render(tpl.smsBody, { ...vars, url: smsUrl })
        : fallback.sms;
    const smsBodyOnly = smsRaw
      .split(pageUrl)
      .join(' ')
      .split(smsUrl)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    const smsPrepared = prepareSms(smsBodyOnly || smsRaw, smsUrl, {
      requiredFragments: [location],
    });
    const sms = smsPrepared.content;

    if (
      hasIncompleteRender(subject, { location }) ||
      hasIncompleteRender(intro, { location })
    ) {
      this.logger.warn(
        `PRO ${kind} skipped for ${promotion.id}: incomplete template render`,
      );
      return null;
    }

    return {
      ...fallback,
      subject: subject.slice(0, 140),
      intro,
      sms,
      smsPrepared,
      templateKey,
      templateActive: tpl?.active ?? true,
      pageUrl,
      disclaimer: null,
    };
  }

  /**
   * Lo que se enviaría ahora mismo para (promoción, tipo), sin enviar nada:
   * asunto + HTML exacto, SMS exacto (GSM-7, segmentos) y si se bloquearía.
   */
  async previewProEvent(
    promotionId: string,
    kind: ProNotifyKind,
  ): Promise<ProNotifyPreview> {
    const promotion = await this.prisma.promotion.findUnique({
      where: { id: promotionId },
      select: {
        id: true,
        title: true,
        municipality: true,
        municipalityId: true,
        province: true,
        promotionType: true,
        estimatedPublicationDate: true,
        status: true,
      },
    });
    const empty: ProNotifyPreview = {
      promotionId,
      kind,
      title: promotion?.title ?? '',
      location: promotion
        ? formatLocation({
            municipality: promotion.municipality,
            province: promotion.province,
          })
        : '',
      wouldSend: false,
      templateKey: '',
      templateActive: false,
      email: null,
      sms: null,
      recipients: { email: 0, sms: 0 },
      explanation: describeProNotifyKind(kind),
    };
    if (!promotion) return { ...empty, skipReason: 'not_found' };

    const skipReason = await this.proEventSkipReason(promotion, kind);
    const copy = await this.buildProCopy(promotion, kind);
    const recipients = await this.countProRecipients(kind);

    if (!copy) {
      return {
        ...empty,
        recipients,
        skipReason: skipReason ?? 'missing_location_or_template',
      };
    }

    const smsEnabledForKind = PRO_SMS_KINDS.has(kind);
    const smsBlocked =
      smsEnabledForKind && recipients.sms > 0 && !copy.smsPrepared.ok;

    return {
      ...empty,
      location: copy.location,
      templateKey: copy.templateKey,
      templateActive: copy.templateActive,
      wouldSend: !skipReason && recipients.email + recipients.sms > 0,
      skipReason:
        skipReason ?? (smsBlocked ? copy.smsPrepared.reason : undefined),
      email: {
        subject: copy.subject,
        html: this.buildSlimProEmailHtml({
          bodyHtml: copy.intro,
          pageUrl: copy.pageUrl,
        }),
      },
      sms: { ...copy.smsPrepared, enabledForKind: smsEnabledForKind },
      recipients,
    };
  }

  /** Todas las plantillas renderizadas con datos de ejemplo (email + SMS final). */
  async previewAllTemplates() {
    const templates = await this.templates.list();
    const sampleUrl = `${this.publicSiteUrl}/promotions/ejemplo123`;
    const vars: Record<string, string> = {
      name: 'Ana García',
      email: 'ana@example.com',
      title:
        "Anunci d'inici de procediment d'adjudicació a Sant Cugat del Vallès",
      location: 'Sant Cugat del Vallès, Barcelona',
      date: '15 de diciembre de 2026',
      url: sampleUrl,
      product: 'Guía VPO Catalunya',
      price: '19,99 €',
      phone: '+34600000000',
      access_until: '10 de febrero de 2027',
      billing_summary:
        'Importe: 9,99 € al mes. Se renueva automáticamente cada mes hasta que canceles desde Mi cuenta.',
    };
    const seedKeys = new Set(MESSAGE_TEMPLATE_SEEDS.map((seed) => seed.key));

    return templates.map((tpl) => {
      const isProAlert = tpl.key.startsWith('pro.');
      const subject = tpl.emailSubject
        ? renderTemplate(tpl.emailSubject, vars)
        : null;
      const body = tpl.emailBody
        ? renderTemplate(tpl.emailBody, vars, { html: true })
        : null;
      const html = body
        ? isProAlert
          ? this.buildSlimProEmailHtml({ bodyHtml: body, pageUrl: sampleUrl })
          : `<div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#0b1220;max-width:560px;">${body}</div>`
        : null;
      let sms: PreparedSms | null = null;
      if (tpl.smsBody) {
        const sampleSmsUrl =
          tpl.key === 'pro.new_publication' || !isProAlert
            ? promotionSmsLink(this.publicSiteUrl, 'ejemplo1234567')
            : smsLink(this.publicSiteUrl, '/alerts');
        const raw = renderTemplate(tpl.smsBody, { ...vars, url: sampleSmsUrl });
        const bodyOnly = raw
          .split(sampleSmsUrl)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        sms = prepareSms(bodyOnly || raw, sampleSmsUrl, {
          requiredFragments: isProAlert ? [vars.location] : [],
        });
      }
      return {
        key: tpl.key,
        label: tpl.label,
        description: tpl.description,
        channel: tpl.channel,
        active: tpl.active,
        isCustomized: tpl.isCustomized,
        isKnown: seedKeys.has(tpl.key),
        smsSentForThisTemplate:
          isProAlert && PRO_SMS_KINDS.has(templateKeyToKind(tpl.key)),
        email:
          subject || html ? { subject: subject ?? '', html: html ?? '' } : null,
        sms,
        sampleVars: vars,
      };
    });
  }

  private async proEventSkipReason(
    promotion: ProAlertPromotion,
    kind: ProNotifyKind,
  ): Promise<string | undefined> {
    if (!this.isProAlertsConfigured()) return 'brevo_not_configured';
    if (isAmendmentPublication(promotion.title)) return 'amendment_excluded';
    if (
      kind === 'new_publication' &&
      !isOfficialProcedureStartAnnouncement(promotion.title)
    ) {
      return 'not_official_publication_announcement';
    }
    if (
      (kind === 'new_alert' ||
        kind === 'reminder_7d' ||
        kind === 'reminder_1d') &&
      promotion.status !== 'pending_review'
    ) {
      return 'not_pending_alert';
    }
    if (
      kind === 'new_publication' &&
      promotion.status !== 'published_unreviewed' &&
      promotion.status !== 'published_reviewed'
    ) {
      return 'not_published';
    }
    const existing = await this.prisma.publishedPost.findFirst({
      where: {
        sourceKind: PRO_NOTIFY_SOURCE_KIND[kind],
        sourceId: promotion.id,
        audience: AudienceType.pro,
        channel: 'brevo',
        status: 'sent',
      },
      select: { id: true },
    });
    return existing ? 'already_sent' : undefined;
  }

  private async countProRecipients(kind: ProNotifyKind) {
    const users = await this.prisma.user.findMany({
      where: {
        emailVerifiedAt: { not: null },
        OR: [
          { plan: 'pro' },
          {
            subscriptions: {
              some: {
                planKey: 'pro',
                status: {
                  in: [SubscriptionStatus.active, SubscriptionStatus.trialing],
                },
              },
            },
          },
        ],
      },
      select: { phone: true, smsAlertsEnabled: true },
    });
    return {
      email: users.length,
      sms: PRO_SMS_KINDS.has(kind)
        ? users.filter(
            (user) => user.smsAlertsEnabled && normalizePhoneForSms(user.phone),
          ).length
        : 0,
    };
  }

  /** Email transaccional usando plantilla admin (fallback HTML sencillo). */
  async sendTemplatedEmail(input: {
    templateKey: string;
    toEmail: string;
    toName?: string | null;
    vars: Record<string, string>;
    fallbackSubject: string;
    fallbackHtml: string;
    requiredVars?: string[];
  }): Promise<boolean> {
    if (!this.apiKey) return false;
    const vars: Record<string, string> = {
      ...input.vars,
      name: displayNameOrEmpty(input.vars.name || input.toName),
    };
    for (const key of input.requiredVars ?? []) {
      if (!vars[key]?.trim()) {
        this.logger.warn(
          `Email ${input.templateKey} skipped: missing required var ${key}`,
        );
        return false;
      }
    }

    const tpl = await this.templates.getByKey(input.templateKey);
    const subject =
      tpl?.active && tpl.emailSubject
        ? this.templates.render(tpl.emailSubject, vars)
        : input.fallbackSubject;
    const body =
      tpl?.active && tpl.emailBody
        ? this.templates.renderHtml(tpl.emailBody, vars)
        : input.fallbackHtml;
    if (hasIncompleteRender(subject, {}) || hasIncompleteRender(body, {})) {
      this.logger.warn(
        `Email ${input.templateKey} skipped: unresolved placeholders`,
      );
      return false;
    }
    const html = body.includes('<')
      ? `<div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#0b1220;max-width:560px;">${body}</div>`
      : `<div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#0b1220;max-width:560px;">${body}</div>`;
    return this.sendEmail(
      {
        sender: this.parseEmailSender(),
        to: [{ email: input.toEmail, name: vars.name || undefined }],
        subject: subject.slice(0, 140),
        htmlContent: html,
      },
      `email:${input.templateKey}`,
      { context: { trigger: 'transactional', templateKey: input.templateKey } },
    );
  }

  /** Envoltura slim: el cuerpo de plantilla ya trae CTA y avisos (sin duplicar). */
  private buildSlimProEmailHtml(input: { bodyHtml: string; pageUrl: string }) {
    return `
      <div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#0b1220;max-width:560px;">
        ${input.bodyHtml}
        <p style="margin:20px 0 0;font-size:12px;color:#6b7280;">
          Recibes este aviso porque tienes Radar VPO PRO (servicio contratado, no publicidad).
          Gestiona preferencias y suscripción en
          <a href="${this.escapeHtml(this.publicSiteUrl)}/account">${this.escapeHtml(this.publicSiteUrl)}/account</a>.
        </p>
      </div>
    `;
  }

  async notifyUserOfProCancellation(input: {
    email: string;
    fullName: string | null;
    accessUntil: string | null;
    /** request = pendiente manual; confirmed = renovación ya cancelada */
    stage: 'request' | 'confirmed';
  }): Promise<boolean> {
    if (!this.apiKey) {
      this.logger.warn(
        'User cancellation email skipped: missing BREVO_API_KEY',
      );
      return false;
    }
    const displayName = displayNameOrEmpty(input.fullName);
    const accountUrl = `${this.publicSiteUrl}/account`;
    if (input.stage === 'request') {
      return this.sendTemplatedEmail({
        templateKey: 'cancel.pro_user_requested',
        toEmail: input.email,
        toName: displayName,
        vars: {
          name: displayName,
          email: input.email,
          url: accountUrl,
          title: '',
          location: '',
          date: '',
          product: 'PRO',
          price: '',
          phone: '',
          access_until: '',
          billing_summary: '',
        },
        fallbackSubject: 'Hemos recibido tu solicitud de baja de PRO',
        fallbackHtml: `<p>${displayName ? `Hola ${this.escapeHtml(displayName)},` : 'Hola,'}</p><p>Hemos recibido tu solicitud de baja. Te avisaremos cuando se tramites.</p><p><a href="${this.escapeHtml(accountUrl)}">Ir a mi cuenta</a></p>`,
      });
    }

    if (!input.accessUntil?.trim()) {
      this.logger.warn(
        'cancel.pro_user confirmed skipped: missing access_until',
      );
      return false;
    }

    return this.sendTemplatedEmail({
      templateKey: 'cancel.pro_user',
      toEmail: input.email,
      toName: displayName,
      vars: {
        name: displayName,
        email: input.email,
        url: accountUrl,
        title: '',
        location: '',
        date: input.accessUntil,
        product: 'PRO',
        price: '',
        phone: '',
        access_until: input.accessUntil,
        billing_summary: '',
      },
      requiredVars: ['access_until'],
      fallbackSubject: 'Renovación de Radar VPO PRO cancelada',
      fallbackHtml: `<p>${displayName ? `Hola ${this.escapeHtml(displayName)},` : 'Hola,'}</p><p>Hemos cancelado la renovación. Podrás usar PRO hasta <strong>${this.escapeHtml(input.accessUntil)}</strong>.</p><p><a href="${this.escapeHtml(accountUrl)}">Consultar mi suscripción</a></p>`,
    });
  }

  async notifyAdminsOfProCancellation(input: {
    userId: string;
    email: string;
    fullName: string | null;
    phone: string | null;
    requestedAt: Date;
  }): Promise<{ sent: boolean; recipients: number }> {
    const recipients = await this.resolveAdminEmails();
    if (!this.apiKey) {
      this.logger.warn(
        'Admin cancellation email skipped: missing BREVO_API_KEY',
      );
      return { sent: false, recipients: recipients.length };
    }

    if (recipients.length === 0) {
      this.logger.warn(
        'Admin cancellation email skipped: no BREVO_ADMIN_EMAIL and no admin users',
      );
      return { sent: false, recipients: 0 };
    }

    const displayName = input.fullName?.trim() || input.email;
    const panelUrl = `${this.publicSiteUrl}/admin/cancellations`;
    let sent = false;
    for (const email of recipients) {
      const ok = await this.sendTemplatedEmail({
        templateKey: 'cancel.pro_admin',
        toEmail: email,
        vars: {
          name: displayName,
          email: input.email,
          phone: input.phone || 'n/d',
          url: panelUrl,
          title: '',
          location: '',
          date: '',
          product: 'PRO',
          price: '',
        },
        fallbackSubject: `[Radar VPO] Baja PRO solicitada: ${displayName}`,
        fallbackHtml: `<p>Un usuario ha solicitado dar de baja VPO PRO.</p><p><strong>${this.escapeHtml(displayName)}</strong><br/>${this.escapeHtml(input.email)}</p><p><a href="${this.escapeHtml(panelUrl)}">Ver anulaciones</a></p>`,
      });
      sent = sent || ok;
    }

    if (!sent) {
      this.logger.warn(
        `Admin cancellation email failed for user ${input.userId} (${input.email})`,
      );
    }

    return { sent, recipients: recipients.length };
  }

  async sendPasswordResetEmail(input: {
    email: string;
    fullName: string | null;
    resetUrl: string;
  }): Promise<boolean> {
    if (!this.apiKey) {
      this.logger.warn('Password reset email skipped: missing BREVO_API_KEY');
      return false;
    }

    const displayName = input.fullName?.trim() || input.email;
    return this.sendTemplatedEmail({
      templateKey: 'auth.password_reset',
      toEmail: input.email,
      toName: displayName,
      vars: {
        name: displayName,
        email: input.email,
        url: input.resetUrl,
        title: '',
        location: '',
        date: '',
        product: '',
        price: '',
        phone: '',
      },
      fallbackSubject: 'Restablece tu contraseña de Radar VPO',
      fallbackHtml: `<p>Hola ${this.escapeHtml(displayName)},</p><p>Hemos recibido una solicitud para restablecer la contraseña.</p><p><a href="${this.escapeHtml(input.resetUrl)}">Restablecer contraseña</a></p>`,
    });
  }

  private async resolveAdminEmails(): Promise<string[]> {
    const admins = await this.prisma.user.findMany({
      where: { role: 'admin' },
      select: { email: true },
    });

    return collectAdminEmails(
      process.env.BREVO_ADMIN_EMAIL,
      admins.map((admin) => admin.email),
    );
  }

  /**
   * Activa SMS PRO si hay móvil válido y envía SMS de confirmación (idempotente por sourceRef).
   */
  async enableProSmsAlerts(
    userId: string,
    options?: { sourceRef?: string; sendConfirmation?: boolean },
  ): Promise<{
    enabled: boolean;
    smsSent: boolean;
    reason?: string;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phone: true,
        smsAlertsEnabled: true,
        emailVerifiedAt: true,
      },
    });
    if (!user) {
      return { enabled: false, smsSent: false, reason: 'user_not_found' };
    }
    if (!user.emailVerifiedAt) {
      return {
        enabled: false,
        smsSent: false,
        reason: 'email_not_verified',
      };
    }

    const phone = normalizePhoneForSms(user.phone);
    if (!phone) {
      return { enabled: false, smsSent: false, reason: 'no_phone' };
    }

    if (!user.smsAlertsEnabled) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { smsAlertsEnabled: true },
      });
    }

    const sendConfirmation = options?.sendConfirmation !== false;
    if (!sendConfirmation) {
      return { enabled: true, smsSent: false, reason: 'confirmation_skipped' };
    }

    const sourceRef = options?.sourceRef || `pro_sms_configured:${userId}`;
    const alreadySent = await this.prisma.deliveryLog.findFirst({
      where: {
        channel: 'sms',
        status: 'sent',
        sourceRef: { startsWith: 'pro_sms_configured:' },
        target: phone,
      },
      select: { id: true },
    });
    if (alreadySent) {
      return { enabled: true, smsSent: false, reason: 'already_notified' };
    }

    const accountUrl = smsLink(this.publicSiteUrl, '/account');
    const content = fitSmsContent(
      'Radar VPO PRO activo. Avisos SMS de nuevas promociones configurados correctamente.',
      accountUrl,
    );
    const smsSent = await this.sendSms(
      {
        sender: this.smsSender,
        recipient: phone,
        content,
        type: 'transactional',
      },
      sourceRef,
      { context: { trigger: 'pro_sms_confirmation', userId } },
    );
    return {
      enabled: true,
      smsSent,
      reason: smsSent ? undefined : 'brevo_delivery_failed',
    };
  }

  /**
   * Activa SMS y envía confirmación a PRO con móvil (o a un usuario concreto).
   * Idempotente: no reenvía si ya hubo confirmación enviada a ese móvil.
   */
  async syncProSmsAlerts(options?: {
    onlyUserId?: string;
    sendConfirmation?: boolean;
    limit?: number;
  }): Promise<{
    scanned: number;
    enabled: number;
    smsSent: number;
    skipped: number;
    results: Array<{
      userId: string;
      enabled: boolean;
      smsSent: boolean;
      reason?: string;
    }>;
  }> {
    const limit = Math.min(options?.limit ?? 200, 500);
    const users = await this.prisma.user.findMany({
      where: {
        ...(options?.onlyUserId ? { id: options.onlyUserId } : {}),
        OR: [
          { plan: 'pro' },
          {
            subscriptions: {
              some: {
                planKey: 'pro',
                status: {
                  in: [SubscriptionStatus.active, SubscriptionStatus.trialing],
                },
              },
            },
          },
        ],
      },
      select: { id: true, phone: true, smsAlertsEnabled: true },
      take: limit,
      orderBy: { createdAt: 'asc' },
    });

    const results: Array<{
      userId: string;
      enabled: boolean;
      smsSent: boolean;
      reason?: string;
    }> = [];
    let enabled = 0;
    let smsSent = 0;
    let skipped = 0;

    for (const user of users) {
      if (!normalizePhoneForSms(user.phone)) {
        skipped += 1;
        results.push({
          userId: user.id,
          enabled: false,
          smsSent: false,
          reason: 'no_phone',
        });
        continue;
      }

      const result = await this.enableProSmsAlerts(user.id, {
        sourceRef: `pro_sms_configured:sync:${user.id}`,
        sendConfirmation: options?.sendConfirmation !== false,
      });
      results.push({ userId: user.id, ...result });
      if (result.enabled) enabled += 1;
      if (result.smsSent) smsSent += 1;
      if (!result.enabled || result.reason === 'already_notified') {
        if (!result.smsSent) skipped += 1;
      }
    }

    return {
      scanned: users.length,
      enabled,
      smsSent,
      skipped,
      results,
    };
  }

  private async sendEmail(
    payload: BrevoEmailPayload,
    sourceRef = 'radar_vpo_pro',
    meta: DeliveryMeta = {},
  ) {
    return this.postBrevo(
      'https://api.brevo.com/v3/smtp/email',
      payload,
      'email',
      payload.to[0]?.email,
      sourceRef,
      { subject: payload.subject, content: payload.htmlContent, ...meta },
    );
  }

  private async sendSms(
    payload: BrevoSmsPayload,
    sourceRef = 'radar_vpo_pro',
    meta: DeliveryMeta = {},
  ) {
    return this.postBrevo(
      'https://api.brevo.com/v3/transactionalSMS/sms',
      payload,
      'sms',
      payload.recipient,
      sourceRef,
      { content: payload.content, ...meta },
    );
  }

  private async postBrevo(
    url: string,
    payload: BrevoEmailPayload | BrevoSmsPayload,
    channel: string,
    target?: string,
    sourceRef = 'radar_vpo_pro',
    meta: DeliveryMeta = {},
  ) {
    if (!isRecipientAllowed(target, messagingAllowlist())) {
      await this.recordDelivery({
        channel,
        status: 'skipped',
        target: target || 'unknown',
        sourceRef,
        errorCode: 'NON_PRODUCTION_RECIPIENT_BLOCKED',
        detail: `APP_ENV=${process.env.APP_ENV}: destinatario fuera de MESSAGING_ALLOWLIST`,
        ...meta,
      });
      return false;
    }

    if (!this.apiKey) {
      await this.recordDelivery({
        channel,
        status: 'failed',
        target: target || 'unknown',
        sourceRef,
        errorCode: 'BREVO_API_KEY_MISSING',
        detail: 'BREVO_API_KEY no configurada',
        ...meta,
      });
      return false;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'api-key': this.apiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        await this.recordDelivery({
          channel,
          status: 'failed',
          target: target || 'unknown',
          sourceRef,
          errorCode: `BREVO_${response.status}`,
          detail: await response.text(),
          ...meta,
        });
        return false;
      }

      await this.recordDelivery({
        channel,
        status: 'sent',
        target: target || 'unknown',
        sourceRef,
        ...meta,
      });
      return true;
    } catch (error) {
      await this.recordDelivery({
        channel,
        status: 'failed',
        target: target || 'unknown',
        sourceRef,
        errorCode: 'BREVO_REQUEST_FAILED',
        detail: error instanceof Error ? error.message : 'unknown',
        ...meta,
      });
      return false;
    }
  }

  private async recordDelivery(input: {
    channel: string;
    status: 'sent' | 'failed' | 'skipped';
    target: string;
    sourceRef: string;
    errorCode?: string;
    detail?: string;
    subject?: string | null;
    content?: string | null;
    context?: DeliveryContext;
  }) {
    try {
      await this.prisma.deliveryLog.create({
        data: {
          channel: input.channel,
          status: input.status,
          target: input.target,
          sourceRef: input.sourceRef,
          errorCode: input.errorCode,
          errorDetail: input.detail
            ? { detail: input.detail.slice(0, 2000) }
            : undefined,
          subject: input.subject ? input.subject.slice(0, 300) : undefined,
          content: input.content ? input.content.slice(0, 20000) : undefined,
          context: input.context
            ? (JSON.parse(JSON.stringify(input.context)) as object)
            : undefined,
        },
      });
    } catch (error) {
      this.logger.warn(
        `deliveryLog write failed: ${error instanceof Error ? error.message : 'unknown'}`,
      );
    }

    if (input.status === 'failed') {
      try {
        await this.prisma.deliveryFailure.create({
          data: {
            channel: input.channel,
            target: input.target,
            sourceRef: input.sourceRef,
            errorCode: input.errorCode || 'UNKNOWN',
            errorDetail: input.detail
              ? { detail: input.detail.slice(0, 2000) }
              : undefined,
          },
        });
      } catch (error) {
        this.logger.warn(
          `deliveryFailure write failed: ${error instanceof Error ? error.message : 'unknown'}`,
        );
      }
    }
  }

  private parseEmailSender() {
    const match = this.emailSender.match(/^(.*)<([^>]+)>$/);
    if (!match) {
      return { name: 'Radar VPO', email: this.emailSender };
    }
    return { name: match[1].trim(), email: match[2].trim() };
  }

  private escapeHtml(value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
