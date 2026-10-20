import { FREE_SAVED_PROMOTIONS_LIMIT } from '@/lib/my-space';
import { proPriceLabel } from '@/lib/offer';

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
    title: 'Decide con información que gana',
    price: 'Precio final en la ficha',
    description:
      'Guías al grano sobre vivienda protegida. Entras al contenido al momento y pagas una sola vez.',
    cta: 'Ver las guías',
    href: '/cursos',
    event: 'course_cta_clicked' as const,
  },
  {
    id: 'pro',
    eyebrow: 'Suscripción',
    title: 'Avisos por SMS y organización',
    price: proPriceLabel,
    description:
      'Email y SMS cuando se publica una promoción, Mi espacio sin límite y el curso inicial mientras esté activa.',
    cta: 'Ver Radar VPO PRO',
    href: '/pro',
    event: 'pro_cta_clicked' as const,
  },
] as const;

export const homeHeroProof = [
  'Consultar promociones y su PDF oficial es gratis, sin registrarte.',
  'El curso es pago único: ves el programa y el precio antes de comprar.',
  `PRO (${proPriceLabel}) añade SMS, espacio ilimitado y el curso inicial mientras esté activa.`,
] as const;

export const homeFaqs = [
  {
    question: '¿Qué es Radar VPO?',
    answer:
      'Un sitio para consultar promociones de vivienda protegida en Cataluña con su documento oficial, aprender a preparar la solicitud con un curso y organizar las oportunidades que sigues.',
  },
  {
    question: '¿Puedo ver promociones sin pagar?',
    answer: `Sí. Consultar las promociones y abrir su documento oficial en PDF es gratis. Con una cuenta gratuita también puedes guardar hasta ${FREE_SAVED_PROMOTIONS_LIMIT} promociones en Mi espacio.`,
  },
  {
    question: '¿Qué es Radar VPO PRO?',
    answer: `Una suscripción de ${proPriceLabel} que añade avisos por email y SMS de nuevas promociones, Mi espacio sin límite y acceso al curso inicial mientras esté activa. Se cancela desde Mi cuenta.`,
  },
  {
    question: 'Hay avisos por correo gratis en otros sitios. ¿Por qué PRO?',
    answer:
      'PRO no se vende por el correo. Añade el aviso por SMS (si indicas tu móvil), un espacio personal con cuenta —checklist, etapa y notas en cualquier dispositivo— y el curso inicial mientras la suscripción esté activa. El email, solo, no es el motivo de pago.',
  },
  {
    question: '¿Los cursos son una suscripción?',
    answer:
      'No. Cada curso es un pago único con el precio final visible antes de pagar; no hay renovaciones. Si cancelas PRO, conservas un curso que hayas comprado.',
  },
  {
    question: '¿Qué curso incluye PRO?',
    answer:
      'El curso inicial, mientras la suscripción esté activa. El avanzado, si está a la venta, se compra aparte. En cada ficha se indica el estado real del contenido.',
  },
  {
    question: '¿Radar VPO presenta la solicitud por mí o me asesora individualmente?',
    answer:
      'No. Radar VPO ofrece información, un curso y herramientas de organización. Cada persona presenta su propia solicitud ante los organismos oficiales.',
  },
  {
    question: '¿Garantiza conseguir un piso protegido?',
    answer:
      'No. La adjudicación depende siempre de los organismos oficiales. Radar VPO te ayuda a informarte y a prepararte.',
  },
] as const;

export const pdfNextStep = {
  title: '¿No sabes qué comprobar en estas bases?',
  description:
    'El visor te muestra el documento oficial. El curso te explica cómo leerlo y qué pasos suele exigir una solicitud.',
  cta: 'Ver el curso',
  href: '/cursos',
} as const;
