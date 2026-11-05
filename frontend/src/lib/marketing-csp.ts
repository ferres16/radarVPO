/**
 * Orígenes CSP para Meta Pixel y Google Analytics 4 (gtag.js).
 * Se permiten en CSP siempre; los scripts solo se inyectan con consentimiento.
 *
 * Meta Pixel usa además:
 * - form POST a facebook.com/tr/  → form-action
 * - iframe de facebook.com        → frame-src
 * Sin eso, el navegador bloquea el pixel aunque fbevents.js cargue.
 */

export const MARKETING_SCRIPT_SRC = [
  'https://connect.facebook.net',
  'https://www.googletagmanager.com',
  'https://www.google-analytics.com',
  // Param builder del pixel / CAPI Gateway.
  'https://capi-automation.s3.us-east-2.amazonaws.com',
].join(' ');

export const MARKETING_CONNECT_SRC = [
  'https://connect.facebook.net',
  'https://www.facebook.com',
  'https://*.facebook.com',
  'https://*.facebook.net',
  'https://graph.facebook.com',
  // Meta Pixel CEE / Conversions API Gateway (Cloud Run + fallback AWS).
  'https://*.a.run.app',
  // Gateway regional de Meta (p. ej. mpc-prod-*.us-central1.run.app); no basta *.a.run.app.
  'https://*.us-central1.run.app',
  'https://*.ecs.us-west-1.on.aws',
  'https://capi-automation.s3.us-east-2.amazonaws.com',
  'https://www.googletagmanager.com',
  'https://*.googletagmanager.com',
  'https://www.google-analytics.com',
  'https://*.google-analytics.com',
  'https://analytics.google.com',
  'https://*.analytics.google.com',
  'https://region1.google-analytics.com',
].join(' ');

export const MARKETING_IMG_SRC = [
  'https://www.facebook.com',
  'https://www.google-analytics.com',
  'https://www.googletagmanager.com',
].join(' ');

/** Iframes del pixel / botones de Meta. */
export const MARKETING_FRAME_SRC = [
  'https://www.facebook.com',
  'https://*.facebook.com',
  'https://web.facebook.com',
].join(' ');

/**
 * form-action del pixel (POST a /tr/). Sin esto Chrome bloquea el envío
 * aunque connect-src e img-src permitan facebook.com.
 */
export const MARKETING_FORM_ACTION = [
  'https://www.facebook.com',
  'https://facebook.com',
  'https://*.facebook.com',
].join(' ');
