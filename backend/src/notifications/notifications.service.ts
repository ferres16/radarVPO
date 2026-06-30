import { Injectable, Logger } from '@nestjs/common';
import { AudienceType, Prisma, Promotion, SubscriptionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { normalizePhoneForSms } from './phone-normalize';

type ProAlertPromotion = Pick<
  Promotion,
  'id' | 'title' | 'municipality' | 'province' | 'estimatedPublicationDate'
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
  private readonly frontendUrl = (
    process.env.FRONTEND_URL || 'https://radar-vpo-frontend-ten.vercel.app'
  ).replace(/\/$/, '');

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
    return `${this.frontendUrl}/alerts`;
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
    if (!this.isProAlertsConfigured()) {
      return { skipped: true, reason: 'brevo_not_configured', sent: 0, promotionId };
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

    if (!promotion || promotion.status !== 'pending_review') {
      return { skipped: true, reason: 'not_pending_alert', sent: 0, promotionId };
    }

    const existing = await this.prisma.publishedPost.findFirst({
      where: {
        sourceKind: 'promotion_alert',
        sourceId: promotion.id,
        audience: AudienceType.pro,
        channel: 'brevo',
        status: 'sent',
      },
      select: { id: true },
    });

    if (existing && !options.force) {
      return { skipped: true, reason: 'already_sent', sent: 0, promotionId, title: promotion.title };
    }

    const result = await this.sendProAlert(promotion);
    if (result.sent > 0) {
      if (existing && options.force) {
        await this.prisma.publishedPost.update({
          where: { id: existing.id },
          data: {
            payloadJson: {
              title: promotion.title,
              sent: result.sent,
              channels: result.channels,
              alertsUrl: this.getAlertsPageUrl(),
              forced: true,
            } as Prisma.InputJsonValue,
            sentAt: new Date(),
          },
        });
      } else {
        await this.prisma.publishedPost.create({
          data: {
            sourceKind: 'promotion_alert',
            sourceId: promotion.id,
            audience: AudienceType.pro,
            channel: 'brevo',
            payloadJson: {
              title: promotion.title,
              sent: result.sent,
              channels: result.channels,
              alertsUrl: this.getAlertsPageUrl(),
            } as Prisma.InputJsonValue,
            status: 'sent',
            sentAt: new Date(),
          },
        });
      }
      this.logger.log(
        `Pro alert notification sent for promotion ${promotion.id}: ${result.sent} deliveries (${result.channels.join(', ')})`,
      );
    } else {
      this.logger.warn(`Pro alert notification produced zero deliveries for promotion ${promotion.id}`);
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
      proUsers: result.proUsers,
      emailsSent: result.emailsSent,
      smsSent: result.smsSent,
    };
  }

  private async sendProAlert(promotion: ProAlertPromotion) {
    const users = await this.prisma.user.findMany({
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
      select: { id: true, email: true, fullName: true, phone: true },
    });

    const channels: string[] = [];
    let sent = 0;
    let emailsSent = 0;
    let smsSent = 0;
    const alertsUrl = this.getAlertsPageUrl();
    const location = [promotion.municipality, promotion.province].filter(Boolean).join(', ') || 'Cataluña';
    const estimatedDate = promotion.estimatedPublicationDate
      ? new Date(promotion.estimatedPublicationDate).toLocaleDateString('es-ES')
      : null;

    for (const user of users) {
      const displayName = user.fullName || 'usuario PRO';
      const subject = `Nueva alerta VPO: ${promotion.title}`;
      const sms = this.buildSmsMessage({ location, alertsUrl });
      const html = this.buildEmailHtml({
        displayName,
        promotionTitle: promotion.title,
        location,
        estimatedDate,
        alertsUrl,
      });

      const emailSent = await this.sendEmail({
        sender: this.parseEmailSender(),
        to: [{ email: user.email, name: displayName }],
        subject,
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
          content: sms,
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

  private buildSmsMessage({ location, alertsUrl }: { location: string; alertsUrl: string }) {
    const message = `Radar VPO PRO: nueva alerta en ${location}. Ver lanzamientos: ${alertsUrl}`;
    return message.slice(0, 160);
  }

  private buildEmailHtml({
    displayName,
    promotionTitle,
    location,
    estimatedDate,
    alertsUrl,
  }: {
    displayName: string;
    promotionTitle: string;
    location: string;
    estimatedDate: string | null;
    alertsUrl: string;
  }) {
    const estimatedHtml = estimatedDate
      ? `<p style="margin:0 0 16px;color:#4b5563;">Fecha estimada de publicación: <strong>${this.escapeHtml(estimatedDate)}</strong></p>`
      : '';

    return `
      <div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#0b1220;max-width:560px;">
        <p style="margin:0 0 16px;">Hola ${this.escapeHtml(displayName)},</p>
        <p style="margin:0 0 16px;">Hemos publicado una <strong>nueva alerta de próximo lanzamiento</strong> en Radar VPO PRO.</p>
        <div style="margin:0 0 20px;padding:16px 18px;border:1px solid #e5e7eb;border-radius:16px;background:#f8faf9;">
          <p style="margin:0 0 8px;font-size:18px;font-weight:700;">${this.escapeHtml(promotionTitle)}</p>
          <p style="margin:0;color:#4b5563;">Zona: ${this.escapeHtml(location)}</p>
        </div>
        ${estimatedHtml}
        <p style="margin:0 0 20px;color:#4b5563;">Entra en la web para revisar el aviso y preparar tu solicitud antes de que abra el plazo.</p>
        <p style="margin:0 0 24px;">
          <a href="${this.escapeHtml(alertsUrl)}" style="display:inline-block;background:#167055;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:999px;">
            Ver próximos lanzamientos
          </a>
        </p>
        <p style="margin:0;font-size:13px;color:#6b7280;">Si el botón no funciona, copia este enlace: <a href="${this.escapeHtml(alertsUrl)}">${this.escapeHtml(alertsUrl)}</a></p>
      </div>
    `;
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
