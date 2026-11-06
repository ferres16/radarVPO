import { COURSE_ACCESS_MIN_MONTHS, proPriceLabel } from '@/lib/offer';

/** Tres capas de la oferta, con una acción cada una. */
export const homeOfferLayers = [
  {
    id: 'consult',
    eyebrow: 'Cuenta gratuita',
    title: 'Todas las promociones y fechas',
    price: '0 €',
    description:
      'Regístrate gratis para ver todas las promociones que han salido, su PDF oficial y las fechas aproximadas de los próximos lanzamientos.',
    cta: 'Regístrate gratis',
    href: '/register',
    event: 'register_cta_clicked' as const,
  },
  {
    id: 'learn',
    eyebrow: 'Guía · pago único',
    title: 'Entiende el proceso y qué preparar',
    price: 'Precio en la ficha',
    description: `Lectura en pantalla con acceso mínimo de ${COURSE_ACCESS_MIN_MONTHS} meses. Registro, documentación y pasos hasta la firma, en orden.`,
    cta: 'Comprar la guía',
    href: '/cursos/guiav1#pagar',
    event: 'course_cta_clicked' as const,
  },
  {
    id: 'pro',
    eyebrow: 'Radar VPO PRO',
    title: 'Que no se te escape ninguna',
    price: proPriceLabel,
    description:
      'Aviso por email y SMS en cuanto se publica una promoción, y WhatsApp para resolver dudas. Renovación mensual; cancelas cuando quieras.',
    cta: 'Hazte PRO',
    href: '/pro#pagar',
    event: 'pro_cta_clicked' as const,
  },
] as const;

export const homeHeroProof = [
  'Regístrate gratis y ve todas las promociones que han salido.',
  'Fechas aproximadas de los próximos lanzamientos con tu cuenta gratuita.',
  `Con PRO (${proPriceLabel}) te avisamos por SMS y email en cuanto sale una.`,
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
      'Sí. Sin registrarte ves las últimas promociones. Si te registras gratis ves todas las que han salido, con su PDF oficial, y las fechas aproximadas de los próximos lanzamientos. Solo tienes que confirmar tu email con un clic.',
  },
  {
    question: '¿Qué es Radar VPO PRO?',
    answer: `Una suscripción de ${proPriceLabel} que te avisa por email y SMS en cuanto se publica una promoción nueva y te da WhatsApp para consultas. Se renueva cada mes hasta que la canceles; mantienes el acceso hasta el final del periodo ya pagado. Una guía concreta solo se incluye si aparece listada en la página PRO.`,
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
