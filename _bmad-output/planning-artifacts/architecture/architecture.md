---
title: "Arquitectura: Sócrates — la plataforma de SOC | TALENT"
status: draft
created: 2026-06-14
updated: 2026-06-14
architect: Winston (BMAD)
idioma: es-MX
stepsCompleted: [1, 2, 3, 4, 5, 6, 7]
workflowType: architecture
fuentes:
  - _bmad-output/planning-artifacts/prd/prd.md
  - _bmad-output/planning-artifacts/ux/ux-design.md
  - _bmad-output/planning-artifacts/briefs/brief-SOC-2026-06-14/brief.md
  - _bmad-output/planning-artifacts/briefs/brief-SOC-2026-06-14/addendum.md
  - docs/sim-handoff/07-prd-mvp.md
  - docs/sim-handoff/reporte-innovacion-v0.2.md
versiones_verificadas_web_2026-06-14:
  - "Next.js 16.2.7 (estable jun-2026) — App Router; archivo proxy.ts reemplaza middleware.ts"
  - "Clerk: clerkMiddleware() + createRouteMatcher; @clerk/backend authenticateRequest()/verifyToken() networkless con CLERK_JWT_KEY"
  - "Vercel AI Gateway + AI SDK (paquete `ai`): model string \"anthropic/claude-...\"; AI_GATEWAY_API_KEY; createGateway()"
  - "Hono v4.12.x (abr-2026); Railway lee process.env.PORT; healthcheck GET /health"
  - "Prisma ORM 7.x (Rust-free, nov-2025+): generador `prisma-client` por defecto, `output` obligatorio, ESM con moduleFormat"
  - "Cloudflare R2 vía @aws-sdk/client-s3 + @aws-sdk/s3-request-presigner; presigned URLs; cero egreso"
---

# Arquitectura: Sócrates — la plataforma de SOC | TALENT

> Documento de arquitectura producido por **Winston** (System Architect, BMAD), siguiendo el método `bmad-create-architecture` (contexto → decisiones → patrones → estructura → validación). Ancla en el PRD de Sócrates v1, la especificación de UX "La Oficina", el addendum de stack y el data-room de SIM (PRD del MVP "El Investigador", Reporte de Innovación v0.2).
>
> **Regla de lenguaje heredada:** este documento es técnico (habla de "modelo", "endpoint", "agente"). Eso es legítimo **en la arquitectura**. La inviolabilidad del lenguaje de oficina (NFR-14) vive en la **superficie del producto**, no aquí. Lo que sí cruza: el código que mira el Asesor (mensajes, labels) nunca expone jerga de IA.
>
> **La estrella polar de esta arquitectura** (mandato del Consejo SIM y del PRD): *el control de calidad/precisión a escala ES el producto.* Un dato financiero mal citado o una institución/producto inventado es el veneno. Toda decisión técnica que sigue está subordinada a tres invariantes: **(1) Verificación de citas**, **(2) Fidelidad de catálogo**, **(3) Gate humano**. Se implementan en el servidor, nunca solo en la UI.

---

## 1. Resumen ejecutivo de arquitectura

Sócrates es una **aplicación web full-stack TypeScript end-to-end** organizada como **monorepo pnpm + Turborepo** con dos artefactos desplegables y dos paquetes compartidos:

- **`apps/web`** — Next.js 16 (App Router) en **Vercel**. La Oficina, los Expedientes, el visor/editor del Reporte, la conversación con Sócrates. Autenticación con **Clerk**.
- **`apps/api`** — servicio **Hono** en **Railway**, junto a **Postgres** (Railway). Es el cerebro: el **framework de Empleados**, el **orquestador (Sócrates)**, el **pipeline del Investigador**, las tres compuertas de calidad, el acceso a R2 y a la IA. Verifica el JWT de Clerk de forma *networkless*.
- **`packages/db`** — esquema **Prisma 7** + cliente generado + seed (Las Aliadas, Probemedic, Catálogo SOC). La **espina es el Expediente**.
- **`packages/shared`** — tipos, contratos (Zod), el **contrato común de Empleado**, constantes del glosario (Etapas, estados), y los DTO que cruzan `web` ↔ `api`.

**Por qué esta forma (no Next.js solo).** El PRD pide explícitamente API en Railway + Hono (restricción de Carlos). Pero hay una razón de arquitectura que lo respalda: el trabajo pesado del Investigador (investigación + síntesis + verificación) puede tardar **hasta 15 minutos** (NFR-6) y debe ser **resiliente a que el Asesor navegue fuera** (UX nota 2). Eso es trabajo de **larga duración con estado durable**, mal ajustado a funciones serverless con límite de tiempo. Un servicio Hono *long-running* en Railway, con un worker de tareas que persiste estado en Postgres, es el hogar correcto. Vercel se queda con lo que hace excelente: el frontend y el borde.

**El flujo de datos en una frase.** El Asesor (autenticado por Clerk en `web`) le habla a Sócrates → `web` llama a `api` con el JWT de Clerk → `api` verifica identidad, **deriva la tenencia de su propia fila `Asesor` (nunca del payload)**, el Orquestador planifica y crea **Tareas**, el worker ejecuta los **Empleados** (cada uno `ejecutar(entrada, ctx)`), los Empleados consultan el **Catálogo SOC** y llaman a **Claude vía AI Gateway**, producen **Entregables** (estado Borrador), el Reporte pasa por **Verificación de citas**, el Asesor lo revisa y **aprueba (Gate humano)**, y al exportar se sube el **PDF a R2**. Sin claves de IA, el mismo flujo cae a **Modo sin claves** con datos sembrados, sin tronar.

```
┌──────────────────────────────────────────────────────────────────────────┐
│  NAVEGADOR (Asesor)                                                        │
│  Next.js 16 App Router · Clerk (sesión) · shadcn/ui + Tailwind             │
└───────────────┬──────────────────────────────────────────────────────────┘
                │  fetch con JWT de Clerk (Authorization: Bearer)
                │  + polling ligero de estado (5–10 s)
                ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  apps/api — Hono en Railway (long-running)                                 │
│  ┌───────────────┐  ┌───────────────────┐  ┌──────────────────────────┐   │
│  │ Auth middleware│→ │ Orquestador        │→ │ Worker de Tareas         │   │
│  │ (Clerk verify) │  │ (Sócrates: planea, │  │ (cola en Postgres,       │   │
│  │ → Asesor.id    │  │  delega, reporta)  │  │  ejecuta Empleados)      │   │
│  └───────────────┘  └───────────────────┘  └────────────┬─────────────┘   │
│         │                                                │                 │
│         │            ┌───────────────────────────────────▼─────────────┐  │
│         │            │ Framework de Empleados (registro de los 6)       │  │
│         │            │  ejecutar(entrada, ctx) → resultado              │  │
│         │            │  Investigador · Prospector · Asesor de producto  │  │
│         │            │  Negociador · Tramitador · Gestor                │  │
│         │            └──┬───────────────┬────────────────┬─────────────┘  │
│         │               │               │                │                │
│   ┌─────▼─────┐   ┌──────▼──────┐  ┌─────▼──────┐  ┌──────▼───────┐        │
│   │ Postgres  │   │ Catálogo SOC│  │ AI Gateway │  │ Compuertas   │        │
│   │ (Prisma 7)│   │ (en Postgres)│ │ Claude     │  │ de calidad   │        │
│   └───────────┘   └─────────────┘  └────────────┘  └──────────────┘        │
└───────────────────────────────────────────┬──────────────────────────────┘
                                             │  presigned PUT/GET
                                             ▼
                                   ┌────────────────────┐
                                   │ Cloudflare R2      │
                                   │ (PDFs de reportes) │
                                   └────────────────────┘
```

---

## 2. Análisis de contexto del proyecto

### 2.1 Resumen de requisitos

- **22 Requisitos Funcionales (FR-1 … FR-22)** en 6 funcionalidades: Sócrates/orquestación (FR-1–3), Expedientes/La Oficina (FR-4–7), Investigador/Reporte (FR-8–13), resto del equipo (FR-14–18), Catálogo SOC (FR-19), cimientos identidad/persistencia (FR-20–22).
- **14 Requisitos No Funcionales (NFR-1 … NFR-14)**, encabezados por los de **calidad/precisión de primer orden**: Precisión/veracidad (NFR-1), Fidelidad de catálogo (NFR-2), Trazabilidad (NFR-3), Gate humano (NFR-4). Luego costo (NFR-5), latencia (NFR-6/7), aislamiento multi-asesor (NFR-8), disclaimer (NFR-9), confiabilidad (NFR-10), resiliencia sin claves (NFR-11), idioma (NFR-12), privacidad (NFR-13), lenguaje de oficina (NFR-14).
- **7 Épicas (E1–E7)** con orden de dependencia: cimientos → Expediente → Sócrates → Investigador (PoC primero) → resto del equipo → Catálogo → calidad transversal.

### 2.2 Implicaciones arquitectónicas de la UX

De la especificación "La Oficina" (Sally) extraigo cinco contratos técnicos que esta arquitectura debe honrar (UX §10):

1. **Actualización de La Oficina sin recarga** → el estado de Tareas/Entregables cambia "solo". Decisión: **polling ligero** (ver §4, Decisión D-7), no WebSocket en v1.
2. **Generación en segundo plano resiliente a navegación** → el estado de la Tarea vive en Postgres, no en memoria del cliente. Decisión: **worker de Tareas + cola en Postgres** (§5).
3. **Gate humano en la API** → el endpoint de export verifica `estado = Aprobado` antes de procesar; el bloqueo no es de UI (§6, compuerta C-3).
4. **Versionado de Entregables** → editar+aprobar crea **nueva versión**, no sobrescribe; el PDF lleva versión en metadatos (modelo `EntregableVersion`).
5. **Aislamiento por `userId`** → toda query de Expedientes filtra por la fila `Asesor` derivada del token; jamás un "dame todos" sin filtro (§6, tenencia).

### 2.3 Escala y complejidad

- **Dominio primario:** full-stack web (escritorio, viewport ≥1280px).
- **Nivel de complejidad:** **medio-alto**, concentrado en UN punto: el **pipeline de síntesis del Investigador con calidad verificable** (riesgo técnico real, PoC primero). El resto (CRUD de Expedientes, auth, storage) es complejidad estándar bien entendida.
- **Concurrencia esperada en v1:** piloto de 3–5 Asesores (NFR-8 a escala de piloto). No hay presión de escala horizontal; sí de **corrección y costo unitario**.
- **Multi-tenant:** sí, pero **ligero** (aislamiento por Asesor, no roles/jerarquías corporativas — eso es Non-Goal).

### 2.4 Concerns transversales identificados

- **Calidad como producto** (cruza E4, E5, E7): citas verificables, fidelidad de catálogo, gate humano, trazabilidad. Es una **capa**, no un feature suelto.
- **Modo sin claves** (cruza todo): cada Empleado y cada llamada a IA debe degradar a seed/fallback sin tronar.
- **Tenencia/aislamiento** (cruza toda lectura/escritura de datos).
- **Lenguaje de oficina** (cruza toda cadena de texto de cara al Asesor).
- **Idempotencia y no-pérdida de trabajo** (cruza generación, aprobación, export).

---

## 3. Plantilla de arranque y stack (decisiones ya fijadas)

**No hay starter template de terceros.** El monorepo se arma a mano (es trivial con pnpm + Turborepo y mantiene el control total que el riesgo de calidad exige). El stack está **fijado por Carlos y el Director** (addendum) y **no se re-decide**; aquí solo se verifican versiones actuales (web, jun-2026) y se ata el *cómo*.

| Capa | Tecnología | Versión verificada (jun-2026) | Notas |
|---|---|---|---|
| Frontend | Next.js App Router, TS, Tailwind | **16.2.7** | `proxy.ts` reemplazó a `middleware.ts`; React 19.2; React Compiler estable |
| UI kit | shadcn/ui sobre Tailwind | actual | de la spec de UX |
| Auth | Clerk | actual | `clerkMiddleware()` en `web`; `@clerk/backend` en `api` |
| API | Hono | **4.12.x** | long-running en Railway; lee `process.env.PORT` |
| DB | PostgreSQL (Railway) | 16+ | red privada de Railway entre `api` y Postgres |
| ORM | Prisma | **7.x** (Rust-free) | generador `prisma-client` (default v7), `output` obligatorio |
| Storage | Cloudflare R2 | — | vía `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` |
| IA | Vercel AI Gateway + AI SDK (`ai`) | actual | model strings `anthropic/claude-*`; `AI_GATEWAY_API_KEY` |
| Monorepo | pnpm + Turborepo | actual | `apps/web`, `apps/api`, `packages/shared`, `packages/db` |
| VCS/Deploy | git local, **sin GitHub** | — | deploy por **CLI** de Vercel y Railway |

---

## 4. Decisiones arquitectónicas centrales

> Formato: **Decisión · Elección · Rationale · Afecta · Trade-off**. Las que bloquean implementación van marcadas 🔴; las que dan forma, 🟡.

### Análisis de prioridad de decisiones

**Críticas (bloquean implementación):** D-1 (separación web/api y verificación de identidad cross-service), D-2 (modelo de datos espina-Expediente), D-3 (contrato de Empleado), D-4 (orquestación de Sócrates), D-5 (pipeline del Investigador + compuertas de calidad), D-6 (capa de IA con fallback).
**Importantes (dan forma):** D-7 (transporte de estado: polling), D-8 (storage R2 con presigned), D-9 (validación con Zod en el borde), D-10 (formato de respuesta y errores).
**Diferidas (post-MVP, con rationale):** WebSocket/SSE en lugar de polling; auto-mejora del catálogo (flywheel); multi-región; colas externas (Redis/BullMQ) si el piloto crece.

---

### 🔴 D-1 — Frontera web/api y verificación de identidad cross-service

**Elección.** Dos artefactos separados (`web` en Vercel, `api` en Railway, **orígenes distintos**). `web` usa Clerk para login y sesión; en cada llamada a `api` adjunta el **JWT de Clerk** (`Authorization: Bearer <token>` obtenido con `await auth().getToken()` en server actions / route handlers de Next). `api` verifica el token de forma **networkless** con `@clerk/backend` (`authenticateRequest()` o `verifyToken()`) usando `CLERK_JWT_KEY` (clave pública JWKS del dashboard) — sin llamada de red por request. De ahí saca el `clerkUserId` y **resuelve o crea la fila `Asesor`** correspondiente; **toda la tenencia se deriva de esa fila, nunca del cuerpo de la petición**.

**Rationale.** (1) El PRD fija API en Railway+Hono. (2) La generación larga (≤15 min, resiliente a navegación) necesita un proceso long-running con worker, imposible de garantizar en funciones serverless con timeout. (3) Verificación *networkless* = baja latencia y sin punto de falla extra en el camino caliente. (4) Derivar tenencia de la fila propia (no del payload) es la regla anti-fuga del Director y cumple NFR-8.

**Afecta.** FR-20, NFR-8, NFR-10; todos los endpoints; `packages/shared` (DTO + tipo `AuthedContext`).

**Trade-off.** Dos despliegues y CORS configurado entre dos orígenes (más piezas que un Next.js monolítico). Se acepta porque el trabajo de larga duración lo exige y porque desacopla el "cerebro" del frontend. *Mitigación:* un solo cliente HTTP tipado en `packages/shared` para que `web` no hable "crudo" con `api`.

---

### 🔴 D-2 — Modelo de datos con el Expediente como espina

**Elección.** Postgres + Prisma 7. La jerarquía canónica es `Asesor → Expediente → (Tarea | Entregable)`, con `Empleado` y el Catálogo (`Institucion → Producto`) como tablas de soporte. Bosquejo completo en §7.

**Rationale.** Es la columna vertebral declarada (PRD §4.2, UX P-2). El Expediente porta `etapa`, `progreso` derivado, sus Tareas (estado por Empleado) y sus Entregables (Borrador/Aprobado + versión). Postgres da las garantías relacionales (FKs, transacciones) que la integridad de tenencia y el versionado necesitan.

**Afecta.** FR-4–7, E2; toda la app.

**Trade-off.** Acoplamiento a un esquema relacional (menos flexible que documentos para contenido del Reporte). *Mitigación:* el **contenido** del Reporte (secciones, citas, brechas) se guarda como **JSONB tipado** dentro de `EntregableVersion.contenido`, validado por Zod — relacional para la espina, documento para el cuerpo del Reporte.

---

### 🔴 D-3 — Contrato común de Empleado

**Elección.** Una interfaz única que todos los Empleados implementan, viviendo en `packages/shared` (tipos) + `apps/api` (implementaciones):

```ts
// packages/shared/src/empleados/contract.ts
export interface EntradaEmpleado {
  expedienteId: string;
  instruccion?: string;          // texto libre del Asesor, si lo hubo
  parametros?: Record<string, unknown>;
}

export interface ContextoEjecucion {
  asesorId: string;              // tenencia ya resuelta (D-1)
  expediente: ExpedienteConDatos;
  catalogo: CatalogoLector;      // acceso de solo-lectura al Catálogo SOC
  ia: ProveedorIA;               // wrapper de AI Gateway con fallback (D-6)
  registrarProgreso: (pct: number, nota: string) => Promise<void>;
  modoSinClaves: boolean;        // true → ruta de seed/fallback
}

export interface ResultadoEmpleado {
  entregables: BorradorEntregable[];   // 0..n; siempre estado "Borrador"
  brechas?: BrechaInfo[];
  bloqueo?: { motivo: string };        // si no pudo completar (progreso honesto)
}

export interface Empleado {
  readonly rol: RolEmpleado;     // "investigador" | "prospector" | ...
  ejecutar(entrada: EntradaEmpleado, ctx: ContextoEjecucion): Promise<ResultadoEmpleado>;
}
```

**Rationale.** El addendum exige `ejecutar(entrada, ctx) → resultado`. Un contrato uniforme deja que Sócrates **enrute sin saber los detalles** de cada Empleado, que el worker los ejecute igual, y que el Modo sin claves se maneje en un solo lugar (`ctx.modoSinClaves`). Es el patrón que hace al sistema extensible (los 6 hoy, los del flujo completo mañana) sin tocar el orquestador.

**Afecta.** FR-1–3 (Sócrates), FR-8–18 (los 6 Empleados), E3/E4/E5; `packages/shared`.

**Trade-off.** Un contrato común corre el riesgo de quedar "ancho" (el Investigador hace mucho más que el Gestor). *Mitigación:* la profundidad vive **dentro** del `ejecutar`; el contrato solo estandariza la frontera (entrada/contexto/resultado), no la sofisticación. El Investigador es un pipeline de 6 fases; el Gestor es una llamada. Ambos caben.

---

### 🔴 D-4 — Cómo orquesta Sócrates (síncrono-asistido, no autónomo)

**Elección.** Sócrates es un **componente del `api`** (no un Empleado más; no produce Entregables de cliente). Hace tres cosas:

1. **Interpretar** la intención del Asesor → con una llamada a Claude (vía AI Gateway) que produce un **plan estructurado** (JSON validado por Zod): Expediente objetivo (existente/nuevo), lista de Empleados a invocar y dependencias entre ellos.
2. **Delegar** → crea filas `Tarea` (estado `Encargada`) respetando dependencias; **no dispara** una Tarea hasta que su prerrequisito esté cumplido (p. ej. Negociador espera Reporte `Aprobado`).
3. **Reportar** → resume en lenguaje de oficina qué se entregó, qué espera Gate humano, qué está bloqueado y por qué.

El plan se **muestra al Asesor y se confirma antes de ejecutar** (orquestación síncrona-asistida, PRD FR-3 nota + UX C-3). Sócrates **nunca ejecuta sin el banderazo**.

**Rationale.** El PRD prohíbe autonomía total en v1 (mismo motivo que el Gate humano: el control humano es el seguro contra el veneno). Un plan estructurado y confirmable da control, trazabilidad y previene "el Empleado accionó algo que el Asesor no pidió". La interpretación con LLM + esquema Zod evita inventar Expedientes ante ambigüedad (responde con UNA pregunta, FR-1).

**Afecta.** FR-1–3, E3; la barra de comando de la UX (C-3).

**Trade-off.** Una llamada extra de IA por intención (latencia + costo) y un punto donde el LLM podría malinterpretar. *Mitigación:* esquema de salida estricto (Zod), set cerrado de Empleados (no puede enrutar a uno inexistente), y confirmación humana antes de ejecutar — el error se atrapa antes de gastar cómputo. En Modo sin claves, Sócrates enruta por **reglas heurísticas** (palabras clave → Empleado) sin LLM.

---

### 🔴 D-5 — Pipeline del Investigador y las tres compuertas de calidad

**Elección.** El Investigador es un **pipeline de fases secuenciales** dentro de su `ejecutar`, cada fase persistiendo progreso (`registrarProgreso`) para que la UX muestre el avance por sección y sea resiliente a navegación:

```
1. Investigar industria + prospecto   → hallazgos + fuentes candidatas (IA + web search vía Gateway)
2. Construir perfil + FODA / riesgo    → síntesis estructurada
3. Matchear contra Catálogo SOC        → Recomendaciones (capa de síntesis)  ┐
                                                                              ├─ COMPUERTA C-1: Fidelidad de catálogo
4. Marcar Brechas de información        → lo no verificado, fuera del cuerpo  │
5. Ensamblar Reporte (formato canónico)→ JSONB tipado del Reporte            │
6. Verificar citas (segundo pase)      → degrada lo no respaldado            ┘─ COMPUERTA C-2: Verificación de citas
   → Entregable "Borrador" → COMPUERTA C-3: Gate humano (export bloqueado hasta Aprobado)
```

Las **tres compuertas** son código del servidor, no UI:
- **C-1 Fidelidad de catálogo (NFR-2):** la fase 3 **solo** puede emitir Recomendaciones cuyo `productoId`/`institucionId` **existen en la tabla** del Catálogo. Se valida con un *constraint* aplicativo: cualquier match a un id inexistente se descarta y se anota como Brecha. **Cero alucinación de instituciones/productos.**
- **C-2 Verificación de citas (NFR-1/NFR-3):** segundo pase (otra llamada a Claude con instrucción de verificación) que confirma que cada Cita respalda su afirmación; lo no respaldado se **degrada** (mueve a Brecha o se elimina), nunca se muestra como hecho citado. Resultado **auditable** (qué pasó / qué se degradó), guardado en la versión.
- **C-3 Gate humano (NFR-4):** el endpoint `POST /entregables/:id/exportar` verifica `estado === "Aprobado"`; si no, **responde 409 y no genera PDF**. La UI también lo deshabilita, pero la verdad está en el servidor.

**Rationale.** Es el foso y el riesgo técnico real; las tres compuertas materializan los NFR de primer orden. El pipeline por fases con progreso persistido cumple la latencia (≤15 min) sin bloquear y la resiliencia a navegación.

**Afecta.** FR-8–13, E4, E7; NFR-1/2/3/4/9.

**Trade-off.** Dos llamadas de IA por Reporte (generación + verificación) suben costo y latencia. Se acepta sin discusión: **la precisión ES el producto**; el costo por Reporte sigue siendo centavos contra una comisión de $25k–50k MXN (NFR-5). *Riesgo a vigilar:* el motor de investigación (qué fuente usa la fase 1) está abierto (PRD Q-1) — ver §10 Riesgos.

---

### 🔴 D-6 — Capa de IA: AI Gateway con strings provider/model y fallback obligatorio

**Elección.** Un **único wrapper** `ProveedorIA` en `apps/api` envuelve al AI SDK (`generateText`/`streamText`/`generateObject` del paquete `ai`) apuntando al **Vercel AI Gateway** con strings `"anthropic/claude-..."`. La clave vive en `AI_GATEWAY_API_KEY` (variable de entorno del servicio Railway). Modelos por defecto (verificados jun-2026):

- **Razonamiento pesado** (síntesis del Investigador, verificación de citas): `anthropic/claude-opus-4.6` o `anthropic/claude-sonnet-4.6`.
- **Tareas estándar** (interpretación de Sócrates, Empleados ligeros): `anthropic/claude-sonnet-4.6`.
- **Mecánico/barato** (clasificación, extracción): `anthropic/claude-haiku-4.5`.

El modelo concreto por paso es **configurable** (env/constante), no hardcodeado disperso. **Fallback (NFR-11):** si `AI_GATEWAY_API_KEY` no está o la llamada falla, `ProveedorIA` levanta `modoSinClaves = true` y cada Empleado devuelve **resultado sembrado** (para Probemedic/Las Aliadas) o un **mensaje honesto** ("no hay conexión para investigar en vivo") — **nunca un error que rompa la app**.

**Rationale.** El AI Gateway desacopla del proveedor (cambiar a otro modelo es cambiar el string), centraliza claves/costos/observabilidad y permite el string `provider/model` que pide el addendum. Un solo wrapper hace el fallback **transparente a la UI** (UX nota 5) y deja la elección de modelo por riesgo (doctrina del organigrama).

**Afecta.** FR-1, FR-8–18, FR-22; NFR-5, NFR-11; E1/E4/E5.

**Trade-off.** Dependencia de un intermediario (el Gateway) entre `api` y Anthropic. *Mitigación:* el wrapper aísla esa dependencia; si mañana se quisiera ir directo a la API de Anthropic, solo cambia el wrapper, no los Empleados.

---

### 🟡 D-7 — Transporte de estado a La Oficina: polling ligero (no WebSocket)

**Elección.** `web` hace **polling** cada 5–10 s a `GET /expedientes` y `GET /expedientes/:id` mientras hay Tareas activas (con backoff cuando todo está quieto). No hay WebSocket/SSE en v1.

**Rationale.** Resuelve FR-5 ("sin recargar") con la pieza más simple y robusta. A escala de piloto (3–5 Asesores) el costo de polling es trivial. Evita la complejidad de conexiones persistentes en una API que también corre trabajo largo.

**Afecta.** FR-5; UX P-1.

**Trade-off.** Latencia de hasta ~10 s para ver "el Investigador entregó". Aceptable para un flujo de minutos. *Diferido:* migrar a SSE si el piloto pide inmediatez (cambio aislado en el cliente HTTP + un endpoint de stream).

---

### 🟡 D-8 — Storage R2 con presigned URLs y descarga server-mediated

**Elección.** El **PDF del Reporte se renderiza en `api`** (HTML del Reporte → PDF), y `api` lo **sube a R2** con `@aws-sdk/client-s3` (`PutObjectCommand`) hacia el endpoint S3-compatible de R2. La **descarga** por el Asesor usa **presigned GET URL** (`@aws-sdk/s3-request-presigner`, vencimiento corto) — el navegador baja directo de R2, sin pasar el binario por `api`.

**Rationale.** R2 es S3-compatible y de **cero egreso** (NFR-5, costo). Generar el PDF en el servidor garantiza el formato canónico SOC|TALENT idéntico y permite estampar el disclaimer (NFR-9) y la versión en metadatos. Presigned GET mantiene los archivos privados (no bucket público) y baja sin cargar a `api`.

**Afecta.** FR-13, FR-21; NFR-9; E1/E4.

**Trade-off.** El render de PDF en el servidor añade una dependencia (motor HTML→PDF) y CPU. *Mitigación:* es un paso corto y solo al exportar (tras Gate humano), no en el camino caliente de generación.

---

### 🟡 D-9 / D-10 — Validación en el borde (Zod) y formato de respuesta/errores

**Elección.** Todo lo que entra a `api` se valida con **Zod** (`@hono/zod-validator`); todo lo que sale de IA con salida estructurada usa **`generateObject` + esquema Zod**. Respuestas: cuerpo directo (no wrapper `{data}`) con códigos HTTP semánticos; errores con forma `{ error: { codigo, mensaje } }`, `mensaje` **siempre en español de oficina** cuando puede llegar al Asesor.

**Rationale.** Zod en el borde es la primera línea contra datos malformados y contra que el LLM devuelva algo fuera de esquema (clave para C-1/C-2). Formato de error consistente evita que distintos agentes de implementación inventen formas distintas.

**Afecta.** transversal; `packages/shared` (esquemas compartidos web↔api).

**Trade-off.** Esquemas duplicados de mantener. *Mitigación:* los esquemas viven **una vez** en `packages/shared` y los consumen ambos lados.

---

### Análisis de impacto de decisiones

**Secuencia de implementación (orden de dependencia):**
1. D-2 (esquema Prisma + seed) → 2. D-1 (auth cross-service) → 3. D-9/D-10 (contratos compartidos) → 4. D-3 (contrato de Empleado) → 5. D-6 (capa de IA + fallback) → 6. D-5 (**PoC del Investigador y compuertas — el riesgo real, primero**) → 7. D-4 (orquestador Sócrates) → 8. D-7/D-8 (polling + R2).

**Dependencias cruzadas:** D-1 alimenta el `ctx.asesorId` de D-3; D-6 provee el `ctx.ia` de D-3; D-3 es el molde que D-4 enruta y D-5 implementa a fondo; las compuertas de D-5 dependen del Catálogo de D-2.

---

## 5. Patrones de implementación y reglas de consistencia

> Reglas que **todos** los agentes de implementación DEBEN seguir, para que el código que escriban encaje. Donde el PRD/UX ya fijó algo, se cita.

### 5.1 Nomenclatura

**Base de datos (Prisma / Postgres):**
- Modelos Prisma en **PascalCase singular** en español del dominio: `Asesor`, `Expediente`, `Tarea`, `Entregable`, `EntregableVersion`, `Empleado`, `Institucion`, `Producto`, `Recomendacion`, `Cita`, `Brecha`.
- Campos en **camelCase**: `asesorId`, `expedienteId`, `creadoEn`, `actualizadoEn`. Prisma mapea a snake_case en Postgres con `@@map`/`@map` si se desea; el cliente siempre habla camelCase.
- FKs: `<entidad>Id` (`asesorId`, `productoId`). Timestamps obligatorios `creadoEn`/`actualizadoEn` en toda tabla con vida propia.
- Enums del dominio en español, valores en mayúsculas estables: `EtapaExpediente { PROSPECTO, INVESTIGADO, RECOMENDADO, EN_ACERCAMIENTO, EN_TRAMITE, EN_CIERRE, GANADO, PERDIDO }`, `EstadoTarea { ENCARGADA, EN_CURSO, ENTREGADA, BLOQUEADA }`, `EstadoEntregable { BORRADOR, APROBADO }`, `RolEmpleado { SOCRATES, PROSPECTOR, INVESTIGADOR, ASESOR_PRODUCTO, NEGOCIADOR, TRAMITADOR, GESTOR }`.

**API (Hono):**
- Endpoints **REST, recursos en plural, kebab/lowercase**: `/expedientes`, `/expedientes/:id`, `/expedientes/:id/tareas`, `/entregables/:id`, `/entregables/:id/aprobar`, `/entregables/:id/exportar`, `/socrates/instruir`, `/catalogo/instituciones`.
- Parámetro de ruta `:id`. Query en camelCase. Header de auth estándar `Authorization: Bearer`.

**Código (TS):**
- Archivos de componentes React: `PascalCase.tsx` (`TarjetaExpediente.tsx`). Utilidades/hooks: `camelCase.ts`. Funciones `camelCase`, tipos/interfaces `PascalCase`, constantes `SCREAMING_SNAKE`.
- **Términos del dominio en español** en todo el código (`expediente`, `entregable`, `etapa`) — consistente con el glosario del PRD; reduce traducción mental y errores.

### 5.2 Estructura

- **Tests co-locados** `*.test.ts` junto al código que prueban; e2e del pipeline en `apps/api/test/`.
- Componentes de `web` organizados **por feature** (`oficina/`, `expediente/`, `entregable/`, `socrates/`), no por tipo.
- Empleados en `apps/api/src/empleados/<rol>/` cada uno con su `index.ts` (la implementación), su `seed.ts` (fallback) y su `*.test.ts`.

### 5.3 Formato y datos

- **Respuestas:** cuerpo directo (sin envoltorio `{data}`). Errores: `{ error: { codigo: string, mensaje: string } }`.
- **Fechas:** ISO 8601 string en la API; formateo a es-MX solo en la UI.
- **JSON:** camelCase en todo el límite web↔api.
- **Contenido del Reporte:** JSONB tipado en `EntregableVersion.contenido`, con esquema Zod versionado (`ReporteV1`).

### 5.4 Comunicación y proceso

- **Progreso honesto (P-3 de UX):** un fallo de Empleado se persiste como `Tarea.estado = BLOQUEADA` con `motivo`; **jamás** se infla el progreso. El `progreso` del Expediente se **deriva determinísticamente** de Etapa + Tareas completadas (función pura en `packages/shared`, testeable).
- **Idempotencia:** crear Tarea, aprobar Entregable y exportar PDF son **idempotentes** (clave de idempotencia por `expedienteId+rol+hash(instruccion)` para Tareas; aprobar dos veces no crea dos versiones; exportar dos veces reutiliza el PDF de la versión aprobada). Doctrina del Director: nunca doble efecto.
- **Errores de IA:** capturados en el wrapper `ProveedorIA`; se traducen a `bloqueo` legible o a fallback; **nunca** burbujean como 500 crudos a la UI.
- **Lenguaje de oficina (NFR-14):** ninguna cadena de cara al Asesor menciona "modelo", "prompt", "token", "agente", "API". Un test de lint de cadenas (lista negra) corre en CI local.

### 5.5 Reglas que TODO agente de implementación DEBE cumplir

1. **Toda** lectura/escritura de `Expediente/Tarea/Entregable` filtra por `asesorId` derivado del token (nunca del payload). Sin excepción.
2. Las Recomendaciones **solo** referencian `productoId`/`institucionId` existentes (compuerta C-1, en código, no en confianza).
3. El export verifica `estado === APROBADO` en el servidor (compuerta C-3).
4. Toda llamada a IA pasa por `ProveedorIA` (nunca el AI SDK directo en un Empleado), para que el fallback sea uniforme.
5. Toda salida estructurada de IA se valida con Zod antes de tocar la base de datos.
6. Ninguna cadena de cara al Asesor expone jerga de IA.

### 5.6 Anti-patrones (prohibidos)

- ❌ Query "dame todos los expedientes" sin filtro de tenencia.
- ❌ Recomendar un producto/institución por nombre libre del LLM sin resolverlo contra la tabla del Catálogo.
- ❌ Marcar un Reporte como Aprobado desde el cliente sin pasar por `POST /entregables/:id/aprobar`.
- ❌ Sobrescribir un Entregable al editar (debe versionar).
- ❌ Llamar al AI SDK fuera del wrapper `ProveedorIA`.
- ❌ Exponer "claude", "GPT", "prompt", "token" en cualquier texto que vea el Asesor.

---

## 6. Diseño de la API (Hono)

### 6.1 Middleware (orden)

1. **CORS** (origen de `web` permitido).
2. **Auth** (`@clerk/backend` networkless con `CLERK_JWT_KEY`) → resuelve/crea `Asesor`, inyecta `ctx.asesorId`. Rutas públicas: `GET /health`.
3. **Validación** (`@hono/zod-validator` por ruta).
4. **Manejo de errores** (envoltorio que traduce a `{ error: { codigo, mensaje } }`).

### 6.2 Endpoints clave

| Método | Ruta | Propósito | FR |
|---|---|---|---|
| GET | `/health` | healthcheck DB-aware (Railway) | infra |
| GET | `/expedientes` | lista del Asesor (La Oficina) + filtros | FR-5 |
| POST | `/expedientes` | crear Expediente (nace en PROSPECTO, 0%) | FR-4 |
| GET | `/expedientes/:id` | detalle: Tareas + Entregables + Etapa + progreso | FR-6 |
| PATCH | `/expedientes/:id` | editar datos del prospecto; marcar Ganado/Perdido | FR-4, FR-7 |
| POST | `/socrates/instruir` | interpretar intención → plan propuesto (no ejecuta) | FR-1 |
| POST | `/socrates/confirmar` | confirma el plan → crea/dispara Tareas | FR-2 |
| GET | `/socrates/reporte/:expedienteId` | resumen de gerente (listo/esperando/bloqueado) | FR-3 |
| POST | `/expedientes/:id/empleados/:rol/encargar` | encargo directo a un Empleado | FR-14–18 |
| GET | `/entregables/:id` | ver Entregable (última versión) | FR-6 |
| PATCH | `/entregables/:id` | editar → crea nueva versión Borrador | FR-13 |
| POST | `/entregables/:id/aprobar` | **Gate humano** → estado APROBADO + versión | FR-13, NFR-4 |
| POST | `/entregables/:id/exportar` | render PDF → R2 → presigned GET (solo si APROBADO) | FR-13, FR-21 |
| GET | `/catalogo/instituciones` | leer Catálogo SOC (para UI/curaduría) | FR-19 |
| GET | `/empleados` | estado del equipo (Libre/Trabajando/Entregó) | UX P-4 |

**Patrón de respuesta:** cuerpo directo; 200/201 éxito, 400 validación, 401 sin sesión, 403 tenencia, 404 no existe, **409 Gate humano violado**, 422 salida de IA fuera de esquema, 503 sin servicio de IA (con fallback).

### 6.3 El worker de Tareas (cola en Postgres)

No hay broker externo en v1. El worker es un **loop dentro del proceso `api`** que toma Tareas `ENCARGADA` cuyas dependencias están cumplidas, las marca `EN_CURSO`, ejecuta el Empleado (`ejecutar`), persiste Entregables/Brechas/Bloqueo y marca `ENTREGADA`/`BLOQUEADA`. Estado durable en Postgres ⇒ resiliente a reinicio y a navegación del Asesor (UX nota 2). *Diferido:* mover a BullMQ/Redis si el volumen lo pide.

---

## 7. Esquema de datos (bosquejo `schema.prisma`)

> Prisma 7, generador `prisma-client` (Rust-free, `output` obligatorio). La **espina es el Expediente**. Contenido del Reporte como JSONB tipado.

```prisma
// packages/db/prisma/schema.prisma
generator client {
  provider     = "prisma-client"          // Prisma 7 default (Rust-free)
  output       = "../src/generated/client" // obligatorio en v7
  moduleFormat = "esm"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")          // red privada de Railway
}

// ── Identidad / tenencia ────────────────────────────────
model Asesor {
  id           String       @id @default(cuid())
  clerkUserId  String       @unique          // viene del JWT de Clerk (D-1)
  nombre       String?
  email        String?
  expedientes  Expediente[]
  creadoEn     DateTime     @default(now())
  actualizadoEn DateTime    @updatedAt
}

// ── ESPINA: el Expediente ───────────────────────────────
model Expediente {
  id          String          @id @default(cuid())
  asesor      Asesor          @relation(fields: [asesorId], references: [id])
  asesorId    String                                   // tenencia (NFR-8)
  empresa     String                                   // campos mínimos
  ciudad      String
  industria   String
  sitioWeb    String?                                  // opcionales
  rfc         String?
  sucursales  Int?
  notas       String?
  etapa       EtapaExpediente @default(PROSPECTO)
  progreso    Int             @default(0)              // derivado, persistido para listar rápido
  motivoCierre String?                                 // si GANADO/PERDIDO
  tareas      Tarea[]
  entregables Entregable[]
  creadoEn    DateTime        @default(now())
  actualizadoEn DateTime      @updatedAt
  @@index([asesorId, etapa])
}

// ── Empleados (catálogo de roles) ───────────────────────
model Empleado {
  rol         RolEmpleado  @id
  nombre      String                                   // "El Investigador"
  descripcion String                                   // lenguaje de oficina
  tareas      Tarea[]
}

// ── Tareas (unidad de trabajo delegada) ─────────────────
model Tarea {
  id            String      @id @default(cuid())
  expediente    Expediente  @relation(fields: [expedienteId], references: [id])
  expedienteId  String
  empleado      Empleado    @relation(fields: [empleadoRol], references: [rol])
  empleadoRol   RolEmpleado
  descripcion   String                                 // legible para el Asesor
  estado        EstadoTarea @default(ENCARGADA)
  motivo        String?                                // si BLOQUEADA (progreso honesto)
  dependeDeId   String?                                // dependencia entre Tareas (FR-2)
  idempotencyKey String?    @unique                    // anti doble efecto
  entregable    Entregable?
  creadoEn      DateTime    @default(now())
  actualizadoEn DateTime    @updatedAt
  @@index([expedienteId, estado])
}

// ── Entregables (artefactos) + versionado ───────────────
model Entregable {
  id            String            @id @default(cuid())
  expediente    Expediente        @relation(fields: [expedienteId], references: [id])
  expedienteId  String
  tarea         Tarea?            @relation(fields: [tareaId], references: [id])
  tareaId       String?          @unique
  tipo          String                                 // "reporte_inteligencia" | "guion" | ...
  estado        EstadoEntregable  @default(BORRADOR)   // Gate humano (NFR-4)
  versiones     EntregableVersion[]
  versionActual Int               @default(1)
  creadoEn      DateTime          @default(now())
  actualizadoEn DateTime          @updatedAt
  @@index([expedienteId])
}

model EntregableVersion {
  id            String      @id @default(cuid())
  entregable    Entregable  @relation(fields: [entregableId], references: [id])
  entregableId  String
  version       Int
  contenido     Json                                   // JSONB tipado (ReporteV1, GuionV1, ...)
  aprobado      Boolean     @default(false)
  pdfR2Key      String?                                // objeto en R2 si se exportó
  verificacion  Json?                                  // auditoría de Verificación de citas (C-2)
  creadoEn      DateTime    @default(now())
  @@unique([entregableId, version])
}

// ── Catálogo SOC (el foso) ──────────────────────────────
model Institucion {
  id        String     @id @default(cuid())
  nombre    String     @unique                          // Banorte, Konfío, ...
  productos Producto[]
}

model Producto {
  id            String          @id @default(cuid())
  institucion   Institucion     @relation(fields: [institucionId], references: [id])
  institucionId String
  nombre        String                                  // Crédito Revolvente, Factoraje, ...
  paraQueSirve  String
  condiciones   String                                  // "condiciones típicas"
  cuandoRecomendar String
  recomendaciones Recomendacion[]
  @@unique([institucionId, nombre])
}

// ── Recomendaciones / Citas / Brechas (capa de síntesis) ─
model Recomendacion {
  id             String            @id @default(cuid())
  version        EntregableVersion @relation(fields: [versionId], references: [id])
  versionId      String
  producto       Producto          @relation(fields: [productoId], references: [id]) // C-1: FK real
  productoId     String
  hallazgo       String                                  // qué necesidad la originó (trazable)
  argumentoCierre String
}
// (Citas y Brechas pueden vivir embebidas en `contenido` JSONB del Reporte,
//  o como tablas si se requiere consulta/auditoría cruzada. Default v1: embebidas + auditables.)

// ── Enums del dominio ───────────────────────────────────
enum EtapaExpediente { PROSPECTO INVESTIGADO RECOMENDADO EN_ACERCAMIENTO EN_TRAMITE EN_CIERRE GANADO PERDIDO }
enum EstadoTarea     { ENCARGADA EN_CURSO ENTREGADA BLOQUEADA }
enum EstadoEntregable{ BORRADOR APROBADO }
enum RolEmpleado     { SOCRATES PROSPECTOR INVESTIGADOR ASESOR_PRODUCTO NEGOCIADOR TRAMITADOR GESTOR }
```

**Nota de migraciones (doctrina del Director):** las migraciones son **cartas ya enviadas** — se corrigen hacia adelante (`prisma migrate dev` en local, `prisma migrate deploy` en arranque del servicio Railway), nunca se reescribe el historial.

---

## 8. Estructura del monorepo (árbol completo)

```
socrates/
├── package.json                      # workspaces pnpm
├── pnpm-workspace.yaml               # apps/*, packages/*
├── turbo.json                        # pipeline Turborepo (build, dev, test, lint)
├── tsconfig.base.json                # TS estricto compartido
├── .env.example                      # plantilla de todas las variables (ver §11)
├── .gitignore                        # (git local; sin remoto GitHub)
├── README.md
│
├── apps/
│   ├── web/                          # Next.js 16 (App Router) → Vercel
│   │   ├── package.json
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── proxy.ts                  # ⬅ Next 16: export const proxy = clerkMiddleware()
│   │   ├── vercel.json
│   │   ├── public/                   # logo SOC|TALENT, íconos de rol (tortuga, etc.)
│   │   └── src/
│   │       ├── app/
│   │       │   ├── layout.tsx        # <ClerkProvider> + es-MX
│   │       │   ├── page.tsx          # → redirige a /oficina
│   │       │   ├── sign-in/[[...rest]]/page.tsx
│   │       │   ├── oficina/page.tsx              # P-1 La Oficina (FR-5)
│   │       │   ├── expedientes/[id]/page.tsx     # P-2 Detalle (FR-6)
│   │       │   ├── entregables/[id]/page.tsx     # P-3 Visor/Editor (FR-13)
│   │       │   └── empleados/[rol]/page.tsx      # P-4 Vista de Empleado
│   │       ├── components/
│   │       │   ├── ui/               # shadcn/ui
│   │       │   ├── oficina/          # TarjetaExpediente, FiltrosOficina, PanelEquipo
│   │       │   ├── expediente/       # CabeceraExpediente, BandejaEntregables, BarraProgreso
│   │       │   ├── entregable/       # VisorReporte, PanelFuentes, SeccionBrechas, BarraAcciones
│   │       │   └── socrates/         # BarraComando, PanelPlanPropuesto
│   │       ├── lib/
│   │       │   ├── api-client.ts     # cliente tipado a apps/api (adjunta JWT de Clerk)
│   │       │   ├── polling.ts        # D-7 polling de estado
│   │       │   └── format-esmx.ts    # formateo es-MX (fechas, montos)
│   │       └── hooks/                # useExpedientes, useEntregable, useSocrates
│   │
│   └── api/                          # Hono → Railway (long-running)
│       ├── package.json
│       ├── Dockerfile                # build TS → dist/; migrate deploy en arranque
│       ├── railway.json
│       └── src/
│           ├── index.ts             # app Hono, lee process.env.PORT, GET /health
│           ├── middleware/
│           │   ├── auth.ts          # D-1 @clerk/backend networkless → Asesor.id
│           │   ├── cors.ts
│           │   └── errors.ts        # formato { error: { codigo, mensaje } }
│           ├── rutas/
│           │   ├── expedientes.ts   # FR-4..7
│           │   ├── socrates.ts      # FR-1..3 (instruir/confirmar/reporte)
│           │   ├── entregables.ts   # FR-13 (editar/aprobar/exportar)  ← Gate humano C-3
│           │   ├── catalogo.ts      # FR-19
│           │   └── empleados.ts     # estado del equipo
│           ├── orquestador/
│           │   ├── socrates.ts      # D-4: interpretar/planear/delegar/reportar
│           │   ├── planificador.ts  # plan estructurado (Zod) + dependencias
│           │   └── reglas-fallback.ts # enrutamiento heurístico sin claves
│           ├── empleados/           # D-3: registro + implementaciones
│           │   ├── registro.ts      # Map<RolEmpleado, Empleado>
│           │   ├── investigador/    # ⭐ pipeline 6 fases (D-5)
│           │   │   ├── index.ts
│           │   │   ├── fase-investigar.ts
│           │   │   ├── fase-foda.ts
│           │   │   ├── fase-sintesis.ts       # capa de síntesis + C-1
│           │   │   ├── fase-ensamblar.ts
│           │   │   ├── verificar-citas.ts     # C-2
│           │   │   ├── seed.ts                # fallback Probemedic/Las Aliadas
│           │   │   └── investigador.test.ts
│           │   ├── prospector/      # FR-14
│           │   ├── asesor-producto/ # FR-15 (consulta Catálogo, C-1)
│           │   ├── negociador/      # FR-16 (depende de Reporte aprobado)
│           │   ├── tramitador/      # FR-17 (cotización desde Catálogo, NFR-9)
│           │   └── gestor/          # FR-18
│           ├── worker/
│           │   └── cola-tareas.ts   # §6.3 loop de Tareas en Postgres
│           ├── ia/
│           │   └── proveedor-ia.ts  # D-6: wrapper AI Gateway + fallback
│           ├── calidad/
│           │   ├── fidelidad-catalogo.ts  # C-1
│           │   ├── verificacion-citas.ts  # C-2
│           │   └── gate-humano.ts         # C-3 (verificación de estado)
│           ├── storage/
│           │   ├── r2-client.ts     # @aws-sdk/client-s3 (endpoint R2)
│           │   ├── subir-pdf.ts     # PutObject
│           │   └── url-descarga.ts  # presigned GET (s3-request-presigner)
│           ├── pdf/
│           │   └── render-reporte.ts # HTML canónico SOC|TALENT → PDF + disclaimer (NFR-9)
│           └── progreso/
│               └── derivar-progreso.ts # función pura Etapa+Tareas → %
│
└── packages/
    ├── db/                          # Prisma + seed (la espina)
    │   ├── package.json
    │   ├── prisma/
    │   │   ├── schema.prisma        # §7
    │   │   └── migrations/
    │   └── src/
    │       ├── client.ts            # instancia Prisma (singleton)
    │       ├── generated/client/    # output del generador prisma-client (v7)
    │       └── seed/
    │           ├── seed.ts          # orquesta el sembrado
    │           ├── catalogo-soc.ts  # instituciones+productos del subconjunto v1
    │           ├── expediente-las-aliadas.ts
    │           └── expediente-probemedic.ts  # + Reporte sembrado fiel
    └── shared/                      # contratos cruzados web↔api
        ├── package.json
        └── src/
            ├── glosario.ts          # Etapas, estados, roles (enums espejo)
            ├── dto/                 # esquemas Zod compartidos (Expediente, Tarea, ...)
            ├── reporte/             # esquema ReporteV1 (JSONB del Reporte)
            └── empleados/
                └── contract.ts      # D-3: Empleado, EntradaEmpleado, ContextoEjecucion...
```

### 8.1 Mapeo Épica → ubicación

| Épica | Vive en |
|---|---|
| **E1 Cimientos** | raíz (monorepo/turbo), `apps/web/proxy.ts`, `apps/api/middleware/auth.ts`, `packages/db`, `apps/api/ia`, `apps/api/storage`, seed |
| **E2 Expediente / La Oficina** | `apps/api/rutas/expedientes.ts`, `apps/api/progreso`, `apps/web/components/oficina` + `/expediente` |
| **E3 Sócrates** | `apps/api/orquestador/*`, `apps/web/components/socrates/*` |
| **E4 Investigador + Reporte** | `apps/api/empleados/investigador/*`, `apps/api/calidad/*`, `apps/api/pdf`, `apps/web/components/entregable/*` |
| **E5 Resto del equipo** | `apps/api/empleados/{prospector,asesor-producto,negociador,tramitador,gestor}` |
| **E6 Catálogo SOC** | `packages/db/.../catalogo-soc.ts`, `apps/api/rutas/catalogo.ts`, `apps/api/empleados/asesor-producto` |
| **E7 Calidad transversal** | `apps/api/calidad/*` + tests e2e en `apps/api/test` |

---

## 9. Despliegue (Vercel + Railway por CLI, sin GitHub)

> Restricción de Carlos: **git local, sin GitHub remoto, sin CI/CD por Actions**. Deploy por **CLI**.

### 9.1 `apps/web` → Vercel (CLI)
- `vercel link` (una vez) → `vercel deploy --prebuilt` / `vercel --prod` para producción.
- Variables en Vercel: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_API_URL` (URL pública del servicio Railway).
- `proxy.ts` con `clerkMiddleware()` protege rutas; rutas públicas solo sign-in.

### 9.2 `apps/api` → Railway (CLI)
- `railway link` → `railway up` despliega el servicio desde el `Dockerfile`.
- Postgres como **plugin de Railway**; `api` se conecta por **red privada** (`DATABASE_URL` interna).
- Arranque del contenedor: `prisma migrate deploy && node dist/index.js`. Healthcheck Railway → `GET /health` (DB-aware).
- `PORT` lo provee Railway (el server lo lee de `process.env.PORT`).

### 9.3 Orden de despliegue
1. Provisionar Postgres en Railway → 2. `railway up` de `api` (corre migraciones + seed) → 3. tomar la URL pública de `api` → 4. setear `NEXT_PUBLIC_API_URL` en Vercel → 5. `vercel --prod` de `web` → 6. en Clerk, registrar los orígenes de `web` (y de `api` para CORS) y copiar `CLERK_JWT_KEY` al servicio `api`.

---

## 10. Variables de entorno

| Variable | Dónde | Propósito |
|---|---|---|
| `DATABASE_URL` | api (Railway) | Postgres por red privada |
| `CLERK_SECRET_KEY` | web + api | backend de Clerk |
| `CLERK_JWT_KEY` | api | verificación **networkless** del JWT (D-1) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | web | Clerk en el cliente |
| `NEXT_PUBLIC_API_URL` | web | URL pública del servicio `api` |
| `AI_GATEWAY_API_KEY` | api | Vercel AI Gateway (D-6). **Ausente ⇒ Modo sin claves** |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_ENDPOINT` | api | Cloudflare R2 (S3-compatible) |
| `WEB_ORIGIN` | api | origen permitido por CORS |

**Modo sin claves (NFR-11):** si faltan `AI_GATEWAY_API_KEY` (y/o R2), la app **arranca igual**: los Empleados usan seed/fallback y el export degrada con mensaje honesto. La verdad del arranque sin claves se prueba en CI local (test de bootstrap sin esas variables).

---

## 11. Capa de calidad y verificación (la red de seguridad medible)

> Es E7 y la razón de ser de la arquitectura. Las tres compuertas (§D-5) más la trazabilidad e instrumentación de las contra-métricas.

| Invariante | Dónde se aplica | Cómo se prueba | NFR / SM |
|---|---|---|---|
| **C-1 Fidelidad de catálogo** | `calidad/fidelidad-catalogo.ts`; FK real `Recomendacion.productoId` | test: una Recomendación a un id inexistente se descarta y va a Brecha; **0** instituciones/productos inventados | NFR-2, SM-C1 |
| **C-2 Verificación de citas** | `empleados/investigador/verificar-citas.ts`; auditoría en `EntregableVersion.verificacion` | test: afirmación con cita que no la respalda se **degrada** a Brecha, no se muestra como hecho | NFR-1, NFR-3, SM-C1 |
| **C-3 Gate humano** | `rutas/entregables.ts` export verifica `APROBADO` (409 si no) | test: export de Borrador → 409, no se genera PDF | NFR-4, SM-C1 |
| **Trazabilidad** | cada Cita guarda fuente (URL/doc); cada Recomendación guarda `hallazgo` | test: toda cifra del Reporte tiene fuente abrible; toda Recomendación es trazable a su hallazgo | NFR-3 |
| **Disclaimer / no oferta vinculante** | `pdf/render-reporte.ts` estampa el aviso | test: el PDF contiene el disclaimer y el pie de confidencialidad | NFR-9 |
| **Idempotencia** | claves de idempotencia en Tarea/aprobar/exportar | test: doble disparo no produce doble efecto | doctrina Director |
| **Progreso honesto** | `progreso/derivar-progreso.ts` (función pura) + Tarea.BLOQUEADA con motivo | test: Empleado que falla ⇒ progreso no sube; aparece bloqueo con motivo | P-3 UX |
| **Lenguaje de oficina** | lint de cadenas (lista negra) sobre `web` | test: ninguna cadena de UI contiene jerga de IA | NFR-14 |

**Instrumentación de contra-métricas (SM-C1/SM-C2):** se registra cada **degradación de cita** y cada **descarte por fidelidad de catálogo** (contador auditable) para vigilar que el sistema atrapa el veneno antes de que llegue al cliente. SM-C1 (incidentes de dato mal citado al cliente) objetivo **0**.

---

## 12. Validación de coherencia (cierre BMAD)

**Cobertura FR → arquitectura:** los 22 FR tienen hogar (FR-1–3 orquestador; FR-4–7 expedientes+progreso; FR-8–13 investigador+calidad+pdf; FR-14–18 empleados; FR-19 catálogo+seed; FR-20–22 auth+R2+modo sin claves). ✓
**Cobertura NFR:** los de primer orden (NFR-1–4) son código de servidor en las tres compuertas; NFR-5 (costo) por R2 cero-egreso + modelo por riesgo; NFR-6/7 por pipeline con progreso + polling; NFR-8 por tenencia derivada del token; NFR-9 en el PDF; NFR-10 por estado durable; NFR-11 por fallback; NFR-12 es-MX; NFR-13 marcado (privacidad, §13); NFR-14 por lint de cadenas. ✓
**Cobertura UX:** las 5 notas de implementación de Sally están resueltas (polling, worker durable, gate en API, versionado, fallback transparente, tenencia). ✓
**Riesgos abiertos del PRD reconocidos:** Q-1 (motor de investigación), Q-2 (mapa Etapa↔Entregable), Q-3 (subconjunto del Catálogo), Q-5 (techo de costo) — ver §13.

---

## 13. Riesgos y decisiones abiertas (lo que el build debe cuidar)

| # | Riesgo / decisión abierta | Por qué importa | Mitigación / dueño |
|---|---|---|---|
| **R-1** | **Motor de investigación de la fase 1** (PRD Q-1): qué fuente usa el Investigador para datos reales con citas (web search vía AI Gateway, API de research, scraping). Es el corazón del riesgo técnico (paridad de calidad SM-1). | Sin fuentes verificables, C-2 degrada todo a Brechas y el Reporte pierde valor. Define costo (NFR-5) y latencia (NFR-6). | **PoC primero** (E4 antes que nada): probar la fase 1+3 contra un prospecto real vs. el reporte que Carlos haría a mano. Dueño: Arquitectura + Carlos. |
| **R-2** | **Costo unitario por Reporte** (NFR-5, Q-5): dos llamadas pesadas (síntesis + verificación) + investigación. | Debe quedar en centavos contra una comisión de $25k–50k. | Medir en el PoC; el wrapper `ProveedorIA` permite bajar de modelo por paso si es necesario. |
| **R-3** | **Trabajo largo en Railway** (≤15 min) y el worker in-process. | Un reinicio del servicio a mitad de generación no debe perder trabajo (NFR-10). | Estado durable en Postgres + idempotencia; el worker retoma Tareas `EN_CURSO` huérfanas al arrancar. Si crece, mover a BullMQ. |
| **R-4** | **Dos orígenes (web/api) + JWT cross-service**: CORS y expiración de token en generaciones largas. | Un token vencido a mitad de flujo podría romper el polling. | `getToken()` se refresca en cada llamada desde `web`; el worker no depende del token del Asesor (ya tiene `asesorId`). |
| **R-5** | **Fidelidad de catálogo depende de un Catálogo curado** (Q-3): si el subconjunto v1 es pobre, la capa de síntesis recomienda poco. | C-1 es honesta pero deja hallazgos sin Recomendación si el Catálogo no cubre. | Seed curado del subconjunto de los reportes reales; Catálogo editable por datos sin redeploy. Dueño: Carlos. |
| **R-6** | **Render de PDF fiel al formato canónico SOC\|TALENT**. | La pulcritud del PDF ES parte del valor (cierra deals). | Plantilla HTML+CSS de impresión espejo de los reportes Las Aliadas/Probemedic; el reporte sembrado de Probemedic es la referencia visual de aceptación. |
| **R-7** | **Privacidad / LFPDPPP** (NFR-13, Q-7): RFC y datos fiscales. | Antes de abrir a más asesores. | Marcado, no resuelto aquí; acotado en piloto cerrado con datos de Carlos. Dueño: Carlos + legal. |
| **R-8** | **Mapa Etapa↔Entregable prerrequisito** (Q-2): qué Entregable aprobado habilita cada avance. | Define `derivar-progreso` y las transiciones válidas (FR-7). | Default en `progreso/derivar-progreso.ts`, afinado con Carlos. |

---

*Arquitectura producida por Winston (System Architect, BMAD) · método `bmad-create-architecture` (contexto → decisiones → patrones → estructura → validación) · stack verificado vía web jun-2026 · ancla en PRD Sócrates v1, UX "La Oficina", addendum, y data-room SIM (PRD MVP "El Investigador", Reporte de Innovación v0.2). Siguiente en la cadena: `bmad-create-epics-and-stories` → `bmad-check-implementation-readiness`.*

---

## Apéndice A — Fuentes web consultadas (jun-2026)

- Next.js 16 / versión estable y `proxy.ts`: nextjs.org/blog/next-16, nextjs.org/docs/app/guides/upgrading/version-16, nextjs.org/docs/messages/middleware-to-proxy
- Clerk App Router + middleware: clerk.com/docs/nextjs/getting-started/quickstart, clerk.com/docs/reference/nextjs/clerk-middleware
- Clerk verificación cross-service networkless: clerk.com/docs/reference/backend/authenticate-request, clerk.com/docs/guides/sessions/manual-jwt-verification, clerk.com/docs/reference/backend/verify-token
- Vercel AI Gateway + AI SDK: vercel.com/docs/ai-gateway, ai-sdk.dev/providers/ai-sdk-providers/ai-gateway, vercel.com/docs/ai-gateway/models-and-providers
- Hono + Railway + Prisma: docs.railway.com/guides/hono, prisma.io/docs/orm/prisma-client/deployment/traditional/deploy-to-railway, prisma.io/docs/guides/frameworks/hono
- Prisma 7 (Rust-free, generador `prisma-client`, ESM): prisma.io/blog/announcing-prisma-orm-7-0-0, prisma.io/docs/guides/upgrade-prisma-orm/v7, prisma.io/changelog/2025-11-19
- Cloudflare R2 vía AWS SDK + presigned: developers.cloudflare.com/r2/objects/upload-objects, ruanmartinelli.com/blog/cloudflare-r2-pre-signed-urls
