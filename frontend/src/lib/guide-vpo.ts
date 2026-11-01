/**
 * Presentación pública de la Guía VPO (guiav1).
 * Lectura en pantalla dentro de Radar VPO (no archivo descargable).
 * Copy alineado con el contenido real de la guía 2026.
 * No promete acompañamiento 1:1 ni adjudicación.
 */

export const GUIDE_VPO_SLUGS = [
  'guiav1',
  'guia-vpo',
  'guia-general-vpo',
  'vpo-desde-cero',
  'vpo-inicial',
] as const;

const GUIDE_VPO_SLUG_SET = new Set<string>(GUIDE_VPO_SLUGS);

/** Slug canónico de la guía a la venta. */
export const GUIDE_VPO_PRIMARY_SLUG = 'guiav1';

/** Ficha de la guía. */
export const GUIDE_VPO_HREF = `/cursos/${GUIDE_VPO_PRIMARY_SLUG}`;

/** CTA de compra directa (menos fricción). */
export const GUIDE_VPO_CHECKOUT_HREF = `${GUIDE_VPO_HREF}#pagar`;

export const GUIDE_VPO_TITLE = 'Guía para optar a una vivienda protegida en Catalunya';

export const GUIDE_VPO_TAGLINE =
  'De la inscripción a las llaves: entiende el sistema, prepara papeles y llega a tiempo.';

export const GUIDE_VPO_VALUE =
  'Una guía práctica que ordena el proceso real de la VPO en Catalunya: requisitos, Registro de Solicitantes, Carpeta VPO, tipos de promoción, precio, financiación ICF y pasos hasta la firma.';

export const GUIDE_VPO_SHORT =
  '13 capítulos + checklist, glosario y enlaces oficiales. Lectura en pantalla · pago único · acceso mínimo 24 meses.';

export const GUIDE_VPO_SEO_DESCRIPTION =
  'Guía VPO Catalunya 2026: requisitos, registro, documentación, precio, financiación ICF y proceso hasta las llaves. Lectura en pantalla, pago único, acceso mínimo 24 meses.';

/** Problemas que la guía resuelve (marketing). */
export const GUIDE_VPO_OUTCOMES = [
  {
    title: 'Dejar de ir a ciegas',
    text: 'Entiendes qué es una VPO, quién la gestiona y qué tipo de promoción (pública, privada o cooperativa) encaja con tu situación.',
  },
  {
    title: 'Empezar por el paso correcto',
    text: 'Sabes por qué el Registro de Solicitantes es obligatorio, cómo inscribirte y cómo no perder la inscripción por descuido.',
  },
  {
    title: 'Preparar la Carpeta VPO a tiempo',
    text: 'Reúnes documentación antes de que abra el plazo: en promociones privadas, la rapidez lo decide casi todo.',
  },
  {
    title: 'Hacer bien las cuentas',
    text: 'Calculas ingresos con la cifra que mira la administración, entiendes el precio máximo y situas la entrada y el préstamo ICF Habitatge Emancipació.',
  },
  {
    title: 'Saber qué pasa después de que te seleccionen',
    text: 'Reserva, arras, visado, obligaciones, y qué implica vender o alquilar una VPO más adelante.',
  },
] as const;

/** Inclusiones concretas (marketing). */
export const GUIDE_VPO_INCLUDES = [
  'Mapa del sistema: organismos, regímenes (alquiler, pleno dominio, derecho de superficie) y tipos de promoción',
  'Registro de Solicitantes: inscripción, mantenimiento y errores que te dejan fuera',
  'Cómo acceder el día que abre una promoción (incluida la lógica de las privadas por orden de llegada)',
  'Cálculo de requisitos, ingresos y precio máximo legal',
  'Carpeta VPO + checklist imprimible de documentación',
  'Proceso completo tras la selección hasta la firma',
  'Financiación con el Préstamo ICF Habitatge Emancipació',
  'Obligaciones legales, caducidad de la protección, vender o alquilar',
  'Glosario, FAQ y listado de recursos oficiales',
] as const;

export type GuideVpoChapter = {
  title: string;
  readerCare: string;
  hook: string;
};

/** Índice alineado con la Guía VPO 2026. */
export const GUIDE_VPO_CHAPTERS: GuideVpoChapter[] = [
  {
    title: 'Qué es una VPO y quién la gestiona',
    readerCare: 'Entender el mapa institucional.',
    hook: 'Generalitat, AHC, INCASÒL, ayuntamientos: quién hace qué.',
  },
  {
    title: 'Tipos de VPO según su régimen',
    readerCare: 'Elegir la vía que encaja con tus ahorros.',
    hook: 'Alquiler, pleno dominio o derecho de superficie.',
  },
  {
    title: 'Pública, privada y cooperativa',
    readerCare: 'Saber dónde buscar y con qué estrategia.',
    hook: 'Cada tipo se adjudica de forma distinta — y eso lo cambia todo.',
  },
  {
    title: 'Requisitos e ingresos',
    readerCare: 'Comprobar si cumples con la cifra correcta.',
    hook: 'El error número uno: mirar la casilla equivocada de la renta.',
  },
  {
    title: 'Registro de Solicitantes',
    readerCare: 'Dar el primer paso obligatorio.',
    hook: 'Sin inscripción, no participas en casi ninguna promoción.',
  },
  {
    title: 'Cómo acceder a una promoción',
    readerCare: 'Actuar el día que abre el plazo.',
    hook: 'El capítulo más determinante: aviso previo, anuncio y orden de llegada.',
  },
  {
    title: 'Cómo se calcula el precio',
    readerCare: 'Entender el máximo legal.',
    hook: 'El módulo oficial marca el techo, no la promotora.',
  },
  {
    title: 'La Carpeta VPO',
    readerCare: 'Tener los papeles listos antes.',
    hook: 'Prepárala antes de que exista la promoción.',
  },
  {
    title: 'Tras ser seleccionado',
    readerCare: 'Llegar de la lista a las llaves.',
    hook: 'Preselección, reserva, arras, visado y notario.',
  },
  {
    title: 'Financiación ICF Habitatge Emancipació',
    readerCare: 'Cubrir la entrada que el banco no financia.',
    hook: 'La ayuda pública pensada para el tramo que más cuesta aportar.',
  },
  {
    title: 'Obligaciones y caducidad',
    readerCare: 'Saber a qué te comprometes.',
    hook: 'Uso habitual, marco legal y qué ha cambiado en 2025-2026.',
  },
  {
    title: 'Vender o alquilar tu VPO',
    readerCare: 'Entender las reglas a futuro.',
    hook: 'Lo que casi nadie explica bien antes de firmar.',
  },
  {
    title: 'Checklist, glosario y recursos',
    readerCare: 'Pasar de leer a actuar.',
    hook: 'Lista de acción, FAQ, Carpeta imprimible y enlaces oficiales.',
  },
];

export const GUIDE_VPO_NOT_INCLUDED = [
  'No presentamos tu solicitud ni te representamos ante la administración.',
  'No hay asesoramiento personalizado ni acompañamiento 1:1.',
  'No sustituye las bases oficiales ni el criterio de cada convocatoria.',
  'No garantiza una adjudicación ni un resultado concreto.',
];

export const GUIDE_VPO_FAQS = [
  {
    question: '¿Qué resuelve esta guía?',
    answer:
      'Ordena el proceso completo para optar a una VPO en Catalunya: mapa del sistema, Registro de Solicitantes, requisitos e ingresos, Carpeta VPO, acceso a promociones, precio, financiación ICF y pasos desde la selección hasta la firma — más obligaciones, venta/alquiler, glosario y checklist.',
  },
  {
    question: '¿Es un curso con lecciones o un PDF?',
    answer:
      'Es una guía de lectura en pantalla (más de 40 páginas de contenido). Pago único, sin renovaciones. No es un archivo descargable: se abre dentro de Radar VPO tras el acceso.',
  },
  {
    question: '¿Incluye financiación y qué pasa después de que te seleccionen?',
    answer:
      'Sí. Cubre el Préstamo ICF Habitatge Emancipació, el proceso tras la selección (reserva, arras, visado) y las obligaciones posteriores, incluida la venta o el alquiler de una VPO.',
  },
  {
    question: '¿Me ayudáis a presentar la solicitud?',
    answer:
      'No. La guía informa y organiza. Cada persona presenta su propia solicitud en los canales oficiales. El acompañamiento individual no se ofrece con esta compra.',
  },
] as const;

export const GUIDE_VPO_PAY_BULLETS = [
  'De la inscripción a las llaves, ordenado',
  'Registro, carpeta, precio y financiación ICF',
  'Checklist + glosario + enlaces oficiales',
  'Pago único · lectura en pantalla · 24 meses',
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
