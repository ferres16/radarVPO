import { Injectable, Logger } from '@nestjs/common';
import { AudienceType, Prisma, Promotion, SubscriptionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { normalizePhoneForSms } from './phone-normalize';
import { isAmendmentPublication, shortenAlertTitle } from '../common/promotion-content-filters';
import { resolvePublicSiteUrl } from '../common/public-site-url';
import { collectAdminEmails } from './admin-emails';
import {
  calendarDaysUntil,
  PRO_NOTIFY_SOURCE_KIND,
  type ProNotifyKind,
} from './pro-notify.util';
import { buildProNotifyCopy } from './pro-notify-copy';

type ProAlertPromotion = Pick<
  Promotion,
  'id' | 'title' | 'municipality' | 'province' | 'estimatedPublicationDate' | 'status'
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
  private readonly emailSender = process.env.BREVO_EMAIL_SENDER || 'Radar VPO <info@radarvpo.com>';
  private readonly proAlertsEnabled = process.env.BREVO_PRO_ALERTS_ENABLED === 'true';
  private readonly publicSiteUrl = resolvePublicSiteUrl();

  constructor(private readonly prisma: PrismaService) {}

  isProAlertsConfigured() {
    return Boolean(this.proAlertsEnabled && this.apiKey);
  }

  async getProAlertsDiagnostics() {
    const [pendingAlerts, proUsers, proUserRows, recentFailures] = await Promise.all([
      this.prisma.promotion.count({ where: { status: 'pending_review' } }),
      this.prisma.user.count({
        where: {
          OR: [
            { plan: 'pro' },
            {
              subscriptions: {
                some: {
                  planKey: 'pro',
                  status: { in: [SubscriptionStatus.active, SubscriptionStatus.trialing] },
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
                  status: { in: [SubscriptionStatus.active, SubscriptionStatus.trialing] },
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

    const proUsersWithPhone = proUserRows.filter((user) => normalizePhoneForSms(user.phone)).length;

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
      this.logger.log('Brevo Pro alerts skipped: missing BREVO_API_KEY or BREVO_PRO_ALERTS_ENABLED=true');
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
      const result = await this.notifyProUsersForPromotion(promotion.id, options);
      promotionResults.push({ ...result, title: promotion.title });
      if (!result.skipped) {
        sent += result.sent;
      }
    }

    const skippedResults = promotionResults.filter((result) => result.skipped);
    const failedResults = promotionResults.filter((result) => !result.skipped && result.sent === 0);

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

  async notifyDueReminders(): Promise<{ sent: number; results: NotifyResult[] }> {
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
        province: true,
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
        return { skipped: true, reason: 'not_published', sent: 0, promotionId, kind };
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

    const result = await this.sendProBroadcast(promotion, kind, options.onlyUserId);
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
            } as Prisma.InputJsonValue,
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
            } as Prisma.InputJsonValue,
            status: 'sent',
            sentAt: new Date(),
          },
        });
      }
      this.logger.log(
        `PRO ${kind} sent for ${promotion.id}: ${result.sent} deliveries (${result.channels.join(', ')})`,
      );
    } else if (result.sent === 0) {
      this.logger.warn(`PRO ${kind} produced zero deliveries for ${promotion.id}`);
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
    const users = await this.prisma.user.findMany({
      where: onlyUserId
        ? { id: onlyUserId }
        : {
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
      select: { id: true, email: true, fullName: true, phone: true },
    });

    const channels: string[] = [];
    let sent = 0;
    let emailsSent = 0;
    let smsSent = 0;
    const copy = this.buildProCopy(promotion, kind);

    for (const user of users) {
      const displayName = user.fullName || 'usuario PRO';
      const html = this.buildEmailHtml({
        displayName,
        intro: copy.intro,
        promotionTitle: copy.title,
        location: copy.location,
        estimatedDate: copy.estimatedDate,
        ctaLabel: copy.ctaLabel,
        pageUrl: copy.pageUrl,
        disclaimer: copy.disclaimer,
      });

      const emailSent = await this.sendEmail({
        sender: this.parseEmailSender(),
        to: [{ email: user.email, name: displayName }],
        subject: copy.subject,
        htmlContent: html,
      });
      if (emailSent) {
        sent += 1;
        emailsSent += 1;
        channels.push('email');
      }

      const normalizedPhone = normalizePhoneForSms(user.phone);
      if (normalizedPhone) {
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
      proUsers: users.length,
      emailsSent,
      smsSent,
    };
  }

  private buildProCopy(promotion: ProAlertPromotion, kind: ProNotifyKind) {
    const title = shortenAlertTitle(promotion.title);
    const location =
      [promotion.municipality, promotion.province].filter(Boolean).join(', ') ||
      'Cataluña';
    const estimatedDate = promotion.estimatedPublicationDate
      ? new Date(promotion.estimatedPublicationDate).toLocaleDateString('es-ES', {
          timeZone: 'Europe/Madrid',
        })
      : null;

    return buildProNotifyCopy({
      kind,
      title,
      location,
      estimatedDate,
      alertsUrl: `${this.publicSiteUrl}/alerts`,
      promotionsUrl: `${this.publicSiteUrl}/promotions/${promotion.id}`,
    });
  }

  private buildEmailHtml({
    displayName,
    intro,
    promotionTitle,
    location,
    estimatedDate,
    ctaLabel,
    pageUrl,
    disclaimer,
  }: {
    displayName: string;
    intro: string;
    promotionTitle: string;
    location: string;
    estimatedDate: string | null;
    ctaLabel: string;
    pageUrl: string;
    disclaimer: string | null;
  }) {
    const estimatedHtml = estimatedDate
      ? `<p style="margin:0 0 12px;color:#4b5563;">Fecha estimada (no confirmada): <strong>${this.escapeHtml(estimatedDate)}</strong></p>`
      : '';
    const disclaimerHtml = disclaimer
      ? `<p style="margin:0 0 20px;font-size:13px;color:#6b7280;">${this.escapeHtml(disclaimer)}</p>`
      : '';

    return `
      <div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#0b1220;max-width:560px;">
        <p style="margin:0 0 16px;">Hola ${this.escapeHtml(displayName)},</p>
        <p style="margin:0 0 16px;">${intro}</p>
        <div style="margin:0 0 20px;padding:16px 18px;border:1px solid #e5e7eb;border-radius:16px;background:#f8faf9;">
          <p style="margin:0 0 8px;font-size:18px;font-weight:700;">${this.escapeHtml(promotionTitle)}</p>
          <p style="margin:0;color:#4b5563;">Zona: ${this.escapeHtml(location)}</p>
        </div>
        ${estimatedHtml}
        ${disclaimerHtml}
        <p style="margin:0 0 24px;">
          <a href="${this.escapeHtml(pageUrl)}" style="display:inline-block;background:#167055;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:999px;">
            ${this.escapeHtml(ctaLabel)}
          </a>
        </p>
        <p style="margin:0;font-size:13px;color:#6b7280;">Si el botón no funciona, copia este enlace: <a href="${this.escapeHtml(pageUrl)}">${this.escapeHtml(pageUrl)}</a></p>
      </div>
    `;
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
    const requestedAt = input.requestedAt.toLocaleString('es-ES', {
      timeZone: 'Europe/Madrid',
    });
    const panelUrl = `${this.publicSiteUrl}/admin/cancellations`;
    const sent = await this.sendEmail({
      sender: this.parseEmailSender(),
      to: recipients.map((email) => ({ email })),
      subject: `[Radar VPO] Baja PRO solicitada: ${displayName}`,
      htmlContent: `
        <div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#0b1220;max-width:560px;">
          <p style="margin:0 0 16px;">Un usuario ha solicitado dar de baja VPO PRO.</p>
          <div style="margin:0 0 20px;padding:16px 18px;border:1px solid #e5e7eb;border-radius:16px;background:#f8faf9;">
            <p style="margin:0 0 8px;font-size:18px;font-weight:700;">${this.escapeHtml(displayName)}</p>
            <p style="margin:0 0 4px;color:#4b5563;">Email: ${this.escapeHtml(input.email)}</p>
            <p style="margin:0 0 4px;color:#4b5563;">Teléfono: ${this.escapeHtml(input.phone || 'n/d')}</p>
            <p style="margin:0;color:#4b5563;">Solicitado: ${this.escapeHtml(requestedAt)}</p>
          </div>
          <p style="margin:0 0 20px;color:#4b5563;">Entra al panel de anulaciones para procesar la baja en Stripe y en Radar VPO.</p>
          <p style="margin:0 0 24px;">
            <a href="${this.escapeHtml(panelUrl)}" style="display:inline-block;background:#167055;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:999px;">
              Ver anulaciones
            </a>
          </p>
          <p style="margin:0;font-size:13px;color:#6b7280;">ID usuario: ${this.escapeHtml(input.userId)}</p>
        </div>
      `,
    });

    if (!sent) {
      this.logger.warn(
        `Admin cancellation email failed for user ${input.userId} (${input.email})`,
      );
    }

    return { sent, recipients: recipients.length };
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
    return this.postBrevo('https://api.brevo.com/v3/smtp/email', payload, 'email', payload.to[0]?.email);
  }

  private async sendSms(payload: BrevoSmsPayload) {
    return this.postBrevo('https://api.brevo.com/v3/transactionalSMS/sms', payload, 'sms', payload.recipient);
  }

  private async postBrevo(url: string, payload: BrevoEmailPayload | BrevoSmsPayload, channel: string, target?: string) {
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
        await this.recordFailure(channel, target || 'unknown', `BREVO_${response.status}`, await response.text());
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

  private async recordFailure(channel: string, target: string, errorCode: string, detail: string) {
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
