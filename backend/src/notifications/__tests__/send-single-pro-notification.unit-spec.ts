import { NotificationsService } from '../notifications.service';

function buildService(promotion: Record<string, unknown> | null) {
  const prisma = {
    promotion: { findUnique: jest.fn().mockResolvedValue(promotion) },
    publishedPost: {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn(),
    },
    user: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'u1',
          email: 'pro@example.test',
          fullName: 'Pro',
          phone: '',
          smsAlertsEnabled: false,
        },
      ]),
    },
    deliveryLog: { create: jest.fn() },
  };
  const service = new NotificationsService(prisma as never, {} as never);
  return { service, prisma };
}

const pendingAlert = {
  id: 'promo-1',
  title: "Propera adjudicació d'habitatges d'HPO a Pallejà",
  municipality: 'Pallejà',
  municipalityId: null,
  province: 'Barcelona',
  promotionType: null,
  estimatedPublicationDate: new Date('2027-01-11T00:00:00Z'),
  status: 'pending_review',
};

describe('NotificationsService.sendSingleProNotification', () => {
  const env = process.env;

  beforeEach(() => {
    process.env = {
      ...env,
      BREVO_API_KEY: 'test-key',
      BREVO_PRO_ALERTS_ENABLED: 'true',
      APP_ENV: 'production',
    };
  });

  afterEach(() => {
    process.env = env;
  });

  it('sends one notice, tagged as a single admin send, and records it', async () => {
    const { service, prisma } = buildService(pendingAlert);
    const broadcast = jest
      .spyOn(service as never, 'sendProBroadcast')
      .mockResolvedValue({
        sent: 2,
        channels: ['email'],
        proUsers: 1,
        emailsSent: 2,
        smsSent: 0,
        noCopy: false,
      });

    const result = await service.sendSingleProNotification(
      'promo-1',
      'new_alert',
    );

    expect(result).toMatchObject({ skipped: false, sent: 2 });
    expect(broadcast).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'promo-1' }),
      'new_alert',
      undefined,
      'admin_send_single',
    );
    expect(prisma.publishedPost.create).toHaveBeenCalledTimes(1);
  });

  it('never resends a notice that was already delivered', async () => {
    const { service, prisma } = buildService(pendingAlert);
    prisma.publishedPost.findFirst.mockResolvedValue({ id: 'post-1' });
    const broadcast = jest.spyOn(service as never, 'sendProBroadcast');

    const result = await service.sendSingleProNotification(
      'promo-1',
      'new_alert',
    );

    expect(result).toMatchObject({ skipped: true, reason: 'already_sent' });
    expect(broadcast).not.toHaveBeenCalled();
  });

  it('reports a missing location instead of a Brevo failure', async () => {
    const { service, prisma } = buildService({
      ...pendingAlert,
      municipality: null,
      province: null,
    });

    const result = await service.sendSingleProNotification(
      'promo-1',
      'new_alert',
    );

    expect(result).toMatchObject({
      skipped: true,
      reason: 'missing_location_or_template',
      sent: 0,
    });
    expect(prisma.publishedPost.create).not.toHaveBeenCalled();
  });
});
