# Sócrates — la plataforma de SOC | TALENT

> Tu equipo de asesoría financiera, en una sola oficina. Sócrates (el gerente) y
> seis empleados de IA (Prospector, Investigador, Asesor de producto, Negociador,
> Tramitador, Gestor) trabajan los expedientes de tus prospectos.
>
> **La calidad/precisión ES el producto:** cero cifras inventadas, cero
> instituciones/productos alucinados, y siempre un visto bueno humano antes de
> entregar al cliente.

Este repositorio es el **monorepo** de los cimientos (Épica E1). Corre hoy en tu
máquina, sin Docker y sin ninguna llave, mostrando datos sembrados reales.

---

## Qué hay adentro

```
socrates/
├── apps/
│   ├── web/        Next.js 15 (App Router, TS, Tailwind) — "La Oficina"
│   └── api/        Hono (servicio long-running) — el cerebro + wrappers
├── packages/
│   ├── shared/     tipos y contratos (glosario, contrato de Empleado, ReporteV1, DTOs)
│   └── db/         Prisma (Postgres) + seed realista (Las Aliadas, Probemedic)
├── turbo.json      pipeline (build / dev / typecheck / test / lint)
└── .env.example    plantilla de TODAS las llaves que Carlos debe pegar
```

---

## Cómo correr (sin Docker, sin llaves)

Todo se corre con `pnpm` desde la raíz. Único requisito local: **Postgres**
corriendo (el entorno de desarrollo en la nube ya lo trae; en una laptop:
`brew install postgresql@16` o el instalador oficial — sin Docker).

```bash
# 0. (Solo la primera vez) crear el rol y la base de desarrollo
#    Linux (Debian/Ubuntu — el superusuario es el usuario de sistema `postgres`):
sudo -u postgres psql -c "CREATE ROLE socrates LOGIN PASSWORD 'socrates' CREATEDB;" \
                      -c "CREATE DATABASE socrates OWNER socrates;"
#    macOS (Homebrew — el superusuario es tu propio usuario):
#      psql -d postgres -c "CREATE ROLE socrates LOGIN PASSWORD 'socrates' CREATEDB;" \
#                       -c "CREATE DATABASE socrates OWNER socrates;"

# 1. Instalar todo
pnpm install

# 2. Preparar la base de datos y sembrar los datos demo
pnpm db:generate     # genera el cliente de Prisma
pnpm db:deploy       # aplica las migraciones (Postgres local)
pnpm db:seed         # siembra: 6 empleados, catálogo SOC, Las Aliadas y Probemedic

# 3. Encender los dos servicios (en dos terminales, o en segundo plano)
pnpm --filter @socrates/api dev    # el cerebro → http://localhost:8787
pnpm --filter @socrates/web dev    # La Oficina  → http://localhost:3000
```

Abre **http://localhost:3000** → te lleva a **La Oficina** con los dos expedientes
sembrados, el panel "Tu equipo", las barras de progreso y la barra de Sócrates.

> **Nota:** el paso 2 completo solo es necesario la primera vez (o tras
> `pnpm db:reset`). `pnpm db:migrate` (migrate dev, para crear migraciones
> nuevas) también ejecuta el seed automáticamente al final.

### Verificación rápida (que todo prendió)

```bash
curl http://localhost:8787/health        # → { "estado": "vivo", "db": "ok", ... }
curl http://localhost:8787/expedientes   # → los 2 expedientes sembrados
```

---

## Comandos útiles

| Comando | Qué hace |
|---|---|
| `pnpm build` | Construye los 4 paquetes (build de producción) |
| `pnpm typecheck` | Verifica tipos en todo el monorepo |
| `pnpm test` | Corre los tests co-locados (unitarios, sin base) |
| `pnpm test:integracion` | Corre los tests de integración contra la base real |
| `pnpm db:reset` | Borra y resiembra la base local (Postgres) |
| `pnpm --filter @socrates/web dev` | Solo La Oficina |
| `pnpm --filter @socrates/api dev` | Solo el cerebro |

---

## Modo sin claves (lo que hace que corra sin nada)

La app **arranca igual sin ninguna llave externa** (NFR-11):

- **Sin clave de IA** → los empleados usan datos sembrados; nada truena.
- **Sin Clerk** → modo "asesor demo": entras directo a tu oficina, sin login.
- **Sin Cloudflare R2** → exportar PDF avisa con un mensaje honesto en vez de fallar.
- **Sin Tavily** → la búsqueda en vivo se apaga; el Investigador marca brechas.

Cuando pegues las llaves (ver `.env.example`), cada pieza se enciende sola.

---

## Base de datos: Postgres en desarrollo y en producción

- **Desarrollo:** Postgres local (rol/base `socrates`, ver "Cómo correr") —
  **sin Docker**; misma base que producción, cero sorpresas de paridad.
- **Producción:** Postgres en Railway; solo cambia la `DATABASE_URL` a la cadena
  interna de Railway. Los enums se guardan como texto, validados por la capa de
  aplicación (`@socrates/shared/glosario`); el contenido del reporte como JSON
  serializado — pasar a enums nativos/JSONB queda como migración hacia adelante.

---

## Stack

Next.js 15 (App Router) · Hono · Prisma · Postgres ·
Clerk (auth) · Vercel AI Gateway + AI SDK (IA) · Tavily (búsqueda) ·
Cloudflare R2 (PDFs) · pnpm + Turborepo · TypeScript end-to-end · español en
toda la superficie.

Ver `STATUS.md` para qué quedó hecho, qué falta para Stage 3, y las llaves
pendientes.
