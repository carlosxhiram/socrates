# Imagen base Debian (no alpine) — Puppeteer en E4 lo requiere (decisiones-bloqueantes B-4).
FROM node:22-bookworm-slim AS base
RUN corepack enable
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
# En producción: corre migraciones de Postgres y arranca.
#   prisma migrate deploy && node apps/api/dist/index.js
CMD ["sh", "-c", "pnpm --filter @socrates/db exec prisma migrate deploy && node apps/api/dist/index.js"]
