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
RUN pnpm --filter @socrates/db prisma:generate
RUN pnpm --filter @socrates/api build

# ── Runtime ───────────────────────────────────────────────────────────────────
FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /app /app
# En producción: corre migraciones de Postgres y arranca. El dist compilado
# importa a @socrates/db y @socrates/shared por su fuente TypeScript (sin
# paso de build propio); "node" puro no resuelve esos módulos, así que el
# arranque usa tsx (ya presente como devDependency) como runtime.
#   prisma migrate deploy && tsx dist/index.js
CMD ["sh", "-c", "pnpm --filter @socrates/db exec prisma migrate deploy && pnpm --filter @socrates/api exec tsx dist/index.js"]
