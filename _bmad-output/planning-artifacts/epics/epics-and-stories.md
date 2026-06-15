---
title: "Épicas e Historias: Sócrates — la plataforma de SOC | TALENT"
status: draft
created: 2026-06-14
updated: 2026-06-14
sm: John (PM/SM, BMAD)
idioma: es-MX
stepsCompleted: [1, 2, 3, 4]
workflowType: create-epics-and-stories
inputDocuments:
  - _bmad-output/planning-artifacts/prd/prd.md
  - _bmad-output/planning-artifacts/architecture/architecture.md
  - _bmad-output/planning-artifacts/ux/ux-design.md
  - _bmad-output/planning-artifacts/briefs/brief-SOC-2026-06-14/brief.md
  - _bmad-output/planning-artifacts/briefs/brief-SOC-2026-06-14/addendum.md
fuentes_sim:
  - docs/sim-handoff/07-prd-mvp.md
  - docs/sim-handoff/01-one-pager.md
  - docs/sim-handoff/09-plan-de-equipo.md
  - docs/sim-handoff/reporte-innovacion-v0.2.md
---

# Sócrates — Desglose de Épicas e Historias

## Overview

Este documento descompone los requisitos del **PRD de Sócrates v1** (22 FR, 14 NFR), las decisiones de la **Arquitectura** (Winston: D-1…D-10, esquema Prisma, las tres compuertas de calidad C-1/C-2/C-3, worker de Tareas, despliegue por CLI) y la especificación de **UX "La Oficina"** (Sally: 6 pantallas, componentes C-1…C-6, flujos F-1…F-5) en **épicas secuenciadas** y **historias implementables**, cada una con criterios de aceptación verificables en formato Dado/Cuando/Entonces y notas técnicas.

**La estrella polar** (mandato del Consejo SIM, del PRD y de la Arquitectura): *el control de calidad/precisión a escala ES el producto.* Un dato financiero mal citado o una institución/producto inventado es el veneno. Las tres compuertas — **Fidelidad de catálogo (C-1)**, **Verificación de citas (C-2)** y **Gate humano (C-3)** — son código de servidor, nunca solo de UI, y atraviesan E4, E5 y E8.

**Regla de lenguaje** (NFR-14, P-1 de UX): este documento es técnico (habla de "modelo", "endpoint", "agente"); eso es legítimo en la planeación. Pero **toda cadena que ve el Asesor** usa lenguaje de oficina ("empleado", "encargo", "entregó", "esperando tu revisión") — jamás "modelo", "prompt", "token", "agente", "chatbot".

**Cómo leer la numeración:** las historias se numeran `E{n}-S{m}` (p. ej. `E4-S3`). Cada historia marca sus **dependencias** explícitas. Dentro de una épica, las historias van en orden de implementación y **ninguna depende de una historia futura** de su misma épica.

---

## Requirements Inventory

### Functional Requirements (del PRD)

- **FR-1** — Sócrates interpreta la intención del Asesor en lenguaje natural de oficina (intención + Expediente objetivo + Empleados).
- **FR-2** — Sócrates planifica y delega Tareas a los Empleados, respetando dependencias; el Asesor puede vetar/ajustar antes de ejecutar.
- **FR-3** — Sócrates reporta avance de vuelta (listo / esperando tu revisión / bloqueado con motivo).
- **FR-4** — Crear y gestionar Expedientes por prospecto/cliente (mínimos: empresa, ciudad, industria).
- **FR-5** — Mostrar la lista de Expedientes con progreso, Etapa, Empleados activos, filtros (La Oficina).
- **FR-6** — Ver el detalle de un Expediente (Tareas por Empleado + Entregables Borrador/Aprobado + Etapa + progreso derivado).
- **FR-7** — Avanzar la Etapa del Expediente por transiciones válidas; marcar Ganado/Perdido manualmente.
- **FR-8** — Generar el Reporte de Inteligencia desde el Expediente con todas las secciones canónicas.
- **FR-9** — Citar toda afirmación cuantitativa con fuente verificable (Cita).
- **FR-10** — Producir Recomendaciones accionables contra el Catálogo SOC (capa de síntesis: hallazgo → Producto → Institución → argumento de cierre).
- **FR-11** — Marcar Brechas de información (honestidad como feature).
- **FR-12** — Verificar las citas (segundo pase) antes de mostrar el borrador.
- **FR-13** — Editar, aprobar (Gate humano) y exportar el Reporte a PDF con marca SOC | TALENT a R2.
- **FR-14** — Prospector: calificar/enriquecer prospectos que el Asesor aporta.
- **FR-15** — Asesor de producto: matchear Producto/Institución del Catálogo SOC.
- **FR-16** — Negociador: pitch, guion de acercamiento y manejo de objeciones.
- **FR-17** — Tramitador: lista de requisitos y cotización estimada (marcada como no vinculante).
- **FR-18** — Gestor: seguimiento, cierre y postventa.
- **FR-19** — Mantener un Catálogo SOC estructurado y curado (Institución → Producto → uso → condiciones → cuándo recomendar), editable por datos.
- **FR-20** — Autenticación y aislamiento por Asesor (Clerk).
- **FR-21** — Persistir Entregables y archivos (R2 + Postgres).
- **FR-22** — Operar en Modo sin claves (seed Las Aliadas + Probemedic, Reporte sembrado fiel, fallback honesto).

### NonFunctional Requirements (del PRD)

- **NFR-1** — Precisión/veracidad: 100% de afirmaciones cuantitativas con Cita; 0 cifras inventadas como hecho.
- **NFR-2** — Fidelidad de catálogo: solo recomienda Productos/Instituciones existentes en el Catálogo; jamás alucina.
- **NFR-3** — Trazabilidad: toda Cita rastreable a su fuente (URL/documento).
- **NFR-4** — Gate humano obligatorio: ningún Entregable sale al cliente sin aprobación humana; no se salta.
- **NFR-5** — Costo por Reporte muy por debajo del valor de un deal (techo a calibrar en el PoC).
- **NFR-6** — Latencia: generación de un Reporte ≤ 15 min; La Oficina y edición fluidas.
- **NFR-7** — Capacidad de respuesta de Sócrates: primer acuse ≤ 3 s; plan antes de ejecutar.
- **NFR-8** — Seguridad y aislamiento multi-asesor (Clerk): cada Asesor solo accede a sus datos.
- **NFR-9** — Disclaimer / no oferta vinculante en cada Reporte y cotización.
- **NFR-10** — Confiabilidad: un fallo de generación no pierde el trabajo capturado del Expediente.
- **NFR-11** — Resiliencia sin claves (fallback): la app no truena sin claves de IA/proveedor.
- **NFR-12** — Idioma: español de México con ortografía perfecta en toda la superficie y en los Entregables.
- **NFR-13** — Privacidad/datos: manejo serio de RFC/datos fiscales; preparar terreno LFPDPPP.
- **NFR-14** — Lenguaje de oficina (anti-IA): ningún término de IA en la superficie del producto.

### Additional Requirements (de la Arquitectura — decisiones que el build debe honrar)

- **AR-1 (D-1)** — Dos artefactos (`web` Vercel / `api` Railway, orígenes distintos). `api` verifica el JWT de Clerk **networkless** con `CLERK_JWT_KEY` y deriva la tenencia de su propia fila `Asesor`, **nunca del payload**.
- **AR-2 (D-2)** — Postgres + Prisma 7 (generador `prisma-client`, `output` obligatorio, ESM). Espina `Asesor → Expediente → (Tarea | Entregable)`; contenido del Reporte como **JSONB tipado** en `EntregableVersion.contenido`.
- **AR-3 (D-3)** — Contrato común de Empleado `ejecutar(entrada, ctx) → resultado` en `packages/shared`, con `ctx.modoSinClaves` y `ctx.registrarProgreso`.
- **AR-4 (D-4)** — Orquestación **síncrona-asistida**: plan estructurado (Zod) mostrado y **confirmado** antes de ejecutar; nunca autónomo. En Modo sin claves, enruta por reglas heurísticas.
- **AR-5 (D-5)** — Pipeline del Investigador en **6 fases** con progreso persistido; las tres compuertas C-1/C-2/C-3 son código de servidor.
- **AR-6 (D-6)** — Capa de IA: wrapper único `ProveedorIA` sobre AI Gateway con strings `anthropic/claude-*`; **fallback obligatorio** si falta `AI_GATEWAY_API_KEY`.
- **AR-7 (D-7)** — Transporte de estado: **polling** ligero (5–10 s) con backoff; sin WebSocket en v1.
- **AR-8 (D-8)** — Storage R2: PDF renderizado en `api`, subido con `@aws-sdk/client-s3`; descarga por **presigned GET** de vencimiento corto.
- **AR-9 (D-9/D-10)** — Validación con **Zod** en el borde y en salidas de IA (`generateObject`); respuestas cuerpo-directo; errores `{ error: { codigo, mensaje } }` en español de oficina; idempotencia en crear Tarea / aprobar / exportar.
- **AR-10** — Worker de Tareas: loop in-process que toma Tareas `ENCARGADA` con dependencias cumplidas, persiste estado en Postgres (resiliente a reinicio/navegación), retoma Tareas `EN_CURSO` huérfanas al arrancar.
- **AR-11** — Despliegue por **CLI** (Vercel + Railway), git local sin GitHub; arranque del contenedor `prisma migrate deploy && node dist/index.js`; healthcheck `GET /health` DB-aware.

### UX Design Requirements (de la especificación de Sally — UX-DR)

- **UX-DR-1** — Lenguaje de oficina inviolable en el 100% de la superficie; estados de empleado "Libre/Trabajando/Entregó", nunca "Procesando/Generando" (P-1).
- **UX-DR-2** — La vista raíz es **La Oficina** (lista de Expedientes), no un dashboard ni un inbox (P-2).
- **UX-DR-3** — Progreso honesto: un fallo se muestra como bloqueo con motivo, nunca como % falso (P-3).
- **UX-DR-4** — El Gate humano se presenta como característica satisfactoria, no fricción; botón de aprobar prominente (P-4 UX).
- **UX-DR-5** — Calidad visible: citas, fuentes verificables, brechas marcadas, sello SOC | TALENT son elementos de interfaz tocables (P-5 UX).
- **UX-DR-6** — Estética premium sin ostentación; shadcn/ui + Tailwind; modo claro único; es-MX perfecto (P-6, §2).
- **UX-DR-7** — Componentes: Tarjeta de Empleado (C-1), Tarjeta de Expediente (C-2), Barra de Comando de Sócrates con panel de plan (C-3), Bandeja de Entregables (C-4), Cuerpo del Reporte con citas inline + brechas (C-5), Barra de Progreso con hitos de Etapa (C-6).
- **UX-DR-8** — 6 pantallas: P-0 Autenticación, P-1 La Oficina, P-2 Detalle de Expediente, P-3 Visor/Editor de Entregable, P-4 Vista de Empleado, P-5 Generación del Reporte (modal con progreso por sección, resiliente a navegación).
- **UX-DR-9** — Accesibilidad WCAG 2.1 AA: navegación por teclado, `aria-label` en badges, `role="progressbar"`, `aria-live="polite"` en cambios de estado, foco visible, labels en formularios.
- **UX-DR-10** — Responsive escritorio (≥1280px, `max-width` 1400px); hoja de estilos de impresión para el Reporte (PDF limpio).
- **UX-DR-11** — Actualización de La Oficina sin recarga manual (transparente al mecanismo: polling).

### FR Coverage Map

| Requisito | Épica | Descripción breve |
|---|---|---|
| FR-20 | **E1** | Auth Clerk + aislamiento por Asesor (cross-service networkless) |
| FR-21 | **E1** | Persistencia base (Postgres/Prisma) + R2 inicializado |
| FR-22 | **E1** + E7 | Modo sin claves: bootstrap sin claves + seed (seed pleno en E7) |
| FR-4 | **E2** | Crear/gestionar Expedientes |
| FR-5 | **E2** | La Oficina: lista con progreso + filtros |
| FR-6 | **E2** | Detalle de Expediente (Tareas + Entregables + progreso) |
| FR-7 | **E2** | Avanzar Etapa; Ganado/Perdido |
| FR-1 | **E3** | Sócrates interpreta intención |
| FR-2 | **E3** | Sócrates planifica/delega con dependencias |
| FR-3 | **E3** | Sócrates reporta avance |
| FR-8 | **E4** | Generar Reporte de Inteligencia |
| FR-9 | **E4** | Citas verificables |
| FR-10 | **E4** + E6 | Capa de síntesis → Recomendaciones (consume Catálogo de E6) |
| FR-11 | **E4** | Brechas de información |
| FR-12 | **E4** | Verificación de citas (C-2) |
| FR-13 | **E4** | Editar/Aprobar (C-3)/Exportar PDF a R2 |
| FR-19 | **E6** | Catálogo SOC estructurado y curado |
| FR-15 | **E6** | Asesor de producto (match contra Catálogo) |
| FR-14 | **E5** | Prospector |
| FR-16 | **E5** | Negociador |
| FR-17 | **E5** | Tramitador |
| FR-18 | **E5** | Gestor |
| NFR-1, NFR-2, NFR-3, NFR-4, NFR-9 | **E7** (transversal, materializado en E4/E5/E6) | Endurecer compuertas + trazabilidad + disclaimer + instrumentar contra-métricas |
| NFR-5…NFR-14 | Transversales, verificados en **E8** y a lo largo | Costo, latencia, aislamiento, idioma, fallback, etc. |

> **Nota de secuencia (ajuste sobre el orden sugerido):** se adelanta el **Catálogo SOC (E6)** para que quede **antes** del resto del equipo, porque la Arquitectura (orden de implementación D-5) exige el Catálogo curado **antes** de la capa de síntesis del Investigador (compuerta C-1). En la práctica el seed mínimo del Catálogo nace dentro de E4 (lo que el Investigador necesita) y E6 lo completa/cura y entrega el Empleado "Asesor de producto". El "Seed realista pleno" (Las Aliadas/Probemedic con Reporte sembrado fiel) se consolida en **E7**, ya que necesita la forma final del Reporte de E4. **E8** despliega y verifica en el mundo real.

---

## Epic List

### Épica E1: Cimientos de plataforma — la oficina enciende y reconoce a su dueño
Levanta el monorepo, los dos despliegues (web/api), la base de datos con la espina mínima, la autenticación con aislamiento por Asesor, el storage R2, la capa de IA con fallback, y el arranque en Modo sin claves. Al cerrar E1, un Asesor entra con su cuenta, la app no truena sin claves de IA, y existe el esqueleto sobre el que todo lo demás se construye.
**FRs cubiertos:** FR-20, FR-21, FR-22 (bootstrap). **NFR:** NFR-8, NFR-10, NFR-11, NFR-12, NFR-14. **AR:** AR-1, AR-2, AR-6, AR-9, AR-11.

### Épica E2: El Expediente y La Oficina — la columna vertebral
Entrega la vista raíz (La Oficina) con la lista de Expedientes, su progreso visible y honesto, los filtros; la creación y edición de Expedientes; el detalle con Tareas y Entregables; las Etapas y el avance Ganado/Perdido. Al cerrar E2, el Asesor vive organizado por carpetas de prospectos aunque todavía no haya empleados que las llenen.
**FRs cubiertos:** FR-4, FR-5, FR-6, FR-7. **NFR:** NFR-8, NFR-12. **AR:** AR-2, AR-7. **UX-DR:** 2, 3, 6, 7 (C-2, C-6), 8 (P-1, P-2), 9, 10, 11.

### Épica E3: Sócrates, el gerente — el interlocutor que delega y reporta
Entrega la Barra de Comando, la interpretación de intención en lenguaje de oficina, el plan propuesto confirmable, la creación de Tareas con dependencias, el worker que las ejecuta, y el reporte de avance. Al cerrar E3, el Asesor le habla a Sócrates y ve aparecer Tareas asignadas a empleados en sus Expedientes (con empleados "stub" que aún entregan poco; E4/E5/E6 los llenan).
**FRs cubiertos:** FR-1, FR-2, FR-3. **NFR:** NFR-7, NFR-10, NFR-11, NFR-14. **AR:** AR-3, AR-4, AR-9, AR-10. **UX-DR:** 1, 7 (C-3), 8 (C-3 en P-1/P-2).

### Épica E4: El Investigador y el Reporte — el foso y el riesgo técnico (PoC primero)
El corazón del producto. Entrega el pipeline de 6 fases del Investigador, las Recomendaciones contra el Catálogo (capa de síntesis, compuerta C-1), las citas verificables, la verificación de citas (C-2), las brechas, el ensamblado canónico, el visor/editor del Reporte, el Gate humano (C-3) y la exportación a PDF con marca a R2. Al cerrar E4, el flujo punta de lanza está completo y probado contra un prospecto real.
**FRs cubiertos:** FR-8, FR-9, FR-10 (parcial; completa con E6), FR-11, FR-12, FR-13. Incluye seed mínimo de Catálogo para no bloquearse. **NFR:** NFR-1, NFR-2, NFR-3, NFR-4, NFR-5, NFR-6, NFR-9, NFR-10. **AR:** AR-5, AR-6, AR-8. **UX-DR:** 4, 5, 7 (C-4, C-5), 8 (P-3, P-5), 9, 10.

### Épica E6: El Catálogo SOC — el insumo del foso (curado y consultable)
Estructura y cura el Catálogo (Institución → Producto → uso → condiciones → cuándo recomendar) del subconjunto v1 de los reportes reales, lo hace consultable por los Empleados y editable por datos, y entrega el Empleado "Asesor de producto" que matchea contra él (alimentando las Recomendaciones de E4). Al cerrar E6, la capa de síntesis recomienda solo entradas reales del Catálogo con cobertura suficiente.
**FRs cubiertos:** FR-19, FR-15. **NFR:** NFR-2, NFR-12. **AR:** AR-2. **UX-DR:** 6.

### Épica E5: El resto del equipo — el flujo completo del asesor
Entrega los cuatro Empleados restantes sobre el contrato común: Prospector (califica), Negociador (pitch/guion/objeciones, dependiente del Reporte aprobado), Tramitador (requisitos + cotización estimada no vinculante), Gestor (seguimiento/cierre/postventa). Al cerrar E5, el Asesor dirige a todo el equipo a lo largo de las Etapas, con Gate humano cuando los entregables salen al cliente.
**FRs cubiertos:** FR-14, FR-16, FR-17, FR-18. **NFR:** NFR-3, NFR-4, NFR-9, NFR-11, NFR-12, NFR-14. **AR:** AR-3, AR-4, AR-5 (compuertas). **UX-DR:** 4, 7 (C-4), 8 (P-3 subtipo B).

### Épica E7: Calidad como producto + Seed realista — la red de seguridad medible y la demo viva
Endurece las tres compuertas como invariantes probados, instrumenta las contra-métricas (SM-C1/SM-C2), siembra los Expedientes Las Aliadas y Probemedic con el Reporte de Probemedic sembrado fiel, y consolida el Modo sin claves de extremo a extremo. Al cerrar E7, la demo sin claves muestra valor real y la calidad es medible, no aspiracional.
**FRs cubiertos:** FR-22 (seed pleno), refuerzo de FR-9, FR-10, FR-12, FR-13. **NFR:** NFR-1, NFR-2, NFR-3, NFR-4, NFR-9, NFR-11. **AR:** AR-5, AR-6. **UX-DR:** 1, 3, 5.

### Épica E8: Despliegue a producción y verificación en el mundo real
Despliega `api` a Railway y `web` a Vercel por CLI (sin GitHub), conecta R2 y Clerk en producción, corre migraciones + seed, y **verifica el flujo de punta a punta contra el artefacto real** (el Expediente en la BD, el PDF en el bucket, el login real). Al cerrar E8, Sócrates v1 corre en producción y un Asesor real puede cerrar un deal con un Reporte generado por la plataforma.
**FRs cubiertos:** verificación de todos. **NFR:** NFR-5 (medido), NFR-6, NFR-7, NFR-8, NFR-10, NFR-11, NFR-13. **AR:** AR-11. **UX-DR:** verificación de 8, 9, 10.

---

## Épica E1: Cimientos de plataforma — la oficina enciende y reconoce a su dueño

**Meta:** al cerrar E1 existe un monorepo desplegable en dos artefactos, con base de datos viva, autenticación con aislamiento por Asesor, storage R2 y capa de IA con fallback, y la app arranca y muestra una shell vacía de La Oficina incluso sin claves de IA. Es el cimiento; entrega poco valor de cara al Asesor pero habilita todo lo demás. (Se acepta como épica de cimientos porque concentra el riesgo de integración del stack fijado en un solo lugar, en vez de dispersarlo.)

### Story E1-S1: Esqueleto del monorepo y pipeline de build

As a equipo de desarrollo,
I want un monorepo pnpm + Turborepo con `apps/web`, `apps/api`, `packages/shared`, `packages/db` y un pipeline de build/dev/test/lint que corre verde,
So that todas las piezas comparten tipos y convenciones desde el día uno y cada agente de implementación encaja su trabajo sin fricción.

**Acceptance Criteria:**

**Given** un checkout limpio del repositorio (git local, sin remoto GitHub)
**When** se ejecuta `pnpm install` y `pnpm turbo build`
**Then** se construyen los cuatro workspaces sin errores
**And** `tsconfig.base.json` aplica TypeScript estricto compartido y `packages/shared` exporta el `glosario.ts` con los enums espejo (Etapa, EstadoTarea, EstadoEntregable, RolEmpleado).

**Given** el pipeline de Turborepo configurado
**When** se ejecuta `pnpm turbo lint` y `pnpm turbo test`
**Then** ambos corren sobre los cuatro workspaces y reportan estado por paquete
**And** existe un test placeholder en `packages/shared` que pasa, demostrando el cableado de tests co-locados.

**Given** las convenciones de nomenclatura de la Arquitectura (§5.1)
**When** se revisa la estructura
**Then** los términos del dominio están en español (`expediente`, `entregable`, `etapa`) y los enums usan valores en mayúsculas estables.

**Notas técnicas:** estructura exacta en Arquitectura §8 (árbol del monorepo). `pnpm-workspace.yaml` con `apps/*`, `packages/*`. `turbo.json` con pipeline build/dev/test/lint. Sin starter de terceros (AR, §3). git local sin remoto.
**Dependencias:** ninguna (raíz del árbol).

### Story E1-S2: La espina mínima en Postgres (Asesor + Expediente) con Prisma 7

As a equipo de desarrollo,
I want el esquema Prisma 7 con los modelos `Asesor` y `Expediente` (y los enums del dominio), generado y migrado contra Postgres,
So that la columna vertebral existe y toda lectura/escritura futura puede filtrar por tenencia.

**Acceptance Criteria:**

**Given** `packages/db/prisma/schema.prisma` con generador `prisma-client` (Rust-free), `output` obligatorio y `moduleFormat = "esm"`
**When** se ejecuta `prisma migrate dev`
**Then** se crean las tablas `Asesor` y `Expediente` con sus campos (Arquitectura §7) y los enums `EtapaExpediente`, `EstadoTarea`, `EstadoEntregable`, `RolEmpleado`
**And** `Expediente` nace con `etapa = PROSPECTO`, `progreso = 0`, índice `@@index([asesorId, etapa])`, y FK `asesorId` hacia `Asesor`.

**Given** el cliente Prisma generado en `packages/db/src/generated/client`
**When** `packages/db/src/client.ts` exporta una instancia singleton
**Then** `apps/api` puede importarla y ejecutar una query de prueba contra Postgres.

**Given** la doctrina de migraciones (cartas ya enviadas)
**When** se necesita un cambio de esquema
**Then** se corrige hacia adelante con una nueva migración; no se reescribe el historial.

**Notas técnicas:** los modelos `Tarea`, `Entregable`, `EntregableVersion`, `Institucion`, `Producto`, `Recomendacion` se crean en sus historias (E2/E4/E6), no aquí (principio: crear entidades solo cuando la historia las necesita). Postgres por red privada de Railway (`DATABASE_URL`).
**Dependencias:** E1-S1.

### Story E1-S3: El Asesor inicia sesión y solo ve lo suyo (Clerk + aislamiento)

As a asesor financiero de SOC,
I want entrar a Sócrates con mi cuenta y que el sistema reconozca que soy yo,
So that accedo a mi oficina y nadie más puede ver mis Expedientes.

**Acceptance Criteria:**

**Given** `apps/web` con `<ClerkProvider>` (es-MX) y `proxy.ts` exportando `clerkMiddleware()` (Next 16)
**When** un visitante sin sesión navega a cualquier ruta protegida
**Then** es redirigido a la pantalla de inicio de sesión (P-0); no hay contenido de Expediente visible sin sesión.

**Given** un Asesor autenticado en `web`
**When** `web` llama a `apps/api` adjuntando el JWT de Clerk (`Authorization: Bearer`, vía `await auth().getToken()`)
**Then** `api` verifica el token de forma **networkless** con `@clerk/backend` usando `CLERK_JWT_KEY` (sin llamada de red por request)
**And** `api` **resuelve o crea** la fila `Asesor` por `clerkUserId` e inyecta `ctx.asesorId`; la ruta `GET /health` permanece pública.

**Given** dos Asesores distintos con datos en la base
**When** el Asesor A consulta cualquier recurso de datos
**Then** la tenencia se deriva de la fila `Asesor` del token (**nunca del payload**) y A no puede leer ni operar recursos de B (NFR-8); un intento de acceder a un recurso ajeno responde 403.

**Notas técnicas:** AR-1 (D-1). Middleware en orden: CORS → Auth → Validación → Errores (Arquitectura §6.1). Cliente HTTP tipado único en `packages/shared`/`web/lib/api-client.ts`. Variables: `CLERK_SECRET_KEY`, `CLERK_JWT_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `WEB_ORIGIN` (CORS).
**Dependencias:** E1-S1, E1-S2.

### Story E1-S4: La capa de IA con fallback — la oficina no truena sin claves

As a equipo de desarrollo,
I want un wrapper único `ProveedorIA` sobre el AI Gateway que degrada a Modo sin claves cuando falta la clave,
So that todos los Empleados llaman a la IA igual y la app nunca truena por ausencia de claves.

**Acceptance Criteria:**

**Given** `apps/api/ia/proveedor-ia.ts` que envuelve el AI SDK (`generateText`/`generateObject`) apuntando al Vercel AI Gateway con strings `"anthropic/claude-..."`
**When** `AI_GATEWAY_API_KEY` está presente
**Then** una llamada de prueba devuelve texto generado por el modelo configurado (modelo por paso configurable por env/constante, no hardcodeado disperso).

**Given** que `AI_GATEWAY_API_KEY` no está configurada (o la llamada falla)
**When** se invoca `ProveedorIA`
**Then** el wrapper levanta `modoSinClaves = true` y **nunca** burbujea un error 500 crudo; devuelve una señal de fallback manejable.

**Given** la regla de la Arquitectura (§5.5 regla 4)
**When** un Empleado necesita IA
**Then** lo hace **solo** a través de `ProveedorIA` (nunca el AI SDK directo), para que el fallback sea uniforme.

**Notas técnicas:** AR-6 (D-6). Modelos por defecto verificados (jun-2026): razonamiento pesado `anthropic/claude-opus-4.6`/`sonnet-4.6`; estándar `sonnet-4.6`; mecánico `haiku-4.5`. Salida estructurada con `generateObject` + Zod (regla 5). Un test de bootstrap sin `AI_GATEWAY_API_KEY` confirma el arranque (NFR-11).
**Dependencias:** E1-S1.

### Story E1-S5: Almacén de archivos R2 listo (subir y descargar privado)

As a equipo de desarrollo,
I want inicializado el cliente R2 con subida server-side y descarga por presigned URL,
So that más adelante los PDFs de Reportes se guardan privados y se recuperan sin exponer el bucket.

**Acceptance Criteria:**

**Given** `apps/api/storage/r2-client.ts` con `@aws-sdk/client-s3` apuntando al endpoint S3-compatible de R2
**When** se ejecuta un test de humo que sube un objeto de prueba (`PutObjectCommand`)
**Then** el objeto queda en el bucket privado (no público) y se confirma con un `HeadObject`/`GetObject`.

**Given** `apps/api/storage/url-descarga.ts` con `@aws-sdk/s3-request-presigner`
**When** se solicita la descarga del objeto de prueba
**Then** se genera una **presigned GET URL** de vencimiento corto que permite descargar directo de R2 sin pasar el binario por `api`.

**Given** que faltan las variables de R2
**When** arranca la app
**Then** la app **arranca igual** (Modo sin claves); las operaciones de export degradan con mensaje honesto en vez de tronar.

**Notas técnicas:** AR-8 (D-8). Variables: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_ENDPOINT`. R2 es cero-egreso (NFR-5).
**Dependencias:** E1-S1.

### Story E1-S6: La shell de La Oficina enciende y saluda al Asesor

As a asesor financiero de SOC,
I want que tras iniciar sesión aterrice en La Oficina aunque todavía esté vacía,
So that confirmo que entré a *mi* oficina y la plataforma está viva.

**Acceptance Criteria:**

**Given** un Asesor autenticado (E1-S3)
**When** entra a la app
**Then** `/` redirige a `/oficina` y se muestra la shell de La Oficina con el panel "Tu equipo" (columna izquierda) y el área de "Expedientes" (columna derecha) con estado vacío.

**Given** que no hay Expedientes todavía
**When** se renderiza el estado vacío
**Then** aparece un mensaje en voz de Sócrates invitando a crear el primer Expediente o a escribirle (lenguaje de oficina, sin jerga de IA).

**Given** la app sin claves de IA
**When** el Asesor entra
**Then** La Oficina renderiza sin tronar (la barra de Sócrates puede estar presente pero su comportamiento pleno llega en E3).

**Notas técnicas:** UX-DR-2, UX-DR-6, UX-DR-8 (P-1 shell). shadcn/ui + Tailwind, modo claro, `max-width: 1400px`. Esta historia entrega el **chasis visual** de P-1; las tarjetas de Expediente reales y filtros llegan en E2; el panel "Tu equipo" se llena de comportamiento en E3.
**Dependencias:** E1-S3.

---

## Épica E2: El Expediente y La Oficina — la columna vertebral

**Meta:** al cerrar E2 el Asesor crea, ve y organiza Expedientes; La Oficina muestra la lista con progreso honesto, Etapa, Empleados activos y filtros; el detalle muestra Tareas y Entregables; las Etapas avanzan por transiciones válidas y el Asesor marca Ganado/Perdido. La columna vertebral está completa aunque los Empleados aún no la llenen (eso lo hacen E3–E6).

### Story E2-S1: Crear un Expediente para un prospecto

As a asesor financiero de SOC,
I want crear una carpeta (Expediente) para un prospecto con sus datos mínimos,
So that empiezo a organizar mi trabajo alrededor de ese prospecto.

**Acceptance Criteria:**

**Given** el modelo `Expediente` y el endpoint `POST /expedientes`
**When** el Asesor envía empresa, ciudad e industria (campos mínimos obligatorios) y opcionalmente sitio web, RFC, # sucursales, notas
**Then** se crea un Expediente en Etapa **Prospecto** con progreso 0% y sin Entregables, asociado a su `asesorId` (derivado del token)
**And** los campos opcionales ausentes no bloquean la creación; los mínimos ausentes producen 400 con mensaje en español de oficina.

**Given** el botón "Nuevo expediente" en La Oficina (P-1)
**When** el Asesor lo usa y completa el formulario
**Then** el nuevo Expediente aparece en su lista al confirmar.

**Given** dos Asesores
**When** el Asesor A crea un Expediente
**Then** solo A lo ve (aislamiento NFR-8); B nunca lo lista ni lo abre.

**Notas técnicas:** FR-4. Validación Zod en el borde (AR-9). RFC/datos fiscales tratados con seriedad (NFR-13, marcado). Endpoint `POST /expedientes` (Arquitectura §6.2).
**Dependencias:** E1-S3 (auth/tenencia), E1-S2 (modelo Expediente).

### Story E2-S2: Ver La Oficina — la lista de Expedientes con progreso

As a asesor financiero de SOC,
I want ver todos mis Expedientes como tarjetas con su Etapa, progreso y Empleados activos,
So that de un vistazo sé dónde poner mi energía esta semana.

**Acceptance Criteria:**

**Given** `GET /expedientes` y la tarjeta de Expediente (C-2)
**When** el Asesor abre La Oficina
**Then** cada tarjeta muestra: nombre del prospecto, Etapa actual, barra de progreso (C-6), chips de Empleados trabajando, e indicador ⚠ si hay un Entregable esperando Gate humano.

**Given** el ordenamiento por defecto
**When** se renderiza la lista
**Then** los Expedientes con Gate pendiente aparecen primero, luego por última actividad.

**Given** que cambia el estado de una Tarea o Entregable en el servidor
**When** el Asesor permanece en La Oficina sin recargar
**Then** la lista refleja el cambio mediante **polling** ligero (5–10 s con backoff) sin recarga manual (UX-DR-11).

**Given** un Expediente con una Tarea bloqueada
**When** se renderiza su tarjeta
**Then** muestra el indicador 🔴 (no un progreso falso); el motivo es visible al expandir (UX-DR-3).

**Notas técnicas:** FR-5. AR-7 (polling, `web/lib/polling.ts`). C-2, C-6. Accesibilidad: tarjetas como `<article>` con `aria-label` que incluye el nombre del prospecto; `role="progressbar"` con `aria-valuenow/min/max` (UX-DR-9). Los chips de Empleados/⚠ funcionan con datos seed igual que en vivo (UX-DR transparencia de fallback).
**Dependencias:** E2-S1.

### Story E2-S3: Filtrar La Oficina por revisión pendiente y por Etapa

As a asesor financiero de SOC,
I want filtrar mis Expedientes por "esperando mi revisión" y por Etapa,
So that voy directo a lo que me bloquea sin leer toda la lista.

**Acceptance Criteria:**

**Given** la barra de herramientas de La Oficina (P-1) con filtros Todos / Esperando mi revisión / Por etapa
**When** el Asesor selecciona "Esperando mi revisión"
**Then** la lista se reduce a los Expedientes con al menos un Entregable en Borrador esperando aprobación.

**Given** el filtro por Etapa
**When** el Asesor elige una Etapa
**Then** la lista muestra solo Expedientes en esa Etapa.

**Given** la accesibilidad por teclado
**When** el Asesor tabula desde el campo de filtro
**Then** "Esperando mi revisión" es el primer resultado de Tab (tarea más urgente primero) y la lista es navegable con Tab/Enter (UX-DR-9).

**Notas técnicas:** FR-5. Filtros como query params en camelCase a `GET /expedientes`.
**Dependencias:** E2-S2.

### Story E2-S4: Abrir el detalle de un Expediente

As a asesor financiero de SOC,
I want abrir un Expediente y ver sus Tareas por Empleado, sus Entregables y su Etapa,
So that entiendo el estado completo de ese prospecto y qué falta para avanzar.

**Acceptance Criteria:**

**Given** `GET /expedientes/:id` y la pantalla P-2
**When** el Asesor abre un Expediente
**Then** ve la cabecera (nombre, industria · ciudad, barra de progreso con Etapa), y las pestañas **Equipo** (Tareas por Empleado), **Entregables** (bandeja C-4) y **Datos del prospecto** (editable).

**Given** una Tarea del Expediente
**When** se muestra en la pestaña Equipo
**Then** muestra el Empleado asignado y su estado (Encargada / En curso / Entregada / Bloqueada); si está Bloqueada, muestra el **motivo** (UX-DR-3).

**Given** un Entregable del Expediente
**When** se muestra en la bandeja
**Then** indica su estado (Borrador / Aprobado / Pendiente / Bloqueado) y, si tiene archivo, el enlace a su descarga.

**Given** un Expediente de otro Asesor
**When** el Asesor intenta abrirlo por id
**Then** recibe 403/404 (aislamiento NFR-8).

**Notas técnicas:** FR-6. C-4 (bandeja). Panel lateral de Sócrates contextual presente como placeholder (su comportamiento llega en E3). Breadcrumb "La Oficina > [Nombre]".
**Dependencias:** E2-S1.

### Story E2-S5: Editar los datos del prospecto

As a asesor financiero de SOC,
I want editar los datos capturados de un Expediente,
So that corrijo o completo la información del prospecto a medida que la consigo.

**Acceptance Criteria:**

**Given** la pestaña "Datos del prospecto" de P-2 y `PATCH /expedientes/:id`
**When** el Asesor edita empresa, ciudad, industria u opcionales y guarda
**Then** los cambios se persisten y se reflejan en la cabecera y la tarjeta del Expediente.

**Given** un intento de borrar un campo mínimo obligatorio
**When** el Asesor guarda con empresa/ciudad/industria vacíos
**Then** la operación es rechazada con mensaje en español de oficina (no se permite dejar el Expediente sin mínimos).

**Notas técnicas:** FR-4. `PATCH /expedientes/:id` (también usado para Ganado/Perdido en E2-S7). Validación Zod (AR-9).
**Dependencias:** E2-S4.

### Story E2-S6: El progreso se deriva de forma honesta y reproducible

As a asesor financiero de SOC,
I want que el porcentaje de progreso de un Expediente sea un cálculo honesto y entendible,
So that confío en él para decidir a qué prospecto ir mañana.

**Acceptance Criteria:**

**Given** la función pura `derivar-progreso` (Etapa + Tareas completadas → %) en código compartido y testeable
**When** se calcula el progreso de un Expediente
**Then** el resultado es **determinista y reproducible** (la misma entrada da el mismo %), no una estimación.

**Given** un Empleado que falla una Tarea
**When** se recalcula el progreso
**Then** el progreso **no sube** por esa Tarea; la Tarea queda `BLOQUEADA` con motivo y la tarjeta muestra el bloqueo (UX-DR-3, P-3).

**Given** la barra de progreso (C-6)
**When** se renderiza
**Then** muestra segmento completado (sólido), en progreso (punteado/animación sutil), bloqueado (rojo), y la Etapa actual como etiqueta; los hitos de Etapa (Prospecto → … → En cierre) son visibles.

**Notas técnicas:** FR-6. `apps/api/progreso/derivar-progreso.ts` (función pura). El `progreso` se persiste en `Expediente.progreso` para listar rápido pero se deriva, no se inventa. El mapa exacto Etapa↔% se afina con Carlos (PRD Q-2 / R-8); default documentado en código.
**Dependencias:** E2-S2, E2-S4.

### Story E2-S7: Avanzar la Etapa y marcar Ganado/Perdido

As a asesor financiero de SOC,
I want que el Expediente avance de Etapa conforme se completan los entregables clave, y poder marcarlo Ganado o Perdido,
So that el estado del prospecto refleja la realidad de mi proceso de venta.

**Acceptance Criteria:**

**Given** las transiciones de Etapa (Prospecto → Investigado → Recomendado → En acercamiento → En trámite → En cierre)
**When** se completa el Entregable prerrequisito de una Etapa
**Then** el Expediente avanza por una **transición válida**; no se puede saltar a una Etapa cuyo Entregable prerrequisito no existe/no está Aprobado.

**Given** el botón "Marcar como Ganado / Perdido" en la cabecera de P-2
**When** el Asesor lo usa en cualquier momento
**Then** el Expediente pasa a `GANADO` o `PERDIDO` con motivo opcional, y su tarjeta se muestra en tono gris cerrado.

**Notas técnicas:** FR-7. El mapa exacto Etapa↔Entregable prerrequisito (PRD Q-2 / R-8) se afina con Carlos; default en código. `PATCH /expedientes/:id` para Ganado/Perdido. Las transiciones automáticas por Entregable se conectan plenamente cuando E4/E5 producen esos Entregables; aquí se entrega la **máquina de estados** y el marcado manual.
**Dependencias:** E2-S6.

---

## Épica E3: Sócrates, el gerente — el interlocutor que delega y reporta

**Meta:** al cerrar E3 el Asesor le habla a Sócrates en lenguaje de oficina, ve un plan propuesto, lo confirma, y Sócrates crea Tareas asignadas a Empleados que el worker ejecuta y persiste; Sócrates reporta de vuelta el avance. Como E4/E5/E6 aún no llenan a fondo a los Empleados, en E3 los Empleados pueden ser "stub" que entregan un resultado mínimo o un mensaje honesto — lo que importa es que la orquestación, las dependencias y el reporte funcionan de extremo a extremo.

### Story E3-S1: Sócrates interpreta lo que el Asesor pide

As a asesor financiero de SOC,
I want escribirle a Sócrates en lenguaje natural lo que necesito,
So that no tengo que aprender comandos ni llenar formularios para poner a mi equipo a trabajar.

**Acceptance Criteria:**

**Given** la Barra de Comando de Sócrates (C-3) y `POST /socrates/instruir`
**When** el Asesor escribe un mensaje que nombra un prospecto y un objetivo ("prepárame todo para Probemedic")
**Then** Sócrates determina la intención, identifica un Expediente existente o **propone** crear uno, y devuelve un **plan estructurado** (validado por Zod) con la lista de Empleados a invocar y sus dependencias — **sin ejecutar todavía**.

**Given** un mensaje ambiguo (sin prospecto identificable o sin objetivo)
**When** el Asesor lo envía
**Then** Sócrates responde con **una** sola pregunta de aclaración y **no** crea Expediente ni Tareas hasta resolverla.

**Given** la regla de lenguaje (NFR-14)
**When** Sócrates responde
**Then** la superficie usa lenguaje de oficina; **nunca** expone "modelo", "prompt", "token", "agente".

**Given** el Modo sin claves
**When** falta `AI_GATEWAY_API_KEY`
**Then** Sócrates enruta por **reglas heurísticas** (palabras clave → Empleado) sin LLM, y si no puede, responde con un mensaje honesto (no truena).

**Notas técnicas:** FR-1, AR-4 (D-4). Salida estructurada con `generateObject` + esquema Zod (set cerrado de Empleados, no puede enrutar a uno inexistente). NFR-7: primer acuse ≤ 3 s. `apps/api/orquestador/socrates.ts` + `planificador.ts` + `reglas-fallback.ts`.
**Dependencias:** E1-S4 (ProveedorIA), E2-S1 (Expedientes).

### Story E3-S2: El Asesor confirma o ajusta el plan antes de que arranque

As a asesor financiero de SOC,
I want ver el plan que Sócrates propone y poder confirmarlo, ajustarlo o cancelarlo,
So that mantengo el control y nada se ejecuta sin mi banderazo.

**Acceptance Criteria:**

**Given** el panel de respuesta de Sócrates (C-3) con el plan propuesto
**When** Sócrates muestra el plan (lista de Empleados y lo que hará cada uno)
**Then** aparecen los botones "Sí, arranca", "Ajustar" y "Cancelar"; **Sócrates nunca ejecuta sin confirmación** (orquestación síncrona-asistida).

**Given** el botón "Ajustar"
**When** el Asesor quita un Empleado del encargo
**Then** el plan se actualiza y solo los Empleados restantes se delegarán.

**Given** `POST /socrates/confirmar`
**When** el Asesor confirma el plan
**Then** se crean las filas `Tarea` (estado **Encargada**) para cada Empleado, visibles en el Expediente con Empleado asignado y descripción legible.

**Given** una Tarea con dependencia (p. ej. Negociador requiere Reporte aprobado)
**When** se confirma el plan
**Then** la Tarea dependiente **no se dispara** hasta cumplir la dependencia y se marca como dependencia pendiente.

**Notas técnicas:** FR-2, AR-4, AR-9 (idempotencia: clave por `expedienteId+rol+hash(instruccion)`). Modelo `Tarea` se crea/usa aquí (campos `dependeDeId`, `idempotencyKey`, `motivo`). C-3 panel de plan. UX-DR-1, UX-DR-7.
**Dependencias:** E3-S1.

### Story E3-S3: El worker ejecuta las Tareas y persiste su estado

As a asesor financiero de SOC,
I want que las Tareas que confirmé se ejecuten solas y su avance quede guardado,
So that puedo navegar fuera y volver sin perder el trabajo en curso.

**Acceptance Criteria:**

**Given** el worker de Tareas (loop in-process en `api`)
**When** existe una Tarea `ENCARGADA` cuyas dependencias están cumplidas
**Then** el worker la marca `EN_CURSO`, ejecuta el Empleado vía el contrato común `ejecutar(entrada, ctx)`, persiste su resultado y la marca `ENTREGADA` (o `BLOQUEADA` con motivo si falla).

**Given** un reinicio del servicio a mitad de una Tarea
**When** el `api` vuelve a arrancar
**Then** el worker **retoma** las Tareas `EN_CURSO` huérfanas (estado durable en Postgres); no se pierde el trabajo capturado (NFR-10).

**Given** un Empleado "stub" en E3
**When** se ejecuta
**Then** entrega un resultado mínimo legible o un bloqueo honesto — lo que valida es la mecánica de la cola, no la sofisticación (la profundidad llega en E4/E5/E6).

**Given** el contrato de Empleado (AR-3)
**When** el worker construye el `ContextoEjecucion`
**Then** inyecta `asesorId` (de la tenencia), `expediente`, `catalogo` (lector), `ia` (ProveedorIA), `registrarProgreso` y `modoSinClaves`.

**Notas técnicas:** FR-2, AR-3, AR-10. `apps/api/worker/cola-tareas.ts`. Contrato en `packages/shared/src/empleados/contract.ts`. Idempotencia (AR-9): doble disparo no produce doble efecto.
**Dependencias:** E3-S2, E1-S4.

### Story E3-S4: Sócrates reporta el avance como un buen jefe

As a asesor financiero de SOC,
I want que Sócrates me resuma qué entregó el equipo, qué espera mi revisión y qué está bloqueado,
So that sé el estado sin revisar Tarea por Tarea.

**Acceptance Criteria:**

**Given** `GET /socrates/reporte/:expedienteId`
**When** se completan las Tareas de un encargo (o el Asesor pregunta)
**Then** Sócrates emite un resumen que distingue explícitamente "listo / esperando tu revisión / bloqueado (con motivo)" y lista los Entregables que requieren Gate humano.

**Given** el panel lateral de Sócrates en P-2 y la notificación en la barra de P-1
**When** un Empleado entrega
**Then** aparece un mensaje en voz de Sócrates ("El Investigador entregó el reporte. Está esperando tu revisión.") con `aria-live="polite"` (UX-DR-9), sin jerga de IA.

**Given** una dependencia pendiente
**When** Sócrates reporta
**Then** la señala en lenguaje de oficina ("El Negociador necesita el reporte del Investigador aprobado antes de arrancar"), no como error técnico.

**Notas técnicas:** FR-3, NFR-14. Voz/microcopia según UX §4. El panel "Tu equipo" (C-1) refleja estados Libre/Trabajando/Entregó (UX-DR-1); endpoint `GET /empleados` para el estado del equipo.
**Dependencias:** E3-S3.

---

## Épica E4: El Investigador y el Reporte — el foso y el riesgo técnico (PoC primero)

**Meta:** al cerrar E4 el Investigador genera un Reporte de Inteligencia real, con secciones canónicas, citas verificables, Recomendaciones contra el Catálogo (capa de síntesis con compuerta C-1), Brechas marcadas, verificación de citas (C-2), y el Asesor lo edita, lo aprueba (Gate humano C-3) y lo exporta a PDF con marca a R2. Es el riesgo técnico real: la primera historia es un **PoC** que se mide contra un reporte hecho a mano por Carlos antes de invertir en el resto.

### Story E4-S1: PoC del motor de investigación + síntesis (medir paridad antes de construir)

As a Carlos (design partner / dueño),
I want un PoC que genere las fases de investigación y síntesis para un prospecto real y lo compare con el reporte que yo haría a mano,
So that confirmo que el motor produce calidad de campo **antes** de construir todo el pipeline encima.

**Acceptance Criteria:**

**Given** un prospecto real (p. ej. Probemedic) y la fase 1 (investigar industria + prospecto) usando IA + búsqueda pública vía AI Gateway
**When** se ejecuta el PoC
**Then** produce hallazgos con **fuentes candidatas citadas** y la fase 3 (matchear contra un Catálogo mínimo) produce ≥1 Recomendación con Producto + Institución reales.

**Given** el reporte que Carlos haría a mano para el mismo prospecto
**When** se comparan
**Then** Carlos juzga si el resultado alcanza "entregable con < 15 min de retoque" (SM-1); el resultado y el costo/latencia medidos (NFR-5/NFR-6) se documentan para decidir el motor de investigación (PRD Q-1 / R-1).

**Given** la decisión del motor de investigación
**When** se cierra el PoC
**Then** queda fijado qué fuente usa la fase 1 (web search vía Gateway, API de research, etc.) y el techo de costo de referencia por Reporte.

**Notas técnicas:** AR-5 (D-5 fases 1 y 3), AR-6. Riesgo R-1/R-2 de la Arquitectura: **este PoC va primero, antes que cualquier otra cosa de E4**. Mide costo unitario (dos llamadas pesadas + investigación). Si la paridad no se alcanza, se ajusta el motor antes de seguir.
**Dependencias:** E1-S4 (ProveedorIA), E3 (contrato/worker) o ejecución directa para el PoC; seed mínimo de Catálogo (ver E4-S2 / E6).

### Story E4-S2: El Investigador genera el Reporte borrador con todas las secciones

As a asesor financiero de SOC,
I want pedirle al Investigador un Reporte de Inteligencia desde el Expediente,
So that llego a la cita sabiendo más del negocio del prospecto que su propio dueño.

**Acceptance Criteria:**

**Given** un Expediente con sus datos (empresa + ciudad + industria + opcionales) y el pipeline de 6 fases del Investigador
**When** el Investigador genera el Reporte
**Then** el Reporte incluye, como mínimo: portada/carta ejecutiva, resumen ejecutivo (hallazgos + recomendaciones), panorama de industria con cifras, análisis del prospecto, FODA/perfil de riesgo, Recomendaciones con Producto SOC, benchmarks, **Brechas de información** y **Fuentes**.

**Given** que la generación está en curso
**When** el Asesor mira el progreso (P-5, modal/flujo)
**Then** ve el avance por sección en lenguaje de oficina ("Investigando la industria… → Analizando a [Empresa]… → Construyendo FODA… → Identificando productos del catálogo… → Redactando… → Verificando fuentes…").

**Given** la resiliencia a navegación (NFR-10)
**When** el Asesor navega fuera del modal
**Then** la generación continúa en segundo plano (estado en Postgres) y al volver aparece la notificación de Sócrates; el Reporte se crea en estado **Borrador** asociado al Expediente como Entregable.

**Notas técnicas:** FR-8, AR-5. Modelos `Entregable` + `EntregableVersion` se crean/usan aquí; contenido como **JSONB tipado** (`ReporteV1`) validado por Zod. `registrarProgreso` alimenta P-5. `apps/api/empleados/investigador/*` (fases). UX-DR-8 (P-5).
**Dependencias:** E4-S1, E3-S3 (worker), E6-S1 (seed mínimo de Catálogo) — el seed mínimo puede nacer aquí y E6 lo completa.

### Story E4-S3: Toda cifra lleva su cita verificable

As a asesor financiero de SOC,
I want que cada dato cuantitativo del Reporte tenga una fuente que pueda abrir,
So that puedo defender cada cifra frente al dueño de la empresa en la cita.

**Acceptance Criteria:**

**Given** el cuerpo del Reporte
**When** aparece una afirmación cuantitativa (cifra de mercado, monto, fecha, %)
**Then** lleva una **Cita** asociada; **0 cifras** se presentan como hecho sin Cita (auditable sobre el Reporte) (NFR-1).

**Given** una Cita en el visor del Reporte (C-5)
**When** el Asesor hace click/hover en la marca inline
**Then** ve la fuente (URL/documento + título + fecha de acceso) y puede abrirla; el panel lateral de "Fuentes" lista todas las citas (UX-DR-5, NFR-3).

**Given** un dato no verificable
**When** se ensambla el Reporte
**Then** **no** aparece como hecho en el cuerpo: va a Brechas de información (E4-S5).

**Notas técnicas:** FR-9, NFR-1, NFR-3. C-5 (citas inline + panel de fuentes). Citas embebidas en el `contenido` JSONB, auditables.
**Dependencias:** E4-S2.

### Story E4-S4: Recomendaciones reales contra el Catálogo SOC (compuerta C-1)

As a asesor financiero de SOC,
I want que el Reporte amarre cada necesidad detectada a un producto y una institución reales con su argumento de cierre,
So that llego con una recomendación concreta y vendible, no un consejo genérico.

**Acceptance Criteria:**

**Given** la capa de síntesis (fase 3) y el Catálogo SOC
**When** se detecta una necesidad financiera
**Then** se produce ≥1 Recomendación = Producto específico + Institución específica del Catálogo + argumento de cierre en una frase, trazable al hallazgo que la originó.

**Given** la compuerta **C-1 Fidelidad de catálogo** (código de servidor)
**When** la síntesis propone un match
**Then** **solo** se emiten Recomendaciones cuyo `productoId`/`institucionId` **existen en la tabla** del Catálogo (FK real); cualquier match a un id inexistente se **descarta** y se anota como Brecha — **0 instituciones/productos inventados** (NFR-2).

**Given** un hallazgo sin Producto aplicable en el Catálogo
**When** se sintetiza
**Then** se deja **sin** Recomendación forzada (no se fabrica un match falso) y, si aplica, se nota como Brecha.

**Notas técnicas:** FR-10 (parcial; el match lo profundiza el Asesor de producto en E6), NFR-2. `apps/api/calidad/fidelidad-catalogo.ts`. Modelo `Recomendacion` con FK `productoId`. Instrumentar contador de descartes por fidelidad (para SM-C1, se endurece en E7).
**Dependencias:** E4-S2, E6-S1 (Catálogo seed).

### Story E4-S5: Brechas de información — la honestidad como característica

As a asesor financiero de SOC,
I want que el Reporte marque claramente lo que no se pudo verificar,
So that sé qué preguntar en la cita en vez de llevar un dato inventado.

**Acceptance Criteria:**

**Given** la fase de marcado de Brechas
**When** un dato clave no pudo verificarse
**Then** aparece en la sección **Brechas de información** describiendo qué dato falta y, cuando aplica, cómo conseguirlo (ej.: "el nombre del laboratorio ancla no se divulgó; preguntarlo al director general en la cita").

**Given** un dato marcado como Brecha
**When** se revisa el cuerpo del Reporte
**Then** **no** aparece simultáneamente como hecho en el cuerpo.

**Given** el visor (C-5)
**When** el Asesor llega al final del Reporte
**Then** la sección de Brechas está destacada visualmente (fondo diferenciado/borde de acento) (UX-DR-5).

**Notas técnicas:** FR-11, NFR-1. Brechas embebidas en `contenido` JSONB. C-5 sección de Brechas.
**Dependencias:** E4-S2.

### Story E4-S6: Verificación de citas — el segundo pase antes de mostrar el borrador

As a asesor financiero de SOC,
I want que el sistema confirme que cada cita realmente respalda lo que afirma antes de enseñarme el borrador,
So that el Reporte no me pone en riesgo de citar algo que no dice lo que parece.

**Acceptance Criteria:**

**Given** la compuerta **C-2 Verificación de citas** (segundo pase con IA, código de servidor)
**When** se ensambla el Reporte antes de presentarlo
**Then** cada Cita se verifica; una afirmación cuya Cita **no** la respalda se **degrada** (se mueve a Brecha o se elimina), **nunca** se muestra como hecho citado.

**Given** el resultado de la verificación
**When** termina el segundo pase
**Then** queda **auditable** (qué afirmaciones pasaron, cuáles se degradaron) guardado en `EntregableVersion.verificacion`.

**Given** el Modo sin claves
**When** no hay IA para verificar
**Then** el comportamiento degrada con honestidad (no marca como verificado lo que no se verificó).

**Notas técnicas:** FR-12, NFR-1, NFR-3. `apps/api/empleados/investigador/verificar-citas.ts` + `apps/api/calidad/verificacion-citas.ts`. Instrumentar contador de degradaciones (SM-C1, endurecido en E7).
**Dependencias:** E4-S3, E4-S5.

### Story E4-S7: Leer y editar el Reporte en el visor

As a asesor financiero de SOC,
I want leer el Reporte sección por sección y editar lo que necesite,
So that le doy mi toque y lo dejo listo para mi cliente.

**Acceptance Criteria:**

**Given** el Visor del Reporte (P-3 subtipo A)
**When** el Asesor lo abre
**Then** ve el cuerpo con índice lateral sticky, citas inline clickeables, el panel de fuentes (25%), y la sección de Brechas al final; la cabecera lleva logo SOC | TALENT, nombre del prospecto, fecha y el **disclaimer** de no oferta vinculante (NFR-9).

**Given** el modo de edición inline
**When** el Asesor edita un párrafo
**Then** los cambios se guardan como **nueva versión** de Borrador (no se sobrescribe la anterior) (AR-2, versionado).

**Given** la barra superior fija
**When** se renderiza
**Then** muestra el estado (Borrador amarillo / Aprobado verde) y las acciones [Volver] · [Editar] · [Aprobar reporte ✓] · [Exportar PDF], con "Exportar PDF" **deshabilitado** si el estado es Borrador (tooltip "Primero aprueba el reporte").

**Notas técnicas:** FR-13 (editar), AR-2. `PATCH /entregables/:id` crea nueva `EntregableVersion`. C-5, P-3 subtipo A. UX-DR-4, UX-DR-5, UX-DR-10 (hoja de impresión).
**Dependencias:** E4-S3, E4-S4, E4-S5.

### Story E4-S8: Aprobar el Reporte — el Gate humano (compuerta C-3)

As a asesor financiero de SOC,
I want aprobar el Reporte con una acción clara y satisfactoria,
So that el documento lleva mi firma antes de salir al cliente.

**Acceptance Criteria:**

**Given** el botón "Aprobar reporte ✓" (prominente, UX-DR-4) y `POST /entregables/:id/aprobar`
**When** el Asesor aprueba
**Then** una confirmación de un paso ("¿Confirmas que este reporte está listo para el cliente?") precede al cambio; el Entregable pasa de **Borrador** a **Aprobado** y la versión queda fijada.

**Given** la idempotencia (AR-9)
**When** el Asesor aprueba dos veces
**Then** no se crean dos versiones aprobadas (doble efecto evitado).

**Given** el avance de Etapa (E2-S7)
**When** el Reporte queda Aprobado
**Then** el Expediente puede avanzar a la Etapa correspondiente y las Tareas dependientes (p. ej. Negociador) se desbloquean.

**Notas técnicas:** FR-13, NFR-4. C-3 compuerta Gate humano. `apps/api/calidad/gate-humano.ts`. Disparador de dependencias hacia E5 (Negociador).
**Dependencias:** E4-S7.

### Story E4-S9: Exportar el Reporte a PDF con marca SOC | TALENT (a R2)

As a asesor financiero de SOC,
I want exportar el Reporte aprobado a un PDF con la identidad SOC | TALENT,
So that entrego un documento de consultoría que me posiciona como el mejor informado de la sala.

**Acceptance Criteria:**

**Given** `POST /entregables/:id/exportar` y la compuerta **C-3 en el servidor**
**When** el Asesor exporta un Reporte
**Then** el servidor verifica `estado === APROBADO`; si **no** lo está, responde **409** y **no** genera PDF (el Gate no se salta, ni siquiera por API) (NFR-4).

**Given** un Reporte aprobado
**When** se exporta
**Then** `api` renderiza el HTML canónico SOC | TALENT a PDF (con paginación, pie "Documento Confidencial — Uso Exclusivo del Cliente" y el **disclaimer** de no oferta vinculante, NFR-9), lo sube a **R2**, y el Expediente registra el PDF como Entregable Aprobado con fecha y versión.

**Given** la descarga
**When** el Asesor baja el PDF
**Then** se sirve por **presigned GET URL** de vencimiento corto (descarga directa de R2); reexportar reutiliza el PDF de la versión aprobada (idempotencia).

**Notas técnicas:** FR-13, FR-21, AR-8, NFR-9. `apps/api/pdf/render-reporte.ts` (HTML+CSS de impresión espejo de Las Aliadas/Probemedic, R-6). `storage/subir-pdf.ts` + `url-descarga.ts`. El reporte sembrado de Probemedic (E7) es la referencia visual de aceptación.
**Dependencias:** E4-S8, E1-S5 (R2).

---

## Épica E6: El Catálogo SOC — el insumo del foso (curado y consultable)

**Meta:** al cerrar E6 el Catálogo SOC existe estructurado y curado para el subconjunto v1 (las instituciones/productos de los reportes reales), es consultable por los Empleados y editable por datos sin redeploy, y el Empleado "Asesor de producto" matchea necesidades contra él, dando cobertura suficiente a la capa de síntesis del Investigador. (Se secuencia antes de E5 porque la compuerta C-1 de E4 depende de un Catálogo curado; el seed mínimo nace en E4 y E6 lo completa y cura.)

### Story E6-S1: Estructura y seed del Catálogo SOC (subconjunto v1)

As a Carlos (curador del Catálogo),
I want el Catálogo estructurado (Institución → Producto → para qué sirve → condiciones típicas → cuándo recomendar) sembrado con el subconjunto de los reportes reales,
So that la capa de síntesis tiene contra qué recomendar con cobertura real.

**Acceptance Criteria:**

**Given** los modelos `Institucion` y `Producto` (Arquitectura §7)
**When** se ejecuta el seed del Catálogo
**Then** incluye, como mínimo, las Instituciones de los reportes (p. ej. Banorte, Konfío, Covalto, Afirme, Hey Banco, Xepelin, ION Financiera, Finbe ABC, Finsus Anticipa, Mifel) y Productos (Crédito Revolvente, Arrendamiento Puro, Anticipo de Ventas, Crédito Simple, Factoraje, Standby LC, Seguro PYME+Vida+GMM), cada uno con `paraQueSirve`, `condiciones` y `cuandoRecomendar`.

**Given** la constraint `@@unique([institucionId, nombre])` en Producto
**When** se siembra
**Then** no hay productos duplicados por institución; el subconjunto exacto lo confirma Carlos (PRD Q-3).

**Given** que el Catálogo es editable por datos
**When** Carlos ajusta una entrada
**Then** el cambio aplica **sin redeploy** de la app (vía datos en Postgres).

**Notas técnicas:** FR-19, NFR-2, R-5. `packages/db/src/seed/catalogo-soc.ts`. Este seed mínimo puede haberse iniciado en E4 para no bloquear; E6 lo completa y cura.
**Dependencias:** E1-S2.

### Story E6-S2: Consultar el Catálogo (lector para Empleados y UI)

As a asesor financiero de SOC,
I want que mi equipo consulte el Catálogo y yo pueda verlo,
So that las recomendaciones salen de productos reales y puedo entender de dónde vienen.

**Acceptance Criteria:**

**Given** `GET /catalogo/instituciones` y el `CatalogoLector` (acceso de solo-lectura del contrato de Empleado)
**When** un Empleado (Investigador, Asesor de producto, Tramitador) necesita datos del Catálogo
**Then** los obtiene por el lector inyectado en `ctx.catalogo`; **ningún** Empleado recomienda por nombre libre sin resolverlo contra la tabla (anti-patrón prohibido, §5.6).

**Given** la UI de curaduría/consulta
**When** el Asesor (o Carlos) lista el Catálogo
**Then** ve Instituciones y Productos con su uso, condiciones y cuándo recomendar.

**Notas técnicas:** FR-19. `apps/api/rutas/catalogo.ts`. `CatalogoLector` en el contrato (AR-3).
**Dependencias:** E6-S1.

### Story E6-S3: El Asesor de producto matchea necesidad → Producto/Institución

As a asesor financiero de SOC,
I want que el Asesor de producto identifique el mejor financiamiento del Catálogo para cada necesidad del prospecto,
So that recibo recomendaciones afinadas con el "para qué sirve" y "cuándo recomendarlo" reales.

**Acceptance Criteria:**

**Given** el Empleado "Asesor de producto" (rol `ASESOR_PRODUCTO`) sobre el contrato común
**When** toma las necesidades detectadas en un Expediente
**Then** propone el match Producto + Institución del Catálogo, alimentando las Recomendaciones (junto con FR-10 de E4).

**Given** la Fidelidad de catálogo (C-1, NFR-2)
**When** propone
**Then** **solo** propone Productos/Instituciones existentes; cada propuesta incluye el "para qué sirve" y "cuándo recomendarlo" **tomados del Catálogo**, no inventados.

**Given** un Entregable "Recomendaciones de producto" en Borrador
**When** se produce
**Then** queda en la bandeja del Expediente (C-4) sujeto al Gate humano si sale al cliente.

**Notas técnicas:** FR-15, NFR-2. `apps/api/empleados/asesor-producto/`. Profundiza el match que E4-S4 dejó al nivel de la síntesis del Investigador.
**Dependencias:** E6-S2, E3-S3 (worker), E4-S4 (capa de síntesis).

---

## Épica E5: El resto del equipo — el flujo completo del asesor

**Meta:** al cerrar E5 el Asesor dirige a los cuatro Empleados restantes a lo largo de las Etapas: Prospector (califica), Negociador (pitch/guion/objeciones, dependiente del Reporte aprobado), Tramitador (requisitos + cotización estimada no vinculante), Gestor (seguimiento/cierre/postventa). Todos sobre el contrato común, produciendo Entregables en la bandeja, con Gate humano cuando salen al cliente. Profundidad deliberadamente menor que el Investigador; comportamiento completo.

### Story E5-S1: El Prospector califica y enriquece un prospecto

As a asesor financiero de SOC,
I want que el Prospector califique el prospecto que yo traigo,
So that sé si vale la pena y con qué perfil de bancabilidad arranco.

**Acceptance Criteria:**

**Given** el Empleado "Prospector" (rol `PROSPECTOR`) sobre el contrato común
**When** toma un prospecto que el Asesor aportó
**Then** produce un Entregable de **calificación/enriquecimiento** (giro, tamaño aproximado, señales de bancabilidad, encaje con el perfil objetivo) con campos legibles; cuando hay cifras, llevan Citas (NFR-1/NFR-3).

**Given** el Non-Goal de prospección a escala
**When** opera
**Then** **no** caza prospectos a escala ni hace outbound automático; trabaja sobre el prospecto aportado.

**Given** el Modo sin claves
**When** falta IA
**Then** entrega un resultado sembrado o un mensaje honesto, sin tronar.

**Notas técnicas:** FR-14. `apps/api/empleados/prospector/`.
**Dependencias:** E3-S3 (worker), E2-S1 (Expediente).

### Story E5-S2: El Negociador entrega pitch, guion y manejo de objeciones

As a asesor financiero de SOC,
I want que el Negociador me prepare el pitch, el guion de acercamiento y las respuestas a objeciones,
So that llego a la conversación con el argumento listo, no improvisando.

**Acceptance Criteria:**

**Given** el Empleado "Negociador" (rol `NEGOCIADOR`)
**When** produce su Entregable
**Then** incluye pitch, guion de acercamiento y respuestas a objeciones, **basado en las Recomendaciones del Expediente** (no genérico).

**Given** la dependencia del Reporte
**When** el Reporte del Investigador **no** está Aprobado
**Then** la Tarea del Negociador queda como **dependencia pendiente** (no produce un guion a ciegas); cuando el Reporte se aprueba (E4-S8), la Tarea se desbloquea y arranca.

**Given** que el guion va a usarse frente al cliente
**When** se produce
**Then** queda sujeto al Gate humano (Borrador → Aprobado) en la bandeja (C-4).

**Notas técnicas:** FR-16, AR-4 (dependencias). `apps/api/empleados/negociador/`. P-3 subtipo B (visor de entregable de columna única). PRD §4.4 nota: el Negociador es candidato a mayor profundidad para el piloto (decisión de Carlos).
**Dependencias:** E4-S8 (Reporte aprobado desbloquea), E3-S3, E6-S3 (Recomendaciones).

### Story E5-S3: El Tramitador arma requisitos y cotización estimada

As a asesor financiero de SOC,
I want que el Tramitador me dé la lista de documentos y una cotización estimada del producto recomendado,
So that sé qué pedirle al prospecto y con qué números acercarme.

**Acceptance Criteria:**

**Given** el Empleado "Tramitador" (rol `TRAMITADOR`)
**When** produce su Entregable para un Expediente
**Then** la lista de requisitos corresponde al **Producto/Institución del Catálogo** recomendado, y la cotización estimada sale de las "condiciones típicas" del Catálogo.

**Given** el disclaimer de no oferta vinculante (NFR-9)
**When** se presenta la cotización
**Then** **toda cifra está marcada como estimada**; no se presenta como oferta vinculante de ninguna institución.

**Given** el Non-Goal de integración con instituciones
**When** cotiza
**Then** estima **desde el Catálogo**, no consulta el sistema de la institución (integración real es v2).

**Notas técnicas:** FR-17, NFR-9. `apps/api/empleados/tramitador/`. Consume el Catálogo (E6).
**Dependencias:** E6-S3 (Recomendación/Producto), E3-S3.

### Story E5-S4: El Gestor propone seguimiento, cierre y postventa

As a asesor financiero de SOC,
I want que el Gestor me proponga los siguientes pasos de seguimiento y postventa,
So that no se me enfría un prospecto por falta de un plan de cierre.

**Acceptance Criteria:**

**Given** el Empleado "Gestor" (rol `GESTOR`)
**When** produce su Entregable
**Then** propone acciones concretas **ligadas a la Etapa actual** del Expediente (seguimiento, recordatorios de cierre, postventa).

**Given** una sugerencia de avanzar a Ganado/Perdido
**When** el Gestor la propone
**Then** la deja como **propuesta para el Asesor** (no cambia la Etapa por sí mismo).

**Notas técnicas:** FR-18. `apps/api/empleados/gestor/`. El cambio de Etapa Ganado/Perdido lo ejecuta el Asesor (E2-S7).
**Dependencias:** E3-S3, E2-S7.

### Story E5-S5: Revisar y aprobar entregables de otros empleados (Gate humano transversal)

As a asesor financiero de SOC,
I want revisar y aprobar los entregables del Negociador, Tramitador, Prospector y Gestor cuando van a salir al cliente,
So that todo lo que entrego lleva mi visto bueno, igual que el Reporte.

**Acceptance Criteria:**

**Given** el visor de entregable P-3 subtipo B (columna única) y la barra de acciones
**When** el Asesor abre un entregable distinto al Reporte
**Then** ve su cuerpo estructurado y la barra con estado (Borrador/Aprobado) y la acción "Aprobar" (Gate humano); en v1 solo el Reporte exporta PDF de cliente (UX S-4).

**Given** `POST /entregables/:id/aprobar`
**When** el Asesor aprueba un entregable de otro Empleado
**Then** pasa de Borrador a Aprobado (versionado, idempotente), y donde aplique habilita el avance de Etapa.

**Notas técnicas:** FR-16/17/18 (Gate humano al salir al cliente), NFR-4. Reusa la lógica de aprobación de E4-S8 generalizada a cualquier `Entregable`. UX-DR-4.
**Dependencias:** E5-S2, E5-S3, E5-S4 (entregables a aprobar), E4-S8 (lógica de aprobación).

---

## Épica E7: Calidad como producto + Seed realista — la red de seguridad medible y la demo viva

**Meta:** al cerrar E7 las tres compuertas son invariantes probados con tests, las contra-métricas SM-C1/SM-C2 están instrumentadas, los Expedientes Las Aliadas y Probemedic están sembrados con el Reporte de Probemedic **sembrado fiel**, y el Modo sin claves funciona de extremo a extremo. La calidad pasa de aspiración a red de seguridad medible; la demo sin claves muestra valor real.

### Story E7-S1: Endurecer las tres compuertas como invariantes probados

As a Carlos (dueño que no puede permitir el veneno),
I want que las tres compuertas estén blindadas con tests que prueben que atrapan el veneno,
So that confío en que ningún dato mal citado ni producto inventado llega al cliente.

**Acceptance Criteria:**

**Given** la compuerta **C-1 Fidelidad de catálogo**
**When** corre su test
**Then** una Recomendación a un `productoId` inexistente se **descarta** y va a Brecha; **0** instituciones/productos inventados (NFR-2, SM-C1).

**Given** la compuerta **C-2 Verificación de citas**
**When** corre su test
**Then** una afirmación con cita que **no** la respalda se **degrada** a Brecha y **no** se muestra como hecho citado; el resultado queda auditable (NFR-1, NFR-3).

**Given** la compuerta **C-3 Gate humano**
**When** corre su test
**Then** un export de un Borrador responde **409** y **no** genera PDF (NFR-4).

**Given** trazabilidad e idempotencia
**When** corren sus tests
**Then** toda cifra del Reporte tiene fuente abrible, toda Recomendación es trazable a su hallazgo, y un doble disparo (crear Tarea / aprobar / exportar) no produce doble efecto.

**Notas técnicas:** Arquitectura §11 (tabla de invariantes). Tests e2e en `apps/api/test/`. Lint de cadenas (lista negra de jerga de IA) sobre `web` (NFR-14). Test de progreso honesto (P-3).
**Dependencias:** E4 completa, E6 completa.

### Story E7-S2: Instrumentar las contra-métricas (SM-C1 / SM-C2)

As a Carlos (dueño que vigila el veneno),
I want que el sistema cuente cada degradación de cita y cada descarte por fidelidad de catálogo,
So that mido que el sistema atrapa los errores antes de que lleguen al cliente.

**Acceptance Criteria:**

**Given** la instrumentación de calidad
**When** la verificación de citas degrada una afirmación o C-1 descarta un match
**Then** se registra en un contador auditable por Reporte/versión.

**Given** SM-C1 (incidentes de dato mal citado / producto inventado que lleguen al cliente)
**When** se mide
**Then** el objetivo es **0**, sostenido por el Gate humano + Verificación de citas.

**Given** SM-C2 ("velocidad falsa": % de Reportes aprobados que Carlos tuvo que rehacer por fondo)
**When** hay datos del piloto
**Then** la métrica es observable para vigilar que rápido no signifique malo.

**Notas técnicas:** Arquitectura §11 (instrumentación de contra-métricas). Contadores en `EntregableVersion.verificacion` y/o tabla de auditoría.
**Dependencias:** E7-S1.

### Story E7-S3: Sembrar los Expedientes Las Aliadas y Probemedic con el Reporte fiel

As a Carlos (mostrando Sócrates a un asesor aliado),
I want que los Expedientes Las Aliadas y Probemedic ya estén sembrados con el Reporte de Probemedic fiel,
So that puedo demostrar valor real incluso en una laptop sin conexión a la IA.

**Acceptance Criteria:**

**Given** el seed de Expedientes (`expediente-las-aliadas.ts`, `expediente-probemedic.ts`)
**When** se ejecuta el seed
**Then** La Oficina muestra ambos Expedientes con progreso realista; el de Probemedic incluye el **Reporte de Inteligencia sembrado fiel** en estado Aprobado, con citas, Brechas y PDF.

**Given** el reporte sembrado como referencia de calidad visual
**When** se abre en el visor (P-3)
**Then** es visualmente equivalente al reporte real de Probemedic (referencia de aceptación de R-6).

**Notas técnicas:** FR-22, NFR-11. `packages/db/src/seed/*`. El reporte sembrado fiel es el patrón de calidad de referencia (PRD §11, R-6).
**Dependencias:** E4-S9 (forma final del Reporte/PDF), E7-S1.

### Story E7-S4: Modo sin claves de extremo a extremo (la app no truena)

As a Carlos (demostrando sin claves),
I want que toda la oficina opere con fallback honesto cuando no hay claves de IA/proveedor,
So that la demo se sostiene y el desarrollo no se bloquea por falta de claves.

**Acceptance Criteria:**

**Given** que no hay `AI_GATEWAY_API_KEY` (ni R2)
**When** arranca la app
**Then** La Oficina muestra los Expedientes sembrados, el Reporte de Probemedic se abre completo, y la app **no truena** (test de bootstrap sin esas variables).

**Given** que un Empleado se invoca sin claves
**When** ejecuta
**Then** devuelve un resultado sembrado o un mensaje honesto ("Ahora mismo no tengo conexión para investigar en vivo. Te muestro el expediente Probemedic como referencia"), **nunca** un error que rompa la app (UX §4 fallback).

**Given** que las claves están presentes
**When** se ejecuta el mismo flujo
**Then** genera contenido en vivo (IA real con fallback) — el mismo camino, sin ramas divergentes en la UI (UX-DR transparencia de fallback).

**Notas técnicas:** FR-22, NFR-11. El fallback vive en `ProveedorIA` (E1-S4) y en el `seed.ts` de cada Empleado; transparente a la UI (UX nota 5).
**Dependencias:** E1-S4, E7-S3.

---

## Épica E8: Despliegue a producción y verificación en el mundo real

**Meta:** al cerrar E8 Sócrates v1 corre en producción (`api` en Railway, `web` en Vercel, R2 y Clerk conectados), por **CLI** sin GitHub, con migraciones y seed aplicados, y el flujo de punta a punta está **verificado contra el artefacto real** — el login real, el Expediente en la BD de producción, el PDF en el bucket. La prueba no es el check verde de un deploy, sino el artefacto en el mundo (doctrina del Director).

### Story E8-S1: Desplegar la API a Railway por CLI (con migraciones y seed)

As a equipo de desarrollo,
I want desplegar `apps/api` a Railway por CLI con Postgres provisionado y migraciones aplicadas en el arranque,
So that el cerebro de Sócrates corre en producción con su base de datos viva.

**Acceptance Criteria:**

**Given** Postgres provisionado como plugin de Railway y el `Dockerfile` de `api`
**When** se ejecuta `railway up`
**Then** el contenedor arranca con `prisma migrate deploy && node dist/index.js`, se conecta a Postgres por **red privada** (`DATABASE_URL`), lee `process.env.PORT`, y el healthcheck `GET /health` (DB-aware) responde sano.

**Given** el seed del Catálogo y de los Expedientes
**When** arranca el servicio
**Then** el seed se aplica (Catálogo SOC, Las Aliadas, Probemedic con Reporte fiel) y queda verificable consultando la BD de producción.

**Given** las variables del servicio `api`
**When** se configuran
**Then** están presentes `DATABASE_URL`, `CLERK_SECRET_KEY`, `CLERK_JWT_KEY`, `AI_GATEWAY_API_KEY` (o ausente para Modo sin claves), las de R2 y `WEB_ORIGIN`.

**Notas técnicas:** AR-11. Arquitectura §9.1/§9.3. Sin GitHub (deploy por CLI). git local.
**Dependencias:** E1–E7 (lo que se despliega).

### Story E8-S2: Desplegar la Web a Vercel por CLI y conectar con la API

As a asesor financiero de SOC,
I want acceder a Sócrates desde su URL de producción y que se conecte con la API,
So that uso la plataforma de verdad, no solo en local.

**Acceptance Criteria:**

**Given** la URL pública del servicio `api` (de E8-S1)
**When** se setea `NEXT_PUBLIC_API_URL` y las claves de Clerk en Vercel y se ejecuta `vercel --prod`
**Then** `web` despliega, `proxy.ts` (`clerkMiddleware()`) protege las rutas, y el Asesor inicia sesión real y aterriza en La Oficina de producción.

**Given** Clerk en producción
**When** se registran los orígenes de `web` (y de `api` para CORS) y se copia `CLERK_JWT_KEY` a `api`
**Then** la verificación networkless funciona y `web` llama a `api` con JWT sin errores de CORS ni de token.

**Given** un token que podría vencer en una generación larga (R-4)
**When** el polling consulta estado durante minutos
**Then** `getToken()` se refresca en cada llamada desde `web` y el worker no depende del token del Asesor (ya tiene `asesorId`).

**Notas técnicas:** AR-11. Arquitectura §9.2/§9.3. Variables Vercel: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_API_URL`.
**Dependencias:** E8-S1.

### Story E8-S3: Verificar el flujo completo contra el artefacto real

As a Carlos (dueño que verifica en el mundo, no en el foco verde),
I want recorrer el flujo punta a punta en producción y confirmar los artefactos reales,
So that sé que un asesor puede cerrar un deal con un Reporte generado por Sócrates.

**Acceptance Criteria:**

**Given** producción desplegada (E8-S1, E8-S2)
**When** un Asesor real inicia sesión, crea un Expediente, le pide a Sócrates preparar el prospecto, el Investigador genera el Reporte, el Asesor lo aprueba y lo exporta
**Then** se verifica el **artefacto real**: la fila del Expediente en la BD de producción, el PDF en el bucket de R2, el login real de Clerk — no solo un 200 ni un check de deploy.

**Given** los NFR medibles en producción
**When** se ejecuta el flujo
**Then** se confirma: aislamiento entre asesores (NFR-8), primer acuse de Sócrates ≤ 3 s (NFR-7), generación de Reporte dentro del techo de latencia (NFR-6), costo por Reporte medido contra el techo (NFR-5), y resiliencia a navegación/reinicio (NFR-10).

**Given** el Modo sin claves en producción
**When** se quita `AI_GATEWAY_API_KEY`
**Then** la demo con los Expedientes sembrados sigue funcionando (NFR-11).

**Notas técnicas:** AR-11, doctrina del Director (verificar en el mundo real). Privacidad/LFPDPPP marcada para antes de abrir a más asesores (NFR-13, R-7). Esta historia cierra la cadena BMAD: el siguiente paso es `bmad-check-implementation-readiness`.
**Dependencias:** E8-S2, y todo lo anterior.

---

## Cierre de cobertura (validación BMAD)

- **22/22 FR** cubiertos por al menos una historia (ver FR Coverage Map). FR-10 se reparte entre E4 (capa de síntesis del Investigador + C-1) y E6 (Asesor de producto); FR-22 entre E1 (bootstrap sin claves) y E7 (seed pleno).
- **14/14 NFR** atendidos: los de primer orden (NFR-1–4) como compuertas de servidor en E4 y endurecidas en E7; NFR-5/6/7/8/10 verificados en E8; NFR-9 (disclaimer) en E4-S7/S9 y E5-S3; NFR-11 (fallback) en E1/E7; NFR-12 (es-MX) transversal; NFR-13 (privacidad) marcada; NFR-14 (lenguaje de oficina) por lint de cadenas en E7-S1.
- **11/11 UX-DR** cubiertos: shell y componentes en E1/E2/E3, visor del Reporte y Gate en E4, entregables del resto del equipo en E5, accesibilidad/impresión en E2/E4, polling en E2.
- **Sin dependencias hacia el futuro** dentro de cada épica; las dependencias entre épicas siguen el orden de la Arquitectura (D-2 → D-1 → contratos → D-3 → D-6 → **D-5 PoC primero** → D-4 → D-7/D-8).
- **Riesgos del PRD/Arquitectura reconocidos en las historias:** R-1/R-2 (motor + costo) en E4-S1 (PoC primero); R-3 (trabajo largo) en E3-S3; R-4 (token cross-service) en E8-S2; R-5 (Catálogo curado) en E6-S1; R-6 (PDF fiel) en E4-S9/E7-S3; R-7 (privacidad) en E8-S3; R-8 (mapa Etapa↔Entregable) en E2-S6/S7.

*Documento producido por John (PM/SM, BMAD) · método `bmad-create-epics-and-stories` (validar prerrequisitos → diseñar épicas → crear historias → validación final) · ancla en PRD Sócrates v1, Arquitectura (Winston), UX "La Oficina" (Sally) y data-room SIM. Siguiente en la cadena: `bmad-check-implementation-readiness`.*
