export const proPlan = {
  name: 'VPO PRO',
  brandName: 'Radar VPO',
  price: 'Desde 7,99 €/mes',
  priceAmount: 7.99,
  currency: 'EUR',
  stripeLink: process.env.NEXT_PUBLIC_STRIPE_PRO_LINK || '',
  fallbackHref: '/register?intent=pro',
  courseLabel: 'Curso de iniciación a la VPO',
  smsLabel: 'Notificaciones prioritarias',
  emailLabel: 'Avisos por correo',
  ctaLabel: 'Activar VPO PRO',
};

export const proHref = proPlan.stripeLink || proPlan.fallbackHref;

export const proIncludes = [
  {
    title: 'Notificaciones prioritarias',
    description: 'SMS y correo cuando detectamos un próximo lanzamiento o promoción relevante.',
    icon: '🔔',
  },
  {
    title: 'Seguimiento de municipios',
    description: 'Monitorizamos las zonas que te interesan para avisarte antes que el resto.',
    icon: '📍',
  },
  {
    title: 'Curso de iniciación',
    description: 'Aprende requisitos, documentación y errores frecuentes del proceso.',
    icon: '📚',
  },
  {
    title: 'Guía completa',
    description: 'Todo el proceso explicado paso a paso, sin improvisar cuando abra el plazo.',
    icon: '🗺️',
  },
];

export const proSolutionPoints = [
  { title: 'Detectamos próximos lanzamientos', description: 'Antes de que se publique la convocatoria oficial.' },
  { title: 'Monitorizamos tu zona', description: 'Sin revisar portales cada día a mano.' },
  { title: 'Te avisamos al abrir plazos', description: 'Para que te prepares y presentes con ventaja.' },
];

export const howItWorksSteps = [
  { step: '01', title: 'Detectamos próximos lanzamientos', description: 'Rastreamos señales de promociones que aún no han salido oficialmente.' },
  { step: '02', title: 'Te avisamos a tiempo', description: 'Recibes notificaciones por SMS y correo cuando hay novedad relevante.' },
  { step: '03', title: 'Te preparas antes que el resto', description: 'Revisas requisitos, documentación y estrategia con nuestros recursos.' },
  { step: '04', title: 'Presentas tu solicitud', description: 'Llegas al plazo con margen, sin depender de enterarte tarde.' },
];

export const starterCourseKeywords = [
  'iniciación',
  'iniciacion',
  'vivienda pública',
  'vivienda publica',
  'vpo',
  'hpo',
];

export const proComparisonRows = [
  { feature: 'Consultar próximos lanzamientos', free: true, pro: true },
  { feature: 'Consultar promociones publicadas', free: true, pro: true },
  { feature: 'Notificaciones SMS y correo prioritarias', free: false, pro: true },
  { feature: 'Seguimiento de municipios', free: false, pro: true },
  { feature: 'Curso de iniciación incluido', free: false, pro: true },
  { feature: 'Guía completa del proceso', free: false, pro: true },
] as const;
