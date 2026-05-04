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

  // New course seeded from user-provided content: Curso Iniciación (8 módulos)
  const iniciacionCourse = await prisma.educationalTopic.create({
    data: {
      slug: 'curso-iniciacion',
      title: 'Curso iniciación: Todo lo que tienes que saber para conseguir una vivienda de VPO en Cataluña',
      description: 'Curso práctico con pasos, requisitos y estrategias para acceder a la VPO en Cataluña.',
      active: true,
    },
  });

  await prisma.educationalPost.createMany({
    data: [
      {
        topicId: iniciacionCourse.id,
        slug: 'modulo-1-entender-la-vpo',
        title: 'Módulo 1 — Entender la VPO y el sistema',
        summary: 'Qué es la VPO, modalidades, limitaciones y costes asociados.',
        position: 1,
        body: `Acceder a una vivienda de protección oficial en Cataluña no es simplemente cumplir unos requisitos y esperar a que te toque. Es un sistema con sus propias reglas, tiempos y dinámicas. Entender esto desde el principio es lo que marca la diferencia entre perder meses sin resultados o tener opciones reales.

Las Viviendas de Protección Oficial (VPO) son viviendas cuyo precio está regulado por la administración. Esto significa que, tanto en compra como en alquiler, están por debajo del precio de mercado. El objetivo es facilitar el acceso a la vivienda a personas que, aun teniendo ingresos, no pueden asumir los precios actuales.

Pero esta ventaja viene acompañada de condiciones. Una VPO debe ser tu residencia habitual, no puedes usarla como inversión, ni alquilarla libremente, ni venderla al precio que quieras. Es un sistema pensado para vivir, no para especular.

Dentro de la VPO existen diferentes modalidades. En alquiler, encontramos el alquiler social, destinado a personas en situación de vulnerabilidad, y el alquiler asequible, pensado para personas con ingresos pero insuficientes para el mercado.

En compra, existen dos opciones principales. El pleno dominio, donde compras tanto la vivienda como el suelo, funciona como una compra tradicional, aunque con precio limitado. Y el derecho de superficie, muy común en Cataluña, donde compras el piso pero no el suelo, que sigue siendo público. Esto reduce el coste de entrada, pero la propiedad tiene una duración limitada en el tiempo, normalmente entre 50 y 75 años.

Uno de los puntos más importantes es entender cuánto dinero necesitas realmente. Aunque el precio esté limitado, en la práctica necesitarás disponer aproximadamente de un 20% del precio como entrada, más impuestos (que pueden ser del 4% en VPO, aunque a veces se calcula al 10%) y gastos adicionales. Para una vivienda de unos 220.000 €, esto se traduce en un ahorro de entre 60.000 € y 74.000 €.

No tener claro este punto es una de las principales razones por las que muchas personas abandonan el proceso a mitad.`,
        publishedAt: new Date('2026-05-01'),
      },
      {
        topicId: iniciacionCourse.id,
        slug: 'modulo-2-como-funciona-el-mercado-de-vpo',
        title: 'Módulo 2 — Cómo funciona el mercado de VPO',
        summary: 'Promociones públicas vs privadas, aviso previo y estrategias temporales.',
        position: 2,
        body: `Una de las claves más importantes para conseguir una VPO es entender cómo se asignan realmente las viviendas. Aquí es donde la mayoría de personas se equivoca.

Existen dos tipos de promociones: públicas y privadas.

Las promociones públicas son gestionadas por administraciones como la Generalitat o los ayuntamientos. En estos casos, la asignación suele hacerse mediante sorteo o por orden de antigüedad en el registro de solicitantes. Esto significa que, aunque cumplas los requisitos, el acceso depende en gran parte del azar o del tiempo que lleves inscrito.

En cambio, las promociones privadas funcionan de forma completamente distinta. Son promociones desarrolladas por empresas privadas que, por ley, deben reservar un porcentaje de viviendas protegidas. Aquí la asignación se basa en el orden de llegada.

Este punto es clave: en las promociones privadas no gana quien cumple requisitos, gana quien llega primero.

Además, estas promociones siguen un patrón muy concreto. Primero aparece un aviso previo, aproximadamente 60 días antes del anuncio oficial. En este aviso apenas hay información, normalmente solo el nombre de la promotora. Después aparece el anuncio oficial con todos los detalles.

El error más común es empezar a prepararse cuando sale el anuncio oficial. En ese momento, ya es tarde. La estrategia correcta consiste en utilizar el aviso previo para investigar, prepararse y tener toda la documentación lista.

Este margen de tiempo es una de las mayores ventajas que puedes tener si sabes utilizarlo correctamente.`,
        publishedAt: new Date('2026-05-02'),
      },
      {
        topicId: iniciacionCourse.id,
        slug: 'modulo-3-requisitos-y-elegibilidad',
        title: 'Módulo 3 — Requisitos y elegibilidad',
        summary: 'Edad, empadronamiento y el uso de la casilla 435 de la renta.',
        position: 3,
        body: `Para acceder a una VPO es necesario cumplir una serie de requisitos básicos: ser mayor de edad o emancipado, estar empadronado en Cataluña, no tener otra vivienda en propiedad (salvo excepciones) y destinar la vivienda a residencia habitual.

Sin embargo, el punto más importante es el económico.

La administración no utiliza tus ingresos actuales ni tus nóminas. Utiliza un único dato oficial: la casilla 435 de tu última declaración de la renta. Este valor corresponde a tu base imponible y es el único que se tiene en cuenta.

Si formas parte de una unidad de convivencia, debes sumar la casilla 435 de todos los miembros. Este total determinará si estás dentro o fuera de los límites establecidos para cada promoción.

Aquí es donde se producen muchos errores. Aplicar sin estar dentro del rango significa perder el tiempo, ya que quedarás excluido automáticamente.

También existen estrategias avanzadas que pueden marcar la diferencia. Por ejemplo, comprar en pareja sin vínculo legal formal puede permitir sumar ingresos mediante un documento de compromiso. También es importante entender el timing fiscal, ya que los ingresos que se tienen en cuenta son los de la última renta presentada, no los actuales.`,
        publishedAt: new Date('2026-05-03'),
      },
      {
        topicId: iniciacionCourse.id,
        slug: 'modulo-4-el-registro-de-solicitantes',
        title: 'Módulo 4 — El Registro de Solicitantes',
        summary: 'Cómo inscribirse, tiempos y la Carpeta VPO.',
        position: 4,
        body: `El Registro de Solicitantes de Vivienda con Protección Oficial es un requisito obligatorio para acceder a cualquier VPO. Sin estar inscrito, no puedes participar en ninguna promoción.

El proceso de registro puede hacerse online o presencialmente, pero tiene un aspecto clave: puede tardar hasta dos meses en validarse. Esto significa que esperar a que salga una promoción para registrarte es un error.

Una vez aprobado, recibirás un volante de inscripción. Este documento es imprescindible, ya que te lo solicitarán en cualquier promoción.

Además, el registro tiene una validez limitada, normalmente de un año, por lo que debe renovarse periódicamente.

Un aspecto clave para tener ventaja es crear lo que podríamos llamar una “Carpeta VPO”. Esto consiste en tener todos los documentos necesarios preparados, tanto en formato digital como físico. Incluye la renta, el empadronamiento, la vida laboral, el certificado del catastro y cualquier otro documento relevante.

Tener esta carpeta lista antes de que salga una promoción es una de las mayores ventajas competitivas.`,
        publishedAt: new Date('2026-05-04'),
      },
      {
        topicId: iniciacionCourse.id,
        slug: 'modulo-5-como-conseguir-la-vivienda',
        title: 'Módulo 5 — Cómo conseguir la vivienda',
        summary: 'Estrategias prácticas para promociones privadas y públicas.',
        position: 5,
        body: `Este es el módulo más importante de todo el curso, ya que es donde realmente se decide si consigues o no una VPO.

En las promociones privadas, la realidad es mucho más exigente de lo que parece. Si el registro es presencial, puede implicar hacer cola durante horas o incluso pasar la noche para asegurarte una posición. Si es online, debes enviar tu solicitud exactamente en el momento en que se abre el plazo. Un solo segundo antes o después puede invalidarte.

Esto no es una exageración, es la realidad del sistema.

La estrategia aquí es clara: anticipación, preparación y rapidez. Saber cuándo se abrirá el registro, tener toda la documentación lista y actuar sin margen de error.

En las promociones públicas, el enfoque es distinto. Aquí la asignación depende del sorteo o de la antigüedad en el registro. Por ello, es recomendable inscribirse lo antes posible y participar en todas las convocatorias disponibles.`,
        publishedAt: new Date('2026-05-05'),
      },
      {
        topicId: iniciacionCourse.id,
        slug: 'modulo-6-documentacion-necesaria',
        title: 'Módulo 6 — Documentación necesaria',
        summary: 'DNI, empadronamiento, IRPF, vida laboral y certificado negativo del catastro.',
        position: 6,
        body: `La documentación es uno de los factores más determinantes en el proceso. No tener un documento en el momento adecuado puede hacer que pierdas la oportunidad.

Entre los documentos esenciales se encuentran el DNI, el certificado de empadronamiento, la declaración de la renta, la vida laboral y el certificado negativo del catastro, que acredita que no tienes otras propiedades.

También es necesario acreditar la capacidad económica mediante nóminas, información bancaria y disponibilidad de ahorro.

Una buena práctica es mantener todos estos documentos organizados y accesibles en todo momento. Esto no solo ahorra tiempo, sino que puede marcar la diferencia en promociones donde la rapidez es clave.`,
        publishedAt: new Date('2026-05-06'),
      },
      {
        topicId: iniciacionCourse.id,
        slug: 'modulo-7-proceso-tras-ser-seleccionado',
        title: 'Módulo 7 — Proceso tras ser seleccionado',
        summary: 'Preselección, contratos, visado administrativo y financiación.',
        position: 7,
        body: `Ser seleccionado en una promoción no significa que la vivienda sea tuya. A partir de ese momento comienza un proceso formal que requiere atención y precisión.

Primero se realiza una preselección, donde la promotora te contacta para asignarte una vivienda. A continuación, se firma un contrato de reserva, que implica un primer pago para bloquearla.

El siguiente paso es el contrato de arras, donde se entrega aproximadamente el 10% del precio. Este es un compromiso económico serio, ya que si te retiras puedes perder el dinero.

Sin embargo, este contrato no es plenamente válido hasta que la administración lo visa. El visado es un proceso en el que se revisa toda tu documentación, ingresos y cumplimiento de requisitos.

Muchos candidatos quedan fuera en este punto por errores o documentación incompleta.

Durante este proceso también debes gestionar la financiación. Tener una preaprobación bancaria antes de llegar a este punto es una gran ventaja.

Finalmente, se firma la compraventa ante notario, se formaliza la hipoteca y se adquiere la propiedad.`,
        publishedAt: new Date('2026-05-07'),
      },
      {
        topicId: iniciacionCourse.id,
        slug: 'modulo-8-marco-legal-y-obligaciones',
        title: 'Módulo 8 — Marco legal y obligaciones',
        summary: 'Residencia habitual, limitaciones de venta y supervisión administrativa.',
        position: 8,
        body: `Una VPO está sujeta a un marco legal específico que debes conocer antes de acceder.

La principal norma es que la vivienda debe ser tu residencia habitual. No puedes usarla como segunda residencia ni alquilarla sin autorización.

Además, la venta está limitada. No puedes venderla libremente ni al precio que quieras. El comprador debe cumplir también los requisitos de VPO y la administración tiene derecho de tanteo.

La vivienda está bajo supervisión administrativa constante, lo que implica que cualquier incumplimiento puede acarrear sanciones.

Entender estas limitaciones es fundamental para tomar una decisión informada.

🎯 CONCLUSIÓN FINAL

Conseguir una vivienda de VPO en Cataluña no es fácil, pero tampoco es imposible. La clave no está solo en cumplir los requisitos, sino en entender el sistema, prepararse con antelación y actuar en el momento adecuado.`,
        publishedAt: new Date('2026-05-08'),
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
