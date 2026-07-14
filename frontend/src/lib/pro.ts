export const VPO_PRO_PRICE = {
  amount: 9.99,
  currency: 'EUR',
  interval: 'month' as const,
};

export function formatProPrice(): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: VPO_PRO_PRICE.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(VPO_PRO_PRICE.amount) + '/mes';
}

export const proPlan = {
  name: 'VPO PRO',
  brandName: 'Radar VPO',
  price: formatProPrice(),
  priceAmount: VPO_PRO_PRICE.amount,
  currency: VPO_PRO_PRICE.currency,
  interval: VPO_PRO_PRICE.interval,
  stripeLink: process.env.NEXT_PUBLIC_STRIPE_PRO_LINK || '',
  fallbackHref: '/register?intent=pro',
  courseLabel: 'Curso Guía VPO',
  smsLabel: 'Avisos por SMS',
  emailLabel: 'Avisos por email',
  ctaLabel: 'Activar VPO PRO',
};

export const proHref = proPlan.stripeLink || proPlan.fallbackHref;

export const proActiveMessages = [
  'Ya formas parte de VPO PRO 🎉',
  'Buena elección: ya estás un paso por delante.',
  'VPO PRO activo. Ahora toca no llegar tarde.',
  'Ya estás dentro. Nosotros vigilamos las promociones.',
] as const;

export function getProActiveMessage(seed?: string): string {
  if (!seed) {
    return proActiveMessages[0];
  }
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return proActiveMessages[hash % proActiveMessages.length];
}

export const freePlanFeatures = [
  'Consultar promociones publicadas',
  'Ver próximos lanzamientos en la web',
  'Cuenta y perfil',
] as const;

export const proExclusiveFeatures = [
  'Avisos por email',
  'Avisos por SMS',
  'Curso Guía VPO',
] as const;

export const freeVsProDescription =
  'La cuenta gratuita te deja consultar promociones y lanzamientos en la web. VPO PRO añade avisos por email y SMS, y el curso Guía VPO.';

export const proIncludes = [
  {
    title: 'Avisos por email',
    description: 'Te avisamos al correo cuando detectamos un lanzamiento o se abre un plazo relevante.',
    icon: '📧',
  },
  {
    title: 'Avisos por SMS',
    description: 'Recibe el aviso en el móvil para no depender de revisar la web cada día.',
    icon: '📱',
  },
  {
    title: 'Curso Guía VPO',
    description: 'Formación práctica para entender requisitos, documentación y errores frecuentes del proceso.',
    icon: '📚',
  },
] as const;

export const proSolutionPoints = [
  { title: 'Consultas gratis en la web', description: 'Promociones publicadas y próximos lanzamientos sin pagar.' },
  { title: 'PRO te avisa por email y SMS', description: 'Cuando detectamos una oportunidad relevante en tu zona.' },
  { title: 'Incluye el curso Guía VPO', description: 'Para llegar al plazo preparado, sin improvisar.' },
] as const;

export const howItWorksSteps = [
  { step: '01', title: 'Consultas gratis en la web', description: 'Revisa promociones publicadas y próximos lanzamientos cuando quieras.' },
  { step: '02', title: 'Activa VPO PRO', description: 'Desbloquea avisos por email y SMS, y el curso Guía VPO.' },
  { step: '03', title: 'Recibes los avisos', description: 'Te notificamos cuando hay novedad relevante en tu zona.' },
  { step: '04', title: 'Te preparas con la Guía VPO', description: 'Usa el curso incluido para revisar requisitos y documentación antes del plazo.' },
] as const;

export const starterCourseKeywords = [
  'guía',
  'guia',
  'iniciación',
  'iniciacion',
  'vivienda pública',
  'vivienda publica',
  'vpo',
  'hpo',
];

export const proComparisonRows = [
  { feature: 'Ver promociones publicadas', free: true as const, pro: true as const },
  { feature: 'Ver próximos lanzamientos', free: true as const, pro: true as const },
  { feature: 'Avisos por email', free: false as const, pro: true as const },
  { feature: 'Avisos por SMS', free: false as const, pro: true as const },
  { feature: 'Curso Guía VPO', free: false as const, pro: true as const },
] as const;

export type ProComparisonCell = boolean | string;
