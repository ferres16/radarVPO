-- Idempotencia de webhooks de Stripe: un mismo event.id no se registra dos veces.
CREATE UNIQUE INDEX IF NOT EXISTS audit_logs_stripe_event_id_unique
ON audit_logs (entity_id)
WHERE entity = 'StripeEvent';
