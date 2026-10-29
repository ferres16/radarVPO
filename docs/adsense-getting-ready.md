# AdSense stuck in “Getting ready” — diagnóstico Radar VPO

Revisado el 2026-10-29 contra código y producción (`https://www.radarvpo.com`).

## Qué estaba pasando (confirmado)

| Señal | Evidencia | Impacto |
| --- | --- | --- |
| **`/ads.txt` inválido** | Respuesta live (2026-10-29): `# Publicidad desactivada en el lanzamiento.` | Google no puede verificar el publisher. Esto solo basta para bloquear el alta meses. |
| **Publisher ID no derivado** | `adsTxtContent` exigía `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID`; con solo `CLIENT_ID` (ca-pub-…) el middleware/route pisaban el `public/ads.txt` bueno | El fichero estático correcto nunca llegaba a Google. Ahora se deriva de CLIENT_ID o fallback `pub-9530052824706142`. |
| **Código AdSense invisible al crawler** | Script solo se inyectaba tras consentimiento de cookies | El bot de AdSense no acepta el banner → no “ve” el sitio listo |
| **Inventario muy estrecho** | Rutas `/promotions`, `/cursos`, `/pro` estaban excluidas de ads | Aunque home tuviera unidades, casi no hay páginas de contenido con anuncios |

CSP en producción sí incluye dominios de AdSense → `NEXT_PUBLIC_ADSENSE_ENABLED=true` parece activo. El fallo no era “CSP bloquea”, sino **ads.txt + detección del código**.

Publisher observado en repo (`public/ads.txt`): `pub-9530052824706142`.

## Cambios hechos en código

1. `ads.txt` se genera desde `PUBLISHER_ID` **o** desde `CLIENT_ID` (`ca-pub-X` → `pub-X`).
2. Meta `google-adsense-account` + script de librería en `<head>` cuando ads están enabled (verificación de sitio; las unidades siguen tras consentimiento).
3. Se permiten anuncios en catálogo público (`/promotions`, `/news`, `/alerts`, `/pro`, `/cursos`); se mantienen fuera auth, checkout, cuenta y legales.

## Checklist en Vercel (revisar juntos)

En el proyecto frontend de producción:

1. `NEXT_PUBLIC_ADSENSE_ENABLED=true`
2. `NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-9530052824706142` (o el ca-pub real de la cuenta)
3. Opcional: `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID=pub-9530052824706142`
4. Slots reales (IDs de AdSense, no `1234567890`):
   - `NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR`
   - `NEXT_PUBLIC_ADSENSE_SLOT_CARD`
   - `NEXT_PUBLIC_ADSENSE_SLOT_INLINE` (recomendado en listados)
5. Redeploy tras cambiar env.
6. Comprobar a mano:
   - `https://www.radarvpo.com/ads.txt` → una línea `google.com, pub-…, DIRECT, f08c47fec0942fa0`
   - View-source de `/` → meta `google-adsense-account` y script `adsbygoogle.js?client=ca-pub-…`
7. En AdSense: Sites → Request review / Wait for crawl (puede tardar días tras corregir ads.txt).
8. Dominio canónico: la cuenta AdSense tiene **`radarvpo.com`** (apex). Google mira `https://radarvpo.com/ads.txt`.

## Por qué AdSense dice ads.txt “Not found” (oct 2026)

Evidencia:

- En AdSense → Sites: `radarvpo.com` · Getting ready · **Ads.txt status: Not found** · Last updated **Jul 9, 2026**.
- `https://www.radarvpo.com/ads.txt` → **200** con la línea correcta.
- `https://radarvpo.com/ads.txt` → **308** de Vercel a `www` con cuerpo `Redirecting...` (redirect a nivel de dominio; la app ni siquiera corre).

Google rastrea el apex del sitio registrado. Un 308 + “Redirecting…” se cuenta como **Not found**. Además no ha vuelto a crawlear desde julio.

### Qué hacer en Vercel (imprescindible)

1. Vercel → proyecto frontend → **Settings → Domains**.
2. En `radarvpo.com`, **quita** “Redirect to www.radarvpo.com” (el dominio apex debe apuntar al deployment, no redirigir).
3. Deja `www.radarvpo.com` como dominio de producción / canónico para usuarios.
4. El middleware de la app:
   - sirve `/ads.txt` en **apex y www** con 200;
   - redirige el resto de rutas del apex → `www`.
5. Comprueba sin seguir redirects:
   ```bash
   curl -sI https://radarvpo.com/ads.txt
   # debe ser HTTP 200 (no 308)
   curl -s https://radarvpo.com/ads.txt
   # google.com, pub-9530052824706142, DIRECT, f08c47fec0942fa0
   ```
6. Opcional en AdSense: **+ New site** → `www.radarvpo.com` (además del apex). No sustituye el ads.txt del apex.

No hace falta borrar el sitio ni pedir otra review: la de julio sigue en cola; cuando el ads.txt del apex pase a 200, el crawler actualizará el estado (puede tardar días).

## Lo que no arregla solo el código

- Cuenta AdSense rechazada o en revisión manual por política de contenido.
- Tráfico insuficiente / sitio “thin” a ojos de Google.
- Ad blockers en pruebas manuales (no afectan al crawler de Google).
- Consentimiento: los **anuncios visibles** siguen requiriendo opt-in; eso es correcto a efectos RGPD. La verificación de sitio ya no depende del banner.

## Próximo paso sugerido

Tras el deploy: pegar aquí el contenido live de `/ads.txt` y una captura de Variables de entorno (sin secretos) con ENABLED / CLIENT_ID / SLOTs presentes o no.
