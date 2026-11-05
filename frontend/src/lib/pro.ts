import { PRO_PRICE_AMOUNT, formatEuro, proPriceLabel } from '@/lib/offer';
import { proWhatsapp } from '@/lib/whatsapp';
import {
  VISITOR_PROMOTION_DETAIL_LIMIT,
  VISITOR_PROMOTION_LIST_LIMIT,
} from '@/lib/access-tier';

/**
 * Fuente única de Radar VPO PRO y de los tres niveles de acceso.
 * Visitante / Cuenta verificada / PRO (email verificado + suscripción activa).
 */
export const proPlan = {
  name: 'Radar VPO PRO',
  brandName: 'Radar VPO',
  price: proPriceLabel,
  priceAmount: PRO_PRICE_AMOUNT,
  priceShort: formatEuro(PRO_PRICE_AMOUNT, { decimals: 2 }),
  currency: 'EUR',
  interval: 'month' as const,
  ctaLabel: 'Hazte PRO',
  landingHref: '/pro',
  checkoutHref: '/pro#pagar',
  /** Foto de producto / creativo de campaña. */
  productImageSrc: '/pro-product-v2.png',
  productImageAlt:
    'Suscripción Radar VPO PRO: alertas por email y SMS y acceso a WhatsApp para consultas',
};

export const proHref = proPlan.landingHref;

/** Los CTA de PRO van a la ficha con el recuadro de pago. */
export function getProHref(): string {
  return proPlan.checkoutHref;
}

export const proActiveMessages = [
  'Radar VPO PRO está activo en tu cuenta.',
  'Tienes Radar VPO PRO activo: avisos por email y SMS, y WhatsApp para consultas.',
] as const;

export function getProActiveMessage(seed?: string): string {
  if (!seed) return proActiveMessages[0];
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return proActiveMessages[hash % proActiveMessages.length];
}

/** Ventajas de la cuenta gratuita verificada (no confundir con visitante). */
export const freePlanFeatures = [
  `Consultar el listado completo de promociones (el visitante ve hasta ${VISITOR_PROMOTION_LIST_LIMIT})`,
  'Abrir el documento oficial (PDF) de todas las promociones publicadas',
  'Ver próximos lanzamientos con fechas aproximadas cuando estén disponibles',
  'Comprar la guía por separado (pago único; se activa tras verificar el email)',
] as const;

export const visitorPlanFeatures = [
  `Listado de hasta ${VISITOR_PROMOTION_LIST_LIMIT} promociones publicadas`,
  `Detalle completo solo de las ${VISITOR_PROMOTION_DETAIL_LIMIT} últimas publicadas`,
  'Próximos lanzamientos sin fechas aproximadas ni contadores',
  'Crear cuenta gratuita y verificar el email para desbloquear el resto',
] as const;

export const proExclusiveFeatures = [
  'Avisos por email de nuevas promociones y próximos lanzamientos',
  'Avisos por SMS (se activan al verificar el email con PRO y móvil válido)',
  'Acceso a WhatsApp para consultas',
] as const;

export const freeVsProDescription =
  'El visitante ve un adelanto. La cuenta verificada abre todas las publicaciones y fechas estimadas. PRO añade avisos por email y SMS, y WhatsApp. Ninguna compra se activa sin verificar el email.';

/** Inclusiones fijas de PRO (siempre verdaderas). */
export const proIncludes = [
  {
    title: 'Avisos por email',
    description:
      'Te escribimos cuando se publica una nueva promoción y cuando detectamos un próximo lanzamiento en las fuentes que monitorizamos.',
  },
  {
    title: 'Avisos por SMS',
    description:
      'Tras verificar tu email y pagar PRO con un móvil válido, recibes un SMS de confirmación y luego avisos de nuevas promociones aunque no mires el correo.',
  },
  {
    title: 'WhatsApp para consultas',
    description: proWhatsapp.pitch,
  },
] as const;

/**
 * Solo listar guías cuando existen en catálogo con accessType=pro.
 * Si no hay ninguna, no se anuncia un “curso incluido”.
 */
export function proIncludedGuidesCopy(titles: string[]): {
  title: string;
  description: string;
} | null {
  const published = titles.map((title) => title.trim()).filter(Boolean);
  if (published.length === 0) return null;
  return {
    title:
      published.length === 1
        ? 'Guía incluida mientras esté activa'
        : 'Guías incluidas mientras esté activa',
    description: `${published.join(', ')}. Si las compras aparte, las conservas aunque canceles PRO.`,
  };
}

export function proOfferIncludes(guideTitles: string[]) {
  const guides = proIncludedGuidesCopy(guideTitles);
  return guides ? [...proIncludes, guides] : [...proIncludes];
}

/** Mensaje corto y estable para portada y bandas: nunca inventa un curso. */
export function proHomePitch(includedGuideTitles: string[] = []): string {
  const guides = proIncludedGuidesCopy(includedGuideTitles);
  const guideBit = guides ? ` y ${guides.description.split('.')[0].toLowerCase()}` : '';
  return `Consulta un adelanto sin cuenta. Con email verificado abres todas las publicaciones. ${proPlan.name} añade avisos por email y SMS, y WhatsApp${guideBit}. ${proPlan.price}. Cancelas desde Mi cuenta.`;
}

export const proWhyPay = [
  {
    title: 'Enterarte sin abrir diez webs',
    body: 'PRO te avisa cuando detectamos una publicación o un próximo lanzamiento. Tú decides cuándo mirar la ficha.',
  },
  {
    title: 'SMS, no solo correo',
    body: 'Hay avisos por email gratuitos de terceros. PRO añade el SMS si tu cuenta tiene un móvil válido y el email verificado.',
  },
  {
    title: 'WhatsApp para consultas',
    body: 'Canal directo para resolver dudas sobre el proceso y las promociones mientras tu suscripción esté activa. No presentamos la solicitud por ti.',
  },
] as const;

export const proForWhom = {
  yes: [
    'Quieres enterarte en el móvil cuando se publica una convocatoria, no solo al abrir el correo.',
    'Prefieres poder preguntar por WhatsApp cuando te atasques con un paso del proceso.',
    'Prefieres un aviso sobrio de lo detectado, sin inventar urgencias ni plazas limitadas.',
  ],
  no: [
    'Solo quieres mirar de vez en cuando un adelanto público: eso no requiere PRO.',
    'Esperas que presentemos la solicitud o te representemos ante la administración: no lo hacemos.',
  ],
} as const;

export const proLimits = [
  'Los avisos PRO (email y SMS) cubren todas las promociones que detectamos; no hay filtro por municipio ni por compra/alquiler.',
  'Las fechas de próximos lanzamientos son estimaciones y se indican como tales: pueden no cumplirse o no publicarse.',
  'Los SMS se activan al verificar el email con PRO y un móvil válido; puedes desactivarlos en Mi cuenta.',
  'WhatsApp es para consultas orientativas sobre el proceso; no sustituye asesoramiento jurídico ni presenta solicitudes.',
  'Radar VPO no garantiza una adjudicación.',
  'Una guía concreta solo forma parte de PRO si aparece listada en esta página con su nombre y enlace.',
  'Ninguna compra ni suscripción desbloquea contenidos antes de verificar el email.',
] as const;

export const proFaqs = [
  {
    question: '¿Qué recibo exactamente con PRO?',
    answer:
      'Avisos por email (y por SMS si indicas tu móvil) cuando se publica una nueva promoción o detectamos un próximo lanzamiento, y acceso a WhatsApp para consultas. Una guía concreta solo forma parte de PRO si aparece listada en esta página. Requiere email verificado.',
  },
  {
    question: '¿Qué puedo hacer sin cuenta?',
    answer: `Ver hasta ${VISITOR_PROMOTION_LIST_LIMIT} promociones en listado, abrir el detalle completo solo de las ${VISITOR_PROMOTION_DETAIL_LIMIT} últimas publicadas, y ver próximos lanzamientos sin fechas aproximadas.`,
  },
  {
    question: '¿Qué añade la cuenta gratuita verificada?',
    answer:
      'Todas las publicaciones con su PDF, próximos lanzamientos con fechas aproximadas cuando existan, y la posibilidad de comprar la guía (que solo se desbloquea tras verificar).',
  },
  {
    question: 'Hay avisos por correo gratis. ¿Qué añade PRO?',
    answer:
      'El aviso por SMS si indicas tu móvil y WhatsApp para consultas. El correo, por sí solo, no es el motivo para pagar.',
  },
  {
    question: '¿Qué cubre el WhatsApp?',
    answer:
      'Consultas sobre el proceso de la VPO y las promociones que monitorizamos, mientras tu suscripción esté activa y el email verificado. No presentamos tu solicitud ni damos asesoramiento jurídico personalizado.',
  },
  {
    question: '¿Incluye un curso o una guía?',
    answer:
      'Solo si esa guía está publicada y marcada como incluida: entonces aparece aquí con nombre y enlace. Si no hay ninguna listada, PRO no incluye guía. Lo que compres aparte se conserva aunque canceles, y se activa tras verificar el email.',
  },
  {
    question: '¿Cuánto cuesta y cómo se cobra?',
    answer: `${proPriceLabel}. Ese es el importe final que se cobra cada mes, con renovación automática hasta que la canceles. El mismo precio aparece en la ficha, en el resumen del pedido y en el pago.`,
  },
  {
    question: '¿Cómo cancelo?',
    answer:
      'Desde Mi cuenta, con un clic y sin llamar a nadie. Mantienes el acceso hasta el final del periodo ya pagado y no se vuelve a cobrar.',
  },
  {
    question: '¿Las fechas de lanzamiento son seguras?',
    answer:
      'No. Cuando mostramos una fecha estimada lo indicamos expresamente; solo la fecha de publicación oficial es un dato confirmado. Los visitantes no ven esas fechas.',
  },
  {
    question: '¿Puedo comprar antes de verificar el email?',
    answer:
      'Sí. La compra queda vinculada a tu cuenta como pendiente de verificación. Al verificar el email se activan los accesos pagados (y el SMS de bienvenida PRO una sola vez si hay móvil válido).',
  },
  {
    question: '¿Garantiza conseguir una vivienda protegida?',
    answer:
      'No. Te ayuda a enterarte a tiempo y a resolver dudas del proceso. La adjudicación depende siempre de los organismos oficiales.',
  },
] as const;

export const proComparisonRows = [
  {
    feature: `Listado de promociones (hasta ${VISITOR_PROMOTION_LIST_LIMIT})`,
    visitor: true as const,
    registered: true as const,
    pro: true as const,
  },
  {
    feature: 'Todas las promociones publicadas',
    visitor: false as const,
    registered: true as const,
    pro: true as const,
  },
  {
    feature: `Detalle completo (PDF) — solo ${VISITOR_PROMOTION_DETAIL_LIMIT} últimas`,
    visitor: true as const,
    registered: true as const,
    pro: true as const,
  },
  {
    feature: 'Detalle completo de todas las publicaciones',
    visitor: false as const,
    registered: true as const,
    pro: true as const,
  },
  {
    feature: 'Próximos lanzamientos (sin fechas)',
    visitor: true as const,
    registered: true as const,
    pro: true as const,
  },
  {
    feature: 'Fechas aproximadas de lanzamientos',
    visitor: false as const,
    registered: true as const,
    pro: true as const,
  },
  {
    feature: 'Avisos por email',
    visitor: false as const,
    registered: false as const,
    pro: true as const,
  },
  {
    feature: 'Avisos por SMS',
    visitor: false as const,
    registered: false as const,
    pro: true as const,
  },
  {
    feature: 'WhatsApp para consultas',
    visitor: false as const,
    registered: false as const,
    pro: true as const,
  },
  {
    feature: 'Guía de pago',
    visitor: 'Compra aparte',
    registered: 'Compra aparte (tras verificar)',
    pro: 'Solo si aparece listada en PRO',
  },
] as const;

/** @deprecated Usar proComparisonRows con visitor/registered/pro. */
export const freeVsProComparisonLegacy = [
  { feature: 'Consultar promociones publicadas', free: true as const, pro: true as const },
  { feature: 'Abrir el documento oficial (PDF)', free: true as const, pro: true as const },
  { feature: 'Avisos por email', free: false as const, pro: true as const },
  { feature: 'Avisos por SMS', free: false as const, pro: true as const },
  { feature: 'WhatsApp para consultas', free: false as const, pro: true as const },
] as const;

export type ProComparisonCell = boolean | string;
