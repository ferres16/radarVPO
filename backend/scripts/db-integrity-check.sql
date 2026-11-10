-- Comprobaciones de integridad de solo lectura (no modifica datos).
-- Uso: psql "$DATABASE_URL" -f backend/scripts/db-integrity-check.sql
-- Cada consulta devuelve un recuento; cualquier valor > 0 merece revisión.
\pset footer off

\echo '== Acceso y planes =='
SELECT 'plan_pro_sin_suscripcion_activa' AS check_name, count(*) AS issues
FROM users u
WHERE u.plan = 'pro'
  AND NOT EXISTS (
    SELECT 1 FROM subscriptions s
    WHERE s.user_id = u.id AND s.plan_key = 'pro' AND s.status IN ('active', 'trialing')
  );

SELECT 'suscripcion_activa_con_plan_free' AS check_name, count(DISTINCT s.user_id) AS issues
FROM subscriptions s JOIN users u ON u.id = s.user_id
WHERE s.status IN ('active', 'trialing') AND s.plan_key = 'pro' AND u.plan = 'free';

SELECT 'suscripcion_activa_periodo_vencido' AS check_name, count(*) AS issues
FROM subscriptions
WHERE status IN ('active', 'trialing') AND current_period_end < now() - interval '3 days';

SELECT 'pro_sin_email_verificado' AS check_name, count(*) AS issues
FROM users WHERE plan = 'pro' AND email_verified_at IS NULL;

SELECT 'acceso_curso_activo_sin_compra_pagada' AS check_name, count(*) AS issues
FROM user_course_accesses a
WHERE a.is_active
  AND a.activated_by_admin = false
  AND NOT EXISTS (
    SELECT 1 FROM purchases p
    WHERE p.user_id = a.user_id AND p.course_id = a.course_id AND p.status = 'paid'
  );

SELECT 'acceso_curso_activo_con_compra_reembolsada' AS check_name, count(*) AS issues
FROM user_course_accesses a
WHERE a.is_active
  AND EXISTS (
    SELECT 1 FROM purchases p
    WHERE p.user_id = a.user_id AND p.course_id = a.course_id AND p.status = 'refunded'
  )
  AND NOT EXISTS (
    SELECT 1 FROM purchases p
    WHERE p.user_id = a.user_id AND p.course_id = a.course_id AND p.status = 'paid'
  );

\echo '== Compras y consentimientos =='
SELECT 'compra_pagada_sin_consentimiento' AS check_name, count(*) AS issues
FROM purchases p
WHERE p.status = 'paid' AND p.provider = 'stripe'
  AND NOT EXISTS (SELECT 1 FROM purchase_consents c WHERE c.purchase_id = p.id);

SELECT 'compra_pagada_sin_fecha' AS check_name, count(*) AS issues
FROM purchases WHERE status = 'paid' AND purchased_at IS NULL;

SELECT 'eventos_stripe_atascados_processing' AS check_name, count(*) AS issues
FROM stripe_processed_events
WHERE status = 'processing' AND created_at < now() - interval '1 hour';

\echo '== Referencias sin clave foránea (posibles huérfanos) =='
SELECT 'consentimiento_curso_inexistente' AS check_name, count(*) AS issues
FROM purchase_consents c
WHERE c.course_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM courses x WHERE x.id = c.course_id);

SELECT 'evento_suministro_consentimiento_inexistente' AS check_name, count(*) AS issues
FROM content_supply_events e
WHERE e.consent_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM purchase_consents c WHERE c.id = e.consent_id);

SELECT 'published_post_promocion_inexistente' AS check_name, count(*) AS issues
FROM published_posts pp
WHERE pp.source_kind LIKE 'pro_%'
  AND NOT EXISTS (SELECT 1 FROM promotions p WHERE p.id = pp.source_id);

SELECT 'file_asset_promocion_inexistente' AS check_name, count(*) AS issues
FROM file_assets f
WHERE f.entity_type = 'promotion' AND f.status = 'active'
  AND NOT EXISTS (SELECT 1 FROM promotions p WHERE p.id = f.entity_id);

SELECT 'file_asset_curso_inexistente' AS check_name, count(*) AS issues
FROM file_assets f
WHERE f.entity_type = 'course' AND f.status = 'active'
  AND NOT EXISTS (SELECT 1 FROM courses c WHERE c.id = f.entity_id);

\echo '== Duplicados =='
SELECT 'aviso_pro_enviado_mas_de_una_vez' AS check_name, count(*) AS issues
FROM (
  SELECT source_kind, source_id FROM published_posts
  WHERE status = 'sent' AND audience = 'pro' AND channel = 'brevo'
  GROUP BY source_kind, source_id HAVING count(*) > 1
) d;

SELECT 'entitlement_duplicado' AS check_name, count(*) AS issues
FROM (
  SELECT user_id, key, source, source_id FROM user_entitlements
  GROUP BY user_id, key, source, source_id HAVING count(*) > 1
) d;

SELECT 'email_duplicado_sin_distinguir_mayusculas' AS check_name, count(*) AS issues
FROM (SELECT lower(email) FROM users GROUP BY lower(email) HAVING count(*) > 1) d;

\echo '== Higiene y conservación =='
SELECT 'sesiones_caducadas_o_revocadas' AS check_name, count(*) AS issues
FROM sessions WHERE expires_at < now() OR revoked_at IS NOT NULL;

SELECT 'tokens_caducados' AS check_name,
  (SELECT count(*) FROM password_reset_tokens WHERE expires_at < now())
  + (SELECT count(*) FROM email_verification_tokens WHERE expires_at < now()) AS issues;

SELECT 'delivery_logs_mayores_12_meses' AS check_name, count(*) AS issues
FROM delivery_logs WHERE created_at < now() - interval '12 months';

SELECT 'cuentas_sin_verificar_mayores_30_dias' AS check_name, count(*) AS issues
FROM users u
WHERE u.email_verified_at IS NULL AND u.created_at < now() - interval '30 days'
  AND u.email NOT LIKE 'deleted.%@deleted.invalid'
  AND NOT EXISTS (SELECT 1 FROM purchases p WHERE p.user_id = u.id);
