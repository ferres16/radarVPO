import type { Metadata } from 'next';

export const siteConfig = {
  name: 'Radar VPO',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.radarvpo.com',
  locale: 'es_ES',
  title: 'Radar VPO | Prepara tus solicitudes de vivienda protegida en Cataluña',
  description:
    'Consulta promociones de vivienda protegida con su documento oficial, aprende a preparar tu solicitud con un curso y organiza tus oportunidades. Avisos por email y SMS con Radar VPO PRO.',
  keywords: [
    'vivienda pública cataluña',
    'vivienda publica catalunya',
    'vivienda protegida cataluña',
    'próximos lanzamientos VPO',
    'promociones publicadas VPO',
    'pisos protegidos cataluña',
    'HPO cataluña',
    'promociones vivienda pública barcelona',
    'vivienda social cataluña',
    'adjudicaciones vivienda protegida',
    'cursos vivienda protegida',
  ],
};

export function absoluteUrl(path = '/') {
  if (/^https?:\/\//i.test(path)) return path;
  const base = siteConfig.url.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

export function createMetadata({
  title,
  description = siteConfig.description,
  path = '/',
  image = '/og-image.png',
  keywords = [],
  type = 'website',
}: {
  title: string;
  description?: string;
  path?: string;
  image?: string;
  keywords?: string[];
  type?: 'website' | 'article';
}): Metadata {
  const url = absoluteUrl(path);
  const resolvedTitle = title.includes(siteConfig.name) ? title : `${title} | ${siteConfig.name}`;

  return {
    title,
    description,
    keywords: [...siteConfig.keywords, ...keywords],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: resolvedTitle,
      description,
      url,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type,
      images: [{ url: absoluteUrl(image), width: 1200, height: 630, alt: resolvedTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: resolvedTitle,
      description,
      images: [absoluteUrl(image)],
    },
  };
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    sameAs: [],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      areaServed: 'Catalonia',
      availableLanguage: ['es', 'ca'],
    },
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: 'es-ES',
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqJsonLd(items: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}
