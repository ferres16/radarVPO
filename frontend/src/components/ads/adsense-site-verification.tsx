import { adsConfig } from '@/lib/ads';

/**
 * Meta de cuenta para que AdSense verifique el sitio sin cargar nada de Google.
 * La librería `adsbygoogle.js` puede fijar cookies publicitarias, así que solo la
 * inyecta `ConsentedScripts` cuando el usuario acepta la categoría de anuncios.
 */
export function AdsenseSiteVerification() {
  if (!adsConfig.enabled || !adsConfig.clientId) return null;

  return <meta name="google-adsense-account" content={adsConfig.clientId} />;
}
