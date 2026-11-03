-- Activar SMS de nuevas promociones para PRO existentes con teléfono.
-- Los que paguen PRO a partir de ahora lo reciben en el fulfill de Stripe.
UPDATE "users"
SET "sms_alerts_enabled" = true
WHERE "sms_alerts_enabled" = false
  AND COALESCE(TRIM("phone"), '') <> ''
  AND (
    "plan" = 'pro'
    OR EXISTS (
      SELECT 1
      FROM "subscriptions" s
      WHERE s."user_id" = "users"."id"
        AND s."plan_key" = 'pro'
        AND s."status" IN ('active', 'trialing')
    )
  );
