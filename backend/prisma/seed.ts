import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('Admin1234!', 10);
  const userPassword = await bcrypt.hash('User12345!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@radarvpo.com' },
    update: {},
    create: {
      email: 'admin@radarvpo.com',
      fullName: 'Radar Admin',
      passwordHash: adminPassword,
      role: 'admin',
      plan: 'pro',
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@radarvpo.com' },
    update: {},
    create: {
      email: 'user@radarvpo.com',
      fullName: 'Usuario Demo',
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
      status: 'published',
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

  await prisma.educationalTopic.create({
    data: {
      title: 'Como preparar documentacion VPO',
      description: 'Checklist para expedientes de inscripcion',
      active: true,
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
