import { PRO_PRICE_AMOUNT, formatEuro, proPriceLabel } from '@/lib/offer';

/**
 * Definición de Radar VPO PRO. Solo prestaciones que existen hoy en el producto.
 * Cualquier mejora futura se documenta en docs/estrategia-lanzamiento.md, no aquí.
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
  checkoutHref: '/checkout?product=pro',
};

export const proHref = proPlan.landingHref;

/** Los CTA de PRO llevan siempre a la página que explica la oferta y su precio. */
export function getProHref(isAuthenticated: boolean): string {
  return isAuthenticated ? proPlan.checkoutHref : proPlan.landingHref;
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
  'Lección de muestra del curso inicial',
] as const;

export const proExclusiveFeatures = [
  'Avisos por email de nuevas promociones y próximos lanzamientos',
  'Avisos por SMS si indicas tu móvil',
  'Mi espacio sin límite de promociones guardadas',
] as const;

export const freeVsProDescription =
  'Consultar promociones y ver sus documentos oficiales es gratis. PRO añade avisos por email y SMS, y organización sin límite.';

export const proIncludes = [
  {
    title: 'Avisos por email',
    description:
      'Te escribimos cuando se publica una nueva promoción y cuando detectamos un próximo lanzamiento.',
  },
  {
    title: 'Avisos por SMS',
    description:
      'El mismo aviso en el móvil, si has indicado tu número en tu cuenta. Es el canal que no está regalado en los avisos gratuitos de terceros.',
  },
  {
    title: 'Mi espacio sin límite',
    description:
      'Guarda las promociones en tu cuenta —no solo en este navegador—, marca la etapa y sigue una lista de pasos.',
  },
  {
    title: 'Curso VPO Inicial incluido',
    description:
      'Acceso al curso inicial mientras tu suscripción esté activa. Si lo compras aparte, lo conservas aunque canceles PRO.',
  },
] as const;

/** Por qué pagar PRO cuando ya hay avisos y guías gratis. Solo hechos del producto. */
export const proWhyPay = [
  {
    title: 'SMS, no solo correo',
    body: 'Hay avisos por email gratuitos de otros sitios, a menudo con filtro por municipio. PRO añade el aviso por SMS si tu cuenta tiene un móvil válido.',
  },
  {
    title: 'Espacio con cuenta',
    body: `Con la cuenta gratuita guardas hasta 3 promociones. PRO quita el límite. Los favoritos van con tu usuario: checklist, etapa y notas en cualquier dispositivo.`,
  },
  {
    title: 'Curso inicial mientras esté activa',
    body: 'Si aún no has comprado el curso, PRO lo incluye durante la suscripción. La compra del curso es pago único y se conserva si cancelas.',
  },
] as const;

export const proForWhom = {
  yes: [
    'Quieres enterarte en el móvil cuando se publica una convocatoria, no solo al abrir el correo.',
    'Sigues varias promociones y necesitas una lista con pasos, no un marcador del navegador.',
    'Quieres el curso inicial ahora y aún no lo has comprado.',
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
  'Los SMS solo se envían si tu cuenta tiene un móvil válido.',
  'Radar VPO informa y organiza: no presenta solicitudes por ti ni garantiza una adjudicación.',
] as const;

export const proFaqs = [
  {
    question: '¿Qué recibo exactamente con PRO?',
    answer:
      'Avisos por email (y por SMS si indicas tu móvil) cuando se publica una nueva promoción o detectamos un próximo lanzamiento, Mi espacio sin límite de promociones guardadas y acceso al Curso VPO Inicial mientras la suscripción esté activa.',
  },
  {
    question: '¿Qué puedo hacer gratis?',
    answer:
      'Consultar todas las promociones, abrir su documento oficial en PDF, guardar hasta 3 promociones en Mi espacio y leer la lección de muestra del curso inicial.',
  },
  {
    question: 'Hay avisos por correo gratis. ¿Qué añade PRO?',
    answer:
      'El aviso por SMS si indicas tu móvil, Mi espacio sin límite con cuenta, y el curso inicial mientras la suscripción esté activa. El correo, por sí solo, no es el motivo para pagar.',
  },
  {
    question: '¿Cuánto cuesta y cómo se cobra?',
    answer: `${proPriceLabel}, con renovación mensual automática hasta que la canceles. El precio total se muestra antes de pagar y el cobro lo gestiona Stripe.`,
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
  { feature: 'Curso VPO Inicial', free: 'Lección de muestra', pro: 'Incluido mientras esté activo' },
] as const;

export type ProComparisonCell = boolean | string;
