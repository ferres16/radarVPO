# Rendimiento

[← Índice](./README.md)

## Mediciones

### JavaScript inicial por ruta (cliente)

Medido sumando los ficheros `entryJSFiles` de `page_client-reference-manifest.js` tras `next build` (Next 16 ya no imprime tamaños por ruta). Tamaños sin comprimir.

| Ruta | Antes | Después | Cambio |
|---|---|---|---|
| `/admin/courses/[courseId]` (editor de lecciones) | 637 KB | 152 KB | TipTap cargado con `next/dynamic` solo al abrir el editor |
| `/cursos/[slug]` | 274 KB | 275 KB | — |
| `/` | 255 KB | 255 KB | — |
| `/pro` | 258 KB | 258 KB | — |
| `/promotions` | 243 KB | 243 KB | — |

Script de medición: ver el comando en la sección *Reproducir* más abajo.

### Rate limit (429)

Ver [operations.md#rate-limit](./operations.md#rate-limit): con 3 visitantes simultáneos, de 30 respuestas 429 sobre 90 peticiones a 0, sin permitir saltarse el límite con cabeceras falsificadas.

### Peticiones duplicadas

- `/cursos/[slug]`: `generateMetadata` y la página pedían el curso dos veces por render; ahora `React.cache` deduplica (1 petición en vez de 2).
- SSR con sesión ya no comparte el cupo de rate limit con el resto del tráfico.

### Base de datos

21 índices añadidos sobre claves foráneas y filtros frecuentes (listados en `backend/prisma/migrations/20261110120000_audit_indexes/migration.sql`). El volumen local no es representativo, así que no se publican tiempos; el criterio es que PostgreSQL no indexa automáticamente las FKs, lo que provoca recorridos secuenciales en borrados en cascada, en joins por `user_id`/`course_id` y en el historial admin (`delivery_logs.target`, `audit_logs(user_id, created_at)`).

Paginación: los listados admin y públicos usan `take/skip` con límites máximos en los DTOs; el historial de envíos se pagina en servidor.

## Caché y datos privados

- Backend: `Cache-Control: private, no-store` en rutas de usuario y en cualquier petición con credenciales.
- Frontend: lecturas públicas anónimas con ISR (`revalidate` 45 s); con sesión, `cache: 'no-store'`. Las respuestas personalizadas no entran en la caché de datos de Next.

## Pendiente (no implementado)

| Mejora | Motivo / impacto |
|---|---|
| Quitar `force-dynamic` de `/`, `/pro`, `/cursos`, `/cursos/[slug]` | Permitiría ISR del HTML; exige separar la parte dependiente de la sesión en componentes cliente |
| Sustituir 6 `<img>` por `next/image` | Tamaños responsivos y lazy-load |
| Polling de confirmación de compra (`2,5 s × 8`) | Aceptable; podría sustituirse por SSE/espera larga |
| `pg_advisory_lock` en jobs | Requisito para escalar el backend a varias instancias |

## Reproducir

```bash
cd frontend && npx next build
node -e '
const fs=require("fs"),p=require("path");
function walk(d){for(const f of fs.readdirSync(d)){const x=p.join(d,f);
 if(fs.statSync(x).isDirectory())walk(x);
 else if(f==="page_client-reference-manifest.js"){const g={};new Function("globalThis",fs.readFileSync(x,"utf8"))(g);
  const m=Object.values(g.__RSC_MANIFEST)[0];const s=new Set(Object.values(m.entryJSFiles||{}).flat());
  let t=0;for(const c of s){try{t+=fs.statSync(p.join(".next",c)).size}catch{}}
  console.log(Math.round(t/1024)+" KB\t/"+p.relative(".next/server/app",d));}}}
walk(".next/server/app")' | sort -rn | head
```
