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
      phone: '+34 600 111 222',
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

  await prisma.educationalAsset.deleteMany();
  await prisma.educationalPost.deleteMany();
  await prisma.educationalTopic.deleteMany();

  const essentialCourse = await prisma.educationalTopic.create({
    data: {
      slug: 'guia-vpo-esencial',
      title: 'Guia VPO esencial',
      description: 'Guia completa para conseguir una vivienda de VPO en Cataluna, paso a paso.',
      active: true,
    },
  });

  const proCourse = await prisma.educationalTopic.create({
    data: {
      slug: 'guia-pro',
      title: 'Curso avanzado Radar VPO',
      description: 'Curso avanzado con modulos y recursos actualizados.',
      active: true,
    },
  });

  await prisma.educationalPost.createMany({
    data: [
      {
        topicId: essentialCourse.id,
        slug: 'que-es-vpo',
        title: 'Modulo 1 - Que es una vivienda de VPO',
        summary: 'Definicion, limites de precio y reglas de uso.',
        position: 1,
        body:
          'Las Viviendas de Proteccion Oficial (VPO) son inmuebles con precio limitado por ley, destinados a personas con ingresos dentro de rangos establecidos. La administracion regula su acceso para garantizar el derecho a una vivienda digna.\n\nNo es vivienda libre: hay requisitos, limites de precio y obligaciones de uso como residencia habitual.',
        publishedAt: new Date('2026-04-01'),
      },
      {
        topicId: essentialCourse.id,
        slug: 'tipos-de-vpo',
        title: 'Modulo 2 - Tipos de VPO segun su regimen',
        summary: 'Alquiler, compra y modalidades mas comunes.',
        position: 2,
        body:
          'Puedes optar por alquiler o compra. En compra hay dos modalidades: pleno dominio o derecho de superficie.\n\n- Alquiler social: para situaciones de vulnerabilidad, con renta muy reducida.\n- Alquiler asequible: para ingresos estables pero insuficientes para mercado libre.\n- Compra en pleno dominio: compras piso y suelo. Precio limitado y residencia obligatoria.\n- Compra en derecho de superficie: compras el piso pero no el suelo, con plazo de 50 a 75 anos.\n\nPara un piso de 220.000 euros se estima una entrada del 20% + impuestos y gastos. En derecho de superficie el coste es menor al no pagar el suelo.',
        publishedAt: new Date('2026-04-02'),
      },
      {
        topicId: essentialCourse.id,
        slug: 'tipos-promocion',
        title: 'Modulo 3 - Tipos de promocion y como se asignan',
        summary: 'Promocion publica y privada, y como cambia la asignacion.',
        position: 3,
        body:
          'Hay promociones publicas (administracion) y privadas (promotoras). La asignacion cambia por completo.\n\n- Promocion publica: suele adjudicarse por sorteo o antiguedad en el registro.\n- Promocion privada: se asigna por orden de llegada. La velocidad lo es todo.\n- En privadas debes registrarte en la promocion concreta con la promotora.\n\nEl aviso previo suele salir unos 60 dias antes del anuncio oficial. Usalo para preparar documentacion y saber donde registrarte el primer dia.',
        publishedAt: new Date('2026-04-03'),
      },
      {
        topicId: essentialCourse.id,
        slug: 'requisitos',
        title: 'Modulo 4 - Requisitos para acceder',
        summary: 'Puntos basicos que revisa la administracion.',
        position: 4,
        body:
          'Ser mayor de edad o menor emancipado.\nEstar empadronado en un municipio de Cataluna.\nNo tener otra vivienda en propiedad (con excepciones).\nDestinar la vivienda a residencia habitual y permanente.\n\nLa administracion valida ingresos con la ultima declaracion de la renta. El dato clave es la casilla 435. Se suman todos los miembros de la unidad de convivencia.\n\nSi estas fuera de los limites de ingresos segun la casilla 435, tu solicitud sera descartada. Ten tu renta descargada y lista.',
        publishedAt: new Date('2026-04-04'),
      },
      {
        topicId: essentialCourse.id,
        slug: 'registro',
        title: 'Modulo 5 - Registro de solicitantes',
        summary: 'Inscripcion, renovacion y carpeta documental.',
        position: 5,
        body:
          'Estar inscrito en el Registro de Solicitantes de VPO es obligatorio. Sin registro no puedes acceder a ninguna promocion.\n\n- Validez: 1 ano, hay que renovarlo.\n- Tramite online o presencial. Puede tardar hasta 2 meses.\n- Guarda el volante de inscripcion: es obligatorio para apuntarte a promociones.\n\nCrea una carpeta VPO con renta, empadronamiento, vida laboral y volante. En privadas necesitas reaccionar el primer dia.',
        publishedAt: new Date('2026-04-05'),
      },
      {
        topicId: essentialCourse.id,
        slug: 'acceso-promociones',
        title: 'Modulo 6 - Como acceder a promociones',
        summary: 'Estrategia para promociones publicas y privadas.',
        position: 6,
        body:
          'En promociones privadas el registro suele abrir al dia siguiente del anuncio oficial y se asigna por orden de llegada. En publicas se usa sorteo o antiguedad.\n\n- Privadas presenciales: puede requerir cola y pasar la noche.\n- Privadas online: enviar solicitud en el segundo exacto de apertura.\n- Publicas: aplica a todas para aumentar probabilidades.\n\nLlegar tarde, documentacion desactualizada o registro caducado son los motivos de exclusion mas habituales.',
        publishedAt: new Date('2026-04-06'),
      },
      {
        topicId: essentialCourse.id,
        slug: 'documentacion',
        title: 'Modulo 7 - Documentacion clave',
        summary: 'Papeles que debes tener preparados.',
        position: 7,
        body:
          'DNI o NIE en vigor.\nCertificado de empadronamiento.\nLibro de familia o certificados de convivencia.\nVolante de inscripcion en el Registro RHSPO.\nDeclaracion de IRPF (casilla 435).\nTres ultimas nominas o acreditacion laboral.\nCertificado negativo del catastro.\n\nNo mezcles archivos. Usa una carpeta en la nube con PDFs y otra fisica con originales para no perder tiempo en el registro.',
        publishedAt: new Date('2026-04-07'),
      },
      {
        topicId: essentialCourse.id,
        slug: 'proceso-seleccion',
        title: 'Modulo 8 - Proceso tras ser seleccionado',
        summary: 'Del sorteo a la firma y la entrada a la vivienda.',
        position: 8,
        body:
          'Preseleccion y asignacion de vivienda.\nFirma del contrato de reserva.\nContrato de arras (normalmente penitenciales).\nVisado del contrato por la administracion.\nFinanciacion con el banco.\nFirma de compraventa ante notario.\nPost-firma: registro, suministros y entrada a vivir.\n\nSin visado administrativo el contrato no es valido. Lleva documentacion completa para no retrasar la operacion.',
        publishedAt: new Date('2026-04-08'),
      },
      {
        topicId: essentialCourse.id,
        slug: 'marco-legal',
        title: 'Modulo 9 - Marco legal de la VPO',
        summary: 'Normativa base, limites y obligaciones.',
        position: 9,
        body:
          'En Cataluna la VPO se regula principalmente por la Ley 18/2007 del derecho a la vivienda. Define obligaciones, limites de precio y control de la administracion.\n\n- Uso obligatorio como residencia habitual.\n- Limitaciones de venta y precio durante el periodo de proteccion.\n- Derecho de tanteo y retracto por parte de la Generalitat.\n- Control y sanciones si se incumple la normativa.\n\nSi necesitas mudarte temporalmente, pide autorizacion. Nunca dejes la vivienda vacia sin justificar.',
        publishedAt: new Date('2026-04-09'),
      },
    ],
    skipDuplicates: true,
  });

  await prisma.educationalPost.createMany({
    data: [
      {
        topicId: proCourse.id,
        slug: 'modulo-1-como-funciona-vpo',
        title: 'Modulo 1 - Como funciona la VPO',
        summary: 'Base legal, requisitos clave y calendario realista.',
        position: 1,
        body: 'Contenido introductorio del modulo 1. Aqui explicamos la estructura de la VPO y el flujo base.',
        publishedAt: new Date('2026-04-01'),
      },
      {
        topicId: proCourse.id,
        slug: 'modulo-2-registro-paso-a-paso',
        title: 'Modulo 2 - Registro paso a paso',
        summary: 'Alta correcta en registros y checklist de errores.',
        position: 2,
        body: 'Contenido del modulo 2 con pasos detallados y recomendaciones para el registro.',
        publishedAt: new Date('2026-04-02'),
      },
      {
        topicId: proCourse.id,
        slug: 'modulo-3-errores-comunes',
        title: 'Modulo 3 - Errores comunes',
        summary: 'Motivos de exclusion y como evitarlos.',
        position: 3,
        body: 'Contenido del modulo 3 con ejemplos reales y alertas de error comunes.',
        publishedAt: new Date('2026-04-03'),
      },
    ],
    skipDuplicates: true,
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
