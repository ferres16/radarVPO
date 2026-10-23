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
    title: 'Entiende contexto, ayudas e hipoteca',
    price: 'Precio final en la ficha',
    description:
      'La primera guía trata el contexto de la VPO, las ayudas y el ahorro necesario. Pagas en la misma ficha, sin páginas intermedias.',
    cta: 'Comprar la guía',
    href: '/cursos#pagar',
    event: 'course_cta_clicked' as const,
  },
  {
    id: 'pro',
    eyebrow: 'Suscripción',
    title: 'Avisos por SMS y organización',
    price: proPriceLabel,
    description:
      'Email y SMS cuando se publica una promoción, y Mi espacio sin límite. El precio y el pago están en la misma página.',
    cta: `Hazte PRO · ${proPriceLabel}`,
    href: '/pro#pagar',
    event: 'pro_cta_clicked' as const,
  },
] as const;

export const homeHeroProof = [
  'Consultar promociones y su PDF oficial es gratis, sin registrarte.',
  'Cada guía muestra el precio final antes de comprar; no se añade un recargo en el pago.',
  `PRO (${proPriceLabel}) añade SMS y espacio ilimitado.`,
] as const;

export const homeFaqs = [
  {
    question: '¿Qué es Radar VPO?',
    answer:
      'Un sitio para consultar promociones de vivienda protegida en Cataluña con su documento oficial, entender el contexto con una guía y organizar las oportunidades que sigues.',
  },
  {
    question: '¿Puedo ver promociones sin pagar?',
    answer: `Sí. Consultar las promociones y abrir su documento oficial en PDF es gratis. Con una cuenta gratuita también puedes guardar hasta ${FREE_SAVED_PROMOTIONS_LIMIT} promociones en Mi espacio.`,
  },
  {
    question: '¿Qué es Radar VPO PRO?',
    answer: `Una suscripción de ${proPriceLabel} que añade avisos por email y SMS de nuevas promociones y Mi espacio sin límite. Si una guía publicada está marcada como incluida, también puedes consultarla mientras esté activa. Se cancela desde Mi cuenta.`,
  },
  {
    question: 'Hay avisos por correo gratis en otros sitios. ¿Por qué PRO?',
    answer:
      'PRO no se vende por el correo. Añade el aviso por SMS (si indicas tu móvil) y un espacio personal con cuenta —checklist, etapa y notas en cualquier dispositivo—. El email, solo, no es el motivo de pago.',
  },
  {
    question: '¿Los cursos son una suscripción?',
    answer:
      'No. Cada guía o curso es un pago único con el precio final visible antes de pagar; no hay renovaciones. Si cancelas PRO, conservas lo que hayas comprado.',
  },
  {
    question: '¿Qué incluye PRO además de los avisos?',
    answer:
      'Mi espacio sin límite. Una guía concreta solo si su ficha publicada lo indica. No prometemos rutas o cursos que no estén a la venta.',
  },
  {
    question: '¿Radar VPO presenta la solicitud por mí o me asesora individualmente?',
    answer:
      'No. Radar VPO ofrece información, guías y herramientas de organización. Cada persona presenta su propia solicitud ante los organismos oficiales.',
  },
  {
    question: '¿El acompañamiento individual sigue existiendo?',
    answer:
      'No. Esa oferta se retiró. Las direcciones antiguas llevan al catálogo de guías.',
  },
];

/** CTA tras el visor PDF de una promoción. */
export const pdfNextStep = {
  title: '¿Quieres contexto sobre ayudas y requisitos?',
  description:
    'El visor te muestra el documento oficial. Las guías explican el contexto de la VPO, las ayudas y el ahorro necesario; el precio final aparece en cada ficha.',
  cta: 'Ver las guías',
  href: '/cursos',
} as const;
