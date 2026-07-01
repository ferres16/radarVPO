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
    title: 'Enviamos alertas',
    description: 'Email y SMS cuando abre un plazo o detectamos un próximo lanzamiento en tu zona.',
  },
  {
    step: '03',
    title: 'Te preparamos',
    description: 'Curso VPO, checklist y guía para llegar al plazo con documentación y criterio.',
  },
  {
    step: '04',
    title: 'Te acompañamos',
    description: 'Revisión de tu caso y estrategia si necesitas apoyo personalizado.',
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
      'Es la suscripción que te avisa antes que el resto sobre promociones y próximos lanzamientos de vivienda protegida en Cataluña, con curso, checklist y soporte prioritario.',
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
      'Sí. VPO PRO incluye el curso completo para entender requisitos, documentación y errores frecuentes del proceso.',
  },
  {
    question: '¿Garantiza conseguir un piso protegido?',
    answer:
      'No. Radar VPO te ayuda a enterarte antes y prepararte. La adjudicación depende siempre de los organismos oficiales.',
  },
  {
    question: '¿Puedo ver promociones sin pagar?',
    answer:
      'Sí. Puedes consultar promociones publicadas con la versión gratuita. PRO desbloquea alertas ilimitadas, próximos lanzamientos y preparación completa.',
  },
] as const;

export const courseFaqs = [
  {
    question: '¿Los cursos están incluidos en VPO PRO?',
    answer:
      'Los programas marcados como "Incluido en PRO" se desbloquean con tu suscripción. Otros cursos premium pueden comprarse por separado.',
  },
  {
    question: '¿Necesito experiencia previa?',
    answer:
      'No. Los cursos están pensados para personas que buscan su primera vivienda protegida y quieren entender requisitos y plazos sin tecnicismos.',
  },
  {
    question: '¿Puedo comprar un curso sin PRO?',
    answer:
      'Sí. Los programas premium tienen compra directa. PRO es la opción más completa si también quieres alertas y lanzamientos.',
  },
  {
    question: '¿Garantiza conseguir una vivienda?',
    answer:
      'No. La formación te ayuda a prepararte y evitar errores. La adjudicación depende siempre de los organismos oficiales.',
  },
] as const;

export const accompanimentProblem = {
  title: 'El plazo no espera a que estés listo',
  description:
    'Muchas personas descubren la convocatoria tarde, sin documentación preparada ni claridad sobre requisitos. Eso reduce opciones reales de presentarse a tiempo.',
} as const;

export const accompanimentSteps = [
  { step: '01', title: 'Cuéntanos tu caso', description: 'Revisamos tu situación, municipio y objetivos.' },
  { step: '02', title: 'Preparamos contigo', description: 'Requisitos, documentación y señales a vigilar.' },
  { step: '03', title: 'Llegas al plazo con criterio', description: 'Sin improvisar cuando se abre la solicitud.' },
] as const;

export const accompanimentIncludes = [
  'Revisión de requisitos económicos y familiares',
  'Orientación sobre documentación necesaria',
  'Seguimiento de oportunidades relevantes',
  'Traducción de plazos y pasos en lenguaje claro',
] as const;

export const accompanimentExcludes = [
  'No garantizamos adjudicación de vivienda',
  'No presentamos solicitudes en tu nombre salvo acuerdo específico',
  'No sustituimos resoluciones de organismos oficiales',
] as const;
