#!/usr/bin/env node
/**
 * Genera la documentación de referencia derivada del código:
 *   docs/reference/endpoints.md        (controladores NestJS + route handlers Next)
 *   docs/reference/data-dictionary.md  (modelos, columnas, índices de Prisma)
 *   docs/reference/erd.md              (diagramas Mermaid por módulo)
 *   docs/reference/file-inventory.md   (todos los ficheros versionados)
 *   docs/reference/env-vars.md         (nombres de variables de entorno, sin valores)
 *
 * Uso: npm run docs:reference  (no requiere base de datos ni red)
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const outDir = path.join(root, 'docs/reference');
fs.mkdirSync(outDir, { recursive: true });

const header = (title) =>
  `# ${title}\n\n> Generado por \`scripts/generate-reference-docs.mjs\`. No editar a mano: ejecuta \`npm run docs:reference\`.\n\n`;

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

function trackedFiles() {
  return execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' })
    .split('\n')
    .filter(Boolean);
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

function parseNestController(rel) {
  const src = read(rel);
  const controllerMatch = src.match(/@Controller\(\s*'([^']*)'\s*\)/);
  if (!controllerMatch) return [];
  const base = controllerMatch[1];
  const classIndex = src.indexOf('export class', src.indexOf(controllerMatch[0]));
  const classDecorators = src.slice(src.lastIndexOf('\n\n', src.indexOf(controllerMatch[0])), classIndex);
  const lines = src.slice(classIndex).split('\n');

  const routes = [];
  let decorators = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const continuation = decorators.length && (/^ {3,}\S/.test(line) || /^ {2}[)}\]]/.test(line));
    if (/^ {2}@/.test(line) || continuation) {
      decorators.push(line);
      continue;
    }
    const handlerMatch = line.match(/^ {2}(?:async\s+)?(\w+)\s*\(/);
    if (!handlerMatch) {
      if (line.trim() && !/^ {2}@/.test(line)) decorators = [];
      continue;
    }
    const block = decorators.join('\n');
    decorators = [];
    const http = block.match(/@(Get|Post|Put|Patch|Delete)\(\s*(?:'([^']*)')?/);
    if (!http) continue;
    const handlerSignature = lines.slice(i, i + 8).join('\n');
    const guards = `${classDecorators}\n${block}`;
    const roles = block.match(/@Roles\(([^)]*)\)/)?.[1] ?? classDecorators.match(/@Roles\(([^)]*)\)/)?.[1];
    let auth = 'Público';
    if (/OptionalJwtAuthGuard/.test(guards)) auth = 'Opcional (JWT)';
    if (/\bJwtAuthGuard\b/.test(guards)) auth = 'JWT';
    if (roles) auth = `JWT + rol ${roles.replace(/'/g, '')}`;
    if (base === 'jobs') auth = 'Token JOBS_ADMIN_TOKEN';
    if (/stripe-signature/i.test(handlerSignature)) auth = 'Firma Stripe';
    const throttle = block.match(/@Throttle\(\{ default: \{ limit: (\d+), ttl: ([^}]+?) \} \}\)/);
    routes.push({
      method: http[1].toUpperCase(),
      path: `/api/v1/${[base, http[2]].filter(Boolean).join('/')}`.replace(/\/+/g, '/'),
      auth,
      rateLimit: /@SkipThrottle\(\)/.test(block)
        ? 'sin límite'
        : throttle
          ? `${throttle[1]} / ${throttle[2].trim()}`
          : 'global 60/min',
      handler: handlerMatch[1],
      file: rel,
    });
  }
  return routes;
}

function parseNextRoute(rel) {
  const src = read(rel);
  const methods = [...src.matchAll(/export\s+(?:async\s+)?(?:function|const)\s+(GET|POST|PUT|PATCH|DELETE)\b/g)].map((m) => m[1]);
  const route =
    '/' +
    rel
      .replace(/^frontend\/src\/app\//, '')
      .replace(/\/route\.ts$/, '')
      .replace(/\([^)]+\)\//g, '');
  return methods.map((method) => ({ method, path: route, file: rel }));
}

function writeEndpoints(files) {
  const nest = files
    .filter((f) => /^backend\/src\/.*\.controller\.ts$/.test(f))
    .flatMap(parseNestController)
    .sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method));
  const next = files
    .filter((f) => /^frontend\/src\/app\/.*route\.ts$/.test(f))
    .flatMap(parseNextRoute)
    .sort((a, b) => a.path.localeCompare(b.path));
  const pages = files
    .filter((f) => /^frontend\/src\/app\/.*page\.tsx$/.test(f))
    .map((f) => '/' + f.replace(/^frontend\/src\/app\//, '').replace(/\/?page\.tsx$/, ''))
    .sort();

  let md = header('Inventario de endpoints');
  md += `Backend NestJS: **${nest.length}** rutas. Frontend (route handlers Next): **${next.length}**. Páginas: **${pages.length}**.\n\n`;
  md += 'Leyenda de autenticación: *Público* sin sesión; *Opcional* el resultado depende del nivel de acceso; *JWT* cookie `access_token` o `Authorization: Bearer` con sesión activa en BD; *rol admin* además requiere `role=admin` leído de BD en cada petición.\n\n';
  md += 'Los límites "global 60/min" son por IP real del visitante (ver `docs/operations.md#rate-limit`).\n\n';
  md += '## Backend (`/api/v1`)\n\n| Método | Ruta | Autenticación | Rate limit | Handler | Fichero |\n|---|---|---|---|---|---|\n';
  for (const r of nest) {
    md += `| ${r.method} | \`${r.path}\` | ${r.auth} | ${r.rateLimit} | \`${r.handler}\` | \`${r.file.replace('backend/src/', '')}\` |\n`;
  }
  md += '\n## Frontend: route handlers (`frontend/src/app/**/route.ts`)\n\nTodos se ejecutan en Vercel y reenvían al backend con `buildBackendProxyHeaders` / `applyClientIpHeaders` (IP del visitante firmada con `BACKEND_PROXY_SECRET`).\n\n| Método | Ruta | Fichero |\n|---|---|---|\n';
  for (const r of next) md += `| ${r.method} | \`${r.path}\` | \`${r.file.replace('frontend/src/', '')}\` |\n`;
  md += '\n## Frontend: páginas\n\nLas rutas `/admin/**` comprueban el rol en cliente y, sobre todo, en el backend (todas las llamadas `/backoffice/*` exigen rol admin).\n\n';
  md += pages.map((p) => `- \`${p || '/'}\``).join('\n') + '\n';
  fs.writeFileSync(path.join(outDir, 'endpoints.md'), md);
  return { nest: nest.length, next: next.length, pages: pages.length };
}

// ---------------------------------------------------------------------------
// Prisma: diccionario de datos + ERD
// ---------------------------------------------------------------------------

const PERSONAL_FIELDS = /email|phone|fullName|name$|ipAddress|ip$|userAgent|target|passwordHash|address|nif|taxId/i;
const SECRET_FIELDS = /passwordHash|tokenHash|refreshTokenHash|secret|codeHash/i;

function parsePrisma() {
  const src = read('backend/prisma/schema.prisma');
  const models = [];
  const enums = [];
  for (const m of src.matchAll(/^model (\w+) \{([\s\S]*?)^\}/gm)) {
    const [, name, body] = m;
    const fields = [];
    const blockAttrs = [];
    let pendingDoc = [];
    for (const raw of body.split('\n')) {
      const line = raw.trim();
      if (!line) continue;
      if (line.startsWith('///') || line.startsWith('//')) {
        pendingDoc.push(line.replace(/^\/\/\/?\s?/, ''));
        continue;
      }
      if (line.startsWith('@@')) {
        blockAttrs.push(line);
        continue;
      }
      const fm = line.match(/^(\w+)\s+([\w]+)(\[\])?(\?)?\s*(.*)$/);
      if (!fm) continue;
      const [, fname, type, list, optional, rest] = fm;
      const inlineDoc = rest.match(/\/\/\s?(.*)$/)?.[1];
      fields.push({
        name: fname,
        type: type + (list ? '[]' : ''),
        optional: Boolean(optional),
        attrs: rest.replace(/\/\/.*$/, '').trim(),
        doc: [...pendingDoc, inlineDoc].filter(Boolean).join(' '),
      });
      pendingDoc = [];
    }
    const table = blockAttrs.find((a) => a.startsWith('@@map'))?.match(/"([^"]+)"/)?.[1] ?? name;
    models.push({ name, table, fields, blockAttrs });
  }
  for (const m of src.matchAll(/^enum (\w+) \{([\s\S]*?)^\}/gm)) {
    enums.push({
      name: m[1],
      values: m[2]
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith('//'))
        .map((l) => l.split(/\s+/)[0]),
    });
  }
  return { models, enums };
}

const MODULES = [
  ['Identidad y sesiones', /^(User|Session|EmailVerificationToken|PasswordResetToken|AuditLog)$/],
  ['Comercio y pagos', /^(Purchase|PurchaseConsent|Subscription|StripeProcessedEvent|UserEntitlement|ProAccessGrant|CommercePromoRule|Service|UserServiceAccess)$/],
  ['Cursos y guía', /^(Course|CourseModule|CourseLesson|LessonBlock|CourseAsset|UserCourseAccess|CourseProgress|LessonProgress|ContentSupplyEvent)/],
  ['Promociones y alertas', /^(Promotion|PromotionDocument|PromotionFavorite|Municipality|SavedSearch|UserAlert|Reminder|PromotionShortLink|ShortLink)/],
  ['Notificaciones', /^(DeliveryLog|DeliveryFailure|MessageTemplate|PublishedPost|NotificationOutbox)/],
  ['Contenido, ficheros y operación', /.*/],
];

function moduleOf(modelName) {
  return MODULES.find(([, re]) => re.test(modelName))[0];
}

function writeDataDictionary({ models, enums }) {
  const modelNames = new Set(models.map((m) => m.name));
  let md = header('Diccionario de datos (PostgreSQL vía Prisma)');
  md += `Fuente: \`backend/prisma/schema.prisma\`. **${models.length}** modelos y **${enums.length}** enums. Los nombres de tabla/columna reales son los de \`@@map\`/\`@map\` (snake_case).\n\n`;
  md += 'Columna *Datos*: **P** = dato personal (RGPD), **S** = secreto/credencial (solo hash; nunca se devuelve por la API).\n\n';
  for (const [moduleName] of MODULES) {
    const inModule = models.filter((m) => moduleOf(m.name) === moduleName);
    if (!inModule.length) continue;
    md += `## ${moduleName}\n\n`;
    for (const model of inModule) {
      md += `### ${model.name} (\`${model.table}\`)\n\n| Campo | Tipo | Nulo | Atributos | Datos | Notas |\n|---|---|---|---|---|---|\n`;
      for (const f of model.fields) {
        const isRelation = modelNames.has(f.type.replace('[]', ''));
        const flags = [
          SECRET_FIELDS.test(f.name) ? 'S' : '',
          !isRelation && PERSONAL_FIELDS.test(f.name) ? 'P' : '',
        ]
          .filter(Boolean)
          .join(' ');
        md += `| ${f.name} | ${isRelation ? `→ ${f.type}` : f.type} | ${f.optional ? 'sí' : 'no'} | ${f.attrs.replace(/\|/g, '\\|') || ''} | ${flags} | ${f.doc.replace(/\|/g, '\\|')} |\n`;
      }
      const constraints = model.blockAttrs.filter((a) => !a.startsWith('@@map'));
      if (constraints.length) {
        md += `\nÍndices y restricciones:\n\n${constraints.map((c) => `- \`${c}\``).join('\n')}\n`;
      }
      md += '\n';
    }
  }
  md += '## Enums\n\n| Enum | Valores |\n|---|---|\n';
  for (const e of enums) md += `| ${e.name} | ${e.values.map((v) => `\`${v}\``).join(', ')} |\n`;
  fs.writeFileSync(path.join(outDir, 'data-dictionary.md'), md);
}

function writeErd({ models }) {
  const modelNames = new Set(models.map((m) => m.name));
  let md = header('Diagramas entidad-relación (Mermaid)');
  md += 'Un diagrama por módulo. Las relaciones con modelos de otros módulos se dibujan con la entidad externa sin atributos.\n\n';
  for (const [moduleName] of MODULES) {
    const inModule = models.filter((m) => moduleOf(m.name) === moduleName);
    if (!inModule.length) continue;
    md += `## ${moduleName}\n\n\`\`\`mermaid\nerDiagram\n`;
    const edges = new Set();
    for (const model of inModule) {
      const fkFields = new Set(
        model.fields.flatMap((f) => f.attrs.match(/fields:\s*\[([^\]]+)\]/)?.[1].split(',').map((x) => x.trim()) ?? []),
      );
      md += `  ${model.name} {\n`;
      for (const f of model.fields) {
        if (modelNames.has(f.type.replace('[]', ''))) continue;
        const key = /@id\b/.test(f.attrs) ? ' PK' : /@unique\b/.test(f.attrs) ? ' UK' : fkFields.has(f.name) ? ' FK' : '';
        md += `    ${f.type.replace(/[^\w]/g, '')} ${f.name}${key}\n`;
      }
      md += '  }\n';
      for (const f of model.fields) {
        if (!/@relation\(/.test(f.attrs) || !/fields:/.test(f.attrs)) continue;
        const target = f.type.replace('[]', '');
        const card = f.optional ? '|o--o{' : '||--o{';
        edges.add(`  ${target} ${card} ${model.name} : "${f.name}"`);
      }
    }
    md += [...edges].join('\n') + '\n```\n\n';
  }
  fs.writeFileSync(path.join(outDir, 'erd.md'), md);
}

// ---------------------------------------------------------------------------
// Inventario de ficheros
// ---------------------------------------------------------------------------

function describe(file) {
  const rules = [
    [/^backend\/prisma\/migrations\/.*\/migration\.sql$/, 'Migración SQL (aplicada por `prisma migrate deploy`)'],
    [/^backend\/prisma\/migrations\/.*\/down\.sql$/, 'Rollback manual de la migración'],
    [/^backend\/prisma\/schema\.prisma$/, 'Esquema de datos (fuente de verdad)'],
    [/\.controller\.ts$/, 'Controlador HTTP NestJS'],
    [/\.service\.ts$/, 'Servicio NestJS (lógica de negocio)'],
    [/\.module\.ts$/, 'Módulo NestJS'],
    [/\.dto\.ts$|\/dto\//, 'DTO de validación (class-validator)'],
    [/guard\.ts$/, 'Guard de autorización / rate limit'],
    [/strategy\.ts$/, 'Estrategia Passport'],
    [/(\.unit-spec|\.spec|\.integration-spec|\.test)\.tsx?$/, 'Test automatizado'],
    [/^frontend\/src\/app\/.*route\.ts$/, 'Route handler Next (proxy/servidor)'],
    [/^frontend\/src\/app\/.*page\.tsx$/, 'Página Next (App Router)'],
    [/^frontend\/src\/app\/.*layout\.tsx$/, 'Layout Next'],
    [/^frontend\/src\/app\/.*(error|not-found|loading)\.tsx$/, 'Estado especial de ruta Next'],
    [/^frontend\/src\/app\/.*(sitemap|robots|manifest|opengraph-image|icon)\.(ts|tsx)$/, 'Metadato/SEO generado'],
    [/^frontend\/src\/components\//, 'Componente React'],
    [/^frontend\/src\/lib\//, 'Utilidad frontend'],
    [/^frontend\/src\/types/, 'Tipos compartidos frontend'],
    [/^frontend\/public\//, 'Recurso estático público'],
    [/^backend\/src\/.*\.ts$/, 'Utilidad backend'],
    [/^backend\/scripts\//, 'Script operativo backend'],
    [/^backend\/test\//, 'Configuración/tests de integración'],
    [/^\.github\/workflows\//, 'Pipeline CI/CD'],
    [/^docs\//, 'Documentación'],
    [/\.md$/, 'Documentación'],
    [/(package(-lock)?\.json|tsconfig.*\.json|nest-cli\.json|eslint\.config\.m?js|\.prettierrc|postcss\.config\.mjs|next\.config\.ts|vitest\.(config|setup)\.ts|jest.*\.json)$/, 'Configuración de herramientas'],
    [/(vercel|railway)\.json$|Dockerfile|Procfile/, 'Configuración de despliegue'],
    [/\.env\.example$/, 'Plantilla de variables de entorno (sin valores reales)'],
    [/\.gitignore$/, 'Exclusiones de git'],
  ];
  return rules.find(([re]) => re.test(file))?.[1] ?? 'Otro';
}

function writeInventory(files) {
  const listed = files.filter((f) => !f.startsWith('docs/reference/'));
  let md = header('Inventario de ficheros');
  md += `**${listed.length}** ficheros versionados (\`git ls-files\`), excluyendo los propios documentos generados en \`docs/reference/\`.\n\n`;
  md += '## Exclusiones\n\nNo se inventarían porque no están versionados o se regeneran:\n\n';
  md += '- `node_modules/` (dependencias, ver `package-lock.json`).\n- `backend/dist/`, `frontend/.next/` (artefactos de build).\n- `.env`, `.env.local` y similares (secretos; solo se versionan los `.env.example`).\n- `backend/generated/` / cliente Prisma (se genera con `prisma generate`).\n- Coberturas, logs y cachés locales (`coverage/`, `*.log`, `.turbo`).\n\n';
  const groups = new Map();
  for (const f of listed) {
    const parts = f.split('/');
    const group = parts.length > 2 ? parts.slice(0, Math.min(parts.length - 1, 3)).join('/') : parts.length === 2 ? parts[0] : '(raíz)';
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(f);
  }
  const counts = {};
  for (const f of listed) counts[describe(f)] = (counts[describe(f)] ?? 0) + 1;
  md += '## Resumen por tipo\n\n| Tipo | Ficheros |\n|---|---|\n';
  for (const [k, v] of Object.entries(counts).sort((a, b) => b[1] - a[1])) md += `| ${k} | ${v} |\n`;
  md += '\n## Listado completo\n\n';
  for (const [group, items] of [...groups.entries()].sort()) {
    md += `### \`${group}\` (${items.length})\n\n| Fichero | Tipo |\n|---|---|\n`;
    for (const f of items.sort()) md += `| \`${f}\` | ${describe(f)} |\n`;
    md += '\n';
  }
  fs.writeFileSync(path.join(outDir, 'file-inventory.md'), md);
  return listed.length;
}

// ---------------------------------------------------------------------------
// Variables de entorno (nombres, nunca valores)
// ---------------------------------------------------------------------------

function exampleKeys(rel) {
  if (!fs.existsSync(path.join(root, rel))) return new Set();
  return new Set(
    read(rel)
      .split('\n')
      .map((l) => l.match(/^#?\s*([A-Z][A-Z0-9_]+)=/)?.[1])
      .filter(Boolean),
  );
}

function writeEnvVars(files) {
  const usage = new Map();
  for (const f of files) {
    if (!/\.(ts|tsx|mjs|js)$/.test(f) || /(__tests__|\.test\.|spec\.ts$)/.test(f)) continue;
    if (!/^(backend|frontend)\//.test(f)) continue;
    const src = read(f);
    for (const m of src.matchAll(/process\.env\.([A-Z][A-Z0-9_]+)|config\.get(?:<[^>]+>)?\(\s*'([A-Z][A-Z0-9_]+)'/g)) {
      const key = m[1] || m[2];
      const side = f.split('/')[0];
      if (!usage.has(key)) usage.set(key, { backend: new Set(), frontend: new Set() });
      usage.get(key)[side].add(f);
    }
  }
  const validated = new Set(
    [...read('backend/src/config/env.validation.ts').matchAll(/^\s+([A-Z][A-Z0-9_]+)[?!]?:/gm)].map((m) => m[1]),
  );
  const beExample = exampleKeys('backend/.env.example');
  const feExample = exampleKeys('frontend/.env.example');
  let md = header('Variables de entorno');
  md += 'Nombres detectados en el código (`process.env.X` y `ConfigService.get(\'X\')`). **No se incluyen valores.** *Validada* = declarada en `backend/src/config/env.validation.ts` (el backend no arranca si el formato es inválido). Variables `NEXT_PUBLIC_*` se incrustan en el bundle del navegador: nunca deben contener secretos.\n\n';
  md += '| Variable | Backend | Frontend | Validada | En .env.example | Ficheros |\n|---|---|---|---|---|---|\n';
  for (const [key, u] of [...usage.entries()].sort()) {
    const where = [...u.backend, ...u.frontend].map((f) => `\`${f.replace(/^(backend|frontend)\/src\//, '$1:')}\``);
    md += `| \`${key}\` | ${u.backend.size ? 'sí' : ''} | ${u.frontend.size ? 'sí' : ''} | ${validated.has(key) ? 'sí' : ''} | ${[beExample.has(key) ? 'backend' : '', feExample.has(key) ? 'frontend' : ''].filter(Boolean).join(', ')} | ${where.slice(0, 4).join(', ')}${where.length > 4 ? ` +${where.length - 4}` : ''} |\n`;
  }
  fs.writeFileSync(path.join(outDir, 'env-vars.md'), md);
  return usage.size;
}

const files = trackedFiles();
const envCount = writeEnvVars(files);
const prisma = parsePrisma();
const endpointCounts = writeEndpoints(files);
writeDataDictionary(prisma);
writeErd(prisma);
const fileCount = writeInventory(files);
console.log(
  JSON.stringify({ envVars: envCount, files: fileCount, models: prisma.models.length, enums: prisma.enums.length, ...endpointCounts }),
);
