import { PRO_PRICE_AMOUNT, formatEuro, proPriceLabel } from '@/lib/offer';
import { proWhatsapp } from '@/lib/whatsapp';

/**
 * Fuente única de Radar VPO PRO.
 * Solo prestaciones que existen hoy. Las guías incluidas salen del catálogo
 * publicado (accessType=pro), nunca de un nombre fijo inventado.
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
  productImageSrc: '/pro-product.png',
  productImageAlt:
    'Suscripción Radar VPO PRO: alertas de vivienda protegida y acceso a WhatsApp para consultas',
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

export const freePlanFeatures = [
  'Consultar todas las promociones publicadas',
  'Abrir el documento oficial (PDF) de cada promoción',
  'Comprar la guía por separado (pago único)',
] as const;

export const proExclusiveFeatures = [
  'Avisos por email de nuevas promociones y próximos lanzamientos',
  'Avisos por SMS si indicas tu móvil',
  'Acceso a WhatsApp para consultas',
] as const;

export const freeVsProDescription =
  'Consultar promociones y abrir sus documentos oficiales es gratis. PRO añade avisos por email y SMS, y WhatsApp para consultas.';

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
      'El mismo aviso en el móvil si has indicado tu número. Llega aunque no estés mirando el correo.',
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
  return `Consultar promociones es gratis. ${proPlan.name} añade avisos por email y SMS, y WhatsApp para consultas${guideBit}. ${proPlan.price}. Cancelas desde Mi cuenta.`;
}

export const proWhyPay = [
  {
    title: 'Enterarte sin abrir diez webs',
    body: 'PRO te avisa cuando detectamos una publicación o un próximo lanzamiento. Tú decides cuándo mirar la ficha.',
  },
  {
    title: 'SMS, no solo correo',
    body: 'Hay avisos por email gratuitos de terceros. PRO añade el SMS si tu cuenta tiene un móvil válido.',
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
    'Solo quieres mirar convocatorias de vez en cuando: eso es gratis, sin PRO.',
    'Esperas que presentemos la solicitud o te representemos ante la administración: no lo hacemos.',
  ],
} as const;

export const proLimits = [
  'Los avisos PRO (email y SMS) cubren todas las promociones que detectamos; no hay filtro por municipio ni por compra/alquiler.',
  'Las fechas de próximos lanzamientos son estimaciones y se indican como tales: pueden no cumplirse o no publicarse.',
  'Los SMS solo se envían si tu cuenta tiene un móvil válido y has activado ese canal.',
  'WhatsApp es para consultas orientativas sobre el proceso; no sustituye asesoramiento jurídico ni presenta solicitudes.',
  'Radar VPO no garantiza una adjudicación.',
  'Una guía concreta solo forma parte de PRO si aparece listada en esta página con su nombre y enlace.',
] as const;

export const proFaqs = [
  {
    question: '¿Qué recibo exactamente con PRO?',
    answer:
      'Avisos por email (y por SMS si indicas tu móvil) cuando se publica una nueva promoción o detectamos un próximo lanzamiento, y acceso a WhatsApp para consultas. Una guía concreta solo forma parte de PRO si aparece listada en esta página.',
  },
  {
    question: '¿Qué puedo hacer gratis?',
    answer:
      'Consultar todas las promociones y abrir su documento oficial en PDF. La guía se puede comprar aparte con pago único.',
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
      'No. Cuando mostramos una fecha estimada lo indicamos expresamente; solo la fecha de publicación oficial es un dato confirmado.',
  },
  {
    question: '¿Garantiza conseguir una vivienda protegida?',
    answer:
      'No. Te ayuda a enterarte a tiempo y a resolver dudas del proceso. La adjudicación depende siempre de los organismos oficiales.',
  },
] as const;

export const proComparisonRows = [
  { feature: 'Consultar promociones publicadas', free: true as const, pro: true as const },
  { feature: 'Abrir el documento oficial (PDF)', free: true as const, pro: true as const },
  { feature: 'Avisos por email', free: false as const, pro: true as const },
  { feature: 'Avisos por SMS', free: false as const, pro: true as const },
  { feature: 'WhatsApp para consultas', free: false as const, pro: true as const },
  {
    feature: 'Guía incluida en PRO',
    free: 'No',
    pro: 'Solo si aparece listada en la página PRO',
  },
] as const;

export type ProComparisonCell = boolean | string;
