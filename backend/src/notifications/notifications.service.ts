import { Injectable, Logger } from '@nestjs/common';
import { AudienceType, Promotion, SubscriptionStatus } from '@prisma/client';
import { MessageTemplatesService } from '../commerce/message-templates.service';
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
} from './message-vars';
import { userMatchesProAlertPreferences } from '../common/pro-alert-preferences';

/** SMS PRO: solo publicación oficial por defecto (aunque el usuario tenga SMS on). */
const PRO_SMS_KINDS = new Set<ProNotifyKind>(['new_publication']);

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
  private readonly smsSender = process.env.BREVO_SMS_SENDER || 'RadarVPO';
  private readonly emailSender =
    process.env.BREVO_EMAIL_SENDER || 'Radar VPO <info@radarvpo.com>';
  private readonly proAlertsEnabled =
    process.env.BREVO_PRO_ALERTS_ENABLED === 'true';
  private readonly publicSiteUrl = resolvePublicSiteUrl();

  constructor(
    private readonly prisma: PrismaService,
    private readonly templates: MessageTemplatesService,
  ) {}

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
          where: { sourceRef: 'radar_vpo_pro' },
          orderBy: { createdAt: 'desc' },
          take: 5,
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
      recentFailures,
    };
  }

  getAlertsPageUrl() {
    return `${this.publicSiteUrl}/alerts`;
  }

  async notifyProUsersForPendingAlerts(
    limit = 20,
    options: { force?: boolean } = {},
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
      const result = await this.notifyProUsersForPromotion(
        promotion.id,
        options,
      );
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
    options: { force?: boolean } = {},
  ): Promise<NotifyResult> {
    return this.notifyProEvent(promotionId, 'new_alert', options);
  }

  async notifyProUsersForPublication(
    promotionId: string,
    options: { force?: boolean } = {},
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
      const result = await this.notifyProEvent(alert.id, kind);
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
    options: { force?: boolean; simulate?: boolean; onlyUserId?: string } = {},
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
  ) {
    const isReminder = kind === 'reminder_7d' || kind === 'reminder_1d';
    const favoriteUserIds = isReminder
      ? new Set(
          (
            await this.prisma.promotionFavorite.findMany({
              where: { promotionId: promotion.id },
              select: { userId: true },
            })
          ).map((row) => row.userId),
        )
      : null;

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
        alertMunicipalityIds: true,
        alertPromotionTypes: true,
      },
    });

    const preferenceFiltered = users.filter((user) =>
      userMatchesProAlertPreferences(user, promotion),
    );

    const recipients = favoriteUserIds
      ? preferenceFiltered.filter((user) => favoriteUserIds.has(user.id))
      : preferenceFiltered;

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

    for (const user of recipients) {
      const displayName = displayNameOrEmpty(user.fullName);
      const html = this.buildSlimProEmailHtml({
        bodyHtml: copy.intro,
        pageUrl: copy.pageUrl,
      });

      const emailSent = await this.sendEmail({
        sender: this.parseEmailSender(),
        to: [{ email: user.email, name: displayName || undefined }],
        subject: copy.subject,
        htmlContent: html,
      });
      if (emailSent) {
        sent += 1;
        emailsSent += 1;
        channels.push('email');
      }

      const wantSms =
        user.smsAlertsEnabled &&
        PRO_SMS_KINDS.has(kind) &&
        Boolean(copy.sms?.trim());
      const normalizedPhone = wantSms ? normalizePhoneForSms(user.phone) : null;
      if (normalizedPhone && copy.sms) {
        const smsSentForUser = await this.sendSms({
          sender: this.smsSender,
          recipient: normalizedPhone,
          content: copy.sms,
          type: 'transactional',
        });
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
        ? this.templates.render(tpl.emailBody, vars)
        : fallback.intro;
    const smsRaw =
      tpl?.smsBody != null
        ? this.templates.render(tpl.smsBody, vars)
        : fallback.sms;
    const smsBodyOnly = smsRaw.replace(pageUrl, '').trim();
    const sms = fitSmsContent(smsBodyOnly || smsRaw, pageUrl);

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
      pageUrl,
      disclaimer: null,
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
        ? this.templates.render(tpl.emailBody, vars)
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
    return this.sendEmail({
      sender: this.parseEmailSender(),
      to: [{ email: input.toEmail, name: vars.name || undefined }],
      subject: subject.slice(0, 140),
      htmlContent: html,
    });
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

  private async sendEmail(payload: BrevoEmailPayload) {
    return this.postBrevo(
      'https://api.brevo.com/v3/smtp/email',
      payload,
      'email',
      payload.to[0]?.email,
    );
  }

  private async sendSms(payload: BrevoSmsPayload) {
    return this.postBrevo(
      'https://api.brevo.com/v3/transactionalSMS/sms',
      payload,
      'sms',
      payload.recipient,
    );
  }

  private async postBrevo(
    url: string,
    payload: BrevoEmailPayload | BrevoSmsPayload,
    channel: string,
    target?: string,
  ) {
    if (!this.apiKey) return false;

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
        await this.recordFailure(
          channel,
          target || 'unknown',
          `BREVO_${response.status}`,
          await response.text(),
        );
        return false;
      }

      return true;
    } catch (error) {
      await this.recordFailure(
        channel,
        target || 'unknown',
        'BREVO_REQUEST_FAILED',
        error instanceof Error ? error.message : 'unknown',
      );
      return false;
    }
  }

  private async recordFailure(
    channel: string,
    target: string,
    errorCode: string,
    detail: string,
  ) {
    await this.prisma.deliveryFailure.create({
      data: {
        channel,
        target,
        sourceRef: 'radar_vpo_pro',
        errorCode,
        errorDetail: { detail },
      },
    });
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
