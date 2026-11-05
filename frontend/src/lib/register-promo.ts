import { VISITOR_PROMOTION_LIST_LIMIT } from '@/lib/access-tier';

/** Motivo concreto por el que invitamos a registrarse en cada pantalla. */
export type RegisterPromoReason = 'dates' | 'promotions' | 'detail' | 'general';

export const registerPromoCopy: Record<
  RegisterPromoReason,
  { title: string; text: string; cta: string; pendingTitle: string }
> = {
  dates: {
    title: 'Regístrate gratis para ver las fechas aproximadas de lanzamiento',
    text: 'Te enseñamos cuándo esperamos que salga cada promoción para que llegues con los papeles preparados.',
    cta: 'Regístrate gratis y ver fechas',
    pendingTitle: 'Confirma tu email para ver las fechas de lanzamiento',
  },
  promotions: {
    title: 'Regístrate gratis para ver todas las promociones que han salido',
    text: `Sin registro solo ves las ${VISITOR_PROMOTION_LIST_LIMIT} más recientes. Con tu cuenta gratuita accedes al histórico completo y a todos los documentos oficiales.`,
    cta: 'Regístrate gratis y ver todas',
    pendingTitle: 'Confirma tu email para ver todas las promociones',
  },
  detail: {
    title: 'Regístrate gratis para abrir el documento oficial de esta promoción',
    text: 'Bases, requisitos, precios y plazos en el PDF oficial, sin salir de Radar VPO.',
    cta: 'Regístrate gratis y abrir el PDF',
    pendingTitle: 'Confirma tu email para abrir este documento',
  },
  general: {
    title: 'Regístrate gratis y no te pierdas ninguna promoción',
    text: 'Con tu cuenta gratuita ves todas las promociones publicadas, sus documentos oficiales y las fechas aproximadas de los próximos lanzamientos.',
    cta: 'Regístrate gratis',
    pendingTitle: 'Confirma tu email para desbloquearlo todo',
  },
};

/** Lo que desbloquea la cuenta gratuita, en positivo. */
export const registerBenefits = [
  'Todas las promociones que han salido, no solo las últimas',
  'El documento oficial (PDF) de cada promoción',
  'Fechas aproximadas de los próximos lanzamientos',
  'Gratis, sin tarjeta y en menos de un minuto',
] as const;

export function registerHref(next?: string): string {
  return next ? `/register?next=${encodeURIComponent(next)}` : '/register';
}

export function loginHref(next?: string): string {
  return next ? `/login?next=${encodeURIComponent(next)}` : '/login';
}
