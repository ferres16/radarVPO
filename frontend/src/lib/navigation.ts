export type NavLink = {
  href: string;
  label: string;
  mobileLabel?: string;
};

export const primaryNavLinks: NavLink[] = [
  { href: '/', label: 'Inicio' },
  { href: '/alerts', label: 'Próximos Lanzamientos', mobileLabel: 'Lanzamientos' },
  { href: '/promotions', label: 'Promociones Publicadas', mobileLabel: 'Publicadas' },
  { href: '/cursos', label: 'Cursos' },
  { href: '/services', label: 'Servicios' },
];

export const copy = {
  upcomingLaunches: 'Próximos Lanzamientos',
  upcomingLaunchesDesc:
    'Promociones que todavía no han salido pero que podrían publicarse próximamente.',
  publishedPromotions: 'Promociones Publicadas',
  publishedPromotionsDesc: 'Promociones ya abiertas o publicadas oficialmente con requisitos y plazos.',
  howItWorks: 'Cómo funciona',
} as const;
