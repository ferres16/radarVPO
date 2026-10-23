export type NavLink = {
  href: string;
  label: string;
  /** Shorter label for the fixed-width top navigation bar */
  navLabel?: string;
  mobileLabel?: string;
};

/** Navegación principal: oferta + cuenta. Noticias/ayuda van al pie. */
export const primaryNavLinks: NavLink[] = [
  {
    href: '/promotions',
    label: 'Promociones',
    navLabel: 'Promociones',
    mobileLabel: 'Promociones publicadas',
  },
  {
    href: '/alerts',
    label: 'Avisos previos',
    navLabel: 'Avisos',
    mobileLabel: 'Avisos previos',
  },
  {
    href: '/cursos/guiav1',
    label: 'Guía VPO',
    navLabel: 'Guía VPO',
    mobileLabel: 'Guía VPO',
  },
  {
    href: '/pro',
    label: 'Radar PRO',
    navLabel: 'Radar PRO',
    mobileLabel: 'Radar PRO',
  },
];

/** Enlaces secundarios (pie / menú auxiliar). */
export const secondaryNavLinks: NavLink[] = [
  { href: '/news', label: 'Noticias' },
  { href: '/contacto', label: 'Contacto' },
  { href: '/cursos', label: 'Catálogo de guías' },
];

export const copy = {
  upcomingLaunches: 'Avisos previos',
  upcomingLaunchesDesc:
    'Anuncios previos a una convocatoria. La fecha es una estimación, no una publicación oficial.',
  publishedPromotions: 'Promociones publicadas',
  publishedPromotionsDesc:
    'Promociones de vivienda protegida publicadas oficialmente, con sus bases y documentos.',
  howItWorks: 'Cómo funciona',
} as const;
