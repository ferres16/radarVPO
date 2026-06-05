# Auditoría UX/UI Radar VPO

## Resumen ejecutivo

La web tenía una base visual limpia, pero el producto no estaba suficientemente centrado en la tarea principal del usuario: encontrar vivienda pública en Cataluña. La navegación mezclaba cursos, servicios, noticias y promociones con la misma jerarquía, el home comunicaba asesoría antes que búsqueda de vivienda y el área privada no mostraba todavía una visión tipo dashboard.

Las mejoras implementadas priorizan claridad institucional, búsqueda más rápida, confianza, accesibilidad AA y una sensación de producto más moderno sin añadir dependencias pesadas.

## Problemas detectados

| Área | Problema | Impacto | Prioridad | Solución propuesta / aplicada |
| --- | --- | --- | --- | --- |
| Arquitectura de información | La navegación no reflejaba las tareas principales: buscar vivienda, ayudas, requisitos, municipios y FAQ. | El usuario tarda más en entender dónde empezar. | Alta | Navbar rediseñada con jerarquía centrada en vivienda pública. |
| Navbar | Estética básica, sin indicador activo, sin CTA de registro visible y menú móvil poco premium. | Menor confianza y peor orientación. | Alta | Navbar sticky glassmorphism, estado activo, acciones de sesión y drawer móvil animado. |
| Home | El hero comunicaba asesoría y cursos antes que búsqueda de vivienda. | Pérdida de conversión en los primeros segundos. | Alta | Hero reescrito con título solicitado, CTAs principales, estadísticas y pasos claros. |
| Búsqueda | Filtros poco explicativos y resultados limitados a una presentación básica. | Menor velocidad para comparar promociones. | Alta | Cabecera de búsqueda nueva, filtros etiquetados, búsqueda rápida local y resumen de resultados. |
| Cards | Las fichas no priorizaban ubicación, régimen y estado de revisión. | Lectura lenta y menor confianza en la calidad del dato. | Media | Cards más escaneables con estado visual, ubicación destacada y CTA "Ver ficha". |
| Registro | Sin feedback de fortaleza de contraseña ni refuerzo del valor de crear cuenta. | Más fricción y más errores. | Media | Indicador de fortaleza, autocompletado y explicación de beneficios del perfil. |
| Login | Pantalla funcional pero poco institucional y con errores poco destacados. | Menor percepción de seguridad. | Media | Layout de acceso privado, consejo de seguridad y mensajes con `role="alert"`. |
| Perfil | La cuenta mezclaba perfil, plan y guía PRO sin dashboard ciudadano claro. | El usuario no ve estado, favoritos ni próximos pasos. | Alta | Dashboard con solicitudes, favoritos, documentación, notificaciones, accesos y roles. |
| Accesibilidad | Faltaban mejoras globales de foco, motion reduction y labels más completos. | Riesgo WCAG AA. | Alta | Foco global visible, labels en filtros, `aria-current`, `aria-expanded`, `aria-controls` y `prefers-reduced-motion`. |
| Rendimiento | Añadir Framer Motion habría aumentado bundle para animaciones simples. | Riesgo de bundle innecesario. | Media | Animaciones CSS ligeras equivalentes: fade, slide, hover y float con motion reduction. |

## Decisiones UX/UI clave

- Se prioriza "Buscar vivienda" como acción principal porque es el objetivo de mayor intención y conversión.
- Los colores catalanes se usan de forma contenida: verde institucional para confianza, rojo como acento de estado/activo y dorado como luz visual, evitando una estética partidista o saturada.
- El drawer móvil sustituye el menú básico para mejorar percepción de producto y facilitar interacción táctil.
- La búsqueda mantiene filtros compatibles con el backend actual (`municipality`, `province`, `promotionType`, `limit`) y añade búsqueda rápida local sobre los resultados cargados.
- No se añadió Framer Motion para evitar peso extra. Las microinteracciones se implementaron con CSS y respetan `prefers-reduced-motion`.
- El dashboard de usuario muestra bloques preparados para solicitudes y documentación aunque todavía no exista endpoint específico, dejando clara la arquitectura de producto sin inventar datos.

## Recomendaciones siguientes

- Añadir endpoints para solicitudes, documentación enviada, notificaciones y filtros avanzados de unidades por precio/habitaciones.
- Implementar recuperación de contraseña completa en backend y frontend.
- Medir Lighthouse en entorno desplegado y revisar imágenes reales cuando existan assets finales.
- Añadir tests de navegación y formularios críticos con Playwright o Testing Library.

## Fase 2: Sistema visual y CMS

Se amplió la modernización con una base más consistente para toda la plataforma:

- Se añadió Framer Motion con primitivos reutilizables (`Reveal`, `MotionCard`, `Stagger`, `StaggerItem`) y respeto a `prefers-reduced-motion`.
- Se creó un Design System reutilizable (`PageHero`, `SectionHeader`, `SurfaceCard`, `MetricCard`, `ButtonLink`, `Eyebrow`) para reducir estilos duplicados.
- La navbar se reorientó a la arquitectura solicitada: Servicios, Cursos, Promociones, Alertas, Ayudas y Contacto, con buscador global.
- La home se reorganizó para dar protagonismo a servicios, promociones activas, alertas, cursos y novedades.
- La página de detalle de promoción se transformó hacia una experiencia de portal inmobiliario con hero visual, resumen estructurado, contadores multimedia, documentos, requisitos, fechas y unidades.
- Alertas se rediseñó como centro de notificaciones con filtros visuales, tipos y estado leído/no leído preparado para persistencia.
- Backoffice incorpora navegación lateral, dashboard CMS, gestor de promociones y cabeceras de editor para cursos/promociones.

### Auditoría técnica detectada

| Área | Hallazgo | Riesgo | Mejora aplicada |
| --- | --- | --- | --- |
| Componentes | Muchas páginas repetían headers, botones y cards con clases distintas. | Inconsistencia visual y mantenimiento lento. | Design System compartido. |
| Animación | Animaciones CSS dispersas y sin patrón de entrada por scroll. | Experiencia poco consistente. | Primitivos Framer Motion centralizados. |
| Admin | El panel mezclaba dashboard y gestión operativa. | Baja productividad editorial. | Sidebar CMS y página específica de promociones. |
| Cursos | El editor era funcional pero no comunicaba una arquitectura de bloques. | Dificulta evolución a CMS avanzado. | Módulos visuales de editor por bloques. |
| Promociones | La edición y el detalle público no reflejaban galería/multimedia/estructura inmobiliaria. | Menor confianza y menor escalabilidad. | Hero inmobiliario, contadores multimedia y módulos CMS. |
| Mobile-first | Algunos layouts eran desktop-first y dependían de grids anchos. | Peor lectura en móvil. | Componentes y secciones parten de una columna y escalan a grid. |

## Fase 3: Revisión crítica de conversión

Se reorientó la experiencia con mentalidad comercial:

- Promociones ahora carga de forma segura las últimas 10 promociones publicadas, con filtros opcionales y estado vacío con CTAs a Avisos y Servicios.
- Home se simplificó drásticamente: hero comercial, máximo 4 promociones destacadas, Servicios Premium, Cursos como ventaja práctica y máximo 3 avisos.
- Se eliminaron estadísticas irrelevantes del hero porque transmitían dashboard interno y no empujaban a una acción.
- Servicios se transformó en landing comercial con beneficios, casos prácticos, qué incluye, testimonios, FAQ y sección integrada "Hablemos".
- Alertas se renombró visualmente a Avisos y se redujo a pendientes de publicación, próximas aperturas y fechas importantes.
- Noticias pasa a ser una página editorial con destacado, buscador y recientes.
- Navegación pública queda enfocada a negocio: Inicio, Promociones, Servicios, Cursos, Avisos, Noticias y Perfil.

Decisión de producto: toda pantalla pública debe empujar a una de cuatro acciones: ver promociones, contratar servicios, comprar cursos o registrarse.
