/**
 * NEXT_PUBLIC_APP_ENV distingue producción de entornos de prueba (staging).
 * Sin valor se asume producción para no cambiar despliegues existentes.
 */
const rawAppEnv = process.env.NEXT_PUBLIC_APP_ENV?.trim().toLowerCase() || 'production';

export const appEnv = rawAppEnv;
export const isProductionSite = rawAppEnv === 'production';
