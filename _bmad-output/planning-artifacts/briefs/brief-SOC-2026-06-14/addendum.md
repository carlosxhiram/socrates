# Addendum — Sócrates (restricciones técnicas y contexto para downstream)

Detalle que no va en el brief de negocio pero alimenta el PRD, la UX y la Arquitectura.

## Stack (restricciones fijadas por Carlos + decisiones del Director)

| Capa | Tecnología | Origen |
|---|---|---|
| Frontend | Next.js (App Router, TS, Tailwind) en **Vercel** | Carlos |
| Backend / API | **Railway** (servicio API + base de datos) | Carlos |
| Storage | **Cloudflare R2** (PDFs de reportes, documentos de expedientes) | Carlos |
| Auth | **Clerk** | Carlos |
| IA | **Vercel AI Gateway** con strings `"provider/model"` (modelos Claude por defecto), AI SDK | Director |
| Monorepo | **pnpm + Turborepo** (`apps/web`, `apps/api`, `packages/shared`, `packages/db`) | Director |
| Lenguaje | **TypeScript end-to-end** | Director |
| ORM / DB | **Prisma + PostgreSQL** (Postgres en Railway) | Director |
| API framework | **Hono** en Railway (ligero, rápido, TS) | Director |
| Control de versiones | git local; **SIN GitHub remoto / sin Actions** (deploy por CLI de Vercel/Railway) | Carlos |

## Modelo de datos (espina = el Expediente)
- `Asesor` (usuario Clerk) → `Expediente` (carpeta por prospecto/cliente, con `progreso` %, `estado`) → `Tarea` (asignada a un `Empleado`, con progreso/estado) + `Entregable` (reporte/documento en R2).
- `Empleado` = los 6 roles + Sócrates (gerente). Contrato común `ejecutar(entrada, ctx) → resultado`.
- `CatalogoProducto` = instituciones + productos SOC (subconjunto curado en v1; expandible a 55).

## Principios de calidad (heredados del Consejo SIM)
- **El control de calidad/precisión a escala ES el producto** — un dato financiero mal citado a escala es el veneno. Verificación de citas + gate de revisión humana antes de entregar = requisitos de primer orden.
- Debe **correr sin claves externas** para demo (seed realista: expedientes Las Aliadas y Probemedic; reporte de Probemedic sembrado fiel). La IA real entra cuando hay claves; si no, fallback que no truena.

## Credenciales que faltan de Carlos (para ir a producción / live)
- Cuentas + tokens: Railway, Vercel, Cloudflare R2 (bucket + keys), Clerk (publishable + secret).
- API key del modelo de IA (o configuración del AI Gateway).
- Datos reales: catálogo de productos de las 55 instituciones; fuentes de prospección.
