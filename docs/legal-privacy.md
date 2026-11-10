# Preparación legal y de privacidad (España y Cataluña)

[← Índice](./README.md)

> **Aviso.** Este documento es una revisión técnica del producto frente a requisitos normativos, contrastada con los textos oficiales del BOE. **No es asesoramiento jurídico** ni certifica el cumplimiento. Los textos legales publicados y las decisiones de la tabla "Requiere validación profesional" deben revisarse con un abogado o DPO. No se han inventado datos de empresa, contratos con proveedores ni pruebas de consentimiento.

## Fuentes oficiales consultadas

| Norma | Referencia | Artículos revisados |
|---|---|---|
| RGPD (Reglamento UE 2016/679) | DOUE L 119, 4/5/2016 | arts. 6, 7, 13, 17, 20, 28, 30, 32, 44–49 |
| LOPDGDD (LO 3/2018) | [BOE-A-2018-16673](https://www.boe.es/buscar/act.php?id=BOE-A-2018-16673) | arts. 11, 21, 32 |
| LSSI (Ley 34/2002) | [BOE-A-2002-13758](https://www.boe.es/buscar/act.php?id=BOE-A-2002-13758) | art. 10 (información general), 21 y 22.1 (comunicaciones comerciales), 22.2 (cookies), 27–28 (contratación electrónica) |
| TRLGDCU (RDL 1/2007) | [BOE-A-2007-20555](https://www.boe.es/buscar/act.php?id=BOE-A-2007-20555) | arts. 97, 98 (contratos a distancia, botón de pago, confirmación), 102, 103.m (desistimiento en contenido digital) |
| Codi de consum de Catalunya (Llei 22/2010) | [BOE-A-2010-13115](https://www.boe.es/buscar/act.php?id=BOE-A-2010-13115) | art. 128-1 (derechos lingüísticos), interpretado por la STC 88/2017 ([BOE-A-2017-8473](https://www.boe.es/buscar/doc.php?id=BOE-A-2017-8473)) |
| AEPD, *Guía sobre el uso de las cookies* (2023) | [aepd.es](https://www.aepd.es/guias/guia-cookies.pdf) | consentimiento previo, rechazo tan fácil como aceptar |

## 1. Cumplimiento técnico implementado (verificable en código)

| Requisito | Fuente | Implementación |
|---|---|---|
| Cookies no necesarias solo tras consentimiento | LSSI 22.2, guía AEPD | Banner por categorías; GA4, Meta Pixel, Vercel Analytics y AdSense se cargan solo tras consentir (`components/consent/consented-scripts.tsx`). **Corregido**: AdSense cargaba su librería antes del consentimiento |
| Derecho de supresión | RGPD 17 | `DELETE /users/me`: anonimización conservando solo compras/consentimientos; borra logs de envío, favoritos, alertas, lista de espera, tokens. **Corregido**: antes quedaban datos y el admin borraba registros comerciales |
| Portabilidad/acceso | RGPD 15, 20 | `GET /users/me/export` (JSON) |
| Minimización en logs | RGPD 5.1.c, 32 | Errores 5xx sin mensaje; logs de envío anonimizados al dar de baja; retención configurable |
| Seguridad del tratamiento | RGPD 32 | Ver [security-audit.md](./security-audit.md): contraseñas bcrypt, tokens con hash, HTTPS/HSTS, control de acceso por nivel, ficheros privados firmados |
| Plazos de conservación técnicos | RGPD 5.1.e | Job de retención (`jobs/data-retention.ts`), **desactivado** hasta alinear plazos con la política |
| Prueba del consentimiento contractual | TRLGDCU 98.7, 103.m | `purchase_consents`: versión, texto literal aceptado, fecha de aceptación de condiciones y de inicio inmediato/renuncia al desistimiento; email de confirmación con ese resumen (soporte duradero) |
| Inicio del suministro digital | TRLGDCU 103.m | `first_content_opened_at` registra la primera apertura del contenido |
| Consentimiento de marketing con versión | RGPD 7.1 | `users.marketing_opt_in_at`, `marketing_opt_in_version`, `marketing_opt_out_at` |
| Email verificado antes de activar servicios | Seguridad / exactitud (RGPD 5.1.d) | Compras y PRO quedan pendientes hasta verificar |
| Avisos PRO como servicio contratado | LSSI 21 (no son comunicaciones comerciales) | Pie con enlace a Mi cuenta para gestionar preferencias |
| Aviso de cancelación y renovación | TRLGDCU 97 | Texto en Stripe Checkout (`custom_text`), email de confirmación y Mi cuenta |
| Idioma | Codi de consum 128-1 | El aviso legal indica que la información en catalán se facilita a petición |

## 2. Documentación pendiente (bloquea o condiciona el lanzamiento)

| Pendiente | Fuente | Estado actual | Acción |
|---|---|---|---|
| **NIF y domicilio del prestador** | LSSI 10.1.a y 10.1.e | Producción muestra "Pendiente de publicación" | Definir `NEXT_PUBLIC_LEGAL_TAX_ID` y `NEXT_PUBLIC_LEGAL_ADDRESS` con datos reales y redeploy. **No se han inventado** |
| Registro de actividades de tratamiento | RGPD 30 | No está en el repositorio | Elaborarlo (titular) |
| Contratos de encargado de tratamiento (DPA) | RGPD 28 | No verificable: Stripe, Brevo, Vercel, Railway, proveedor S3, Google, Meta, proveedores de IA | Aceptar/archivar los DPA de cada proveedor |
| Transferencias internacionales | RGPD 44–49 | La política menciona garantías genéricas | Concretar por proveedor (p. ej. Marco de Privacidad de Datos UE-EE. UU. o cláusulas tipo) |
| Plazos de conservación concretos | RGPD 13.2.a | La política habla de "plazos legales" | Fijar plazos y activar `DATA_RETENTION_ENABLED` en coherencia |
| Facturación | Reglamento de facturación (RD 1619/2012) | Las suscripciones generan facturas en Stripe; los pagos únicos (cursos) solo recibo | Decidir si se emiten facturas (Stripe `invoice_creation` o herramienta externa) |
| Consentimiento en el registro: IP/agente de usuario | RGPD 7.1 (demostrar el consentimiento) | Se guarda fecha y versión, no IP ni agente | Valorar si la versión+fecha basta como prueba |

## 3. Requiere validación profesional

| Cuestión | Por qué |
|---|---|
| Redacción de aviso legal, privacidad, cookies y condiciones | Deben revisarse por un profesional; este análisis no valida textos legales |
| Botón de pago | TRLGDCU 98.2 exige "pedido con obligación de pago" o fórmula análoga no ambigua. El botón propio dice "Pagar X €…"; el de Stripe Checkout lo genera Stripe ("Pagar"/"Suscribirse") |
| Renuncia al desistimiento en PRO | El art. 103.m cubre contenido digital; PRO es en parte un **servicio** (alertas), al que aplica el 103.a. Validar el tratamiento del desistimiento en la suscripción y en el pack |
| Catalán | El art. 128-1.2 reconoce el derecho a recibir en catalán la documentación contractual y las condiciones generales, "sin perjuicio del respeto pleno al deber de disponibilidad lingüística" (STC 88/2017). La versión en catalán se retiró por decisión del titular; validar si "a petición" es suficiente para el modelo de negocio |
| Base jurídica del Meta Pixel / conversiones | Consentimiento obtenido por categoría; validar la información sobre corresponsabilidad con Meta |
| Comunicaciones comerciales | Hoy no hay envíos de marketing en el código (solo se registra el opt-in). Antes de enviarlos: dirección de baja en cada comunicación (LSSI 21.2 y 22.1) y cabecera `List-Unsubscribe` |
| Hojas de reclamación / resolución de litigios | El aviso legal remite a la Agència Catalana del Consum; validar obligaciones para un servicio solo online |
