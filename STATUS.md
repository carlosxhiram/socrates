# STATUS — Socratia

Fecha: 2026-07-19 · Director de ingeniería: Fable · Fase: producto vivo en producción (Railway + Vercel) con **el motor real ya fusionado** (PR #19: encargar → worker → los 6 empleados producen → aprobar) · Único frente en vuelo: rediseño de la landing (PR #34, draft) · El mapa histórico (congelado al 2026-07-03): `PLAN-DE-ORQUESTACION.md`

> Resumen de una línea: **desde el checkpoint del 2026-07-03 (PRs #1–#8) se
> fusionaron 25 PRs más a `master` (#9–#33): Sesiones, Onboarding +
> cobro Stripe, superficie 100% en español, renombre completo de marca a
> SOCRATIA con blindaje legal (Términos/Aviso + consentimiento versionado por
> documento), nombres propios editables para los 6 empleados de cada oficina,
> el API vive en Railway (arranca con `node` puro, sin `tsx`, imagen
> adelgazada) con la web en Vercel, el catálogo curado creció a 18
> instituciones (Finkargo la última, PR #33), y —lo grande— el PR #19, el
> motor real (encargar trabajo, worker, los 6 empleados produciendo
> entregables, aprobar con Gate C-3), se FUSIONÓ el 2026-07-18 a las 23:43.
> El equipo dejó de ser aparador: la maquinaria que lo hace trabajar de
> verdad ya vive en `master`.**
>
> Para quien siga este trabajo: la doctrina y trampas del terreno viven en
> `CLAUDE.md`; el mapa histórico completo (congelado al checkpoint) en
> `PLAN-DE-ORQUESTACION.md`. **El estado vivo de PRs es GitHub, no esta
> tabla** — corre `gh pr list --state all` antes de asumir nada.

---

## Nota de historia: el PR #19 sí se cerró (después de un largo estancamiento)

Este documento nació el 2026-07-18 describiendo el PR #19 como estancado:
sin un commit desde el 2026-07-06 y en `CONFLICTING` contra `master`. Esa
foto fue **cierta hasta la noche del 2026-07-18**. Después se resolvió el
conflicto y **el PR #19 se fusionó a `master` el 2026-07-18 a las 23:43**
(`gh pr view 19` → `MERGED`). Se deja constancia aquí porque las versiones
viejas de este archivo (y de `DECISIONES-PARA-CARLOS.md`) todavía hablan del
#19 como "trabajo terminado esperando una decisión de merge": ya no. La
decisión se tomó, el merge ocurrió, la maquinaria está en `master`.

---

## Qué está fusionado en `master` hoy (PRs #9–#33; el checkpoint 2026-07-03 con #1–#8 sigue documentado en `PLAN-DE-ORQUESTACION.md`)

### Ola 1 (2026-07-04 a 2026-07-05) — Sesiones, cobro y superficie en español

| PR | Qué entrega |
|---|---|
| [#9 Sesiones](https://github.com/carlosxhiram/socrates/pull/9) | Chat del Asesor con Sócrates (replantado sobre la arquitectura del checkpoint: Postgres nativo, `ai@5`+Gateway); tenencia por `asesorId` del token; sin llave de IA, Sócrates degrada a un acuse honesto — nunca truena. |
| [#10 Onboarding + cobro Stripe](https://github.com/carlosxhiram/socrates/pull/10) | Landing pública, recibimiento de 3 pasos, suscripción mensual con periodo de prueba; wrapper de Stripe + webhook firmado + muralla de suscripción server-side; sin llaves de Stripe corre en modo demo honesto. |
| [#11 Addendum de herencia](https://github.com/carlosxhiram/socrates/pull/11) | Cierre de las 2 decisiones que bloqueaban el cobro: `past_due` → estado **gracia** (solo lectura, `402 PAGO_PENDIENTE` al escribir) y copy "Pago seguro y cifrado" (NFR-14, sin nombrar al procesador). |
| [#12 Landing v2](https://github.com/carlosxhiram/socrates/pull/12) | Reencuadre de venta ("un equipo para tu oficina"), logotipo y footer profesional. |
| [#13 Deploy fixes](https://github.com/carlosxhiram/socrates/pull/13) | `/nosotros` pública en el proxy + restaura `.vercelignore`. |
| [#14 Favicon](https://github.com/carlosxhiram/socrates/pull/14) | Favicon de marca (tortuga verde salvia). |
| [#15 Caja en español](https://github.com/carlosxhiram/socrates/pull/15) | `locale: "es-419"` en el Checkout de Stripe + email precargado (se fija al crear el Customer, no como `customer_email`) — hallazgo de un recorrido E2E real contra Stripe test. |
| [#16 Acceso en español](https://github.com/carlosxhiram/socrates/pull/16) | Pantallas de acceso/registro de Clerk en español dentro de la app. |
| [#17 BarraComando↔Sesiones](https://github.com/carlosxhiram/socrates/pull/17) | La barra de comando de la oficina ya no pierde el encargo: queda conectada a Sesiones. |
| [#18 Ficha del Asesor](https://github.com/carlosxhiram/socrates/pull/18) | Nombre/email reales del Asesor al asegurar su fila desde Clerk. |

### PR #19 ("El equipo en marcha") — fusionado el 2026-07-18

Se abrió el 2026-07-06 entre la Ola 1 y la Ola 2, se estancó doce días y
finalmente **se fusionó a `master`** la noche del 2026-07-18. Detalle de lo
que trae, abajo en su sección dedicada.

### Ola 2 (2026-07-14 a 2026-07-15) — Renombre a SOCRATIA + blindaje legal

| PR | Qué entrega |
|---|---|
| [#20 Equipo con nombre propio](https://github.com/carlosxhiram/socrates/pull/20) | Las 6 tarjetas pasan de "6 especialistas" a nombre humano + rol (Diego·Prospector, Hiram·Investigador, Jair·Asesor de producto, Katya·Negociadora, María·Trámites, Paula·Gestora); landing viva con 4 gráficos animados (Hero, equipo, Cómo funciona). |
| [#21 SOCRATIA: renombre + legal + consentimiento](https://github.com/carlosxhiram/socrates/pull/21) | Tras el dictamen de marca, el producto opera como **SOCRATIA** (femenino) en toda la superficie. Páginas `/terminos` y `/aviso-de-privacidad` (v1.0). Consentimiento **obligatorio y versionado**: 2 casillas en el registro, la muralla de suscripción exige consentimiento vigente (incluida `/sesiones`, el chat), subir la versión de un documento re-pide firma a todos, guardia fail-closed server-side (`409 FALTA_CONSENTIMIENTO`). |
| [#22 ComoFunciona a 2 columnas](https://github.com/carlosxhiram/socrates/pull/22) | Rediseño + corrige la conversación animada que se quedaba muda (`overflow-hidden` sobre el header). |
| [#23 Footer sin afiliación con SOC](https://github.com/carlosxhiram/socrates/pull/23) | Corrección legal de superficie: el pie de página ya no insinúa afiliación con SOC. |
| [#24 Título de pestaña](https://github.com/carlosxhiram/socrates/pull/24) | Corrige el título duplicado de la pestaña en `/nosotros`. |
| [#25 Nota de trampas del terreno](https://github.com/carlosxhiram/socrates/pull/25) | Documenta (en `CLAUDE.md`) no anidar animaciones por-scroll propias dentro de `RevelarAlScroll`/`ListaEscalonada`. |
| [#26 El gerente se llama "Sócrates"](https://github.com/carlosxhiram/socrates/pull/26) | Ajuste de personaje: el gerente es **Sócrates** (nombre propio, masculino); la marca/producto sigue siendo **Socratia**. Decisión de Carlos asumiendo el riesgo de marca a sabiendas — el rol interno `SOCRATES` (PK/FK) no se toca. |

### Ola 3 (2026-07-17 a 2026-07-18) — Producción real + nombres de equipo por oficina

| PR | Qué entrega |
|---|---|
| [#27 Railway durable](https://github.com/carlosxhiram/socrates/pull/27) | La config que sostenía el deploy vivía fuera de git (un redeploy limpio lo habría roto). `railway.json` + `.railwayignore` a `master`; Dockerfile instala `openssl`/`ca-certificates` (Prisma caía a un motor `1.1.x` sin ellos); `healthcheckTimeout` 30→300 (la migración inicial mataba el contenedor a medias). Verificado con `railway up --ci`: deploy Online, `/health` 200. |
| [#28 API arranca con `node` puro](https://github.com/carlosxhiram/socrates/pull/28) | Salda la deuda del #27: `@socrates/db` se compila a JS real (con su cliente Prisma copiado a `dist/generated`); `@socrates/api` se empaqueta con `tsup` incrustando `@socrates/shared` (evita tocar el paquete que la web transpila). El contenedor arranca con `node apps/api/dist/index.js`, ya no con `tsx`. Verificado con `docker build` + `docker run` contra Postgres limpio: 4 migraciones aplicadas, `/health` 200. |
| [#29 Imagen adelgazada](https://github.com/carlosxhiram/socrates/pull/29) | El runtime copiaba TODO `/app` (957 MB, incl. herramientas de build). Ahora reinstala solo `--prod` y copia únicamente los artefactos compilados. **Nota de honestidad**: el propio PR decía "NO fusionar hasta validar el arranque" y dejaba esa prueba pendiente por inestabilidad de Docker Desktop local; se fusionó igual — la validación de arranque post-adelgazamiento vive en el deploy real de Railway, no en un log de esta sesión. Vale la pena confirmarlo con un `/health` fresco si no se ha hecho ya. |
| [#30 Nombres de equipo por oficina](https://github.com/carlosxhiram/socrates/pull/30) | Cada asesor renombra a sus 6 empleados (solo nombre, sin avatar); Sócrates no se renombra. Fuente única en `@socrates/shared` (glosario), campo `Asesor.nombresEquipo Json?` (merge parcial), `PATCH /yo/equipo` con validación zod, editor inline en el Panel de Equipo y en el onboarding, propagado a expedientes/entregables. Verificado: 11/11 tareas de turbo, **54/54** test:integracion, 35/35 unitarios de `shared`, flujo en vivo en modo demo. |
| [#31 STATUS/DECISIONES al día](https://github.com/carlosxhiram/socrates/pull/31) | Puso los documentos de estado al corriente con la realidad tras el PR #30. |
| [#32 Deuda chica](https://github.com/carlosxhiram/socrates/pull/32) | Saldó tres deudas técnicas: metadato del catálogo, la carrera de `turbo.json` (typecheck vs. su propio build) y la config de seed migrada a `prisma.config.ts` (Prisma 7). |
| [#33 Finkargo al catálogo](https://github.com/carlosxhiram/socrates/pull/33) | Institución #18 del catálogo curado; su tasa pendiente queda marcada como supuesto (convención del catálogo). Solo Carlos cura el catálogo. |

### Ola 4 (2026-07-19) — en vuelo, sin fusionar

| PR | Qué entrega | Estado |
|---|---|---|
| [#34 Rediseño de la landing](https://github.com/carlosxhiram/socrates/pull/34) | Iteración 1 "startup con inversión": fundamentos de tokens (paleta Tavily aplicada a la marca propia, radios por nivel, altura de control 44px, curva de motion única centralizada, Geist Mono en eyebrows/cifras, logomark real la tortuga en vez del emoji) + rediseño de la portada (tipografía disciplinada peso 500, profundidad por hairline, composición editorial). **No toca ninguna pantalla de producto** (/oficina, /entregables, /sesiones, /bienvenida, Clerk). | **DRAFT**, mergeable, preview verde en Vercel — esperando el OK visual de Carlos. |

---

## En vuelo: PR #19 — "El equipo en marcha" (construido, probado, sin fusionar)

**[PR #19](https://github.com/carlosxhiram/socrates/pull/19)** (`claude/socrates-carril-api` → `master`, **MERGED 2026-07-18 23:43**,
abierto 2026-07-06) construye exactamente lo que el negocio necesita para
que el equipo deje de ser aparador, y ya vive en `master`:

- `POST /expedientes/:id/tareas` — encargar trabajo a un rol (tenencia, expediente-no-cerrado, anti-duplicado).
- Worker in-process: reclama Tareas vía `UPDATE...WHERE id=(SELECT...FOR UPDATE SKIP LOCKED)` (atómico entre instancias), concurrencia máx. 2, timeout 20 min → BLOQUEADA digna, recupera huérfanas al arrancar.
- `POST /socrates/instruir` + `/confirmar` — Sócrates propone un plan (o pregunta si es ambiguo), el Asesor confirma; nunca ejecuta solo.
- Los 6 empleados reales: el Investigador con su pipeline de 6 fases (citas que solo quedan "verificadas" si la URL viene de una búsqueda real de esa corrida — nunca por la palabra de la IA); los otros 5 con `EntregableGenericoV1` y la misma disciplina de citas honestas.
- La oficina (web): las 6 tarjetas con botón "Encargar" → progreso en vivo (polling 5s/30s) → botón "Aprobar" (Gate C-3 con versión).
- El proveedor de IA cambia de Vercel AI Gateway a **Anthropic directo** (`ANTHROPIC_API_KEY` en vez de `AI_GATEWAY_API_KEY`) — este cambio SOLO existe en esta rama; `master` sigue en AI Gateway (ver `DECISIONES-PARA-CARLOS.md`).

El PR reportó 57/57 pruebas de integración verdes y un recorrido en vivo con
Playwright de punta a punta antes de fusionarse. Como se resolvió el
conflicto y se mergeó a `master`, esas capacidades ya no son "de otra rama":
están en la base canónica. Conviene una re-verificación fresca de la batería
completa sobre `master` para confiar en los números post-merge.

El propio PR dejó 3 preguntas abiertas para Carlos (ver
`DECISIONES-PARA-CARLOS.md` para el contexto completo): falta la llave de
IA en producción, la UI de chat "Sócrates propone y confirma" no está
conectada (el encargo directo por tarjeta sí cubre la misma capacidad de
negocio), y el campo "Tu nombre" personal no se captura en el onboarding.

---

## Deuda técnica vigente (verificada en el código de `master` hoy, no asumida)

1. ~~**Metadato del catálogo desalineado consigo mismo**~~ — **saldado por el PR #32** (deuda chica). El metadato de `catalogo-soc.json` se realineó con lo realmente sembrado.
2. ~~**`turbo.json`: `typecheck` no depende de su propio `build`**~~ — **saldado por el PR #32**: la carrera flaky (typecheck de `web` leyendo `.next/types` a medias) quedó corregida en la config de turbo.
3. **`lint` ≡ `typecheck` duplicados**: en `packages/db`, `packages/shared` y `apps/web` son literalmente el mismo comando (`tsc ... --noEmit`); en `apps/api`, `lint` es un subconjunto de `typecheck` (le falta `tsconfig.tests.json`). Redundancia de CI, no un bug.
4. ~~**Config de seed deprecada para Prisma 7**~~ — **saldado por el PR #32**: la config de seed se migró de `package.json#prisma.seed` a `prisma.config.ts`.
5. **`Dockerfile` con `--frozen-lockfile=false`** en las dos instalaciones (`deps` y `runtime`) — presente incluso después de los PRs #27–#29 que tocaron el mismo archivo esta semana; no es deuda vieja olvidada, es una bandera que sigue ahí a propósito o por descuido, vale la pena decidir cuál.
6. **Metadato del reporte sembrado** (Probemedic): `indiceCobertura` declara `totalAfirmaciones: 11, verificadas: 6, estimaciones: 3, brechas: 2` — consistente internamente, pero la auditoría del checkpoint encontró que el contenido real tiene menos afirmaciones de las que el índice presume. Sin tocar desde el commit fundacional.
7. **Gate C-3, FR-5 y `PanelEquipo` honesto — la maquinaria llegó con el PR #19 (ya fusionado)**: el botón "Aprobar" con versión, los filtros + polling ligero (`usar-polling.ts`) y el estado del equipo derivado de Tareas reales vivían en el #19 mientras estaba sin fusionar. Con el merge del 2026-07-18 esa maquinaria ya está en `master`; lo que falta es **re-verificarla en el código y en producción** antes de darla por cerrada (no asumir que quedó, confirmarlo).
8. **DTOs vivos**: `apps/web/src/lib/api-client.ts` sigue haciendo `(await resp.json()) as T` sin validar con zod contra los esquemas de `shared/dto` — confirmado en el código hoy. La excepción es el contenido de entregables (`ReporteV1Schema.safeParse`), que sí se valida por venir de datos variables/generados.

---

## Llaves y decisiones que faltan de Carlos

Ver **`DECISIONES-PARA-CARLOS.md`** (ojo: ese documento aún puede hablar del
PR #19 como decisión pendiente — **ya se fusionó**; conviene una poda para
alinearlo con esta realidad). Lo que sigue genuinamente esperando a Carlos:
la llave de IA en producción y qué variable exacta espera cada proveedor,
el mapa de Etapas, la curaduría del catálogo, el metadato del reporte
sembrado, los umbrales del PRD y la profundidad del Negociador, y —lo
inmediato— el **OK visual del PR #34** (rediseño de la landing) para sacarlo
de draft. **El estado vivo de PRs es GitHub, no esta tabla** — antes de
actuar sobre cualquier fila de arriba, confirma con `gh pr list --state all`
que sigue siendo cierta.
