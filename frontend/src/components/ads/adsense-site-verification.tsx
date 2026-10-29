import { adsConfig } from '@/lib/ads';

/**
 * Señal server-side para que AdSense detecte el sitio sin depender del banner de cookies.
 * No muestra anuncios: solo meta de cuenta + script de la librería cuando ads están habilitados.
 * Las unidades (`adsbygoogle.push`) siguen requiriendo consentimiento en AdSlot.
 */
export function AdsenseSiteVerification() {
  if (!adsConfig.enabled || !adsConfig.clientId) return null;

  return (
    <>
      <meta name="google-adsense-account" content={adsConfig.clientId} />
      {/* eslint-disable-next-line @next/next/no-sync-scripts -- AdSense pide el script de cliente en el documento */}
      <script
        id="radar-vpo-adsense"
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsConfig.clientId}`}
        crossOrigin="anonymous"
      />
    </>
  );
}
