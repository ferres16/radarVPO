export const COMMERCE_SETTINGS_KEY = 'commerce.settings';

export type CommerceSettings = {
  /** Checkout de suscripción PRO (mensual). */
  proEnabled: boolean;
  /** Checkout de cursos y guías de pago. */
  coursesEnabled: boolean;
  /** Mensaje público cuando algo está en mantenimiento. */
  maintenanceMessage: string;
  /** Slug de la guía que incluye el pack PRO 3 meses. */
  proPackGuideSlug: string;
  /** Permitir códigos de promoción de Stripe en Checkout. */
  allowPromotionCodes: boolean;
  /**
   * Stripe Tax (automatic_tax). Mantener false en fase de validación de producto
   * (antes de alta de autónomo). Activar solo tras confirmar IVA/gestoría
   * y configurar Tax en el Dashboard de Stripe.
   */
  stripeAutomaticTax: boolean;
};

export const DEFAULT_COMMERCE_SETTINGS: CommerceSettings = {
  proEnabled: true,
  coursesEnabled: true,
  maintenanceMessage:
    'El pago online está temporalmente en mantenimiento. Vuelve a intentarlo más adelante.',
  proPackGuideSlug: 'vpo-inicial',
  allowPromotionCodes: false,
  stripeAutomaticTax: false,
};
