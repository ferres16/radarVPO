export const COMMERCE_SETTINGS_KEY = 'commerce.settings';

export type CommerceSettings = {
  /** Checkout de suscripción PRO (mensual). */
  proEnabled: boolean;
  /** Checkout de cursos y guías de pago. */
  coursesEnabled: boolean;
  /** Mensaje público cuando algo está en mantenimiento. */
  maintenanceMessage: string;
  /** Slug de la guía que incluye el pack PRO 3 meses (fase posterior). */
  proPackGuideSlug: string;
};

export const DEFAULT_COMMERCE_SETTINGS: CommerceSettings = {
  proEnabled: true,
  coursesEnabled: true,
  maintenanceMessage:
    'El pago online está temporalmente en mantenimiento. Vuelve a intentarlo más adelante.',
  proPackGuideSlug: 'vpo-inicial',
};
