import { COURSE_ACCESS_MIN_MONTHS, proPriceLabel } from '@/lib/offer';

/** Tres capas de la oferta, con una acción cada una. */
export const homeOfferLayers = [
  {
    id: 'consult',
    eyebrow: 'Visitante / cuenta',
    title: 'Consulta las promociones',
    price: '0 €',
    description:
      'Sin cuenta ves un adelanto. Con email verificado abres todas las publicaciones y las fechas estimadas de lanzamientos.',
    cta: 'Ver promociones',
    href: '/promotions',
    event: 'promotion_list_cta_clicked' as const,
  },
  {
    id: 'learn',
    eyebrow: 'Guía · pago único',
    title: 'Entiende el proceso y qué preparar',
    price: 'Precio en la ficha',
    description: `Lectura en pantalla, acceso mínimo ${COURSE_ACCESS_MIN_MONTHS} meses. Se desbloquea tras verificar el email.`,
    cta: 'Comprar la guía',
    href: '/cursos/guiav1#pagar',
    event: 'course_cta_clicked' as const,
  },
  {
    id: 'pro',
    eyebrow: 'Suscripción',
    title: 'Alertas y WhatsApp',
    price: proPriceLabel,
    description:
      'Email y SMS cuando se publica una promoción, y WhatsApp para consultas. Requiere email verificado. Renovación mensual; cancelas cuando quieras.',
    cta: 'Ver Radar PRO',
    href: '/pro',
    event: 'pro_cta_clicked' as const,
  },
] as const;

export const homeHeroProof = [
  'Sin cuenta ves un adelanto; con email verificado abres todas las publicaciones.',
  'La guía es lectura en pantalla, pago único; se activa tras verificar el email.',
  `PRO (${proPriceLabel}) añade avisos por SMS y WhatsApp (email verificado).`,
] as const;

export const homeFaqs = [
  {
    question: '¿Qué es Radar VPO?',
    answer:
      'Un servicio independiente para consultar promociones de vivienda protegida en Cataluña con su documento oficial, entender el proceso con una guía y recibir avisos con Radar VPO PRO. No es una administración ni adjudica viviendas.',
  },
  {
    question: '¿Puedo ver promociones sin pagar?',
    answer:
      'Sí. Sin cuenta ves un listado limitado y el detalle de las dos últimas publicadas. Con cuenta gratuita y email verificado abres todas las publicaciones. PRO añade avisos y WhatsApp.',
  },
  {
    question: '¿Qué es Radar VPO PRO?',
    answer: `Una suscripción de ${proPriceLabel} que añade avisos por email y SMS de nuevas promociones y WhatsApp para consultas. Requiere email verificado. Se renueva cada mes hasta que la canceles; mantienes el acceso hasta el final del periodo ya pagado. Una guía concreta solo se incluye si aparece listada en la página PRO.`,
  },
  {
    question: 'Hay avisos por correo gratis en otros sitios. ¿Por qué PRO?',
    answer:
      'PRO no se vende solo por el correo. Añade el aviso por SMS (si indicas tu móvil) y WhatsApp para consultas sobre el proceso mientras la suscripción esté activa.',
  },
  {
    question: '¿La guía es una suscripción?',
    answer: `No. Es un pago único. Se consulta en pantalla (no es un archivo descargable) con acceso durante al menos ${COURSE_ACCESS_MIN_MONTHS} meses. Si cancelas PRO, conservas lo que hayas comprado aparte.`,
  },
  {
    question: '¿Qué cubre la Guía VPO?',
    answer:
      'El proceso para optar a una vivienda protegida en Catalunya: por dónde empezar, el Registro de Solicitantes, requisitos, documentación, cuentas, tipos de promoción y lo que viene después de que te seleccionen. No incluye asesoramiento personalizado.',
  },
  {
    question: '¿Radar VPO presenta la solicitud por mí o me asesora individualmente?',
    answer:
      'No. Radar VPO ofrece información, una guía práctica y avisos. Cada persona presenta su propia solicitud ante los organismos oficiales. El WhatsApp de PRO es para consultas orientativas, no para presentar solicitudes. El soporte cubre compras, acceso, facturación e incidencias técnicas.',
  },
];

/** CTA tras el visor PDF de una promoción. */
export const pdfNextStep = {
  title: '¿Quieres entender el proceso antes de presentar nada?',
  description:
    'El visor te muestra el documento oficial. La guía ordena registro, papeles y pasos hasta la firma.',
  cta: 'Comprar la guía',
  href: '/cursos/guiav1#pagar',
} as const;
