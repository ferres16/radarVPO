import type { NewsItem } from '@/types';

/** URL del artículo concreto cuando existe; evita enlazar solo la portada del medio. */
export function getNewsArticleUrl(
  item: Pick<NewsItem, 'itemUrl' | 'sourceUrl'>,
): string | null {
  if (item.itemUrl?.startsWith('http')) return item.itemUrl;
  if (item.sourceUrl?.startsWith('http')) return item.sourceUrl;
  return null;
}

export function newsSourceLooksLikeHomepage(url: string): boolean {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.replace(/\/+$/, '') || '/';
    return path === '/' || path === '';
  } catch {
    return false;
  }
}

type NextStep = { title: string; description: string; href: string; cta: string };

/** Siguiente paso útil según el tema del artículo (sin forzar compra en temas delicados). */
export function getNewsNextStep(
  item: Pick<NewsItem, 'category' | 'topic' | 'title'>,
): NextStep {
  const haystack = `${item.category || ''} ${item.topic || ''} ${item.title || ''}`.toLowerCase();

  if (/ayuda|prestamo|préstamo|subvenci|hipoteca|financi/.test(haystack)) {
    return {
      title: '¿Quieres situar el dinero necesario?',
      description:
        'La guía ordena ahorro, gastos y pasos hasta la firma. Consultar promociones sigue siendo gratis.',
      href: '/cursos/guiav1',
      cta: 'Ver la guía',
    };
  }

  if (/alquiler|lloguer|arrend/.test(haystack)) {
    return {
      title: 'Consulta promociones de alquiler protegido',
      description: 'Abre las bases oficiales en el visor, sin cuenta.',
      href: '/promotions',
      cta: 'Ver promociones',
    };
  }

  if (/normativa|decreto|ley|reglament|requisito|registro|inscrip/.test(haystack)) {
    return {
      title: 'Entiende el proceso antes de presentar nada',
      description:
        'Registro, documentación y requisitos están ordenados en la guía. Las bases oficiales se consultan gratis.',
      href: '/cursos/guiav1',
      cta: 'Ver la guía',
    };
  }

  if (/adjudic|convocator|promoci|lanzamiento|propera/.test(haystack)) {
    return {
      title: 'Mira las promociones publicadas',
      description: 'Documento oficial en PDF, gratis y sin registro.',
      href: '/promotions',
      cta: 'Ver promociones',
    };
  }

  return {
    title: 'Siguiente paso',
    description:
      'Consulta promociones con su documento oficial o prepara el proceso con la guía.',
    href: '/promotions',
    cta: 'Ver promociones gratis',
  };
}
