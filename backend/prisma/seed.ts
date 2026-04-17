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
      status: 'open',
      publishedAt: new Date('2026-03-21'),
      deadlineDate: new Date('2026-05-08'),
      sourceUrl: 'https://habitatge.gencat.cat/promocion-2026',
      rawText: 'Bases de adjudicacion para vivienda protegida en alquiler',
      aiStatus: 'done',
      publishStatus: 'published',
    },
  });

  await prisma.promotionDocument.create({
    data: {
      promotionId: promotion.id,
      documentUrl: 'https://habitatge.gencat.cat/docs/bases.pdf',
      fileType: 'pdf',
      extractedText: 'Texto extraido de las bases oficiales',
      processedAt: new Date(),
    },
  });

  await prisma.promotionAiAnalysis.create({
    data: {
      promotionId: promotion.id,
      model: 'gpt-4o-mini',
      resultJson: {
        summary: 'Promocion de alquiler protegido con cupos de juventud',
      },
      confidence: 0.91,
    },
  });

  await prisma.promotionFavorite.create({
    data: {
      userId: user.id,
      promotionId: promotion.id,
    },
  });

  await prisma.newsItem.createMany({
    data: [
      {
        sourceName: 'Ajuntament Barcelona',
        sourceUrl: 'https://ajuntament.barcelona.cat',
        itemUrl: 'https://ajuntament.barcelona.cat/noticia-vpo-1',
        title: 'Barcelona amplia parque de vivienda asequible',
        rawText: 'Nuevas promociones VPO previstas para 2026',
        summary: 'Se anuncian nuevas lineas de vivienda protegida en varios distritos.',
        relevance: 'high',
        contentHash: 'news-hash-1',
        publishedAt: new Date('2026-04-14'),
      },
      {
        sourceName: 'Generalitat',
        sourceUrl: 'https://gencat.cat',
        itemUrl: 'https://gencat.cat/noticia-vpo-2',
        title: 'Nueva convocatoria de ayudas al alquiler social',
        rawText: 'Ayudas dirigidas a colectivos vulnerables.',
        summary: 'La convocatoria refuerza el acceso a vivienda protegida en Catalunya.',
        relevance: 'medium',
        contentHash: 'news-hash-2',
        publishedAt: new Date('2026-04-13'),
      },
    ],
    skipDuplicates: true,
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
