import { PRO_PRICE_AMOUNT, formatEuro, proPriceLabel } from '@/lib/offer';
import { proWhatsapp } from '@/lib/whatsapp';
import {
  VISITOR_PROMOTION_DETAIL_LIMIT,
  VISITOR_PROMOTION_LIST_LIMIT,
} from '@/lib/access-tier';

/**
 * Fuente única de Radar VPO PRO y de los tres niveles de acceso.
 * Sin registro / Registrado gratis / PRO. Técnicamente, "registrado" exige email confirmado.
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

/** Lo que desbloqueas al registrarte gratis. */
export const freePlanFeatures = [
  'Todas las promociones que han salido, no solo las últimas',
  'El documento oficial (PDF) de cada promoción publicada',
  'Fechas aproximadas de los próximos lanzamientos',
  'Gratis y sin tarjeta: solo confirmas tu email con un clic',
] as const;

export const visitorPlanFeatures = [
  `Las ${VISITOR_PROMOTION_LIST_LIMIT} promociones más recientes`,
  `El PDF de las ${VISITOR_PROMOTION_DETAIL_LIMIT} últimas publicadas`,
  'Próximos lanzamientos, sin fechas aproximadas',
  'Regístrate gratis para verlo todo',
] as const;

export const proExclusiveFeatures = [
  'Avisos por email de nuevas promociones y próximos lanzamientos',
  'Avisos por SMS al móvil que nos indiques',
  'Acceso a WhatsApp para consultas',
] as const;

export const freeVsProDescription =
  'Sin registro ves las últimas promociones. Registrándote gratis ves todas las que han salido y las fechas aproximadas de lanzamiento. Con PRO, además, te avisamos por email y SMS en cuanto sale una y tienes WhatsApp para dudas.';

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
      'Con un móvil válido en tu cuenta recibes un SMS de bienvenida y luego avisos de nuevas promociones aunque no mires el correo.',
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
  return `Con ${proPlan.name} te avisamos por email y SMS en cuanto se publica una promoción, y tienes WhatsApp para dudas${guideBit}. ${proPlan.price}. Cancelas desde Mi cuenta cuando quieras.`;
}

export const proWhyPay = [
  {
    title: 'Enterarte sin abrir diez webs',
    body: 'PRO te avisa cuando detectamos una publicación o un próximo lanzamiento. Tú decides cuándo mirar la ficha.',
  },
  {
    title: 'SMS, no solo correo',
    body: 'Hay avisos por email gratuitos de terceros. PRO añade el SMS al móvil de tu cuenta para que te enteres aunque no abras el correo.',
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
    'Solo quieres consultar promociones y fechas de vez en cuando: para eso basta con registrarte gratis.',
    'Esperas que presentemos la solicitud o te representemos ante la administración: no lo hacemos.',
  ],
} as const;

export const proLimits = [
  'Los avisos PRO (email y SMS) cubren todas las promociones que detectamos; no hay filtro por municipio ni por compra/alquiler.',
  'Las fechas de próximos lanzamientos son estimaciones y se indican como tales: pueden no cumplirse o no publicarse.',
  'Los SMS requieren un móvil válido en tu cuenta; puedes desactivarlos en Mi cuenta.',
  'WhatsApp es para consultas orientativas sobre el proceso; no sustituye asesoramiento jurídico ni presenta solicitudes.',
  'Radar VPO no garantiza una adjudicación.',
  'Una guía concreta solo forma parte de PRO si aparece listada en esta página con su nombre y enlace.',
  'Las compras y la suscripción se activan cuando confirmas tu email.',
] as const;

export const proFaqs = [
  {
    question: '¿Qué recibo exactamente con PRO?',
    answer:
      'Avisos por email (y por SMS si indicas tu móvil) cuando se publica una nueva promoción o detectamos un próximo lanzamiento, y acceso a WhatsApp para consultas. Una guía concreta solo forma parte de PRO si aparece listada en esta página.',
  },
  {
    question: '¿Qué puedo ver sin registrarme?',
    answer: `Las ${VISITOR_PROMOTION_LIST_LIMIT} promociones más recientes, el PDF de las ${VISITOR_PROMOTION_DETAIL_LIMIT} últimas y los próximos lanzamientos sin fecha. Regístrate gratis para verlo todo.`,
  },
  {
    question: '¿Qué gano registrándome gratis?',
    answer:
      'Ver todas las promociones que han salido con su PDF oficial y las fechas aproximadas de los próximos lanzamientos. Es gratis y sin tarjeta; solo confirmas tu email con un clic.',
  },
  {
    question: 'Hay avisos por correo gratis. ¿Qué añade PRO?',
    answer:
      'El aviso por SMS si indicas tu móvil y WhatsApp para consultas. El correo, por sí solo, no es el motivo para pagar.',
  },
  {
    question: '¿Qué cubre el WhatsApp?',
    answer:
      'Consultas sobre el proceso de la VPO y las promociones que monitorizamos, mientras tu suscripción esté activa. No presentamos tu solicitud ni damos asesoramiento jurídico personalizado.',
  },
  {
    question: '¿Incluye un curso o una guía?',
    answer:
      'Solo si esa guía está publicada y marcada como incluida: entonces aparece aquí con nombre y enlace. Si no hay ninguna listada, PRO no incluye guía. Lo que compres aparte se conserva aunque canceles.',
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
      'No. Cuando mostramos una fecha estimada lo indicamos expresamente; solo la fecha de publicación oficial es un dato confirmado. Para verlas basta con registrarte gratis.',
  },
  {
    question: '¿Puedo pagar antes de confirmar mi email?',
    answer:
      'Sí. El pago queda guardado en tu cuenta y todo se activa en cuanto confirmas tu email con el enlace que te enviamos (incluido el SMS de bienvenida de PRO, una sola vez).',
  },
  {
    question: '¿Garantiza conseguir una vivienda protegida?',
    answer:
      'No. Te ayuda a enterarte a tiempo y a resolver dudas del proceso. La adjudicación depende siempre de los organismos oficiales.',
  },
] as const;

export const proComparisonRows = [
  {
    feature: `Las ${VISITOR_PROMOTION_LIST_LIMIT} promociones más recientes`,
    visitor: true as const,
    registered: true as const,
    pro: true as const,
  },
  {
    feature: 'Todas las promociones que han salido',
    visitor: false as const,
    registered: true as const,
    pro: true as const,
  },
  {
    feature: `PDF de las ${VISITOR_PROMOTION_DETAIL_LIMIT} últimas promociones`,
    visitor: true as const,
    registered: true as const,
    pro: true as const,
  },
  {
    feature: 'PDF oficial de todas las promociones',
    visitor: false as const,
    registered: true as const,
    pro: true as const,
  },
  {
    feature: 'Próximos lanzamientos detectados',
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
    feature: 'Aviso por email al publicarse',
    visitor: false as const,
    registered: false as const,
    pro: true as const,
  },
  {
    feature: 'Aviso por SMS al publicarse',
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
    registered: 'Compra aparte',
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
