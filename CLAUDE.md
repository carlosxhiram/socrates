# Sócrates — guía para el modelo que trabaje este repo

Eres parte del equipo de ingeniería de Sócrates (SOC | TALENT). Antes de tocar
código, lee en este orden: **`PLAN-DE-ORQUESTACION.md`** (el mapa completo, la
doctrina y la etapa en curso), **`STATUS.md`** (dónde vamos de verdad) y
**`DECISIONES-PARA-CARLOS.md`** (lo que está bloqueado esperando a Carlos).

## Reglas duras (violarlas invalida el PR, sin discusión)

1. **NFR-11**: la app SIEMPRE arranca sin llaves externas. Ningún cambio puede
   requerir una llave para arrancar; sin llave se degrada honesto.
2. **NFR-14**: cero jerga de IA o técnica en la superficie del producto (nada
   de "IA/modelo/prompt/agente/token/API/servidor/base de datos"; la metáfora
   es una oficina — "archivero", "equipo", "encargo", "entregable").
3. **NFR-12**: español de México impecable en superficie, comentarios, commits.
4. **Las compuertas C-1/C-2/C-3 son el foso**: fortalécelas si quieres; jamás
   las debilites ni las rodees. C-1: solo se recomienda lo que existe en el
   Catálogo (FK real). C-2: citas verificadas con auditoría. C-3: nada sale al
   cliente sin aprobación humana (y de la versión VISTA).
5. **El catálogo es sagrado**: NO inventes instituciones, productos ni
   condiciones. Los ids `soc_*` del reporte sembrado se quedan sin resolver
   (a propósito). Solo Carlos cura el catálogo.
6. **Nada de producción sin banderazo de Carlos**: no deploys, no bases
   remotas. Los tests de integración tienen guardia anti-producción — respétala.
7. **Migraciones hacia adelante**; jamás reescribir historial aplicado. Nada
   de secretos en commits.

## Cómo se trabaja (resumen; el detalle en PLAN §3 y §8)

- Un PR = un propósito = una rama `claude/socrates-<proposito>`; ramas
  apiladas se trabajan en worktrees propios (`git worktree add`).
- TDD: integración en `apps/api/tests-integracion/` (app Hono en proceso con
  `app.request()`, Postgres local); unitarios junto al código en `shared`.
  Los tests que necesitan base NUNCA van en `src/*.test.ts` (node --test los
  descubriría).
- Antes de cerrar un PR: revisión adversarial + batería verde + **flujo tocado
  en vivo** (curl/Playwright, chromium en `/opt/pw-browsers/chromium`).
- Commits en español con sección "Verificado corriendo:" que solo lista lo que
  DE VERDAD se corrió.
- División de modelos: Sonnet implementa con spec cerrada; Opus revisa y
  diseña; pocas flotas, bien especificadas (los enjambres grandes agotan la
  sesión).

## Comandos (la batería completa vive en PLAN §7)

```bash
service postgresql start   # el contenedor recicla Postgres al dormir
pnpm install --frozen-lockfile && pnpm db:generate && pnpm db:deploy && pnpm db:seed
pnpm turbo run typecheck build test && pnpm test:integracion
pnpm --filter @socrates/api dev    # :8787 (health DB-aware, 503 si db caída)
pnpm --filter @socrates/web dev    # :3000 (modo asesor demo sin llaves)
```

## Trampas del terreno (lista completa en PLAN §6)

`NODE_ENV=development` global rompe builds de Next (no quites el
`NODE_ENV=production` del script build) · puertos zombis: `fuser <p>/tcp` y
mata antes de re-arrancar · `.next` viejo entre versiones = builds rotos ·
la CLI de Prisma solo lee `packages/db/.env` · el proxy de egress bloquea
`ai-gateway.vercel.sh` (verificación con llave real ⇒ sesión local).
