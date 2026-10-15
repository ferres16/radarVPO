export type NavLink = {
  href: string;
  label: string;
  /** Shorter label for the fixed-width top navigation bar */
  navLabel?: string;
  mobileLabel?: string;
};

export const primaryNavLinks: NavLink[] = [
  { href: '/', label: 'Inicio' },
  { href: '/promotions', label: 'Promociones Publicadas', navLabel: 'Publicadas', mobileLabel: 'Promociones publicadas' },
  {
    href: '/alerts',
    label: 'Próximos Lanzamientos',
    navLabel: 'Lanzamientos',
    mobileLabel: 'Próximos lanzamientos',
  },
  { href: '/cursos', label: 'Cursos' },
  { href: '/pro', label: 'Radar VPO PRO', navLabel: 'PRO', mobileLabel: 'Radar VPO PRO' },
  { href: '/news', label: 'Noticias', mobileLabel: 'Noticias' },
];

export const copy = {
  upcomingLaunches: 'Próximos Lanzamientos',
  upcomingLaunchesDesc:
    'Promociones que todavía no han salido pero que podrían publicarse próximamente.',
  publishedPromotions: 'Promociones Publicadas',
  publishedPromotionsDesc:
    'Promociones de vivienda protegida publicadas oficialmente, con sus bases y documentos.',
  howItWorks: 'Cómo funciona',
} as const;
