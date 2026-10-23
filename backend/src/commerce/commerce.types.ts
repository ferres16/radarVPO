export const COMMERCE_SETTINGS_KEY = 'commerce.settings';

/** Cómo se presenta la oferta pública. */
export type SalesMode = 'validation' | 'live' | 'maintenance';

export type CommerceSettings = {
  /**
   * validation: no cobra; muestra muestra + “avísame”.
   * live: cobro activo según proEnabled/coursesEnabled.
   * maintenance: no cobra; mensaje + lista de interés.
   */
  salesMode: SalesMode;
  /** Checkout de suscripción PRO (mensual). Solo aplica en mode=live. */
  proEnabled: boolean;
  /** Checkout de cursos y guías de pago. Solo aplica en mode=live. */
  coursesEnabled: boolean;
  /** Mensaje público cuando no hay cobro (validación o mantenimiento). */
  maintenanceMessage: string;
  /** Precio previsto de la guía (céntimos) para validación; no es el cobro. */
  guideListPriceCents: number | null;
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
  // Validación por defecto en código; producción con ventas activas debe
  // fijar salesMode=live en SystemSetting (admin Comercio).
  salesMode: 'validation',
  proEnabled: false,
  coursesEnabled: false,
  maintenanceMessage:
    'Todavía no hemos abierto el cobro online. Déjanos tu email y te avisamos cuando esté disponible.',
  guideListPriceCents: 1499,
  proPackGuideSlug: 'vpo-inicial',
  allowPromotionCodes: false,
  stripeAutomaticTax: false,
};

export function isSalesMode(value: unknown): value is SalesMode {
  return value === 'validation' || value === 'live' || value === 'maintenance';
}

/** ¿Puede cobrarse este producto ahora? Exige mode=live + interruptor del producto. */
export function isProductSaleOpen(
  settings: CommerceSettings,
  product: 'pro' | 'course',
): boolean {
  if (settings.salesMode !== 'live') return false;
  return product === 'pro' ? settings.proEnabled : settings.coursesEnabled;
}
