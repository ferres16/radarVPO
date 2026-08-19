export type NavLink = {
  href: string;
  label: string;
  /** Shorter label for the fixed-width top navigation bar */
  navLabel?: string;
  mobileLabel?: string;
};

export const primaryNavLinks: NavLink[] = [
  { href: '/', label: 'Inicio' },
  { href: '/cursos', label: 'Cursos' },
  {
    href: '/alerts',
    label: 'Próximos Lanzamientos',
    navLabel: 'Lanzamientos',
    mobileLabel: 'Lanzamientos',
  },
  {
    href: '/promotions',
    label: 'Promociones Publicadas',
    navLabel: 'Publicadas',
    mobileLabel: 'Publicadas',
  },
  {
    href: '/acompanamiento',
    label: 'Acompañamiento',
    navLabel: 'Acompañamiento',
    mobileLabel: 'Acompañamiento',
  },
  { href: '/news', label: 'Noticias', mobileLabel: 'Noticias' },
];

export const copy = {
  upcomingLaunches: 'Próximos Lanzamientos',
  upcomingLaunchesDesc:
    'Promociones que todavía no han salido pero que podrían publicarse próximamente.',
  publishedPromotions: 'Promociones Publicadas',
  publishedPromotionsDesc: 'Promociones ya abiertas o publicadas oficialmente con requisitos y plazos.',
  howItWorks: 'Cómo funciona',
  accompaniment: 'Acompañamiento',
  accompanimentDesc:
    'Acompañamiento personalizado para conseguir tu VPO: revisión de requisitos, preparación de documentación y seguimiento de oportunidades.',
} as const;
