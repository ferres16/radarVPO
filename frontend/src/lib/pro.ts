export const proPlan = {
  name: 'VPO PRO',
  brandName: 'Radar VPO',
  price: 'Desde 7,99 €/mes',
  priceAmount: 7.99,
  currency: 'EUR',
  stripeLink: process.env.NEXT_PUBLIC_STRIPE_PRO_LINK || '',
  fallbackHref: '/register?intent=pro',
  courseLabel: 'Curso de iniciación a la VPO',
  smsLabel: 'Alertas prioritarias',
  emailLabel: 'Alertas por correo',
  ctaLabel: 'Activar VPO PRO',
};

export const proHref = proPlan.stripeLink || proPlan.fallbackHref;

export const proIncludes = [
  {
    title: 'Alertas prioritarias',
    description: 'SMS y correo cuando detectamos una oportunidad relevante.',
    icon: '🔔',
  },
  {
    title: 'Seguimiento de municipios',
    description: 'Monitorizamos las zonas que te interesan para avisarte a tiempo.',
    icon: '📍',
  },
  {
    title: 'Curso de iniciación',
    description: 'Aprende requisitos, documentación y errores frecuentes.',
    icon: '📚',
  },
  {
    title: 'Guía completa',
    description: 'Todo el proceso explicado paso a paso, sin improvisar.',
    icon: '🗺️',
  },
];

export const proSolutionPoints = [
  { title: 'Detecta avisos previos', description: 'Antes de que se publique la convocatoria.' },
  { title: 'Monitoriza municipios', description: 'Sin revisar portales cada día.' },
  { title: 'Avisa al abrir plazos', description: 'Para que actúes con margen.' },
];

export const starterCourseKeywords = [
  'iniciación',
  'iniciacion',
  'vivienda pública',
  'vivienda publica',
  'vpo',
  'hpo',
];
