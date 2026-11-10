# Radar VPO: documentación técnica y preparación para producción

Documento principal. Está pensado para que otro desarrollador pueda entender, operar y desplegar el sistema sin contexto previo.

## Mapa de la documentación

| Documento | Contenido |
|---|---|
| [architecture.md](./architecture.md) | Componentes, módulos, controles transversales, niveles de acceso |
| [flows.md](./flows.md) | Registro, verificación, sesión, compra, guía, suscripción, notificaciones, cancelación, baja, retención |
| [integrations.md](./integrations.md) | Stripe, Brevo (email/SMS), S3, WhatsApp, IA, analítica y publicidad |
| [operations.md](./operations.md) | Instalación, desarrollo, pruebas, despliegue, checklist de lanzamiento, rate limit, migraciones y rollback, copias y restauración, observabilidad, reembolsos, rotación de secretos |
| [security-audit.md](./security-audit.md) | Hallazgos por severidad (fichero, causa, riesgo, corrección), verificaciones y riesgos pendientes |
| [performance.md](./performance.md) | Mediciones antes/después y mejoras pendientes |
| [legal-privacy.md](./legal-privacy.md) | Requisitos de España y Cataluña: cumplimiento técnico, documentación pendiente, validación profesional |
| **Referencia generada** (`npm run docs:reference`) | |
| [reference/endpoints.md](./reference/endpoints.md) | 129 rutas del backend, 20 route handlers y 41 páginas, con autenticación y rate limit |
| [reference/data-dictionary.md](./reference/data-dictionary.md) | 42 modelos y 28 enums: campos, tipos, nulos, restricciones, índices, datos personales/secretos |
| [reference/erd.md](./reference/erd.md) | Diagramas entidad-relación Mermaid por módulo (validados con el parser de Mermaid) |
| [reference/env-vars.md](./reference/env-vars.md) | 86 variables de entorno (sin valores): dónde se usan, validación, documentación |
| [reference/file-inventory.md](./reference/file-inventory.md) | Los 510 ficheros versionados clasificados, con exclusiones explicadas |

Documentos anteriores que siguen siendo útiles como contexto: [auditoria-rv01-rv06-2026-10-29.md](./auditoria-rv01-rv06-2026-10-29.md), [checkout-thankyou-consent.md](./checkout-thankyou-consent.md), [adsense-getting-ready.md](./adsense-getting-ready.md), [ads-meta-diagnosis.md](./ads-meta-diagnosis.md), [ux-ui-audit.md](./ux-ui-audit.md), [estrategia-lanzamiento.md](./estrategia-lanzamiento.md).

## Resumen del sistema

Monorepo con **Next.js 16** (Vercel) y **NestJS 11 + Prisma 6 + PostgreSQL** (Railway). Stripe para pagos, Brevo para email y SMS, almacenamiento S3-compatible. Tres niveles de acceso: visitante, registrado verificado y PRO (verificado y con suscripción activa). Una cuenta sin verificar solo tiene permisos públicos; sus compras se registran pero no se activan hasta verificar el email.

## Cambios realizados en esta auditoría

| Commit | Cambio |
|---|---|
| 41ecbc6 | Rate limit por IP real del visitante (causa de los 429) |
| b9269ae | Baja/borrado admin: anonimización que conserva registros comerciales y limpia datos personales |
| a0a745f | Índices: deriva de esquema corregida y 21 índices nuevos (migración aditiva con rollback) |
| e6dc1f3 | Job de retención (desactivado por defecto) y comprobaciones de integridad de solo lectura |
| a0beb90 | Refresh tokens con SHA-256 + `jti` (la rotación no invalidaba tokens antiguos); login sin diferencia de tiempos |
| b78fa6c | Webhook Stripe: claims abandonados y estado de suscripción actual; ventanas de acceso |
| 079c5f5 | Ventana de visitantes no paginable; logs 5xx diagnosticables sin datos |
| bfb5645 | CI en verde (lint backend y frontend) |
| 764820e | Escape HTML de variables en emails; vista previa de plantillas aislada |
| 391a5c3 | Claves S3 no adivinables; token de jobs en tiempo constante |
| 543e5bd | AdSense tras consentimiento; SSR con cupo por usuario; editor TipTap diferido (637 → 152 KB) |
| 3c32442 | Documentación de referencia generada desde el código |
| 191d163 | `Cache-Control: private, no-store` en peticiones con credenciales |
| 3c200d2 | La baja no anonimiza si Stripe no puede cancelar una suscripción activa |
| 8f2688e | CI con PostgreSQL y migraciones desde cero |

Ningún cambio borra datos existentes ni modifica infraestructura de producción. La única migración nueva solo crea índices.

## Pruebas ejecutadas

| Comprobación | Resultado |
|---|---|
| Backend lint (ESLint + Prettier) | 0 errores |
| Backend `tsc --noEmit` | OK |
| Backend unitarias (Jest) | 23 suites, 101 tests OK |
| Backend integración contra PostgreSQL 16 (BD nueva con todas las migraciones) | 2 suites, 4 tests OK |
| Backend build | OK |
| Frontend lint | 0 errores (24 avisos preexistentes) |
| Frontend `tsc --noEmit` | OK |
| Frontend Vitest | 89 tests OK |
| Frontend `next build` | OK |
| Migración nueva: aplicar → revertir (`down.sql`) → reaplicar; `migrate diff` vacío | OK |
| Backend en modo producción (local): CSRF 403 desde otro origen, Swagger 404, errores sin detalles internos, campos extra rechazados, `Cache-Control` privado con credenciales | OK |
| Medición de 429 (local) | Antes 30/90 rechazadas; después 0/90; IP falsificada sin secreto no se salta el límite |
| Cabeceras de producción (`curl -I`) | CSP, HSTS, `X-Frame-Options: DENY` presentes |

No se ha probado contra producción ningún ataque, cobro ni envío real.

## Veredicto de lanzamiento

### **Preparado con condiciones**

Las correcciones de seguridad, datos y pagos están implementadas y verificadas con pruebas automáticas y locales. El lanzamiento depende de condiciones que **no se pueden resolver desde el código**:

**Bloqueantes (resolver antes de lanzar)**

1. Publicar **NIF y domicilio** del prestador (LSSI art. 10). Hoy figuran como "Pendiente de publicación".
2. Configurar **`BACKEND_PROXY_SECRET`** (el mismo valor en Vercel y Railway) y redesplegar. Sin él persisten los 429 compartidos.
3. **Revisión profesional** de los textos legales, del tratamiento del desistimiento en PRO y del botón de pago ([legal-privacy.md](./legal-privacy.md#3-requiere-validación-profesional)).

**Condiciones operativas (antes o justo después del lanzamiento)**

4. Confirmar copias automáticas de PostgreSQL y hacer una restauración de prueba ([operations.md](./operations.md#copias-de-seguridad-y-restauración)).
5. Ejecutar `backend/scripts/db-integrity-check.sql` (solo lectura) contra producción.
6. Comprobar que el bucket S3 no tiene lectura pública a nivel de bucket.
7. Archivar los DPA de proveedores y el registro de actividades de tratamiento.
8. Monitor externo de `/healthz` y alertas de webhooks en Stripe.
9. Mantener **una sola instancia** del backend hasta sustituir el bloqueo de jobs.

### Estado por categoría

| Categoría | Elementos |
|---|---|
| **Corregido** | S-01 … S-17, D-01, D-02, O-01 ([security-audit.md](./security-audit.md)); AdSense previo al consentimiento; rendimiento del editor; duplicado de peticiones |
| **Verificado** | Controles de acceso, CSRF, validación, cookies, webhook firmado, cabeceras de producción, ausencia de secretos en el repositorio, migraciones desde cero |
| **No verificable desde el repositorio** | Variables reales de Railway/Vercel, copias de seguridad, política del bucket, SPF/DKIM/DMARC en Brevo, eventos configurados en Stripe, datos de producción, contratos con proveedores |
| **Pendiente** | P-01 … P-10 ([security-audit.md](./security-audit.md#riesgos-pendientes-no-corregidos)), documentación legal ([legal-privacy.md](./legal-privacy.md#2-documentación-pendiente-bloquea-o-condiciona-el-lanzamiento)), mejoras de rendimiento ([performance.md](./performance.md#pendiente-no-implementado)) |

Este veredicto no significa que el sistema sea seguro al 100 % ni que cumpla íntegramente la normativa: refleja lo revisado y verificado en esta auditoría y sus limitaciones.
