# STATUS — Sócrates, Cimientos (Épica E1)

Fecha: 2026-06-14 · Ingeniera: Amelia (Opus) · Fase: E1 (Cimientos)

> Resumen de una línea: **el monorepo compila, la base de datos vive con el seed
> realista, y La Oficina carga en el navegador mostrando los dos expedientes
> (Las Aliadas y Probemedic) con el Reporte de Probemedic aprobado — todo sin
> Docker y sin ninguna llave.**

---

## ✅ Verificado de verdad (corrido, no asumido)

| Prueba | Resultado |
|---|---|
| `pnpm install` | OK (236 paquetes; build scripts de Prisma/esbuild/sharp aprobados) |
| `pnpm db:generate` | OK (cliente Prisma v6.19.3 generado) |
| `prisma migrate dev` | OK (migración inicial creada y aplicada a SQLite) |
| `pnpm db:seed` | OK — 7 empleados, 17 instituciones, 22 productos, 2 expedientes, Reporte Probemedic **APROBADO** |
| `pnpm turbo run typecheck` | OK — 6/6 tareas verdes |
| `pnpm turbo run build` | OK — 4/4 paquetes; web build con 6 rutas + middleware |
| `pnpm test` (shared) | OK — 4/4 tests (derivación de progreso, glosario) |
| `api` corriendo (`/health`) | `{ estado: "vivo", db: "ok", modoSinClavesIA: true }` |
| `api` `/expedientes`, `/empleados`, `/catalogo`, `/entregables/:id` | OK — devuelven el seed real |
| `web` dev en :3000 | `/` → 307 → `/oficina` (200); detalle (200); entregable (200) |
| **La Oficina renderiza el seed** | "Tu oficina", "Tu equipo", Probemedic (En investigación, 38%), Las Aliadas (Con recomendación, 58%), el Investigador "Entregó" |
| Visor de Reporte | título, marca SOC \| TALENT, resumen ejecutivo, disclaimer de no-oferta-vinculante (NFR-9) — todo desde el JSONB |
| Lenguaje de oficina (NFR-14) | escaneo de la superficie: **0** términos de IA (prompt/token/claude/procesando/…) |

---

## Qué quedó hecho (alcance E1)

- **Monorepo pnpm + Turborepo**: `apps/web`, `apps/api`, `packages/shared`, `packages/db`.
- **`packages/shared`**: glosario (enums espejo + etiquetas de oficina), contrato de
  Empleado `ejecutar(entrada, ctx) → resultado` (D-3), esquema `ReporteV1` (Zod),
  DTOs compartidos (Zod), y la derivación pura de progreso (testeada).
- **`packages/db`**: esquema Prisma con la espina completa (Asesor, Expediente,
  Tarea, Entregable + EntregableVersion, Empleado, Institucion, Producto,
  Recomendacion), migración inicial, y seed realista idempotente.
- **Wrappers (codificados, detrás de env, con fallback que NO truena):**
  - `ProveedorIA` (AI Gateway, modelos Claude por string, fallback sin clave).
  - `ProveedorBusqueda` (Tavily, fallback sembrado).
  - `AlmacenR2` (S3 SDK, presigned GET, degradación honesta sin claves).
  - Auth Clerk **networkless** (`@clerk/backend`) + **modo asesor demo** sin claves.
- **`apps/web`**: La Oficina (panel de los 6 empleados con estado, lista de
  expedientes con barra de progreso, barra de Sócrates funcional), detalle de
  expediente (bandeja de entregables + equipo), y visor del Reporte.
- **`apps/api`**: Hono con CORS → Auth → Validación (Zod) → Errores; rutas de
  expedientes (CRUD + avanzar etapa), empleados (estado del equipo), catálogo, y
  entregables (ver + Gate humano de aprobar). `/health` DB-aware.
- **git local** inicializado (sin remoto). `README.md` + este `STATUS.md`.
- **`Dockerfile` + `railway.json`** del api listos para Stage 3 (deploy).

---

## Desviaciones deliberadas del documento de arquitectura (y por qué)

1. **Next.js 15.1 en lugar de 16 / `middleware.ts` en lugar de `proxy.ts`.**
   Para GARANTIZAR que el dev server y el build levanten en este entorno, se usó
   Next 15 (estable, sólido con Clerk v6 + React 19). El cambio a Next 16 para
   Stage 3 es de bajo riesgo: subir la versión y **renombrar `middleware.ts` a
   `proxy.ts`** exportando `export const proxy = clerkMiddleware(...)` (el cuerpo
   ya está escrito así, con una nota en el archivo).

2. **Prisma 6 con generador `prisma-client-js` (no Prisma 7 Rust-free).**
   La decisión del Director (#2) manda **SQLite para dev sin Docker**; el
   generador clásico es el camino más confiable para SQLite local. En producción
   (Postgres/Railway) se puede subir a Prisma 7 sin tocar el modelo.

3. **AI SDK `ai@4.3` — `createGateway` por import dinámico.** En esta versión del
   AI SDK el proveedor del Gateway vive en `@ai-sdk/gateway` (paquete aparte). El
   wrapper lo carga por especificador variable, así el arranque **sin clave** (el
   caso de hoy) no depende del paquete. Cuando Carlos pegue la clave de IA, se
   instala `@ai-sdk/gateway` y el camino queda activo.

4. **`DATABASE_URL` con default absoluto en dev** (`apps/api/src/env.ts`): la api
   resuelve sola la ruta del SQLite desde cualquier cwd, para que
   `pnpm --filter api dev` corra sin configurar nada.

---

## Pendiente para Stage 3 (lo que sigue, en orden)

1. **PoC del Investigador (el gate de E4):** validar paridad de calidad y costo
   del pipeline de 6 fases contra el Reporte real de Probemedic, ANTES de
   construir el pipeline caro. Es el riesgo técnico central (R-1).
2. **E3 Sócrates real:** la Barra de Comando hoy es un placeholder funcional (da
   un acuse honesto). Falta la interpretación de intención → plan confirmable →
   crear Tareas con dependencias → worker que las ejecuta.
3. **E2 completo:** crear/editar Expediente desde la UI (los endpoints ya existen;
   falta el formulario y el botón "Nuevo expediente"); polling de estado (5–10 s).
4. **Las tres compuertas de calidad como código probado** (C-1 fidelidad de
   catálogo con FK real, C-2 verificación de citas, C-3 Gate humano en export) y
   el render PDF con Puppeteer + subida a R2.
5. **E8 Deploy** por CLI (Railway api + Postgres, Vercel web), conectar Clerk/R2.

---

## Llaves que faltan de Carlos (pegar en `.env`, ver `.env.example`)

| Llave | Para qué | Sin ella |
|---|---|---|
| `AI_GATEWAY_API_KEY` | IA real (Vercel AI Gateway, modelos Claude) | Modo sin claves (seed) |
| `TAVILY_API_KEY` | Búsqueda en vivo del Investigador | Fallback sembrado |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_JWT_KEY` | Login y aislamiento por asesor | Modo asesor demo |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_ENDPOINT` | Guardar PDFs | Export degrada con aviso |
| `DATABASE_URL` (Postgres) | Producción en Railway | En dev usa SQLite local |

---

## Notas de datos para Carlos

- El **catálogo curado v1** tiene **17 instituciones / 22 productos** reales
  (extraídos de los reportes Las Aliadas y Probemedic + research). El `_meta` del
  archivo dice "37 productos" — es una **inexactitud del metadato**, no de los
  datos; hay 22 productos reales cargados. Carlos debe expandir hacia las 55
  instituciones validando condiciones con cada institución.
- Las recomendaciones de financiamiento del Reporte sembrado de Probemedic usan
  ids placeholder `soc_*` que **no** existen aún en el catálogo: por diseño (C-1),
  no se crean filas `Recomendacion` con FK falsa — el reporte conserva los nombres
  legibles para mostrar, pero la "verdad" (el id real) se resolverá cuando el
  catálogo cubra esas instituciones.
