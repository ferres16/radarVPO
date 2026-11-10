import { PrismaClient } from '@prisma/client';
import { JobsService } from '../src/jobs/jobs.service';
import { UsersService } from '../src/users/users.service';

/**
 * Pruebas contra PostgreSQL real. Solo se ejecutan con TEST_DATABASE_URL
 * apuntando a una base de datos desechable con las migraciones aplicadas.
 */
const databaseUrl = process.env.TEST_DATABASE_URL;
const describeDb = databaseUrl ? describe : describe.skip;

describeDb('data lifecycle (PostgreSQL)', () => {
  let prisma: PrismaClient;
  const suffix = Date.now().toString(36);

  beforeAll(async () => {
    prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  async function createUser(email: string) {
    return prisma.user.create({
      data: {
        email,
        fullName: 'Test User',
        phone: '+34600000000',
        passwordHash: 'x',
        emailVerifiedAt: new Date(),
        plan: 'pro',
        smsAlertsEnabled: true,
      },
    });
  }

  it('anonymizes an account but keeps purchases and checkout consent', async () => {
    const user = await createUser(`buyer-${suffix}@example.test`);
    const purchase = await prisma.purchase.create({
      data: {
        userId: user.id,
        provider: 'stripe',
        providerRef: `cs_test_${suffix}`,
        productKey: 'guide',
        status: 'paid',
        purchasedAt: new Date(),
      },
    });
    await prisma.purchaseConsent.create({
      data: {
        userId: user.id,
        purchaseId: purchase.id,
        stripeSessionId: `cs_test_${suffix}`,
        productKey: 'guide',
        termsVersion: 'v1',
        termsTextSnapshot: 'terms',
        termsAcceptedAt: new Date(),
      },
    });
    await prisma.deliveryLog.create({
      data: {
        channel: 'email',
        status: 'sent',
        target: user.email,
        content: '<p>hola</p>',
      },
    });

    const billing = { cancelStripeSubscriptionsForUser: jest.fn() };
    const users = new UsersService(
      prisma as never,
      {} as never,
      {} as never,
      billing as never,
    );
    const admin = await createUser(`admin-${suffix}@example.test`);
    await users.anonymizeAccount(user.id, {
      actorUserId: admin.id,
      allowAdmin: true,
    });
    expect(
      await prisma.auditLog.count({
        where: { userId: admin.id, action: 'admin.user.anonymized' },
      }),
    ).toBe(1);

    const after = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
    });
    expect(after.email).toBe(`deleted.${user.id}@deleted.invalid`);
    expect(after.phone).toBe('');
    expect(after.plan).toBe('free');
    expect(after.emailVerifiedAt).toBeNull();
    expect(after.smsAlertsEnabled).toBe(false);
    expect(await prisma.purchase.count({ where: { userId: user.id } })).toBe(1);
    expect(
      await prisma.purchaseConsent.count({ where: { userId: user.id } }),
    ).toBe(1);
    expect(
      await prisma.deliveryLog.count({ where: { target: user.email } }),
    ).toBe(0);
  });

  it('purges only expired technical data', async () => {
    const user = await createUser(`retention-${suffix}@example.test`);
    const old = new Date(Date.now() - 400 * 24 * 60 * 60 * 1000);
    const recent = new Date();
    await prisma.session.createMany({
      data: [
        {
          id: `old-${suffix}`,
          userId: user.id,
          refreshTokenHash: 'h',
          expiresAt: old,
        },
        {
          id: `live-${suffix}`,
          userId: user.id,
          refreshTokenHash: 'h',
          expiresAt: new Date(Date.now() + 86_400_000),
        },
      ],
    });
    await prisma.deliveryLog.createMany({
      data: [
        {
          channel: 'sms',
          status: 'sent',
          target: `old-${suffix}`,
          createdAt: old,
        },
        {
          channel: 'sms',
          status: 'sent',
          target: `new-${suffix}`,
          createdAt: recent,
        },
      ],
    });

    const jobs = new JobsService(
      prisma as never,
      {} as never,
      {} as never,
      {} as never,
    );
    const result = await jobs.runDataRetention();

    expect(result.sessions).toBeGreaterThanOrEqual(1);
    expect(
      await prisma.session.findUnique({ where: { id: `live-${suffix}` } }),
    ).not.toBeNull();
    expect(
      await prisma.session.findUnique({ where: { id: `old-${suffix}` } }),
    ).toBeNull();
    expect(
      await prisma.deliveryLog.count({ where: { target: `new-${suffix}` } }),
    ).toBe(1);
    expect(
      await prisma.deliveryLog.count({ where: { target: `old-${suffix}` } }),
    ).toBe(0);
  });
});
