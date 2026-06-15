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
│   └── db/         Prisma (SQLite en dev) + seed realista (Las Aliadas, Probemedic)
├── turbo.json      pipeline (build / dev / typecheck / test / lint)
└── .env.example    plantilla de TODAS las llaves que Carlos debe pegar
```

---

## Cómo correr (en tu máquina, sin Docker, sin llaves)

Todo se corre con `pnpm` desde la raíz. (Amelia corre estos comandos por ti.)

```bash
# 1. Instalar todo
pnpm install

# 2. Preparar la base de datos local (SQLite) y sembrar los datos demo
pnpm db:generate     # genera el cliente de Prisma
pnpm db:migrate      # crea las tablas (SQLite: packages/db/prisma/dev.db)
pnpm db:seed         # siembra: 6 empleados, catálogo SOC, Las Aliadas y Probemedic

# 3. Encender los dos servicios (en dos terminales, o en segundo plano)
pnpm --filter @socrates/api dev    # el cerebro → http://localhost:8787
pnpm --filter @socrates/web dev    # La Oficina  → http://localhost:3000
```

Abre **http://localhost:3000** → te lleva a **La Oficina** con los dos expedientes
sembrados, el panel "Tu equipo", las barras de progreso y la barra de Sócrates.

> **Nota:** `pnpm db:migrate` ya ejecuta el seed automáticamente al final. El
> paso 2 completo solo es necesario la primera vez (o tras `pnpm db:reset`).

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
| `pnpm test` | Corre los tests co-locados |
| `pnpm db:reset` | Borra y resiembra la base local (SQLite) |
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

## Base de datos: SQLite en dev, Postgres en producción

- **Desarrollo:** SQLite local en `packages/db/prisma/dev.db` — corre **sin Docker**.
- **Producción:** Postgres en Railway. Para migrar, se cambia el `provider` del
  esquema a `postgresql` y la `DATABASE_URL` a la cadena de Railway (los enums se
  guardan como texto, validados por la capa de aplicación; el contenido del
  reporte como JSON — el mismo código sirve para ambos).

---

## Stack

Next.js 15 (App Router) · Hono · Prisma · SQLite (dev) / Postgres (prod) ·
Clerk (auth) · Vercel AI Gateway + AI SDK (IA) · Tavily (búsqueda) ·
Cloudflare R2 (PDFs) · pnpm + Turborepo · TypeScript end-to-end · español en
toda la superficie.

Ver `STATUS.md` para qué quedó hecho, qué falta para Stage 3, y las llaves
pendientes.
