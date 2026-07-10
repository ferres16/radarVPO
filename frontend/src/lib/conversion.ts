export const homeProblemCards = [
  {
    title: 'Descubre la promoción demasiado tarde',
    description: 'Cuando la ves, el plazo ya está cerrado o las plazas agotadas.',
  },
  {
    title: 'No tiene preparada la documentación',
    description: 'Pierdes días reuniendo papeles mientras otros ya han presentado.',
  },
  {
    title: 'Revisa decenas de portales',
    description: 'Horas perdidas sin saber si te estás perdiendo la oportunidad real.',
  },
] as const;

export const homeSolutionBlocks = [
  {
    step: '01',
    title: 'Detectamos promociones',
    description: 'Monitorizamos señales de vivienda protegida y HPO en Cataluña antes de que salgan oficialmente.',
  },
  {
    step: '02',
    title: 'PRO te avisa por email y SMS',
    description: 'Cuando detectamos un próximo lanzamiento o se abre un plazo relevante en tu zona.',
  },
  {
    step: '03',
    title: 'Te preparas con la Guía VPO',
    description: 'El curso incluido en PRO te ayuda con requisitos, documentación y errores frecuentes.',
  },
  {
    step: '04',
    title: 'Acompañamiento opcional',
    description: 'Si necesitas ayuda personalizada, puedes contratar acompañamiento aparte.',
  },
] as const;

export const homeTestimonials = [
  {
    id: 'placeholder-1',
    name: 'María G.',
    location: 'Barcelona',
    quote: 'Me avisaron dos días antes de que saliera la convocatoria. Llegué preparada y presenté a tiempo.',
    result: 'Presentó solicitud con margen',
    placeholder: true,
  },
  {
    id: 'placeholder-2',
    name: 'Jordi P.',
    location: 'Tarragona',
    quote: 'Dejé de revisar portales a diario. Las alertas PRO me ahorraron horas y mucha ansiedad.',
    result: 'Detectó oportunidad en su municipio',
    placeholder: true,
  },
  {
    id: 'placeholder-3',
    name: 'Laura M.',
    location: 'Girona',
    quote: 'El curso me aclaró requisitos y errores típicos. Supe qué preparar antes de que abriera el plazo.',
    result: 'Documentación lista antes del plazo',
    placeholder: true,
  },
] as const;

export const homeFaqs = [
  {
    question: '¿Qué es Radar VPO PRO?',
    answer:
      'Es la suscripción que añade avisos por email y SMS cuando detectamos lanzamientos o promociones relevantes, e incluye el curso Guía VPO.',
  },
  {
    question: '¿Sirve para VPO y HPO en Cataluña?',
    answer:
      'Sí. Monitorizamos promociones de vivienda protegida (VPO) y vivienda de protección oficial (HPO) publicadas o previstas en Cataluña.',
  },
  {
    question: '¿Recibiré alertas por email y SMS?',
    answer:
      'Con VPO PRO recibes avisos prioritarios por correo y SMS cuando detectamos un lanzamiento relevante o se abre un plazo en tu zona.',
  },
  {
    question: '¿Incluye curso para solicitar una VPO?',
    answer:
      'Sí. VPO PRO incluye el curso Guía VPO para entender requisitos, documentación y errores frecuentes del proceso.',
  },
  {
    question: '¿Garantiza conseguir un piso protegido?',
    answer:
      'No. Radar VPO te ayuda a enterarte antes y prepararte. La adjudicación depende siempre de los organismos oficiales.',
  },
  {
    question: '¿Puedo ver promociones sin pagar?',
    answer:
      'Sí. Con la cuenta gratuita puedes consultar promociones publicadas y próximos lanzamientos en la web. VPO PRO añade avisos por email y SMS, y el curso Guía VPO.',
  },
] as const;
