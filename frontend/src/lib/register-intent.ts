import { safeNextPath } from '@/lib/safe-next';

export type RegisterIntent = 'save' | 'buy_guide' | 'buy_pro' | 'general';

export function resolveRegisterIntent(nextRaw: string | null | undefined): {
  intent: RegisterIntent;
  nextPath: string;
  title: string;
  description: string;
  submitLabel: string;
} {
  const nextPath = safeNextPath(nextRaw, '');

  if (nextPath.startsWith('/promotions/') || nextPath.startsWith('/mi-espacio')) {
    return {
      intent: 'save',
      nextPath: nextPath || '/mi-espacio',
      title: 'Crea tu cuenta para guardar esta promoción',
      description:
        'La cuenta es gratis. Al terminar vuelves a la promoción que querías guardar. No te pedimos pagar por guardar.',
      submitLabel: 'Crear cuenta y guardar',
    };
  }

  if (
    nextPath.startsWith('/checkout') ||
    nextPath.includes('#pagar') ||
    (nextPath.startsWith('/cursos/') && (nextPath.includes('pagar') || nextPath.includes('checkout')))
  ) {
    const isPro = nextPath.startsWith('/pro') || nextPath.includes('product=pro');
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

  if (nextPath.startsWith('/pro')) {
    return {
      intent: 'buy_pro',
      nextPath,
      title: 'Crea tu cuenta para Radar VPO PRO',
      description: 'Con la cuenta gestionas avisos y el acceso PRO. Si solo quieres guardar promociones, no hace falta pagar.',
      submitLabel: 'Crear cuenta y continuar',
    };
  }

  if (nextPath.startsWith('/cursos/')) {
    return {
      intent: 'buy_guide',
      nextPath,
      title: 'Crea tu cuenta para la guía',
      description:
        'Si vas a comprar, la cuenta activa el acceso tras el pago. Consultar la muestra no requiere pagar.',
      submitLabel: 'Crear cuenta y continuar',
    };
  }

  return {
    intent: 'general',
    nextPath: nextPath || '/account',
    title: 'Crea tu cuenta en 1 minuto',
    description:
      'La cuenta es gratis. Con ella guardas promociones y accedes a la muestra de las guías que la ofrezcan.',
    submitLabel: 'Crear cuenta gratis',
  };
}
