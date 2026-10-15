import { track } from '@vercel/analytics';

/**
 * Eventos de producto para validar la oferta (ver docs/estrategia-lanzamiento.md).
 * Nunca incluyen datos personales: solo identificadores de producto y contexto.
 * Los eventos personalizados requieren un plan de Vercel Analytics que los admita;
 * si no están disponibles, la llamada se ignora sin afectar a la web.
 */
export type AnalyticsEventName =
  | 'pdf_viewer_opened'
  | 'pdf_viewer_loaded'
  | 'pdf_viewer_error'
  | 'pdf_document_selected'
  | 'pdf_download_clicked'
  | 'pdf_original_opened'
  | 'promotion_pdf_cta_clicked'
  | 'promotion_list_cta_clicked'
  | 'pro_cta_clicked'
  | 'pro_page_viewed'
  | 'course_cta_clicked'
  | 'course_page_viewed'
  | 'checkout_viewed'
  | 'checkout_started'
  | 'checkout_failed'
  | 'signup_completed'
  | 'favorite_saved'
  | 'favorite_removed'
  | 'subscription_cancel_requested'
  | 'subscription_cancel_withdrawn';

type EventProperties = Record<string, string | number | boolean | null>;

export function trackEvent(name: AnalyticsEventName, properties?: EventProperties) {
  if (typeof window === 'undefined') return;
  try {
    track(name, properties);
  } catch {
    // El análisis nunca debe romper la experiencia.
  }
}
