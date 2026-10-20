'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { adsConfig } from '@/lib/ads';
import { useConsent } from './consent-provider';

export function CookieBanner() {
  const {
    decided,
    configuring,
    preferences,
    acceptAll,
    rejectNonEssential,
    save,
    openSettings,
    closeSettings,
  } = useConsent();
  const pathname = usePathname();
  const [analytics, setAnalytics] = useState(preferences?.analytics ?? false);
  const [ads, setAds] = useState(preferences?.ads ?? false);

  const showBanner = (!decided || configuring) && !pathname.startsWith('/admin');
  if (!showBanner) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-modal="true" aria-labelledby="cookie-banner-title">
      <div className="cookie-banner__panel">
        <h2 id="cookie-banner-title" className="cookie-banner__title">
          Cookies
        </h2>
        <p className="cookie-banner__text">
          Usamos cookies técnicas para la sesión. La analítica solo se carga si la aceptas
          {adsConfig.enabled
            ? ' y la publicidad, si la consientes.'
            : '. Durante el lanzamiento no hay anuncios.'}{' '}
          Puedes cambiar la elección cuando quieras.{' '}
          <Link href="/cookies" className="font-semibold underline">
            Política de cookies
          </Link>
          .
        </p>

        {configuring ? (
          <fieldset className="cookie-banner__choices">
            <legend className="sr-only">Finalidades</legend>
            <label className="cookie-banner__choice">
              <input type="checkbox" checked disabled />
              <span>
                <strong>Necesarias</strong> — sesión e inicio de sesión. Siempre activas.
              </span>
            </label>
            <label className="cookie-banner__choice">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(event) => setAnalytics(event.target.checked)}
              />
              <span>
                <strong>Analítica</strong> — medición de uso de la web (Vercel Analytics y contador de
                visitas).
              </span>
            </label>
            {adsConfig.enabled ? (
              <label className="cookie-banner__choice">
                <input type="checkbox" checked={ads} onChange={(event) => setAds(event.target.checked)} />
                <span>
                  <strong>Publicidad</strong> — anuncios de Google AdSense, que pueden usar cookies de
                  terceros.
                </span>
              </label>
            ) : null}
          </fieldset>
        ) : null}

        <div className="cookie-banner__actions">
          <button type="button" className="btn btn--secondary btn--lg" onClick={rejectNonEssential}>
            Rechazar no necesarias
          </button>
          {configuring ? (
            <>
              <button
                type="button"
                className="btn btn--secondary btn--lg"
                onClick={() => {
                  setAnalytics(preferences?.analytics ?? false);
                  setAds(preferences?.ads ?? false);
                  closeSettings();
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn--primary btn--lg"
                onClick={() => save({ analytics, ads })}
              >
                Guardar elección
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="btn btn--secondary btn--lg"
                onClick={() => {
                  setAnalytics(preferences?.analytics ?? false);
                  setAds(preferences?.ads ?? false);
                  openSettings();
                }}
              >
                Configurar
              </button>
              <button type="button" className="btn btn--primary btn--lg" onClick={acceptAll}>
                Aceptar todas
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
