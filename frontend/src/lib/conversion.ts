import { FREE_SAVED_PROMOTIONS_LIMIT } from '@/lib/my-space';
import { COURSE_ACCESS_MIN_MONTHS, proPriceLabel } from '@/lib/offer';

/** Tres capas de la oferta, con una acción cada una. */
export const homeOfferLayers = [
  {
    id: 'consult',
    eyebrow: 'Gratis',
    title: 'Consulta las promociones',
    price: '0 €',
    description: `Abre el PDF oficial de cada convocatoria sin cuenta. Con registro puedes guardar hasta ${FREE_SAVED_PROMOTIONS_LIMIT} promociones.`,
    cta: 'Ver promociones',
    href: '/promotions',
    event: 'promotion_list_cta_clicked' as const,
  },
  {
    id: 'learn',
    eyebrow: 'Guía · pago único',
    title: 'Entiende el proceso y qué preparar',
    price: 'Precio en la ficha',
    description: `Lectura en pantalla, acceso mínimo ${COURSE_ACCESS_MIN_MONTHS} meses. Registro, papeles y pasos hasta la firma.`,
    cta: 'Descubrir la guía',
    href: '/cursos/guiav1',
    event: 'course_cta_clicked' as const,
  },
  {
    id: 'pro',
    eyebrow: 'Suscripción',
    title: 'Avisos y organización',
    price: proPriceLabel,
    description:
      'Email y SMS cuando se publica una promoción, y Mi espacio sin límite. Renovación mensual; cancelas cuando quieras.',
    cta: 'Ver Radar PRO',
    href: '/pro',
    event: 'pro_cta_clicked' as const,
  },
] as const;

export const homeHeroProof = [
  'Consultar promociones y su PDF oficial es gratis, sin registrarte.',
  'La guía es lectura en pantalla, pago único, con acceso mínimo de 24 meses.',
  `PRO (${proPriceLabel}) añade avisos y espacio ilimitado.`,
] as const;

export const homeFaqs = [
  {
    question: '¿Qué es Radar VPO?',
    answer:
      'Un servicio independiente para consultar promociones de vivienda protegida en Cataluña con su documento oficial, entender el proceso con una guía y organizar las oportunidades que sigues. No es una administración ni adjudica viviendas.',
  },
  {
    question: '¿Puedo ver promociones sin pagar?',
    answer: `Sí. Consultar las promociones y abrir su documento oficial en PDF es gratis. Con una cuenta gratuita también puedes guardar hasta ${FREE_SAVED_PROMOTIONS_LIMIT} promociones en Mi espacio.`,
  },
  {
    question: '¿Qué es Radar VPO PRO?',
    answer: `Una suscripción de ${proPriceLabel} que añade avisos por email y SMS de nuevas promociones y Mi espacio sin límite. Se renueva cada mes hasta que la canceles; mantienes el acceso hasta el final del periodo ya pagado. Una guía concreta solo se incluye si aparece listada en la página PRO.`,
  },
  {
    question: 'Hay avisos por correo gratis en otros sitios. ¿Por qué PRO?',
    answer:
      'PRO no se vende solo por el correo. Añade el aviso por SMS (si indicas tu móvil) y un espacio personal con cuenta —checklist, etapa y notas en cualquier dispositivo—.',
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
      'No. Radar VPO ofrece información, guías y herramientas de organización. Cada persona presenta su propia solicitud ante los organismos oficiales. El soporte cubre compras, acceso, facturación e incidencias técnicas.',
  },
];

/** CTA tras el visor PDF de una promoción. */
export const pdfNextStep = {
  title: '¿Quieres entender el proceso antes de presentar nada?',
  description:
    'El visor te muestra el documento oficial. La guía ordena registro, papeles y pasos hasta la firma.',
  cta: 'Ver la guía',
  href: '/cursos/guiav1',
} as const;
