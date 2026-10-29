/**
 * Orígenes CSP para Meta Pixel y Google Analytics 4 (gtag.js).
 * Se permiten en CSP siempre; los scripts solo se inyectan con consentimiento.
 */

export const MARKETING_SCRIPT_SRC = [
  'https://connect.facebook.net',
  'https://www.googletagmanager.com',
  'https://www.google-analytics.com',
].join(' ');

export const MARKETING_CONNECT_SRC = [
  'https://connect.facebook.net',
  'https://www.facebook.com',
  'https://*.facebook.com',
  'https://*.facebook.net',
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
