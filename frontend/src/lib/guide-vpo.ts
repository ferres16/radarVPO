/**
 * Presentación pública de la Guía VPO.
 * El producto vive en Radar VPO (no en Stripe). Esta copia describe lo que el PDF
 * incluye hoy: proceso, registro, papeles, financiación y pasos hasta la firma.
 * No promete acompañamiento 1:1 ni usa historias personales no verificadas en la web.
 */

export const GUIDE_VPO_SLUGS = [
  'guiav1',
  'guia-vpo',
  'guia-general-vpo',
  'vpo-desde-cero',
  'vpo-inicial',
] as const;

const GUIDE_VPO_SLUG_SET = new Set<string>(GUIDE_VPO_SLUGS);

export const GUIDE_VPO_TITLE = 'Guía para optar a una vivienda protegida en Catalunya';

export const GUIDE_VPO_TAGLINE =
  'Entiende el proceso de la VPO y qué preparar antes de dar el siguiente paso.';

export const GUIDE_VPO_VALUE =
  'El valor está en ordenar información que hoy está dispersa y convertirla en acciones comprensibles: registro, requisitos, documentación, tipos de promoción y lo que viene después de que te seleccionen.';

export const GUIDE_VPO_SHORT =
  'De la inscripción a la firma: registro, papeles, cuentas y pasos reales. Pago único.';

export const GUIDE_VPO_SEO_DESCRIPTION =
  'Guía para entender el proceso de la VPO en Catalunya y preparar registro, documentación, financiación y los pasos hasta la firma. Pago único e acceso inmediato.';

export type GuideVpoChapter = {
  title: string;
  readerCare: string;
  hook: string;
};

export const GUIDE_VPO_CHAPTERS: GuideVpoChapter[] = [
  {
    title: 'Primeros pasos',
    readerCare: 'Entender por dónde empezar.',
    hook: 'Buscas una VPO. ¿Cuál es el primer paso?',
  },
  {
    title: 'Registro de Solicitantes',
    readerCare: 'Saber cómo iniciar y mantener la inscripción.',
    hook: 'Antes de mirar promociones, entiende el registro.',
  },
  {
    title: 'Requisitos e ingresos',
    readerCare: 'Saber qué información económica revisar.',
    hook: '¿Qué datos necesitas para revisar los requisitos de una VPO?',
  },
  {
    title: 'Documentación',
    readerCare: 'Organizar los papeles con antelación.',
    hook: 'Tu Carpeta VPO: empieza a prepararla.',
  },
  {
    title: 'Ahorro y gastos',
    readerCare: 'Entender el dinero necesario para comprar.',
    hook: 'El precio del piso es solo una parte de las cuentas.',
  },
  {
    title: 'Pública, privada y cooperativa',
    readerCare: 'Comprender las diferencias entre promociones.',
    hook: 'Tres tipos de promoción que conviene distinguir.',
  },
  {
    title: 'Pleno dominio y derecho de superficie',
    readerCare: 'Entender qué se está comprando.',
    hook: 'Antes de comparar precios, compara qué compras.',
  },
  {
    title: 'Precios, garaje y trastero',
    readerCare: 'Interpretar mejor una promoción.',
    hook: '¿Qué incluye realmente el precio anunciado?',
  },
  {
    title: 'Reserva, arras y visado',
    readerCare: 'Comprender los pasos después de la selección.',
    hook: 'Te seleccionan para una VPO. ¿Qué viene después?',
  },
  {
    title: 'Obligaciones posteriores',
    readerCare: 'Saber qué implica vivir en una vivienda protegida.',
    hook: 'Lo que conviene conocer antes de firmar.',
  },
  {
    title: 'Checklist imprimible',
    readerCare: 'Pasar de leer a organizarte.',
    hook: 'Una lista para ordenar tu documentación.',
  },
  {
    title: 'Enlaces oficiales y glosario',
    readerCare: 'Consultar fuentes y entender términos.',
    hook: 'Registro, visado, calificación… empieza a entenderlos.',
  },
];

export const GUIDE_VPO_NOT_INCLUDED = [
  'No presentamos tu solicitud ni te representamos ante la administración.',
  'No hay asesoramiento personalizado ni acompañamiento 1:1.',
  'No sustituye las bases oficiales ni el criterio de cada convocatoria.',
];

export const GUIDE_VPO_FAQS = [
  {
    question: '¿Qué resuelve esta guía?',
    answer:
      'Ordena el proceso de la VPO en Catalunya y te dice qué preparar: registro, requisitos, documentación, tipos de promoción, cuentas y los pasos desde que te seleccionan hasta la firma.',
  },
  {
    question: '¿Es un curso con lecciones o un PDF?',
    answer:
      'Es una guía de lectura en pantalla. Pago único, sin renovaciones. No es un archivo descargable.',
  },
  {
    question: '¿Incluye registro, papeles y financiación?',
    answer:
      'Sí. Además del contexto general, esta versión cubre el Registro de Solicitantes, la carpeta de documentación, la financiación y los pasos posteriores a la selección.',
  },
  {
    question: '¿Me ayudáis a presentar la solicitud?',
    answer:
      'No. La guía informa y organiza. Cada persona presenta su propia solicitud en los canales oficiales. El acompañamiento individual no se ofrece.',
  },
] as const;

export const GUIDE_VPO_PAY_BULLETS = [
  'El proceso de la VPO, ordenado en acciones',
  'Qué preparar antes del siguiente paso',
  'Registro, papeles, precio y firma',
  'Pago único · lectura en pantalla',
];

export function isGuideVpoSlug(slug?: string | null): boolean {
  return Boolean(slug && GUIDE_VPO_SLUG_SET.has(slug));
}

export function getPublicCourseTitle(course: { slug?: string | null; title?: string | null }): string {
  return isGuideVpoSlug(course.slug) ? GUIDE_VPO_TITLE : (course.title ?? 'Guía Radar VPO');
}

export function getPublicCourseDescription(course: {
  slug?: string | null;
  shortDescription?: string | null;
  longDescription?: string | null;
}): string {
  if (isGuideVpoSlug(course.slug)) return GUIDE_VPO_TAGLINE;
  return (
    course.longDescription ||
    course.shortDescription ||
    'Una guía clara para tomar mejores decisiones sobre vivienda protegida.'
  );
}

export function getGuideVpoTopicTitles(): string[] {
  return GUIDE_VPO_CHAPTERS.map((chapter) => chapter.title);
}
