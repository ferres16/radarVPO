# 02 · Competencia: Oestum HPO, #elPagès, alternativas, cursos y guías oficiales

- **Fecha de consulta:** 2026-10-15 (todas las URLs de este documento se consultaron ese día salvo que se indique lo contrario).
- **Herramientas:** WebFetch y WebSearch. No se ha editado código del repositorio.
- **Convenciones:** "No localizado en la consulta" significa que no apareció en las páginas leídas; **no** afirma que no exista.
- **Cita textual:** entre comillas, idioma original de la página (catalán o castellano).
- **Aviso de método:** WebFetch devuelve texto renderizado y a veces resumido. Los menús, precios dinámicos o contenido detrás de formularios pueden no verse. Por eso se separa lo visto de lo anunciado y de lo no comprobado.

---

## 0. Resumen ejecutivo (para decidir)

| Tema | Hallazgo clave |
|---|---|
| Oestum HPO | Proyecto personal, **100 % gratuito según sus Términos**, avisos por **Telegram y/o correo**, filtro por **municipios**, guías gratuitas (6). Sin planes de pago localizados. |
| #elPagès (app Android) | App gratuita con **anuncios (AdMob)**, **100+ descargas** en Google Play, **sin valoraciones visibles** en la ficha, filtros por municipio/palabras clave/alquiler-venta, **notificaciones locales** (sin servidor), sin cuenta. |
| Otros avisos gratuitos | **ObjectiuLlar** (avisos por correo, gratis, financiado con AdSense), **Piso Propio** (toda España, alertas por correo gratis). |
| Avisos de pago | Ningún otro servicio de pago específico VPO/HPO Cataluña localizado en la consulta, aparte de la propia Radar VPO PRO (ver nota §3.6). |
| Cursos para particulares | **Ningún curso/ebook de pago específico para particulares sobre cómo solicitar VPO/HPO localizado en la consulta** (Udemy, Hotmart, Gumroad, Teachable, Domestika, Amazon). Los cursos localizados son profesionales/administrativos. |
| Base gratuita de formación | Guías oficiales gratuitas (Generalitat, Registre, Consorci Barcelona), sesiones informativas gratuitas del Consorci y guías divulgativas gratuitas de terceros (Oestum, Piso Propio). |

---

## 1. Oestum HPO — "Anuncis HPO Catalunya" (vpo.oestum.com)

### 1.1 Hechos verificados (visto en las páginas)

| Dato | Evidencia (URL · frase) |
|---|---|
| Titular y naturaleza | https://vpo.oestum.com/legal · Titular: "Oscar Estudillo"; "Anuncis HPO Catalunya és un projecte personal i gratuït. No és un servei oficial de la Generalitat". |
| Gratuidad | https://vpo.oestum.com/terms · "El servei s'ofereix de manera gratuïta i «tal com és» (as is), sense garanties de disponibilitat, exactitud o continuïtat". También https://vpo.oestum.com/privacy · "És un projecte personal i no comercial." |
| Qué hace | https://vpo.oestum.com/ · "Llegim cada dia el Registre de Sol·licitants i mostrem les convocatòries d'HPO en venda i lloguer en un sol lloc, fàcils de llegir i filtrar." |
| Fuente de datos | https://vpo.oestum.com/about · datos de registresolicitants.cat; "Un robot fa una còpia automàtica dels anuncis públics de HPO i els processa amb intel·ligència artificial". Aviso: "Això pot comportar errors o imprecisions." |
| Canales de aviso | https://vpo.oestum.com/notifications · "T'avisem al moment quan surt una convocatòria d'habitatge de protecció oficial a Catalunya. Telegram, correu, o tots dos." Flujo de 3 pasos: "1 Canals · 2 Dades · 3 Activar". |
| Baja | https://vpo.oestum.com/notifications · email: "enllaç de baixa amb un sol clic"; Telegram: "escriu `/stop` al bot o bloqueja'l"; "Cada canal es gestiona per separat." |
| Datos que guarda | https://vpo.oestum.com/privacy · correo (obligatorio), nombre (opcional), municipios de interés (opcional), IP/idioma/marca temporal del consentimiento; si Telegram, solo `chat_id`. |
| Filtro por municipio | https://vpo.oestum.com/privacy · "Municipis d'interès (opcional) per filtrar els avisos"; apartado 9: "La selecció de quins anuncis t'arriben es basa només en els municipis que has triat." |
| Proveedores (RGPD) | https://vpo.oestum.com/privacy · Vercel, Supabase, Resend, Telegram, Cloudflare Turnstile y **OpenAI** ("Estructuració amb IA del text dels anuncis públics... No rep dades teves com a subscriptor"). Política versión `2026-04-29`. |
| Anti-scraping | https://vpo.oestum.com/terms · "Queda prohibida l'extracció massiva de dades (scraping automatitzat) del nostre lloc". Uso "personal i no comercial". |
| robots.txt | https://vpo.oestum.com/robots.txt · `Content-Signal: search=yes, ai-input=yes, ai-train=no`. |
| Ficha de convocatoria | https://vpo.oestum.com/announcement/52-habitatges-hpo-de-lloguer-a-montgat-10785 · campos: Tipus, Ubicació, Promotor, Habitatges, Garatge, Traster, Estat inscripció, Data publicació (02/10/2026), Ingressos màx., Altres requisits, Durada del contracte, Actualització de la renda, Resum. Incluye un aviso donde falta el anexo de precios ("aquest quadre no figura al text proporcionat"). |
| Listado | https://vpo.oestum.com/ · tarjetas con tipo (Venda/Lloguer), estado (Obert/Tancat), fecha, nº viviendas, m² y precio cuando constan (p. ej. "25 habitatges 57,73-89,28 m² 215.718€ – 298.607€"). La captura leída mostraba entradas hasta 01/09/2026; no se comprobó si hay más recientes tras la caché. |
| Guías | https://vpo.oestum.com/guides · "Sis guies curtes": Què és l'HPO (2 min); Tipus d'habitatge protegit (3); Requisits per accedir-hi (4); Com inscriure't al Registre i a una convocatòria (4); Baremació i sorteig (4); Preguntes freqüents (3). |
| Guía "cómo inscribirse" | https://vpo.oestum.com/guides/com-inscriures · "Contingut revisat el 5 d'agost de 2026"; pasos, documentación, renovación ("finestra de renovació són els 90 dies anteriors a la caducitat"), enlaces a fuentes oficiales. Usa capturas de la web oficial. |
| Guía "baremación y sorteo" | https://vpo.oestum.com/guides/baremacio-i-sorteig · calendario de 10 pasos, contingentes, sorteo ante notario, consecuencias de renunciar. Revisada 5-ago-2026. |
| Páginas no localizadas | https://vpo.oestum.com/pricing → 404; https://vpo.oestum.com/faq → 404; https://vpo.oestum.com/privacitat → 404; https://vpo.oestum.com/sitemap.xml → 500 Internal Server Error. (La ruta correcta de privacidad es `/privacy`.) |

### 1.2 Prestaciones anunciadas (declaradas por el sitio, sin poder verificar cómo funcionan)

- Avisos "al moment" por Telegram y/o correo ("T'avisem al moment...").
- Ejemplo de mensaje de aviso (ilustrativo en la página): "Nou avís: 38 vivendes a Sabadell · Règim: Lloguer · Preu: Des de 425€ · Termini: 14 dies".
- Cobertura: "convocatòries d'habitatge de protecció oficial a Catalunya" (venta y alquiler).
- Lectura diaria: "Llegim cada dia el Registre de Sol·licitants".
- Resumen IA por convocatoria (requisitos, ingresos, duración contrato, etc.) y guías educativas gratuitas.

### 1.3 Gratis vs de pago

- **Gratis (según Términos y Aviso legal):** todo lo visto — listado, fichas, guías, avisos email/Telegram.
- **De pago:** no localizado en la consulta (no hay página de precios; `/pricing` devuelve 404).
- **Herramientas personales:** solo filtro por municipios al suscribirse. No se localizaron: checklist de documentación, calendario personal, recordatorio de renovación de inscripción, simulador de elegibilidad, panel de usuario.

### 1.4 No comprobado

- Latencia real de los avisos (no se probó la suscripción para no crear datos reales).
- Nombre/enlace del bot de Telegram (no aparece en el texto leído; probablemente se muestra tras interacción).
- Filtros del listado principal (la home dice "fàcils de llegir i filtrar", pero los controles no se ven en el texto).
- Si los avisos filtran por régimen (venta/alquiler) o solo por municipio.
- Frecuencia de actualización real frente a registresolicitants.cat.
- Número de suscriptores o usuarios.

---

## 2. App Google Play "Alertas de Pisos VPO y HPO" (#elPagès)

- **URL Play (consultada):** https://play.google.com/store/apps/details?id=com.elpages.alertas_vpo&hl=es
- **Web del desarrollador:** https://alertas-vpo-elpages.web.app y https://alertas-vpo-elpages.web.app/privacy

### 2.1 Hechos verificados

| Dato | Evidencia |
|---|---|
| Package ID | `com.elpages.alertas_vpo` (en la URL de Play y en chrome-stats/apkpure). |
| Descargas (Play) | "100+ Descargas". |
| Descargas (tercero) | chrome-stats.com muestra "Downloads 182 Data as of 2026-10-14" (estimación de terceros, no de Google). https://chrome-stats.com/d/com.elpages.alertas_vpo |
| Última actualización | "Última actualización 9 oct 2026" (Play). Coincide con chrome-stats ("Last updated: 2026-10-09"). |
| Versión | 1.0.11 · Android 7.0+ · 23 MB (apkpure.net y appstorespy.com, terceros; no mostrado en el texto de Play que leímos). |
| Fecha de publicación | chrome-stats: 2026-01-10; appstorespy: "2025-12-29" (**discrepancia entre terceros**). |
| Desarrollador | Play: "VICTOR ASENJO CARVAJAL · appsdelpages@gmail.com · Spain". La política de privacidad nombra como responsable a "Victor Asenjo Carvajal". Marca de desarrollador: "#elPagès". |
| Seguridad de datos (Play) | "No se comparten datos con terceros" y "No se recogen datos" (declarado por el desarrollador). |
| Precio / compras en la app | El texto de Play leído **no muestra precio ni "compras en la aplicación"**. La política de privacidad dice: "Para mantener la aplicación gratuita mostramos anuncios mediante Google AdMob". |
| Valoraciones | La ficha leída **no muestra puntuación ni nº de reseñas**. chrome-stats no muestra rating para esta app. |
| Idiomas | Web: "La app está disponible en catalán y en castellano." |
| Sin cuenta | Web: "Sin cuenta ni registro. Tus filtros nunca salen del dispositivo." Política: "Sin registro. No pedimos nombre, correo electrónico, teléfono..." |
| Frecuencia | Web: "Consulta el registro en segundo plano cada hora aproximadamente". |
| Notificaciones | Política §5: "notificaciones locales del sistema operativo... no usamos servidores de notificaciones push". |
| Permisos declarados | Internet/red, notificaciones, inicio automático tras reinicio, AD_ID (identificador de publicidad). |
| Historial | Política §7: "El historial de convocatorias se limita a las 200 más recientes." |
| Aviso legal | Play: "Esta aplicación NO representa a ninguna entidad gubernamental"; fuente principal Agència de l'Habitatge de Catalunya y registresolicitants.cat. |
| Consentimiento ads | Política §3: UMP de Google en EEE/UK/Suiza; anuncios personalizados solo con consentimiento. |

### 2.2 Prestaciones anunciadas (Play)

- "Promociones al día: Accede a un listado de las nuevas promociones de vivienda protegida en toda Cataluña (Barcelona, Tarragona, Lleida y Girona)."
- "Alertas Personalizadas: Configura tus filtros según tus necesidades (zona geográfica, palabras clave)".
- "Notificaciones Instantáneas: Recibe un aviso en tu móvil cuando se detecte una nueva publicación que coincida con tu perfil."
- "Acceso Rápido: ... consultes detalles y requisitos en pocos segundos."
- Web: filtros "municipios, palabras clave y alquiler o venta".
- Novedades: "Acceso a requisitos y enlaces oficiales".

### 2.3 Gratis vs de pago

- App **gratuita con publicidad** (AdMob). Sin plan de pago ni "quitar anuncios" localizado en la consulta.

### 2.4 No comprobado / observaciones

- Rating, número de reseñas, "compras en la aplicación": no visibles en la ficha leída; no se descartan datos que Play muestre solo en el cliente móvil.
- **Posible incoherencia a revisar (no concluyente):** Play declara "No se recogen datos" mientras la política indica uso de AdMob con identificador de publicidad e IP tratados por Google. Puede ser una forma de declarar ("recogidos por el SDK de terceros"), pero **no se ha verificado** el formulario de Data Safety completo.
- Fiabilidad de la comprobación horaria en segundo plano (depende de las restricciones de batería de Android; no probado).
- No existe versión iOS localizada en la consulta.

---

## 3. Otras alternativas de avisos / información (Cataluña y España)

### 3.1 ObjectiuLlar (Cataluña) — https://www.objectiullar.cat/

**Hechos verificados**
- Alertas: https://www.objectiullar.cat/alertes · "Gratuït i sense targeta · Gratis · sense targeta de crèdit. Baixa quan vulguis." Canal: **correo** ("T'enviarem un correu només quan hi hagi una novetat rellevant").
- Filtros: municipios (añadir uno o más; "Sense municipi, seguiràs les novetats de tot Catalunya"), temas: "Habitatge protegit (HPO) · Subhastes públiques · Sòl i urbanisme · Obra nova"; nivel de aviso: "Només quan em pugui inscriure / Tot el procés / Personalitzat" y categorías: "noves promocions, obertures, canvis importants, recordatoris, sorteigs i resultats".
- Cobertura: "Fonts oficials de tota Catalunya: Registre HPO, CIDO i els butlletins oficials de Barcelona, Girona, Tarragona i Lleida." La home mostraba "46 fonts"; https://www.objectiullar.cat/convocatories mostraba contadores ("Totes 384 · Obertes ara 5 · Properes 73 · En curs 25 · Sorteig programat 1 · Llistes/resultats 119 · Tancades/històriques 162").
- Actualización: "Actualització diària automàtica".
- Modelo de negocio declarado: publicidad Google AdSense (https://www.objectiullar.cat/privacitat y /cookies); "L'accés al radar i les alertes per correu són gratuïts" (https://www.objectiullar.cat/qui-som). Titular: Marc Duran Garcia (Esplugues de Llobregat). Proyecto "impulsat de manera independent per una sola persona".
- "ObjectiuLlar no tramita sol·licituds."
- **Telegram/SMS/WhatsApp:** no localizados en la consulta.
- **Formación/cursos/herramientas personales (checklist, calculadora):** no localizados en la consulta (hay la sección "Què pots fer?" no leída por completo).
- Mapa/lista y botón "Desar" (guardar) en fichas visibles en la home.
- **Prestaciones anunciadas sin verificar:** "Mai mostrem una oportunitat com a oberta sense data", "Resums en llenguatge clar".

### 3.2 Piso Propio (España, incluye Cataluña) — https://pisopropio.es/

**Hechos verificados**
- Alertas por correo: "Déjanos tu correo y te avisamos de las convocatorias de tu zona, de los plazos que se acaban y de cuando toque renovar tu inscripción. Sin contraseña y te puedes dar de baja en un clic."
- Cobertura: "10 plazos abiertos, 198 ofertas sin plazo y 3 aperturas anunciadas, de 140 fuentes oficiales en 17 territorios" (home). Un post del autor (https://fcarril.com/posts/how-i-built-piso-propio) habla de cifras menores en otro momento (13 regiones, 22 fuentes, 228 ofertas): las cifras varían con el tiempo.
- Gratuito: https://pisopropio.es/sobre · "herramienta independiente y gratuita"; "no cobramos comisión"; lo hace "Fernando Carril, ingeniero de software". Política de privacidad: "No vendemos ni cedemos tus datos a terceros, ni los usamos para publicidad."
- Herramientas personales: comprobador de elegibilidad ("test de elegibilidad"), calculadoras de ingresos máximos (tablas con IRSC 2026 de 801,85 €/mes), guía en 5 pasos, glosario, lista de documentos para inscribirse y solicitar, aviso de renovación de inscripción. Guía: https://pisopropio.es/guia ("Normas comprobadas frente a las fuentes oficiales el 22 de septiembre de 2026").
- Guía incluye listado de documentos y errores habituales, pero es texto de lectura (**no se vieron plantillas descargables ni ejercicios**).
- Dataset abierto para prensa (CC BY 4.0): https://pisopropio.es/prensa.
- **No localizado en la consulta:** Telegram/SMS/WhatsApp, planes de pago.

### 3.3 Registre de Sol·licitants d'HPO (oficial) — https://www.registresolicitants.cat/registre/

- Hechos: página "Notificacions i anuncis" con ALERTAs y anuncios de inicio (p. ej. 08/10/2026 "ALERTA: Propera adjudicació d'habitatge d'HPO de venda promoguts per PROMIMAT 2020 S.L a Mataró. En el termini de 60 dies es publicarà l'anunci...").
- Suscripción oficial a avisos (email/RSS/Telegram) del Registre: **no localizada en la consulta** (la búsqueda sobre Agència de l'Habitatge no halló opción de suscripción; ver §3.7).
- Es la **fuente primaria** de la que beben Oestum, #elPagès y ObjectiuLlar (según sus propias páginas) y Radar VPO.

### 3.4 Casa 47 (Ministerio de Vivienda) — https://portal.casa47.es/

- Portal público de **alquiler asequible** (no es una alerta VPO/HPO catalana). Fuente: https://www.mivau.gob.es/vivienda/el-portal-de-casa-47: "buscador de viviendas con simulador previo", adjudicaciones "mediante sorteo ante notario"; "Cada tres meses lanzaremos convocatorias públicas" (https://www.casa47.es/convocatoria-alquiler-vivienda-asequible).
- Prensa (Expansión, 2026-09-07): siete convocatorias abiertas, incluida Cataluña (93 viviendas); "no incluye... ninguna vivienda... en... Madrid ni de Barcelona". No se verificó con documento oficial el lote catalán exacto; es dato de prensa.
- Relevancia para Radar VPO: alternativa/complemento institucional (no cubre HPO del Registre).

### 3.5 Otros servicios localizados (menor relevancia directa)

| Servicio | URL | Hecho verificado | Relevancia |
|---|---|---|---|
| RadarVivienda (Madrid/España) | https://www.radarvivienda.es/ | "Proyecto ciudadano e independiente"; alertas **por email** gratis ("Sin publicidad") sobre datos y "Promesómetro". | Baja (Madrid, observatorio de datos). |
| FuncioHouse Radar | https://funciohouse.com/radar-vivienda/ | Alertas VPP Madrid para funcionarios; "El acceso es gratuito". | Baja (Madrid, nicho). |
| Piso:Alerta | https://pisoalerta.com/ | "4,99€/mes" y "9,99€/mes", 7 días gratis; avisos por Telegram y email; **vigila Idealista y Fotocasa, no VPO/HPO**. | Referencia de **precios de mercado de alertas de pisos libres**, no competidor directo. |
| Ibercaja blog | https://www.ibercaja.es/particulares/blog/vivienda/guia-para-comprar-una-vivienda-de-proteccion-oficial-vpo-en-espana/ | Guía divulgativa gratuita (25-sep-2025) de un banco (marketing de hipotecas). | Guía gratuita de terceros. |
| Casacochecurro | https://www.casacochecurro.com/como-solicitar-una-vivienda-de-proteccion-oficial-en-cataluna.html | Artículo y vídeo explicativo sobre inscribirse en el Registre. | Contenido gratuito/SEO. |
| YouTube (vídeo corto) | https://www.youtube.com/watch?v=OLeLD2HzOKQ | "6 requisitos para obtener una vivienda de protección oficial en España" (genérico, no Cataluña). | Contenido gratuito; no se localizó un canal catalán especializado en la consulta. |

### 3.6 Nota sobre radarvpo.com

- https://www.radarvpo.com/ (y `/alerts`, `/promotions`, `/cursos`) aparece indexado en las búsquedas con el nombre "Radar VPO" y ofrece Free vs VPO PRO (avisos email/SMS + "Curso Guía VPO"), "Curso avanzado de vivienda publica 89 €", "Curso VPO Inicial · VPO Para Principiantes" (precio no visible), y la leyenda "Valoración y alumnos: datos orientativos de lanzamiento".
- **Se asume que es el producto propio** (mismo nombre que el workspace) y por eso no se analiza como competidor. Si no lo fuera, habría que tratarlo como competidor directo. Es dato a confirmar por el equipo.
- Observación útil: la propia web muestra "4,8 valoración · +120 alumnos · 89 €" con la nota de "datos orientativos de lanzamiento" y testimonios con nombre y ciudad. Conviene que cualquier métrica o testimonio publicado sea verificable (riesgo de reputación/consumo si no lo son). Esta observación es sobre lo visto en la página, no una valoración legal.

### 3.7 Canales Telegram / WhatsApp / newsletters

- **Telegram:** el único servicio de avisos por Telegram para HPO Cataluña localizado en la consulta es **Oestum** (bot con `/stop`).
- **WhatsApp:** no localizado en la consulta ningún canal específico de VPO/HPO en Cataluña (solo canales institucionales generales, p. ej. Generalitat: "El Govern ... ha activat ... un nou canal oficial de difusió d'informació a través de WhatsApp", metadata.cat 14-sep-2023; sin sección de HPO verificada).
- **Newsletters específicas HPO Cataluña:** no localizadas más allá de ObjectiuLlar (email de alertas; "novetats" opcionales y separadas).
- **Agència de l'Habitatge / habitatge.gencat.cat:** "Vull saber quines són les ofertes actuals d'habitatges amb Protecció Oficial" en https://agenciahabitatge.gencat.cat/ca/ (cercador de promociones). Suscripción oficial a avisos: no localizada en la consulta.
- **Incasòl, APROP, Housfy-like, "Tu VPO":** búsquedas realizadas sin resultados relevantes para avisos HPO en las consultas hechas; **no localizado en la consulta** (no se afirma que no existan).

---

## 4. Cursos, ebooks y formación para particulares

### 4.1 Hechos verificados — oferta de pago

| Item | Vendedor | URL | Precio | Formato | ¿Para particulares? | Notas |
|---|---|---|---|---|---|---|
| Curso de viviendas de protección oficial en Cataluña: cuestiones clave para el ejercicio profesional | ICAB (Il·lustre Col·legi de l'Advocacia de Barcelona) | https://www.icab.es/es/formacion/cursos/Curso-de-viviendas-de-proteccion-oficial-en-Cataluna-cuestiones-clave-para-el-ejercicio-profesional/ | "De pago" (importe no visible en el extracto leído) | 28/09/2026–13/10/2026, lunes y miércoles 18–20 h, presencial y online, "20 presencial y 20 online" plazas | **No**: profesionales (abogacía) | Incluye "Taller práctico" con casos de perfiles familiares; fechas ya pasadas el 2026-10-15. |
| EOCO019PO Normativa de Vivienda Protegida | Varios centros (p. ej. ARE FP, formacioncontinuaonline.com) | https://arefp.es/acciones-formativas/normativa-de-vivienda-protegida/ | Bonificada para trabajadores (según web) | Online/teleformación, 30 h | No (normativa/ayudas Plan Estatal) | Temario: plan estatal y financiación. |
| Curso en viviendas de protección oficial (VPO). Gestión y rentabilidad | Grupo A4 Formación | https://www.aprendemas.com/es/curso/curso-en-viviendas-de-proteccion-oficial-vpo-gestion-y-rentabilidad-404455/ | No visible | A distancia, 80 h | Mixto/profesional (promoción, viabilidad, sorteo organizado) | Temario con 11 temas; incluye "Desarrollo práctico y organización del sorteo". |
| Experto en gestión de viviendas de protección oficial | geYdes | https://formacioncontinuabonificada.geydes.es/experto-gestion-viviendas-proteccion-oficial | No visible | Formación bonificada | Profesional | Mismo temario aparente que el anterior. |
| Curso Marc normatiu, promoció i gestió de l'HPO | Diputació de Barcelona | https://www.diba.cat/ca/web/hua/-/curs-marc-normatiu-promoci%C3%B3-i-gesti%C3%B3-de-l-habitatge-amb-protecci%C3%B3-oficial | Precio no visible | 4, 11, 22 mayo y 1 junio 2026 (ya celebrado); inscripción hasta 29-abr-2026 | **No**: dirigido a gestión local | Hay documentación del curso en comunitatxslh.diba.cat. |
| Guía de compra de una vivienda (ebook) | De Vecchi Ediciones (Cuervo y Alfageme) | https://www.amazon.com/Gu%C3%ADa-compra-una-vivienda-Spanish-ebook/dp/B07JZ3Z5MH | 9,99 USD (visto) | Kindle, 788 KB | Sí, pero **no es sobre VPO** | 1 reseña, 5 estrellas (visto). Compra general. |
| "Como Vender una Casa" | Udemy | https://www.udemy.com/course/comovenderunacasa/ | No visible | Vídeo | **No** (México, vivienda de interés social, profesionales de ventas) | Falso positivo por palabras clave. |

### 4.2 Resultado de búsqueda — curso/ebook de pago para particulares

- En Udemy, Hotmart, Gumroad, Teachable, Domestika, Amazon Kindle y asesorías de pago: **no se localizó en la consulta ningún curso o ebook de pago específico para particulares sobre cómo solicitar VPO/HPO en Cataluña**. Esto describe lo que arrojaron las búsquedas realizadas (varias en castellano y catalán), no una prueba de inexistencia.
- Servicio de asesoría/mentoría privada de pago para solicitar HPO: **no localizado en la consulta**.
- **Implicación:** para el mercado catalán el "competidor" principal de un curso de pago es el contenido gratuito (oficial y divulgativo), no otros cursos de pago.

### 4.3 Formación gratuita (línea base)

#### Oficial / institucional
| Recurso | URL | Hecho verificado |
|---|---|---|
| Registre de Sol·licitants d'HPO (Generalitat) | https://www.registresolicitants.cat/registre/paginas/02_Sghp.jsp | Registro "permanent, sense terminis"; "La inscripció en el Registre té una vigència de dos anys"; requisito imprescindible para ser adjudicatario. |
| Requisitos y documentación | https://www.registresolicitants.cat/registre/paginas/pagina.jsp?idPagina=13 | Enumera los 6 requisitos (art. del Decret 106/2009): mayoría de edad, necesidad de vivienda, empadronamiento en Cataluña, límite de ingresos, sin causas de exclusión, capacidad contractual. |
| Trámite Gencat | https://tramits.gencat.cat/ca/tramits/tramits-temes/Inscripcio-en-el-Registre-de-Sollicitants-dHabitatges-amb-Proteccio-Oficial?moda=1 | "Pots fer la inscripció al Registre en qualsevol moment. Per mantenir-la, caldrà que la renovis cada dos anys"; renovar "fins 90 dies abans de la caducitat". |
| FAQ acceso | https://habitatge.gencat.cat/ca/ambits/Habitatge-proteccio-oficial/faqs-acces-habitatge/ | Pasos para acceder, lista de municipios con registro propio (p. ej. Badalona, Terrassa, Sabadell...), Barcelona con registro propio. |
| Definición HPO | https://habitatge.gencat.cat/ca/ambits/Habitatge-proteccio-oficial/hpo/ | Condiciones de acceso, límites de ingresos por IRSC y régimen. |
| Decreto 106/2009 | https://portaljuridic.gencat.cat/ca/document-del-pjur/?documentId=478304 | Norma base del Registro y de los procedimientos de adjudicación. |
| Registro Barcelona (Consorci) | https://www.consorcihabitatge.barcelona/ca/acces-lhabitatge/registre-de-sollicitants | "La inscripció, actualització i cancel·lació de dades són serveis gratuïts per al ciutadà"; vigencia 2 años; canales: web, 010 y oficinas. |
| Oficinas de la Vivienda de Barcelona | https://www.barcelona.cat/habitatge/ca/xarxa-doficines/oficines-de-lhabitatge-de-barcelona | "atenció personalitzada" para información e inscripción en vivienda protegida. |
| Sesiones informativas del Consorci | https://www.consorcihabitatge.barcelona/ca/noticies/sessions-informatives-sobre-els-234-habitatges-publics-de-lilla-acer-1509224 y https://www.consorcihabitatge.barcelona/ca/noticies/sessio-informativa-sobre-el-procediment-dacces-als-192-nous-habitatges-publics-a-la-marina-del-prat-vermell-1631530 | Sesiones gratuitas (mayo 2026) sobre requisitos, inscripción, sorteo y calendario de promociones concretas. El gratuito aparece implícito; la palabra "gratuïtes" la usa el resumen de búsqueda, no una cita literal de la página. |
| Asesoría de vivienda compartida (jóvenes ≤35) | https://www.barcelona.cat/joves/es/quienes-somos/centro-de-informacion-y-asesoramiento | Servicio municipal; el asesoramiento sobre vivienda protegida figura en el artículo de Joves. |
| Charla "Els HPO i les ajudes d'accés a l'habitatge" | https://ajuntament.barcelona.cat/infancia/ca/detall/xerrada-els-hpo-i-les-ajudes-d-acces-a-l-habitatge_99400770999.html | Jóvenes 18–35, 13/05/2026 (pasada), inscripción previa. |
| Infografía "Vols optar a un HPO?" (Ajuntament del Masnou) | https://elmasnou.cat/media/repository/habitatge/HPO_Infografia_Registre_solicitants__V_maig_2025_3.pdf | Pasos prácticos; "La inscripció pot trigar tres mesos a ser efectiva" (aviso local). |

**Formatos oficiales vistos:** páginas informativas, FAQ, infografías municipales, sesiones informativas presenciales/en directo, atención en oficina. **No se localizó** (en la consulta) un curso online oficial estructurado ni una guía PDF única de la Generalitat para particulares.

#### Divulgativa gratuita de terceros
- Oestum (6 guías con capturas oficiales): ver §1.
- Piso Propio (guía en 5 pasos, glosario, documentos): ver §3.2.
- Ibercaja (blog) y Casacochecurro: ver §3.5.

### 4.4 Qué incluye / no incluye lo visto en formación gratuita

- **Casos prácticos:** la guía de Oestum usa el caso real "Illa Glòries" (fechas y reparto de contingentes). Piso Propio incluye un ejemplo numérico (IRSC 2026).
- **Plantillas/ejercicios descargables:** no localizados en la consulta en Oestum ni Piso Propio.
- **Reseñas verificables:** no localizadas para ningún curso de particulares (no hay cursos de este tipo localizados).

---

## 5. Comparativa (solo lo verificado)

| Servicio | Precio visto | Canales | Cobertura anunciada | Filtros | Formación | Herramientas personales |
|---|---|---|---|---|---|---|
| Oestum HPO | Gratis ("gratuïta") | Web, email, Telegram | HPO Cataluña (venta/alquiler) | Municipios | 6 guías gratuitas | No localizadas (solo suscripción) |
| #elPagès (Android) | Gratis con anuncios (AdMob) | Notificación móvil local | Cataluña (BCN, TGN, LLE, GIR) | Municipios, palabras clave, alquiler/venta | Enlaces a requisitos oficiales | Filtros locales sin cuenta |
| ObjectiuLlar | Gratis (AdSense) | Web, email | HPO + subastas + suelo + obra nueva (Cataluña) | Municipios, temas, nivel de aviso | No localizada | Guardar fichas ("Desar") |
| Piso Propio | Gratis | Web, email | España (17 territorios, 140 fuentes) | Comunidad/municipio | Guía 5 pasos + glosario | Test elegibilidad, calculadoras, aviso de renovación |
| Registre oficial | Gratis | Web | Cataluña (fuente primaria) | Municipio en procedimientos | Páginas informativas | Consulta de participación (idCAT) |
| Cursos de pago particulares | No localizados en la consulta | — | — | — | — | — |
| Radar VPO (propio, §3.6) | VPO PRO: precio no visible; curso 89 € | Web, email, SMS (PRO) | Cataluña | No verificado | Curso | No verificado |

---

## 6. Hechos verificados (lista consolidada)

1. Oestum es un proyecto personal gratuito de Oscar Estudillo con avisos por Telegram y/o correo y filtro por municipios; usa IA (OpenAI) para estructurar anuncios y avisa de posibles errores.
2. La app de #elPagès es gratuita con anuncios AdMob, tiene "100+ Descargas" en Play, última actualización 9 oct 2026, sin cuenta y con filtros guardados en el dispositivo.
3. ObjectiuLlar ofrece alertas gratuitas por correo con filtros por municipio/tema/fase y se financia con AdSense.
4. Piso Propio ofrece alertas por correo gratuitas, test de elegibilidad y guía para toda España.
5. El Registro oficial de HPO es gratuito, permanente, vigencia de dos años, renovable en los 90 días previos.
6. El Consorci de Barcelona declara gratuitos inscripción, actualización y cancelación y organiza sesiones informativas por promoción.
7. Los cursos localizados sobre VPO/HPO son profesionales (ICAB, Diputació de Barcelona, EOCO019PO, Grupo A4, geYdes).
8. Páginas con error: vpo.oestum.com/pricing (404), /faq (404), /privacitat (404), /sitemap.xml (500).

## 7. Prestaciones anunciadas (no verificadas en uso)

- Oestum: avisos "al moment"; extracción diaria.
- #elPagès: "Notificaciones Instantáneas"; revisión horaria; "Acceso a requisitos y enlaces oficiales".
- ObjectiuLlar: "Actualització diària automàtica"; cobertura de 46 fuentes.
- Piso Propio: "Lo que sí podemos prometer es que no te enterarás tarde"; 140 fuentes oficiales.
- Radar VPO (propio): "48h antelación media alertas", "3.2k usuarios activos", "120+ promociones monitorizadas" (cifras de su home; no verificadas).

## 8. No comprobado

- Latencia real, tasa de falsos positivos y completitud de los avisos de Oestum, #elPagès y ObjectiuLlar (requeriría suscribirse y comparar con registresolicitants.cat durante varias semanas).
- Existencia de compras dentro de la app, rating y reseñas de #elPagès en Google Play (no visibles en el texto obtenido).
- Telegram: nombre y funcionamiento exacto del bot de Oestum.
- Precio de VPO PRO y del curso "VPO Inicial" en radarvpo.com (no visibles en el texto obtenido).
- Cursos de pago en redes sociales, plataformas con paywall/login o infoproductos vendidos por mensaje directo (no indexables por WebSearch).
- Canales de YouTube/TikTok/Instagram especializados en HPO Cataluña: solo se halló un vídeo corto genérico; no se hizo un barrido exhaustivo.
- Grupos privados de WhatsApp/Telegram con VPO (por definición no localizables).
- Incasòl, APROP y portales tipo "Tu VPO": sin resultado relevante en las búsquedas realizadas; no se afirma que no existan.
- Coste de hosting/uso de IA en Oestum (no declarado).

---

## 9. Implicaciones para Radar VPO (síntesis, sin ser prescriptivo)

- **Avisos básicos por email/Telegram ya son gratis y abundantes** (Oestum, ObjectiuLlar, Piso Propio). Cobrar por la alerta en sí compite contra gratis.
- **Posibles diferenciadores localizados en la consulta como ausentes en gratis:** SMS/WhatsApp, herramientas personales de preparación (checklist de documentación, recordatorios de renovación a 90 días, calendario de plazos, simulador por IRSC y zona), formación estructurada con casos y plantillas descargables, acompañamiento 1:1. Habría que validarlo con usuarios.
- **Formación:** la barrera es el contenido gratuito de calidad (Oestum con capturas oficiales; Consorci con sesiones). El valor de un curso de pago debería estar en plantillas, casos resueltos, simulaciones y soporte, no en explicar el procedimiento básico.
- **Confianza/transparencia:** los competidores gratuitos insisten en "no oficial", "font oficial preval" y avisos de error IA. Mantener métricas y testimonios verificables.

---

## 10. Registro de fuentes consultadas (todas 2026-10-15)

**Oestum:** https://vpo.oestum.com/ · /notifications · /privacy · /terms · /legal · /about · /guides · /guides/com-inscriures · /guides/baremacio-i-sorteig · /guides/que-es-hpo (extracto vía búsqueda) · /announcement/52-habitatges-hpo-de-lloguer-a-montgat-10785 · /robots.txt · (errores: /pricing 404, /faq 404, /privacitat 404, /sitemap.xml 500).

**#elPagès:** https://play.google.com/store/apps/details?id=com.elpages.alertas_vpo&hl=es · https://alertas-vpo-elpages.web.app · https://alertas-vpo-elpages.web.app/privacy · https://chrome-stats.com/d/com.elpages.alertas_vpo · https://appstorespy.com/android-google-play/com.elpages.alertas_vpo-trends-revenue-statistics-downloads-ratings (vía búsqueda) · https://apkpure.net/alertas-de-pisos-vpo-y-hpo/com.elpages.alertas_vpo (vía búsqueda).

**Alternativas:** https://www.objectiullar.cat/ · /alertes · /privacitat · /qui-som · /cookies · /condicions · /convocatories · (error: /fonts 404) · https://pisopropio.es/ · /guia · /sobre · /privacidad · /prensa · https://fcarril.com/posts/how-i-built-piso-propio · https://portal.casa47.es/ · https://www.mivau.gob.es/vivienda/el-portal-de-casa-47 · https://www.casa47.es/convocatoria-alquiler-vivienda-asequible · https://www.expansion.com/economia/2026/09/07/6a9e9e4de5fdea63548b45a8.html · https://www.radarvivienda.es/ · https://funciohouse.com/radar-vivienda/ · https://pisoalerta.com/ · https://www.radarvpo.com/ · /alerts · /promotions · /cursos.

**Oficiales / formación:** https://www.registresolicitants.cat/registre/ · /paginas/02_Sghp.jsp · /paginas/pagina.jsp?idPagina=13 · https://habitatge.gencat.cat/ca/ambits/Habitatge-proteccio-oficial/ · /hpo/ · /faqs-acces-habitatge/ · https://tramits.gencat.cat/ca/tramits/tramits-temes/Inscripcio-en-el-Registre-de-Sollicitants-dHabitatges-amb-Proteccio-Oficial?moda=1 · https://agenciahabitatge.gencat.cat/ca/ · https://portaljuridic.gencat.cat/ca/document-del-pjur/?documentId=478304 · https://www.consorcihabitatge.barcelona/ca/acces-lhabitatge/registre-de-sollicitants · https://www.barcelona.cat/habitatge/ca/xarxa-doficines/oficines-de-lhabitatge-de-barcelona · https://www.barcelona.cat/joves/es/quienes-somos/centro-de-informacion-y-asesoramiento · https://ajuntament.barcelona.cat/joves/es/noticia/quince-preguntas-y-respuestas-sobre-la-vivienda-de-proteccion-oficial_1116477 · https://elmasnou.cat/media/repository/habitatge/HPO_Infografia_Registre_solicitants__V_maig_2025_3.pdf.

**Cursos:** https://www.icab.es/es/formacion/cursos/Curso-de-viviendas-de-proteccion-oficial-en-Cataluna-cuestiones-clave-para-el-ejercicio-profesional/ · https://www.diba.cat/ca/web/hua/-/curs-marc-normatiu-promoci%C3%B3-i-gesti%C3%B3-de-l-habitatge-amb-protecci%C3%B3-oficial · https://arefp.es/acciones-formativas/normativa-de-vivienda-protegida/ · https://www.formacioncontinuaonline.com/formacion-gratis/especialidades-formativas/edificacion-y-obra-civil/eoco019po-normativa-de-vivienda-protegida-17986.html · https://www.aprendemas.com/es/curso/curso-en-viviendas-de-proteccion-oficial-vpo-gestion-y-rentabilidad-404455/ · https://formacioncontinuabonificada.geydes.es/experto-gestion-viviendas-proteccion-oficial · https://www.udemy.com/course/comovenderunacasa/ · https://www.amazon.com/Gu%C3%ADa-compra-una-vivienda-Spanish-ebook/dp/B07JZ3Z5MH · https://www.ibercaja.es/particulares/blog/vivienda/guia-para-comprar-una-vivienda-de-proteccion-oficial-vpo-en-espana/ · https://www.casacochecurro.com/como-solicitar-una-vivienda-de-proteccion-oficial-en-cataluna.html · https://www.youtube.com/watch?v=OLeLD2HzOKQ.

> Nota: varias fuentes (apkpure, appstorespy, Ibercaja, Casacochecurro, vídeos) se leyeron solo como extracto de resultados de búsqueda, no como página completa; los datos de esas fuentes deben tratarse como secundarios.
