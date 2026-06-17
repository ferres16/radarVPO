import { Injectable, Logger } from '@nestjs/common';
import { AudienceType, Prisma, Promotion, SubscriptionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type ProAlertPromotion = Pick<Promotion, 'id' | 'title' | 'municipality' | 'province' | 'estimatedPublicationDate'>;

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
};

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly apiKey = process.env.BREVO_API_KEY;
  private readonly smsSender = process.env.BREVO_SMS_SENDER || 'RadarVPO';
  private readonly emailSender = process.env.BREVO_EMAIL_SENDER || 'Radar VPO <info@radarvpo.com>';
  private readonly proAlertsEnabled = process.env.BREVO_PRO_ALERTS_ENABLED === 'true';

  constructor(private readonly prisma: PrismaService) {}

  async notifyProUsersForPendingAlerts(limit = 5) {
    if (!this.proAlertsEnabled || !this.apiKey) {
      this.logger.log('Brevo Pro alerts skipped: missing BREVO_API_KEY or BREVO_PRO_ALERTS_ENABLED=true');
      return { skipped: true, reason: 'brevo_not_configured', sent: 0 };
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

    let sent = 0;
    for (const promotion of promotions) {
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

      if (existing) {
        continue;
      }

      const result = await this.sendProAlert(promotion);
      if (result.sent > 0) {
        sent += result.sent;
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
            } as Prisma.InputJsonValue,
            status: 'sent',
            sentAt: new Date(),
          },
        });
      }
    }

    return { skipped: false, sent };
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
    for (const user of users) {
      const displayName = user.fullName || 'Radar VPO Pro';
      const location = [promotion.municipality, promotion.province].filter(Boolean).join(', ') || 'Cataluña';
      const subject = `Nueva alerta Radar VPO Pro: ${promotion.title}`;
      const sms = `Radar VPO Pro: nueva alerta en ${location}. Revisa ${promotion.title}.`;
      const html = `
        <p>Hola ${this.escapeHtml(displayName)},</p>
        <p>Radar VPO Pro ha detectado una oportunidad que conviene revisar:</p>
        <p><strong>${this.escapeHtml(promotion.title)}</strong></p>
        <p>Zona: ${this.escapeHtml(location)}</p>
        <p>Entra en Radar VPO para revisar la ficha y preparar el siguiente paso.</p>
      `;

      const emailSent = await this.sendEmail({
        sender: this.parseEmailSender(),
        to: [{ email: user.email, name: displayName }],
        subject,
        htmlContent: html,
      });
      if (emailSent) {
        sent += 1;
        channels.push('email');
      }

      if (user.phone) {
        const smsSent = await this.sendSms({
          sender: this.smsSender,
          recipient: user.phone,
          content: sms.slice(0, 160),
        });
        if (smsSent) {
          sent += 1;
          channels.push('sms');
        }
      }
    }

    return { sent, channels: [...new Set(channels)] };
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
      await this.recordFailure(channel, target || 'unknown', 'BREVO_REQUEST_FAILED', error instanceof Error ? error.message : 'unknown');
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
