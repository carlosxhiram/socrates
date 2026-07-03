# PLAN DE ORQUESTACIÓN — El mapa del tesoro de Sócrates

Autor: Fable (Director de ingeniería) · Fecha: 2026-07-03 · Para: **Opus y Sonnet**,
que se quedan a cargo cuando Fable ya no esté. Y para Carlos, que dirige.

> Cómo usar este mapa: léelo COMPLETO antes de tocar código. Después, en cada
> sesión: (1) lee `CLAUDE.md` (reglas duras), (2) lee `STATUS.md` (dónde vamos
> de verdad), (3) toma la siguiente etapa de este plan que no esté cerrada,
> (4) trabaja con la doctrina de la §3, (5) actualiza `STATUS.md` con el mismo
> formato honesto al cerrar. Este documento NO se reescribe: se le añaden
> addendums fechados al final si el rumbo cambia.

---

## 1. El norte (léelo aunque tengas prisa)

Sócrates es una **oficina virtual** para el asesor financiero de SOC | TALENT:
Sócrates (el gerente, una tortuga) y 6 empleados de IA trabajan los expedientes
de sus prospectos PYME. **La calidad/precisión ES el producto**: el único veneno
mortal es una cifra mal citada o una institución/producto inventado llegando al
cliente. Todo lo demás es negociable; esto no.

El foso son las **tres compuertas** (código de servidor, no UI):
- **C-1 Fidelidad de catálogo**: solo se recomienda lo que existe en la tabla
  del Catálogo (FK real). Cero alucinación.
- **C-2 Verificación de citas**: segundo pase que confirma que cada cita
  respalda su afirmación; lo no respaldado se degrada a Brecha, con auditoría.
- **C-3 Gate humano**: nada sale al cliente sin aprobación del Asesor; el
  export verifica APROBADO en el servidor (y desde el checkpoint, la versión
  que el humano VIO).

Reglas duras que ningún PR puede violar (ver `CLAUDE.md` para la lista
operativa): NFR-11 (arranca SIEMPRE sin llaves), NFR-14 (cero jerga de IA en
la superficie), NFR-12 (es-MX impecable), el catálogo es sagrado (solo Carlos
agrega instituciones/productos/condiciones), migraciones hacia adelante,
nada de producción sin banderazo de Carlos.

Documentos fuente (no los dupliques, cítalos): PRD
`_bmad-output/planning-artifacts/prd/prd.md` · arquitectura
`.../architecture/architecture.md` · historias `.../epics/epics-and-stories.md`
· decisiones `.../decisiones-bloqueantes.md` (con addendums I-1b y Postgres).

---

## 2. Dónde estamos (checkpoint 2026-07-03, verificado corrido)

> **Base canónica: `master`** (commit del checkpoint). Los PRs #1–#8 están
> fusionados AHÍ. Las ramas `claude/socrates-*` restantes son historia
> fusionada: no trabajes desde ellas (algunas tienen árboles pre-checkpoint
> que contradicen este documento). El estado vivo de PRs se consulta en
> GitHub, no en tablas de documentos.

**Hecho y fusionado a `master`** (PRs #1–#5, #7, #8 — detalles en `STATUS.md`):
- Monorepo pnpm+Turborepo: `apps/web` (Next 16, `proxy.ts`), `apps/api` (Hono),
  `packages/shared` (glosario, DTOs Zod, ReporteV1, etapas, contrato de
  Empleado), `packages/db` (Prisma 6 + **Postgres dev y prod** + seed realista).
- **Espina E2 completa**: crear/listar/detallar/editar Expedientes desde la UI,
  máquina de Etapas en el servidor (una etapa a la vez, prerrequisito de
  Investigado = Reporte APROBADO, Ganado/Perdido manual, terminales cerrados,
  candado optimista anti-carrera), progreso derivado honesto.
- **Seguridad**: modo demo con candado de producción (`MODO_ASESOR_DEMO=1`
  explícito), fail-closed con Clerk parcial, `authorizedParties` condicional,
  tenencia por `asesorId` derivado del token en TODA ruta.
- **Honestidad operativa**: `/health` 503 con base caída, contrato de error
  `{error:{codigo,mensaje}}` en español en 400/404, visor del Reporte con
  **citas enlazadas** por afirmación, estados viva/degradada/caida en la UI,
  error.tsx/not-found es-MX, accesibilidad base.
- **Capa de IA lista para la llave**: `ai@5` + `@ai-sdk/gateway` (la combinación
  vieja NO podía funcionar), contrato `generarTexto` tipado
  (`sin_claves | clave_invalida | fallo_temporal`), `scripts/verificar-gateway.ts`.
- **Tests**: `pnpm test` (unitarios) + `pnpm test:integracion` (db 4 + api 16,
  contra Postgres local, con guardia anti-producción). TODO verde en el checkpoint.

**Lo que NO existe todavía** (no te confundas con documentos aspiracionales):
Sócrates no interpreta nada (la barra es un acuse honesto), no hay worker, no
hay pipeline del Investigador, no hay export PDF, los 5 empleados restantes no
ejecutan, el catálogo no es editable por UI, no hay deploy.

---

## 3. Doctrina de ejecución (así se trabaja aquí — no es opcional)

1. **Un PR = un propósito = una rama** (`claude/socrates-<proposito>`). PRs
   chicos. Commits atómicos en español. Nunca push a `master` directo.
2. **TDD donde hay lógica**: el test de integración primero (el molde está en
   `apps/api/tests-integracion/` — app Hono en proceso vía `app.request()`,
   Postgres local, guardia anti-producción, limpieza por marcador en
   before/after). Función pura → unitario en `packages/shared`.
3. **Panel adversarial antes de cerrar**: mínimo un revisor Opus con lente
   de correctness/casos-borde Y las reglas del producto. Sus hallazgos se
   aplican hasta ronda limpia. El revisor DEBE verificar ejecutando, no leyendo.
4. **Verificación en el mundo real**: app arrancada y flujo tocado (curl y/o
   Playwright con `/opt/pw-browsers/chromium`), no solo tests verdes. Cada
   commit/PR lista "Verificado corriendo:" con lo que de verdad se corrió.
5. **Reporte honesto**: lo verificado se distingue de lo asumido, SIEMPRE.
   `STATUS.md` mantiene ese contrato; quien lo infle envenena a los que siguen.
6. **División de modelos** (lección aprendida tras tocar el límite de sesión):
   - **Sonnet**: implementación con especificación cerrada (la spec dice
     archivos, reglas, verificación exigida y formato de commit), fixes de
     review bien acotados, migraciones mecánicas.
   - **Opus**: revisión adversarial, diseño de una etapa (proponer, no
     ejecutar), decisiones de trade-off dentro del marco de este plan, y la
     síntesis/actualización de STATUS.
   - Presupuesto: nada de flotas de >4 agentes simultáneos; verificación
     adversarial 1–2 revisores por PR, no paneles de 60.
7. **Datos**: jamás inventar contenido de catálogo ni citas. El seed demo se
   puede resembrar; los expedientes de trabajo real no se tocan. Tests solo
   contra hosts locales (la guardia ya lo impone).
8. **Ante la duda entre rapidez y precisión, gana precisión** (PRD §11).

---

## 4. El mapa por etapas

> Cada etapa cierra con: batería completa verde + flujo tocado en vivo +
> STATUS.md actualizado. El "tamaño" es en PRs chicos esperados.
> Las etapas A y B avanzan SIN llaves. La C es el gate con llave de IA.

### ETAPA A — Cerrar la columna vertebral (sin llaves · ~4 PRs · Sonnet implementa, Opus revisa)

Objetivo: E2/E4-S8 al 100 % en la UI y deuda confirmada a cero, para que el
piloto opere la oficina completa aunque los empleados aún no generen.

- **A1. Gate C-3 en la UI** (E4-S8 mitad UI): botón "Aprobar" en el visor con
  confirmación, enviando `{ version: versionActual }`. OJO: hoy el servidor
  acepta `version` OPCIONAL (si se omite, aprueba lo vigente sin comparar) —
  en este mismo PR hazla **obligatoria en el servidor** (no existen otros
  clientes; romper compat es gratis hoy) para que la garantía "aprobó lo que
  VIO" no dependa de la disciplina de la UI. `409 VERSION_DESFASADA` se
  muestra tal cual. Criterio: flujo Borrador→Aprobado tocado en navegador;
  imposible aprobar una versión no vista NI aprobar sin declarar versión.
- **A2. FR-5 completo**: filtros "Esperando mi revisión" / por Etapa (query
  params camelCase a `GET /expedientes`, filtrado en servidor) + **polling**
  ligero 5–10 s con backoff (`router.refresh()` desde un client component;
  AR-7). Accesibilidad E2-S3: "Esperando mi revisión" primero en el orden de Tab.
- **A3. PanelEquipo honesto**: derivar estado del empleado de sus Tareas
  reales (BLOQUEADA ⇒ nunca "Libre"; "Entregó" con decaimiento o ligado al
  último entregable pendiente de revisión). Hallazgo plausible de la auditoría:
  verifícalo primero, corrígelo después.
- **A4. Deuda menor confirmada**: `turbo.json` (typecheck de web debe depender
  de su build o excluir `.next/types` — hoy es carrera flaky), Dockerfile con
  `--frozen-lockfile` real, `lint`≠`typecheck` o elimínalo, config de seed
  fuera de `package.json#prisma` (deprecada en Prisma 7), DTOs vivos (la api
  `parse`a sus respuestas con los esquemas de `shared/dto` en dev/test).

### ETAPA B — El motor sin IA: worker + Tareas + empleados de utilería (sin llaves · ~4-5 PRs)

Objetivo: la maquinaria de E3 completa y probada con empleados que producen
resultados sembrados/honestos — el día que llegue la llave, solo se cambia el
interior de `ejecutar()`.

- **B1. Worker de Tareas** (E3-S3, arquitectura §6.3): loop en el proceso api;
  toma Tareas `ENCARGADA` con dependencias cumplidas usando
  `SELECT ... FOR UPDATE SKIP LOCKED` (por eso Postgres), marca `EN_CURSO`,
  ejecuta `ejecutar(entrada, ctx)`, persiste Entregable/Bloqueo, marca
  `ENTREGADA`/`BLOQUEADA` con motivo. **I-2**: concurrencia máx 2, timeout
  20 min ⇒ `BLOQUEADA` "tiempo de espera excedido". `idempotencyKey` respetada.
  Tests de integración: carrera de dos workers (SKIP LOCKED), dependencia no
  cumplida no se toma, timeout, reintento retomable. Resiliente a reinicio
  (estado en Postgres, nunca en memoria).
- **B2 (previo). Lector del Catálogo cableado**: `ctx.catalogo: CatalogoLector`
  del contrato D-3 implementado sobre las tablas reales (el seed ya existe) —
  lo consumen los empleados desde B y la compuerta C-1 en D. La UI de
  curaduría para Carlos queda en E3; no la confundas con este lector.
- **B2. Encargo directo** (`POST /expedientes/:id/empleados/:rol/encargar`) +
  empleados **modo sin claves**: cada rol implementa `ejecutar()` devolviendo
  su Entregable sembrado (Probemedic/Las Aliadas) o Bloqueo honesto "sin
  servicio en vivo" — NUNCA texto centinela dentro de un entregable (el
  contrato `ResultadoGenerarTexto` ya lo impide; extiende el patrón).
- **B3. UI de Tareas en vivo**: el detalle del expediente refleja
  Encargada→En curso→Entregada/Bloqueada con el polling de A2; chips de
  empleados activos en las tarjetas ya existen — conéctalos.
- **B4. Sócrates de barra con acuse útil** (pre-IA): la barra crea el encargo
  cuando el texto matchea intenciones simples (regex/heurística honesta:
  "encárgale X al Investigador") y responde con acuse; si no entiende, UNA
  pregunta de vuelta (FR-1 caso límite), sin inventar. El plan confirmable de
  verdad llega en E (con IA). Cuidado NFR-14: nada de "no entendí tu prompt".

### ETAPA C — EL GATE: PoC del Investigador (requiere `AI_GATEWAY_API_KEY` + `TAVILY_API_KEY` · 1 PR de harness + informe)

**No se construye el pipeline caro de E4 sin PoC verde. Este es el riesgo
técnico central (R-1) y la razón de ser del producto.**

- Correr primero `apps/api/scripts/verificar-gateway.ts` con la llave real.
- Harness de PoC: con los datos del expediente Probemedic, generar UN reporte
  con el flujo mínimo (investigar con Tavily → sintetizar contra el catálogo →
  redactar secciones ReporteV1 → verificación de citas simple) y compararlo
  contra el reporte real sembrado (el patrón de calidad).
- **Medir y reportar**: paridad sección por sección (juicio de Carlos, SM-1),
  costo por reporte en USD (NFR-5 — proponer techo), latencia (NFR-6 ≤15 min),
  tasa de afirmaciones con cita válida ANTES del gate humano.
- Salidas posibles: verde (→ Etapa D), amarillo (iterar prompts/modelos:
  `MODELO_PESADO/ESTANDAR/MECANICO` son strings por env), rojo (parar y
  rediseñar con Carlos). El informe del PoC va a `docs/poc/` con formato
  verificado-de-verdad.

### ETAPA D — E4 completo: el Investigador y el Reporte (con llaves · ~6-7 PRs)

Objetivo: el flujo punta de lanza (UJ-3) de producción: pipeline por fases,
compuertas como código probado, editor y PDF.

- **D1. Pipeline por fases con progreso persistido** (D-5, SEIS fases):
  investigar industria → analizar empresa → FODA → matchear catálogo →
  **marcar Brechas de información** → redactar → verificar. Cada fase persiste
  su resultado parcial (retomable tras fallo, decisión #1 de casos borde); la
  UI muestra progreso por fase (FR-8). Invariante de la redacción (FR-9): cada
  afirmación cuantitativa SALE del redactor con su cita adjunta — no se le
  añade después; lo que no tenga fuente nace como estimación o Brecha.
- **D1b. Brechas de información como feature** (FR-11, E4-S5): fase propia y
  proactiva — identifica el dato clave que NO se pudo verificar y sugiere cómo
  conseguirlo ("el laboratorio ancla no se divulgó; pregúntalo en la cita").
  Una Brecha jamás aparece simultáneamente como hecho en el cuerpo.
- **D2. C-1 como código**: el matcheo SOLO emite Recomendacion con
  `productoId`/`institucionId` existentes (FK + validación aplicativa); match
  sin entrada del catálogo ⇒ Brecha, jamás fila inventada. Tests: intento de
  id inexistente se descarta y queda auditado.
- **D3. C-2 verificación de citas**: segundo pase (modelo mecánico) que
  confirma que cada cita respalda su afirmación; lo no respaldado se degrada a
  Brecha o se elimina; resultado auditable persistido en
  `EntregableVersion.verificacion` + **índice de cobertura verificada REAL**
  (hoy el del seed está desalineado — corrígelo entonces con el conteo real,
  decisión #4 de casos borde). El visor ya sabe mostrarlo.
- **D4. Editor del Reporte** (E4-S7): editar secciones ⇒ `PATCH
  /entregables/:id` crea nueva versión BORRADOR (des-aprueba); el gate C-3
  con versión ya lo protege.
- **D5. Export PDF** (E4-S9): `POST /entregables/:id/exportar` — verifica
  APROBADO en servidor (409 si no — C-3), render Puppeteer (Chromium ya vive
  en la imagen si se añade al Dockerfile — medir peso), identidad SOC | TALENT,
  pie "Documento Confidencial", disclaimer NFR-9, sube a R2 (`AlmacenR2` ya
  existe), presigned GET. Sin R2: degrada con mensaje honesto.
- **D6. Avance de etapa conectado**: Reporte aprobado habilita → Investigado
  (ya existe); completar el mapa I-1 conforme existan los entregables.

### ETAPA E — Sócrates real y el resto del equipo (con llaves · ~5-6 PRs)

- **E1. Sócrates interpreta** (FR-1/FR-2, D-4): `POST /socrates/instruir` ⇒
  intención + expediente objetivo + plan de Tareas PROPUESTO (con dependencias);
  `POST /socrates/confirmar` ⇒ crea/dispara las Tareas en el worker. Orquesta
  síncrona-asistida: **nunca ejecuta sin banderazo del Asesor** (supuesto
  §4.1 del PRD). Ambigüedad ⇒ una pregunta, cero invención. `GET
  /socrates/reporte/:expedienteId` ⇒ resumen de jefe (FR-3:
  listo/esperando-tu-revisión/bloqueado-con-motivo).
- **E2. Los 5 empleados con IA** (E5, FR-14–18): mismo contrato, profundidad
  ligera pero comportamiento completo; Prospector califica (no caza), Asesor de
  producto matchea SOLO catálogo (C-1), Negociador depende del Reporte APROBADO
  (dependencia FR-2), Tramitador estima desde condiciones del catálogo con
  marca "estimado" (NFR-9), Gestor propone (no cambia etapas). Gate humano en
  todo lo que salga al cliente (E5-S5): el endpoint de aprobar ya es genérico;
  falta solo el visor sencillo de entregables no-Reporte (guion, cotización,
  lista de requisitos) — columna única, mismo patrón del visor actual.
- **E3. Curaduría del Catálogo** (E6): UI mínima para que Carlos edite
  condiciones típicas por datos, sin redeploy (el LECTOR para empleados se
  cableó desde B2-previo). La expansión a 55 instituciones es de Carlos
  (PoC-R2), no del código.

### ETAPA F — Calidad transversal y deploy (E7 + E8 · ~3-4 PRs + banderazo)

- **F1. Instrumentar SM-C1/SM-C2**: contador de incidentes de dato mal
  citado/producto inventado detectados por compuerta (debe ser 0 en cliente),
  y % de reportes aprobados-luego-rehechos. Tablero simple o log estructurado.
- **F2. Endurecer compuertas con tests de regresión adversariales**: suite que
  intenta colar citas falsas, ids inventados y exports sin aprobar — SIEMPRE
  verde antes de cada release.
- **F3. Deploy** (E8, por CLI, con banderazo de Carlos): Railway (api +
  Postgres privado, healthcheck ya honesto, `prisma migrate deploy` en el CMD),
  Vercel (web), Clerk producción con `WEB_ORIGIN` real, R2. Checklist en
  `DECISIONES-PARA-CARLOS.md`. Smoke en producción: `/health`, login real,
  crear expediente, generar y aprobar un reporte de prueba, export PDF.

### ETAPA G — Piloto (3–5 asesores en Monterrey)

Semana 1: sesión de mapa de Etapas con Carlos (I-1/I-1b), carga de prospectos
reales, SM-1 sobre lote N≥10, medir SM-4 (tiempo ingreso→borrador). Contra-
métricas vigiladas desde el día 1. El feedback alimenta addendums a este plan,
no reescrituras. **Antes de abrir a más asesores que el piloto cerrado:**
validación LFPDPPP con Carlos + experto legal (NFR-13, PRD Q-7) — el RFC y los
datos fiscales de prospectos se tratan con seriedad desde hoy, pero la política
formal es prerequisito de la expansión, no del piloto.

---

## 5. Decisiones tomadas — NO re-litigar (cita la fuente si alguien pregunta)

| Decisión | Dónde está documentada |
|---|---|
| Postgres en dev Y prod, sin Docker | `schema.prisma` cabecera, addendum en `decisiones-bloqueantes.md` |
| Máquina de Etapas: retroceso válido, terminales no se reabren, prerrequisito solo → Investigado (por ahora) | addendum I-1b + `packages/shared/src/etapas.ts` |
| Modo demo: automático en dev, `MODO_ASESOR_DEMO=1` en producción | `apps/api/src/middleware/auth.ts`, `.env.example` |
| `ai@5` + `@ai-sdk/gateway` (v4 era imposible); contrato `ResultadoGenerarTexto` tipado | `apps/api/src/ia/proveedor-ia.ts`, PR #8 |
| Next 16 con build `--webpack` + `NODE_ENV=production` explícito | `apps/web/next.config.ts`, PR #2 |
| Errores `{error:{codigo,mensaje}}` en español SIEMPRE | `apps/api/src/middleware/validacion.ts`, `errors.ts` |
| Aprobación C-3 exige la versión vista | `apps/api/src/rutas/entregables.ts` |

Decisiones ABIERTAS (de Carlos): ver `DECISIONES-PARA-CARLOS.md` — llaves,
deploy, mapa I-1 completo, ids `soc_*`, techo de costo, profundidad Negociador.

---

## 6. Trampas conocidas del terreno (te van a morder si no lees esto)

1. El entorno cloud exporta `NODE_ENV=development` global: rompe builds de
   producción de Next (ya mitigado en el script, pero no lo quites).
2. El contenedor **recicla Postgres al dormir**: si los tests fallan todos de
   golpe con "Can't reach database server", corre `service postgresql start`.
3. Puertos zombis: procesos `next-server`/api viejos sobreviven; usa
   `fuser <puerto>/tcp` y mata antes de re-arrancar. `.next` viejo entre
   versiones de Next causa builds rotos: `rm -rf apps/web/.next`.
4. `node --test` descubre TODO `*.test.ts`: los tests que necesitan base van
   en `tests-integracion/` (fuera del patrón), NUNCA en `src/*.test.ts`.
5. La CLI de Prisma solo lee `packages/db/.env` (versionado a propósito), no
   el `.env` de la raíz.
6. El proxy de egress bloquea `ai-gateway.vercel.sh` y algunos sitios de docs:
   la verificación con llave real de IA requiere sesión local o permitir ese
   host en la política de red del environment.
7. El build con Turbopack es flaky en máquinas de pocos núcleos; `turbo
   typecheck` de web puede correr en carrera con su build (deuda A4).
8. Flotas grandes de agentes tocan el límite de sesión: la auditoría de 160
   agentes se cortó a la mitad. Usa pocos agentes, bien especificados.
9. Ramas apiladas: trabaja cada rama en su **worktree** (`git worktree add`);
   el árbol principal cambia de rama y los dev servers viven de él. Los
   worktrees en `/tmp` son EFÍMEROS (mueren al dormir el contenedor); crea los
   tuyos y remueve los muertos con `git worktree prune`. Poda también las
   ramas ya fusionadas del checkpoint.
10. En este repo el catálogo (`catalogo-soc.json` y tablas) NO se toca sin
    Carlos. Los ids `soc_*` del reporte sembrado quedan sin resolver a
    propósito (C-1). No los "arregles".

---

## 7. Protocolo de verificación (la batería del checkpoint)

```bash
service postgresql start            # por si el contenedor durmió
pnpm install --frozen-lockfile
pnpm db:generate && pnpm db:deploy && pnpm db:seed
pnpm turbo run typecheck build test # 11/11 verde
pnpm test:integracion               # db 4/4 + api 16/16 (crecerán)
# arranque real:
pnpm --filter @socrates/api dev &   # :8787 → /health {estado:"vivo",db:"ok",...}
pnpm --filter @socrates/web dev &   # :3000 → /oficina 200 con seed
```
Un PR no se fusiona si esta batería no está verde y el flujo del PR no fue
tocado en vivo (curl o navegador).

---

## 8. Plantillas de orquestación

**Spec para Sonnet (implementación):** contexto de 3 líneas + reglas duras
aplicables + ALCANCE EXACTO numerado con archivos + método de verificación
exigido (comandos y qué debe salir) + formato de commit (español, sección
"Verificado corriendo:", trailer de Co-Authored-By) + "NO push" si el Director
quiere revisar antes. Trabaja SIEMPRE en un worktree propio.

**Revisor Opus (adversarial):** dale el commit/rama exactos, las preguntas
duras numeradas (correctness, casos borde, reglas del producto, "¿el mensaje
del commit afirma algo que el código no hace?"), acceso para EJECUTAR, y exige
"lista numerada de hallazgos con archivo:línea y severidad o RONDA LIMPIA".
Todo hallazgo se verifica contra el código real antes de reportarse.

**Cadencia por PR:** spec → Sonnet implementa (worktree, commit local) →
Opus revisa → fixes (Sonnet o directo) → batería + flujo vivo → push → PR
draft con "Verificado corriendo:" → merge cuando Carlos autorice checkpoint.

---

## 9. Métricas que definen el éxito (PRD §7)

SM-1 paridad ≥80 % (lote N≥10, juicio de Carlos) · SM-2 ≥1 deal atribuible ·
SM-4 ≤15 min por reporte · **SM-C1 = 0 incidentes de dato mal citado/invento
llegando al cliente** (la contra-métrica manda) · SM-C2 bajo. Si una decisión
acelera SM-4 pero arriesga SM-C1, se rechaza sola.

---

*Addendums fechados debajo de esta línea.*
