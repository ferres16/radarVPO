import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const shouldSeed = process.env.SEED_SAMPLE_DATA === 'true';
  if (!shouldSeed) {
    console.log('Seed skipped (set SEED_SAMPLE_DATA=true to enable).');
    return;
  }

  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPasswordRaw = process.env.SEED_ADMIN_PASSWORD;
  const userEmail = process.env.SEED_USER_EMAIL;
  const userPasswordRaw = process.env.SEED_USER_PASSWORD;

  if (!adminEmail || !adminPasswordRaw || !userEmail || !userPasswordRaw) {
    throw new Error(
      'Missing seed credentials. Provide SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD, SEED_USER_EMAIL, SEED_USER_PASSWORD.',
    );
  }

  const adminPassword = await bcrypt.hash(adminPasswordRaw, 10);
  const userPassword = await bcrypt.hash(userPasswordRaw, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      fullName: 'Radar Admin',
      phone: '+34 600 111 222',
      passwordHash: adminPassword,
      role: 'admin',
      plan: 'pro',
    },
  });

  const user = await prisma.user.upsert({
    where: { email: userEmail },
    update: {},
    create: {
      email: userEmail,
      fullName: 'Usuario Demo',
      phone: '+34 600 222 333',
      passwordHash: userPassword,
      role: 'user',
      plan: 'free',
    },
  });

  const source = await prisma.source.upsert({
    where: { id: 'source-catalunya' },
    update: {},
    create: {
      id: 'source-catalunya',
      name: 'Habitatge Generalitat',
      sourceType: 'official',
      baseUrl: 'https://habitatge.gencat.cat',
      active: true,
    },
  });

  const promotion = await prisma.promotion.create({
    data: {
      sourceId: source.id,
      title: 'Promocion VPO Sant Cugat 2026',
      location: 'Sant Cugat del Valles',
      municipality: 'Sant Cugat del Valles',
      province: 'Barcelona',
      autonomousCommunity: 'Cataluna',
      promotionType: 'alquiler',
      targetScope: 'catalunya',
      tenureType: 'arrendamiento',
      status: 'published_reviewed',
      publishedAt: new Date('2026-03-21'),
      deadlineDate: new Date('2026-05-08'),
      sourceUrl: 'https://habitatge.gencat.cat/promocion-2026',
      rawText: 'Alerta inicial registrada para promocion de alquiler protegido.',
      promoter: 'Incasol',
      totalHomes: 42,
      generalInfo: {
        statusLabel: 'Publicado',
      },
      importantDates: {
        publicationDate: '2026-03-21',
        applicationDeadline: '2026-05-08',
      },
      requirements: {
        income: 'Segun bases de convocatoria',
      },
      economicInfo: {
        averageRent: 520,
      },
      feesAndReservations: {
        reservation: 300,
      },
      contactInfo: {
        email: 'info@habitatge.gencat.cat',
      },
      publicDescription:
        'Promocion de alquiler protegido con prioridad para unidades familiares.',
    },
  });

  await prisma.promotionDocument.create({
    data: {
      promotionId: promotion.id,
      documentKind: 'pdf_original',
      fileType: 'pdf',
      originalName: 'bases.pdf',
      storagePath: 'seed/promocion/bases.pdf',
      publicUrl: 'https://habitatge.gencat.cat/docs/bases.pdf',
    },
  });

  await prisma.promotionUnit.create({
    data: {
      promotionId: promotion.id,
      rowOrder: 1,
      unitLabel: 'Escalera A - 1o 1a',
      floor: '1',
      door: '1',
      bedrooms: 2,
      monthlyRent: 520,
      reservation: 300,
    },
  });

  await prisma.promotionFavorite.create({
    data: {
      userId: user.id,
      promotionId: promotion.id,
    },
  });


  await prisma.savedSearch.create({
    data: {
      userId: user.id,
      name: 'Alquiler Barcelona',
      filtersJson: {
        municipality: 'Barcelona',
        promotionType: 'alquiler',
      },
      notificationsOn: true,
    },
  });

  await prisma.userAlert.create({
    data: {
      userId: user.id,
      type: 'upcoming',
      channel: 'email',
      enabled: true,
      configJson: {
        cadence: 'daily',
      },
    },
  });

  await prisma.reminder.create({
    data: {
      userId: user.id,
      kind: 'deadline',
      payload: {
        promotionId: promotion.id,
      },
      remindAt: new Date(Date.now() + 86400000),
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'seed_initialized',
      entity: 'system',
      entityId: 'seed-2026',
      metadata: { source: 'prisma/seed.ts' },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
