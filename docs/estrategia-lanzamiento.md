# Estrategia de lanzamiento comercial — Radar VPO

- **Fecha:** 15 de octubre de 2026
- **Alcance:** cursos de pago único y suscripción PRO. El acompañamiento 1:1 queda retirado.
- **Convención:** *hecho* = visto en fuente o en el código; *anunciado* = lo declara el competidor, no se ha usado el producto; *no localizado* ≠ no existe; *hipótesis* = juicio comercial a validar.

Investigación de detalle: [01 · ObjectiuLlar y Registre](research/01-objectiullar-registre.md) · [02 · Oestum, elPagès, cursos](research/02-oestum-elpages-cursos.md).

---

## 1. Hechos del mercado (consulta 2026-10-15)

Las alternativas gratuitas ya cubren **detección + aviso + guía corta**. Cobrar por “enterarte de las convocatorias” compite contra gratis.

| Servicio | Precio visto | Gratis anunciado | De pago | Canales | Formación | Herramientas personales | Fuente |
|---|---|---|---|---|---|---|---|
| ObjectiuLlar | Gratis (AdSense) | Radar, fichas, alertas correo, guías, favoritos en el navegador | No localizado (`/preus` 404) | Correo (double opt-in) | 7 guías cortas | Favoritos y criterios **solo en el navegador** | [objectiullar.cat](https://www.objectiullar.cat/) · [/alertes](https://www.objectiullar.cat/alertes) · [/guies](https://www.objectiullar.cat/guies) · [/el-meu-radar](https://www.objectiullar.cat/el-meu-radar) |
| Oestum HPO | Gratis (“tal com és”) | Listado, fichas, avisos, 6 guías | No localizado (`/pricing` 404) | Correo y/o Telegram | 6 guías con capturas oficiales | Filtro por municipio al suscribirse. Panel de usuario: no localizado | [vpo.oestum.com](https://vpo.oestum.com/) · [/notifications](https://vpo.oestum.com/notifications) · [/terms](https://vpo.oestum.com/terms) |
| #elPagès (Android) | Gratis con AdMob | Listado, filtros, notificaciones locales | Compras in-app: no visibles en la ficha leída | Notificación local (sin servidor, según su política) | Enlaces a requisitos oficiales | Filtros en el dispositivo, sin cuenta | [Play](https://play.google.com/store/apps/details?id=com.elpages.alertas_vpo&hl=es) · “100+ descargas” |
| Piso Propio | Gratis | Alertas correo, guía, calculadoras | No localizado | Correo | Guía 5 pasos + glosario | Test de elegibilidad, aviso de renovación de inscripción | [pisopropio.es](https://pisopropio.es/) |
| Registre oficial | Servicio público | Inscripción, anuncios, procedimiento | Tasa: no localizada en las páginas leídas | Sede electrónica; “avís” a inscritos (canal no verificado) | FAQ e instrucción jurídica | Consulta de participación con idCAT (no probada) | [registresolicitants.cat](https://www.registresolicitants.cat/) |
| Cursos para particulares (VPO/HPO CAT) | — | Guías oficiales y de terceros | **Ningún curso de pago para particulares localizado** en Udemy, Hotmart, Gumroad, Teachable, Domestika, Amazon | — | Cursos hallados: ICAB, Diputació, EOCO019PO (profesionales) | — | Ver §4 de `02-oestum-elpages-cursos.md` |

**Prestaciones anunciadas, no comprobadas en uso:** latencia real de avisos, exhaustividad frente al Registre, bot de Telegram de Oestum, rating de la app, envío real de SMS de Radar VPO.

---

## 2. Qué puede justificar un pago (y qué no)

### No merece la pena cobrarlo como producto principal

- Consultar convocatorias y abrir el PDF oficial: ya es (y debe seguir siendo) **gratis**. ObjectiuLlar, Oestum y el Registre lo cubren.
- Alertas por **correo** con filtro municipal: ObjectiuLlar y Oestum las anuncian gratis. Piso Propio también.
- Guías cortas tipo checklist: las hay gratis, actualizadas en 2026.

### Sí puede justificar un pago — hipótesis, a validar con compras reales

1. **Curso estructurado para particulares** (hipótesis fuerte). No se localizó un competidor de pago en este hueco. Las guías gratis explican el mapa; no se vieron casos completos, ejercicios ni materiales descargables. Un curso con programa real, casos y pasos aplicables es el trabajo adicional más defendible.
2. **Organización con cuenta** (hipótesis media). ObjectiuLlar dice explícitamente que los favoritos se pierden al cambiar de dispositivo. Una cuenta con checklist y notas es un plus, no un motivo único de 9,99 €/mes.
3. **SMS** (hipótesis media). No se localizó SMS de un competidor catalán de HPO. Es el único canal de aviso de Radar VPO que no está regalado en el mercado. El email, solo, no diferencia.
4. **Renovación de PRO** (hipótesis débil hoy). La gente renovará si el aviso SMS llega a tiempo y el espacio personal se usa. Si PRO se vende como “alertas por email”, chocará con ObjectiuLlar/Oestum.

**PRO, tal como estaba planteado (“avisos por email y SMS + curso”), es débil frente a las alternativas gratuitas si el argumento es el email.** La alternativa viable dentro de las dos líneas autorizadas:

- **Venta principal = curso inicial (29 €, pago único).**
- **PRO = 9,99 €/mes por SMS + espacio sin límite + curso inicial mientras esté activa**, con límites dichos en la web (sin filtro municipal, fechas estimadas identificadas como tales).

No se ofrece correo gratuito de alertas: duplicaría ObjectiuLlar y canibalizaría PRO sin evidencia de que eso convierta a curso.

---

## 3. Posicionamiento y oferta recomendados

**Posicionamiento (adoptado en la web):**  
“Aprende a preparar tus solicitudes de vivienda protegida y organiza tus oportunidades en un solo lugar.”

Sirve. El problema no es “no hay listados”; es “no sé preparar la solicitud ni seguir varias convocatorias”. Las guías gratis orientan; el curso debe **hacer practicar**.

| Capa | Precio | Acceso | Qué incluye hoy (implementado) | Qué no incluye |
|---|---|---|---|---|
| Gratis | 0 € | Sin cuenta para consultar; cuenta para guardar | Promociones + PDF oficial, 3 promociones en Mi espacio, lección de muestra si el curso la tiene | Avisos, curso completo, espacio ilimitado |
| Curso inicial | 29 € pago único (precio del curso en CMS/Stripe) | Compra | Acceso mientras el curso siga publicado | Asesoría 1:1 |
| Curso avanzado | 89 € previsto | Solo si hay ≥ 3 lecciones publicadas | Si está incompleto se muestra “en preparación” y **no se vende** | No se anuncia como curso terminado |
| PRO | 9,99 €/mes | Suscripción Stripe | Email + SMS, Mi espacio sin límite, curso inicial **mientras la suscripción esté activa** | Filtro municipal, exhaustividad, adjudicación, 1:1 |

**Confusión 29 € vs PRO:**  
- Comprar el curso = pago único, se conserva si cancelas PRO.  
- PRO incluye el inicial solo mientras está activa.  
Esto está escrito en la ficha del curso y en `/pro`. Quien ya compró conserva el acceso por `user_course_access` / purchase.

**Público objetivo:** particulares en Cataluña que van a solicitar HPO/VPO (primera vez o con una convocatoria encima), no profesionales.

**Limitaciones de la oferta:** cobertura la de las fuentes que el scraper monitoriza; SMS requiere móvil; no hay filtro por municipio; el avanzado puede no estar vendible.

**Cómo validar disposición a pagar:** ventas reales del curso (evento `checkout_started` / webhook pagado), altas PRO, lección de muestra vista, PDF abierto, renovación a día 32 y 62. No usar tasas genéricas de ecommerce como previsión.

---

## 4. Recorridos de validación

### Persona que empieza
Recurso gratuito (promociones + PDF o lección de muestra) → ficha del curso con programa real → registro conservando `?next=/checkout?product=course&course=…` → pago único → acceso inmediato.

### Persona que ya busca convocatorias
Consulta gratis del PDF → demostración de aviso en `/pro` → checkout de suscripción con precio y cadencia visibles → activación por webhook → gestión/cancelación en Mi cuenta.

---

## 5. Plan 30 / 60 / 90 días

| Plazo | Qué hacer | Qué medir | Criterio de seguir |
|---|---|---|---|
| 0–30 | Publicar el curso inicial con programa honesto; 4–6 piezas locales (municipio + “cómo leer este PDF”); captación por correo propio y 1–2 colaboraciones (oficina de vivienda, asociación) | Compra de curso, muestra vista, PDF abierto | ≥ 1 venta de curso o señal clara de que el programa no convence (entonces reescribir contenido, no el precio) |
| 31–60 | PRO a quien ya guarda promociones; prueba pequeña de anuncios (búsqueda “HPO [municipio]”, presupuesto cerrado) | Altas PRO, activación, cancelación < 14 días, coste por alta | Si el CPA de PRO > margen de 2 meses, PRO se deja de anunciar en ads y se vende solo como upsell del curso |
| 61–90 | Contenido del avanzado o archivarlo; renovaciones PRO; SMS: tasa de entrega | Renovación mes 2, uso de Mi espacio, quejas de avisos | Renovación PRO < 40 % a mes 2 → bajar el argumento de PRO a SMS+espacio, no a “el radar” |

Canal prioritario: contenido local y correo. Publicidad solo como prueba pequeña.

---

## 6. Escenarios económicos (supuestos explícitos, no previsiones)

**No son tasas de conversión de ecommerce aplicadas a Radar VPO.** Son aritméticas con supuestos.

Fuentes de coste verificadas:

- Stripe España, tarjetas estándar EEE: **1,5 % + 0,25 €** por cobro. [stripe.com/en-es/pricing](https://stripe.com/en-es/pricing), consulta 2026-10-15.
- IVA: si el titular debe repercutir 21 % y el precio público lo incluye, la base = precio / 1,21. **Pendiente de la situación fiscal real del titular.**
- SMS: tarifa Brevo **no fijada aquí**; escenario con supuesto 0,07 €/SMS (hipótesis de trabajo; sustituir por la tarifa contratada).
- Devoluciones: el checkout pide consentimiento de acceso inmediato (contenido digital / servicio). Aun así, escenario 5 % de cursos devueltos.
- Captación y soporte: 0 € en el escenario “orgánico”; o 15 € CPA y 8 € de soporte por cliente/mes en el escenario “con ads”.

Comisión Stripe aproximada (EEE estándar, sin IVA):

| Producto | Precio | Comisión Stripe | Neto cobro |
|---|---|---|---|
| Curso inicial | 29,00 € | 0,69 € | 28,31 € |
| Curso avanzado | 89,00 € | 1,59 € | 87,41 € |
| PRO 1 mes | 9,99 € | 0,40 € | 9,59 € |

Escenario **90 días, orgánico, 21 % IVA incluido, 2 SMS/mes por PRO, 0 € ads, 5 % devolución de cursos, 0 % impago PRO:**

| Hipótesis de volumen | Cursos 29 € | PRO-mes cobrados | Ingresos | Stripe | SMS (supuesto) | Devoluciones | Margen contribución |
|---|---|---|---|---|---|---|---|
| Conservador | 3 | 6 | 146,94 € | ~5,5 € | 0,84 € | 1,45 € | ~139 € |
| Base | 10 | 24 | 529,76 € | ~18,5 € | 3,36 € | 4,35 € | ~504 € |
| Optimista | 25 | 60 | 1.324,40 € | ~45 € | 8,40 € | 10,88 € | ~1.260 € |

Si hay ads a 15 € CPA y 8 altas PRO + 8 cursos, el coste de captación (240 €) se come el margen del escenario conservador. Por eso la publicidad es prueba pequeña, no plan de escala.

Métricas a llevar **por separado:** ventas de cursos, altas PRO, activación (webhook), renovaciones, cancelaciones, CPA, margen de contribución, eventos del visor PDF (`pdf_viewer_opened/loaded/error`, `pdf_download_clicked`).

---

## 7. Implementado vs propuesto

### Implementado en esta entrega (la web solo anuncia esto)

- Acompañamiento 1:1 retirado del menú, inicio, footer, cursos, FAQ, condiciones, sitemap; `/acompanamiento` y `/services` redirigen a `/cursos`; backoffice de servicios redirige a accesos históricos.
- Vista de promoción publicada = visor del PDF oficial + cabecera mínima. Botón “Ver PDF de la promoción”.
- Editor admin de promoción: metadatos + PDF; no se rellena ficha estructurada; no se borran JSON históricos.
- Oferta: gratis / curso pago único / PRO 9,99 €/mes, con límites y cancelación dichos.
- Cursos: programa, estado real, precio final, muestra, duración del acceso. Menos de 3 lecciones = no se vende.
- Checkout: precio y cadencia antes de pagar; `next` conserva el producto en el registro; pago único vs suscripción; sin urgencia ficticia.
- Mi espacio: guardar, etapas, checklist propia, límite 3 en gratis.
- Fechas de lanzamiento: estimación, sin cuenta atrás negativa.
- Eventos de analítica del visor y del checkout.

### Iteración de conversión (2026-10-15, segunda pasada)

- Inicio muestra el producto: visor de ejemplo, 3 promociones reales, oferta en tres capas con un CTA cada una, y maqueta de Mi espacio.
- Publicadas: municipio visible, filtro por municipio, hasta 24 resultados; el CTA principal ya no envía a lanzamientos.
- PRO explica por qué pagar frente a avisos de correo gratis, para quién es y para quién no, con ejemplo de SMS/email y demostración de Mi espacio.
- Cursos distinguen compra única, inclusión en PRO y estado “en preparación”.
- Tras el PDF, un siguiente paso hacia el curso. En sesión, “Mi espacio” está en la barra.
- Eventos nuevos: `promotion_list_cta_clicked`, `pro_page_viewed`, `course_page_viewed`.

### Propuesto (no está en la web)

- Filtro municipal de avisos, Telegram, WhatsApp, push.
- Plantillas descargables y casos grabados (contenido del titular).
- Recurso PDF lead-magnet distinto de la lección de muestra.
- Simulador IRSC / elegibilidad.
- Recordatorio de renovación del Registre a 90 días.
- Curso avanzado como producto vendible (cuando tenga programa completo).
- Autoría, NIF, domicilio y correo de soporte (variables de entorno).

---

## 8. Configuración que requiere datos reales del titular

En Vercel / `.env` del frontend:

- `NEXT_PUBLIC_LEGAL_NAME`, `NEXT_PUBLIC_LEGAL_TAX_ID`, `NEXT_PUBLIC_LEGAL_ADDRESS`, `NEXT_PUBLIC_SUPPORT_EMAIL`
- `NEXT_PUBLIC_COURSE_AUTHOR_NAME`, `NEXT_PUBLIC_COURSE_AUTHOR_BIO`

En Stripe / backend: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRO_PRICE_CENTS=999`, productos/precios de cursos alineados con el CMS. En Brevo: remitente verificado y SMS transaccional. Sin webhook de Stripe la web **no** ofrece pago (el backend lo exige para poder activar el acceso).

Comprobado el 15/10/2026 contra el CMS que sirve la web local: el curso inicial tiene 2 lecciones publicadas (no se vende hasta 3) y el avanzado 1 lección, con precio **149 €** todavía en base de datos. La migración `20261015120000_commercial_launch` deja el avanzado en 89 € sin precio tachado: hay que aplicarla en el entorno real. Completar el programa del inicial es el bloqueo comercial nº 1.

---

## 9. Mejoras posteriores (impacto / esfuerzo)

| Prioridad | Mejora | Impacto | Esfuerzo |
|---|---|---|---|
| 1 | Completar el curso inicial (casos, ejercicios, materiales) | Alto: es el producto que justifica el pago | Alto (contenido) |
| 2 | Filtro municipal en avisos PRO | Alto vs ObjectiuLlar/Oestum | Medio |
| 3 | Medir renovación y CPA reales 90 días | Alto para decidir si PRO se escala | Bajo |
| 4 | Autoría y datos legales visibles | Alto (confianza / LSSI) | Bajo (datos del titular) |
| 5 | Plantilla de documentación descargable en el curso | Medio | Medio |
| 6 | Recordatorio de caducidad del Registre (2 años / 90 días) | Medio | Medio |
| 7 | Telegram (el mercado ya lo tiene gratis) | Bajo para cobrar; útil como canal gratis de captación | Medio |
| 8 | Curso avanzado | Solo si el inicial vende | Alto |
| 9 | Simulador de ingresos | Medio, Piso Propio ya lo da gratis a nivel estatal | Alto |

Baymard ([reduce cart abandonment](https://baymard.com/blog/reduce-cart-abandonment), 19 may 2026): el 19 % abandona si se fuerza cuenta; el 39 % si aparecen costes tarde. En Radar VPO la cuenta es necesaria para activar el acceso digital; se mitiga conservando el producto en `next` y mostrando precio total y cadencia antes de Stripe. No hay guest checkout: limitación consciente (el producto es cuenta + acceso), no un olvido.
