import { PRO_PRICE_AMOUNT, formatEuro, proPriceLabel } from '@/lib/offer';

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
};

export const proHref = proPlan.landingHref;

/** Los CTA de PRO van a la ficha con el recuadro de pago. */
export function getProHref(): string {
  return proPlan.checkoutHref;
}

export const proActiveMessages = [
  'Radar VPO PRO está activo en tu cuenta.',
  'Tienes Radar VPO PRO activo: recibirás los avisos por email y SMS.',
] as const;

export function getProActiveMessage(seed?: string): string {
  if (!seed) return proActiveMessages[0];
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return proActiveMessages[hash % proActiveMessages.length];
}

export const freePlanFeatures = [
  'Consultar todas las promociones publicadas',
  'Ver el documento oficial (PDF) de cada promoción',
  'Guardar hasta 3 promociones en Mi espacio',
  'Muestra gratuita de las guías que la ofrezcan',
] as const;

export const proExclusiveFeatures = [
  'Avisos por email de nuevas promociones y próximos lanzamientos',
  'Avisos por SMS si indicas tu móvil',
  'Mi espacio sin límite de promociones guardadas',
] as const;

export const freeVsProDescription =
  'Consultar promociones y ver sus documentos oficiales es gratis. PRO añade avisos por email y SMS, y organización sin límite.';

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
      'El mismo aviso en el móvil si has indicado tu número. Es el canal que no suele estar en los boletines gratuitos.',
  },
  {
    title: 'Mi espacio sin límite',
    description:
      'Guarda promociones con tu cuenta —checklist, etapa y notas— en cualquier dispositivo. La cuenta gratuita solo permite 3.',
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
  if (guides) {
    return `Consultar el PDF oficial es gratis. ${proPlan.name} añade avisos por email y SMS, Mi espacio sin límite y ${guides.description.split('.')[0].toLowerCase()}. ${proPlan.price}. Cancelas desde Mi cuenta.`;
  }
  return `Consultar el PDF oficial es gratis. ${proPlan.name} añade avisos por email y SMS, y Mi espacio sin límite para organizar lo que sigues. ${proPlan.price}. Cancelas desde Mi cuenta.`;
}

export const proWhyPay = [
  {
    title: 'Enterarte sin abrir diez webs',
    body: 'PRO te avisa cuando detectamos una publicación o un próximo lanzamiento. Tú decides cuándo mirar la ficha; no hace falta revisar el registro cada día.',
  },
  {
    title: 'SMS, no solo correo',
    body: 'Hay avisos por email gratuitos de terceros. PRO añade el SMS si tu cuenta tiene un móvil válido: el aviso llega aunque no estés mirando la bandeja.',
  },
  {
    title: 'Organización con cuenta',
    body: 'Con la cuenta gratuita guardas hasta 3 promociones. PRO quita el límite. Checklist, etapa y notas viajan contigo en cualquier dispositivo.',
  },
] as const;

export const proForWhom = {
  yes: [
    'Quieres enterarte en el móvil cuando se publica una convocatoria, no solo al abrir el correo.',
    'Sigues varias promociones y necesitas una lista con pasos, no un marcador del navegador.',
    'Prefieres un aviso sobrio de lo detectado, sin inventar urgencias ni plazas limitadas.',
  ],
  no: [
    'Solo quieres mirar PDFs de vez en cuando: eso es gratis, sin PRO.',
    'Buscas filtro de avisos por municipio: hoy PRO avisa de las promociones que detectamos, sin ese filtro.',
    'Esperas que presentemos la solicitud o te asesoremos en tu caso: no lo hacemos.',
  ],
} as const;

export const proLimits = [
  'Los avisos cubren las promociones que Radar VPO detecta en las fuentes oficiales que monitoriza; hoy no se pueden filtrar por municipio.',
  'Las fechas de próximos lanzamientos son estimaciones y se indican como tales: pueden no cumplirse o no publicarse.',
  'Los SMS solo se envían si tu cuenta tiene un móvil válido y has activado ese canal.',
  'Radar VPO informa y organiza: no presenta solicitudes por ti ni garantiza una adjudicación.',
  'Una guía concreta solo forma parte de PRO si aparece listada en esta página con su nombre y enlace.',
] as const;

export const proFaqs = [
  {
    question: '¿Qué recibo exactamente con PRO?',
    answer:
      'Avisos por email (y por SMS si indicas tu móvil) cuando se publica una nueva promoción o detectamos un próximo lanzamiento, y Mi espacio sin límite de promociones guardadas. Una guía concreta solo forma parte de PRO si aparece listada en esta página.',
  },
  {
    question: '¿Qué puedo hacer gratis?',
    answer:
      'Consultar todas las promociones, abrir su documento oficial en PDF, guardar hasta 3 promociones en Mi espacio y ver la muestra de las guías que la ofrezcan.',
  },
  {
    question: 'Hay avisos por correo gratis. ¿Qué añade PRO?',
    answer:
      'El aviso por SMS si indicas tu móvil y Mi espacio sin límite con cuenta. El correo, por sí solo, no es el motivo para pagar.',
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
      'No. Te ayuda a enterarte y a organizarte. La adjudicación depende siempre de los organismos oficiales.',
  },
] as const;

export const proComparisonRows = [
  { feature: 'Consultar promociones publicadas', free: true as const, pro: true as const },
  { feature: 'Ver el documento oficial (PDF)', free: true as const, pro: true as const },
  { feature: 'Promociones guardadas en Mi espacio', free: 'Hasta 3', pro: 'Sin límite' },
  { feature: 'Avisos por email', free: false as const, pro: true as const },
  { feature: 'Avisos por SMS', free: false as const, pro: true as const },
  {
    feature: 'Guías incluidas en PRO',
    free: 'No',
    pro: 'Solo si aparecen listadas en la página PRO',
  },
] as const;

export type ProComparisonCell = boolean | string;
