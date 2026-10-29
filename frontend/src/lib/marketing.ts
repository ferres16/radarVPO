/**
 * Píxeles de medición / ads (Meta + Google Analytics 4 vía gtag).
 * Nota: el snippet del compi es gtag GA4 (G-…), no un contenedor GTM-….
 * Solo se inyectan tras consentimiento (analítica → GA; publicidad → Meta Pixel).
 */

function envOrDefault(value: string | undefined, fallback: string) {
  if (value === undefined) return fallback;
  return value.trim();
}

/** IDs públicos del ad account / GA (Oct 2026). Override con env en Vercel si cambian. */
export const marketingConfig = {
  metaPixelId: envOrDefault(process.env.NEXT_PUBLIC_META_PIXEL_ID, '1303653491853194'),
  gaMeasurementId: envOrDefault(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, 'G-EQPBRQLPQ6'),
};

export function hasMetaPixel() {
  return Boolean(marketingConfig.metaPixelId);
}

export function hasGoogleAnalytics() {
  return Boolean(marketingConfig.gaMeasurementId);
}

/** Mostrar categoría “Publicidad” si hay AdSense o Meta Pixel. */
export function needsMarketingConsentCategory(adsenseEnabled: boolean) {
  return adsenseEnabled || hasMetaPixel();
}
