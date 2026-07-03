# STATUS — Sócrates

Fecha: 2026-07-03 · Director de ingeniería: Fable · Fase: CHECKPOINT fusionado (auditoría + endurecimiento post-E1) · El mapa de lo que sigue: `PLAN-DE-ORQUESTACION.md`

> Resumen de una línea: **checkpoint FUSIONADO a master (PRs #1–#5, #7, #8, con
> autorización de Carlos): Postgres en dev y prod, Next 16, máquina de Etapas y
> candados de seguridad en el servidor bajo 20 tests de integración verdes, La
> Oficina crea/edita/cierra expedientes con citas visibles en el Reporte — sin
> llaves, sin deploy, sin tocar el catálogo. Batería completa corrida sobre el
> master integrado: 11/11 tareas verdes y la app tocada en vivo.**
>
> Para quien siga este trabajo (Opus/Sonnet): el mapa completo de etapas,
> doctrina y trampas del terreno vive en **`PLAN-DE-ORQUESTACION.md`**; las
> reglas duras operativas, en **`CLAUDE.md`**.

---

## Primero, la verdad: discrepancias encontradas al tomar la batuta

1. **El repo estaba en E1, no en E7.** El encargo afirmaba que E7 había dejado
   las compuertas C-1/C-2/C-3 bajo tests, worker durable con locking y
   deploy-prep. Realidad verificada: un solo commit (Cimientos E1), **cero**
   tests de compuertas, **ningún** worker, **ningún** script `test:integracion`.
2. **"Postgres local ya migrado y sembrado por el setup script" era falso.**
   El servicio estaba apagado y no existían ni el rol ni la base `socrates`
   (los creé a mano). El esquema Prisma era SQLite: la api arrancaba con
   `db:"error"` en este mismo entorno.
3. **El clon fresco no corría**: `pnpm db:migrate` fallaba (P1012) porque el
   `.env` de Prisma nunca se versionó.
4. El entorno exporta `NODE_ENV=development` globalmente, lo que **rompe el
   build de Next 16** (aislado con app mínima; mitigado en el script de build).

---

## ✅ Verificado de verdad (corrido, no asumido)

| Prueba | Resultado |
|---|---|
| `pnpm install --frozen-lockfile` | OK |
| `pnpm db:generate` + `pnpm db:deploy` | OK — migración inicial re-cortada a **Postgres** aplicada al Postgres local |
| `pnpm db:seed` | OK — 7 empleados, 17 instituciones, 22 productos, 2 expedientes, Reporte Probemedic APROBADO |
| `pnpm turbo run typecheck build test` | OK — verde en los 4 paquetes |
| `pnpm test:integracion` (script NUEVO) | OK — db 4/4 (seed idempotente, catálogo fiel, C-1, ReporteV1 desde la BD) + api 16/16 (máquina de Etapas, candados de auth, contrato de error, C-3 con versión) |
| api `/health` sin llaves | `{estado:"vivo", db:"ok", modoSinClavesIA:true}` (NFR-11 vivo) |
| api con Postgres APAGADO | arranca, `/health` **HTTP 503** honesto con `db:"error"`, rutas degradan con mensaje de oficina — no truena |
| Carrera TOCTOU en PATCH | reproducida en vivo (GANADO+PERDIDO concurrentes ambos 200) y **cerrada** (candado optimista: uno 200, otro 409, estado final consistente) |
| La Oficina en navegador real (Playwright) | crear expediente → detalle → "Avanzar a Investigado" bloqueado con mensaje de prerrequisito → editar datos con confirmación → Ganado con motivo → tarjeta en la lista |
| Build Next 16 (rama #2) | 2/2 estable con `--webpack` + `NODE_ENV=production`; `ƒ Proxy` detectado; Turbopack documentado flaky en máquinas chicas |
| Lenguaje de oficina (NFR-14) | mensajes nuevos del servidor y de la UI en español de oficina; tests lo afirman (`doesNotMatch(/enum|state|transition/)`) |

## ⚠️ Verificado a medias (honestidad ante el límite de sesión)

- **Auditoría multi-agente (7 dimensiones):** ~74 hallazgos preliminares;
  60 veredictos adversariales alcanzaron a correr (44 confirmados / 16
  refutados) antes de que el límite de uso cortara a los verificadores. Lo
  confirmado de seguridad y correctness está corregido en los PRs; la cola de
  UX/silent-failures quedó como **plausible, sin doble verificación** y vive en
  el backlog de abajo.

---

## Qué quedó hecho (esta sesión) — en PRs chicos, uno por propósito (TODOS fusionados)

| PR | Qué entrega | Base |
|---|---|---|
| [#1 Postgres en dev y prod](https://github.com/carlosxhiram/socrates/pull/1) | provider `postgresql`, migración inicial re-cortada (cero cartas enviadas: verificado que la migración SQLite jamás llegó a base compartida), `packages/db/.env` versionado (clon fresco reproducible), tests de integración del seed con guardia anti-producción | master |
| [#2 Next 15→16](https://github.com/carlosxhiram/socrates/pull/2) | `middleware.ts`→`proxy.ts` (Clerk ≥6.34 lo soporta; verificado contra npm/changelog), next 16.2.10 (nunca <16.2.6 por GHSA-26hh-7cqf-hhc6), build endurecido contra `NODE_ENV` contaminado y Turbopack flaky | master |
| [#3 Máquina de Etapas (FR-7)](https://github.com/carlosxhiram/socrates/pull/3) | transiciones válidas en el servidor, prerrequisito de Investigado (Reporte APROBADO), Ganado/Perdido manual, terminales cerrados, candado optimista anti-carrera, `progreso` persistido honesto | #1 |
| [#4 E2 UI](https://github.com/carlosxhiram/socrates/pull/4) | "Nuevo expediente", editar datos del prospecto, Ganado/Perdido con confirmación, errores 409 mostrados tal cual (mensaje de oficina); enlaces solo http(s) | #3 |
| [#5 Endurecimiento api](https://github.com/carlosxhiram/socrates/pull/5) | candado de producción del modo demo (fail-open cerrado), fail-closed con Clerk parcial, `authorizedParties`, `/health` 503 honesto, contrato de error en español, C-3 con fijado de versión | #3 |
| [#7 La Oficina honesta](https://github.com/carlosxhiram/socrates/pull/7) | citas visibles junto a cada cifra del Reporte (NFR-1 en superficie), estados de error veraces (api caída ≠ oficina vacía ≠ archivero degradado), error.tsx es-MX, accesibilidad (progressbar/aria/foco), fechas es-MX sin desfase | #4 |
| [#8 Capa de IA activable](https://github.com/carlosxhiram/socrates/pull/8) | dependencias del Gateway verificadas contra npm (la ruta documentada NO podía funcionar: provider v1 vs v2), contrato `generarTexto` tipado sin strings-centinela, `clave_invalida` distinguida de fallo temporal | master |

**Fusionados a master el 2026-07-03** en el orden #1 → #3 → #4 → #5 → #7 → #2 → #8 (el lockfile de #8 se reconcilió con #2 antes del merge); #6 es esta documentación.

---

## Decisiones de Director tomadas (documentadas en código y addendums)

1. **Postgres también en desarrollo** (paridad con arquitectura §7 y con este
   entorno; el espíritu "sin Docker, sin llaves" se conserva). Addendum en
   `decisiones-bloqueantes.md`; la decisión "SQLite en dev" quedó superada
   hacia adelante.
2. **Máquina de Etapas con dos defaults nuevos a confirmar con Carlos (I-1b):**
   retroceder es válido (corregir es honesto); Ganado/Perdido no se reabren por
   la vía normal. Prerrequisito implementado: solo `→ Investigado` (Reporte
   APROBADO); el resto del mapa I-1 llega con E4/E5.
3. **El modo demo es primera clase pero con candado**: automático en
   desarrollo, opt-in explícito (`MODO_ASESOR_DEMO=1`) en producción.

---

## Pendiente (backlog priorizado, avanzable sin llaves)

1. **Gate C-3 en la UI**: el visor no tiene botón "Aprobar" (el endpoint existe
   y ahora exige versión); es la mitad UI de E4-S8.
2. **FR-5 completo**: filtros "esperando mi revisión"/por Etapa + polling
   (5–10 s) en La Oficina (E2-S2/S3).
3. **PanelEquipo honesto**: hoy muestra "Libre" con tarea BLOQUEADA y "Entregó"
   se queda pegado (hallazgo plausible, sin doble verificación).
4. **DTOs vivos**: la api no valida sus respuestas contra los esquemas Zod y el
   cliente web castea con `as`; conviene `parse` en el borde (anti-drift).
5. Deuda menor confirmada: `turbo.json` sin dependencia typecheck→generate
   (carrera en clon fresco), Dockerfile con `--frozen-lockfile=false`,
   `lint`≡`typecheck` duplicado, config de seed deprecada para Prisma 7.
6. **E3/E4 (worker + Investigador)**: siguen siendo el corazón pendiente; el
   PoC del Investigador requiere la llave de IA (decisión de Carlos).

---

## Llaves y decisiones que faltan de Carlos

Ver **`DECISIONES-PARA-CARLOS.md`** (nuevo, en la raíz): llaves por pegar y qué
enciende cada una, banderazos de deploy, decisiones de producto (mapa de
Etapas, catálogo/ids `soc_*`, métrica de cobertura del reporte sembrado) y
recomendaciones de entorno. Nada de eso se ejecutó: está preparado, no hecho.

---

## Notas de datos (sin cambios)

- Catálogo curado v1: 17 instituciones / 22 productos reales; el `_meta` del
  JSON sigue diciendo "37" (inexactitud del metadato, no de los datos).
- El Reporte sembrado de Probemedic conserva ids placeholder `soc_*` sin fila
  `Recomendacion` (C-1 respetado por diseño y ahora **afirmado por test**).
