import { safeNextPath } from '@/lib/safe-next';

export type RegisterIntent = 'buy_guide' | 'buy_pro' | 'see_dates' | 'see_promotions' | 'general';

function isProPath(path: string): boolean {
  return /^\/pro(?:[/?#]|$)/.test(path);
}

export function resolveRegisterIntent(nextRaw: string | null | undefined): {
  intent: RegisterIntent;
  nextPath: string;
  title: string;
  description: string;
  submitLabel: string;
} {
  const nextPath = safeNextPath(nextRaw, '');

  if (
    nextPath.startsWith('/checkout') ||
    nextPath.includes('#pagar') ||
    (nextPath.startsWith('/cursos/') && (nextPath.includes('pagar') || nextPath.includes('checkout')))
  ) {
    const isPro = isProPath(nextPath) || nextPath.includes('product=pro');
    if (isPro) {
      return {
        intent: 'buy_pro',
        nextPath,
        title: 'Crea tu cuenta para activar PRO',
        description: 'Necesitamos una cuenta para asociar la suscripción. Después continúas con el pago.',
        submitLabel: 'Crear cuenta y continuar',
      };
    }
    return {
      intent: 'buy_guide',
      nextPath,
      title: 'Crea tu cuenta para comprar la guía',
      description: 'La cuenta sirve para activar el acceso tras el pago. Al terminar vuelves al resumen de compra.',
      submitLabel: 'Crear cuenta y continuar',
    };
  }

  if (isProPath(nextPath)) {
    return {
      intent: 'buy_pro',
      nextPath,
      title: 'Crea tu cuenta para Radar VPO PRO',
      description: 'Con la cuenta gestionas avisos, WhatsApp de consultas y el acceso PRO.',
      submitLabel: 'Crear cuenta y continuar',
    };
  }

  if (nextPath.startsWith('/cursos/')) {
    return {
      intent: 'buy_guide',
      nextPath,
      title: 'Crea tu cuenta para la guía',
      description: 'Si vas a comprar, la cuenta activa el acceso tras el pago.',
      submitLabel: 'Crear cuenta y continuar',
    };
  }

  if (nextPath.startsWith('/alerts')) {
    return {
      intent: 'see_dates',
      nextPath,
      title: 'Regístrate gratis para ver las fechas de lanzamiento',
      description:
        'Te enseñamos cuándo esperamos que salga cada promoción. Gratis, sin tarjeta y en menos de un minuto.',
      submitLabel: 'Registrarme y ver las fechas',
    };
  }

  if (nextPath.startsWith('/promotions')) {
    return {
      intent: 'see_promotions',
      nextPath,
      title: 'Regístrate gratis para ver todas las promociones',
      description:
        'Accede a todas las promociones que han salido con su PDF oficial y a las fechas de los próximos lanzamientos.',
      submitLabel: 'Registrarme y verlas todas',
    };
  }

  return {
    intent: 'general',
    nextPath: nextPath && !nextPath.startsWith('/mi-espacio') ? nextPath : '/account',
    title: 'Regístrate gratis en 1 minuto',
    description:
      'Ve todas las promociones que han salido, su PDF oficial y las fechas aproximadas de los próximos lanzamientos. Sin tarjeta.',
    submitLabel: 'Registrarme gratis',
  };
}
