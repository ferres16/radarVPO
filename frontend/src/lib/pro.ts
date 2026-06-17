export const proPlan = {
  name: 'Radar VPO Pro',
  price: '9,99 €/mes',
  priceAmount: 9.99,
  currency: 'EUR',
  stripeLink: process.env.NEXT_PUBLIC_STRIPE_PRO_LINK || '',
  fallbackHref: '/register?intent=pro',
  courseLabel: 'Curso de iniciación a la vivienda pública',
  smsLabel: 'Alertas SMS',
  emailLabel: 'Alertas por correo',
};

export const proHref = proPlan.stripeLink || proPlan.fallbackHref;

export const freePlanFeatures = [
  { label: 'Ver promociones publicadas', included: true },
  { label: 'Guardar oportunidades y consultar el catálogo', included: true },
  { label: 'Avisos básicos dentro de la web', included: true },
  { label: 'Alertas SMS prioritarias', included: false },
  { label: 'Alertas por correo de nuevas oportunidades', included: false },
  { label: 'Curso de iniciación incluido', included: false },
];

export const proPlanFeatures = [
  { label: 'Ver promociones publicadas', included: true },
  { label: 'Guardar oportunidades y consultar el catálogo', included: true },
  { label: 'Avisos básicos dentro de la web', included: true },
  { label: 'Alertas SMS prioritarias', included: true },
  { label: 'Alertas por correo de nuevas oportunidades', included: true },
  { label: 'Curso de iniciación incluido', included: true },
];

export const proBenefits = [
  'Recibe avisos por SMS cuando detectemos oportunidades relevantes.',
  'Recibe alertas por correo con contexto y siguiente paso recomendado.',
  'Accede al curso de iniciación para entender requisitos, documentación y errores frecuentes.',
  'Evita depender de revisar portales, boletines y webs municipales cada día.',
];

export const starterCourseKeywords = [
  'iniciación',
  'iniciacion',
  'vivienda pública',
  'vivienda publica',
  'vpo',
  'hpo',
];
