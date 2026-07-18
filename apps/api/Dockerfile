# Imagen base Debian (no alpine) — Puppeteer en E4 lo requiere (decisiones-bloqueantes B-4).
FROM node:22-bookworm-slim AS base
# OpenSSL: Prisma lo necesita para elegir el motor de consulta correcto (Debian
# bookworm trae openssl 3.x). Sin él, Prisma avisa "may not work as expected" y
# cae en un motor 1.1.x por defecto — funciona de milagro. ca-certificates: TLS
# contra el Postgres (imagen postgres-ssl). Se instala en la base para que el
# generate (etapa build) y el runtime detecten el MISMO motor (openssl-3.0.x).
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
# Clava pnpm en la imagen: sin esto corepack lo descarga en CADA arranque en
# frío del contenedor (dependencia de red al boot y latencia extra).
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate
WORKDIR /app

# ── Dependencias del monorepo ────────────────────────────────────────────────
FROM base AS deps
COPY pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
COPY packages/db/package.json ./packages/db/
RUN pnpm install --frozen-lockfile=false

# ── Build ─────────────────────────────────────────────────────────────────────
FROM deps AS build
COPY . .
# db se compila a JS (genera cliente Prisma + emite dist + copia el cliente
# generado con su motor a dist). Debe ir ANTES del API: el bundle del API deja
# @socrates/db externo y node lo resuelve en runtime desde packages/db/dist.
RUN pnpm --filter @socrates/db build
RUN pnpm --filter @socrates/api build

# ── Runtime (imagen delgada) ─────────────────────────────────────────────────
# NO copia todo /app. Reinstala SOLO dependencias de producción (deja fuera
# tsx/tsup/turbo/typescript, que solo sirven para construir) y trae únicamente
# los artefactos ya compilados. prisma (CLI) vive en las dependencies de
# @socrates/db porque el arranque corre `prisma migrate deploy`.
FROM base AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/package.json /app/pnpm-workspace.yaml /app/pnpm-lock.yaml ./
COPY --from=build /app/apps/api/package.json ./apps/api/
COPY --from=build /app/packages/db/package.json ./packages/db/
COPY --from=build /app/packages/shared/package.json ./packages/shared/
RUN pnpm install --prod --frozen-lockfile=false && pnpm store prune
# Artefactos compilados: el bundle del API (con @socrates/shared incrustado), el
# JS de db con su cliente Prisma + motor, y el schema+migraciones para migrar.
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/packages/db/dist ./packages/db/dist
COPY --from=build /app/packages/db/prisma ./packages/db/prisma
# En producción: corre migraciones de Postgres y arranca con "node" puro (sin tsx).
#   prisma migrate deploy && node apps/api/dist/index.js
CMD ["sh", "-c", "pnpm --filter @socrates/db exec prisma migrate deploy && node apps/api/dist/index.js"]
