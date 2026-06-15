# Revisión Adversaria: Preparación para Implementar — Sócrates v1

**Revisor:** Lente cínico/general (BMAD adversarial review)
**Fecha:** 2026-06-14
**Documentos leídos:** PRD, UX, Arquitectura, Épicas e Historias, Addendum
**Método:** bmad-check-implementation-readiness + bmad-review-adversarial-general

---

## Veredicto

**NO está listo para construir en su estado actual.**

Hay un bloqueante de primer orden que no se puede sortear con un supuesto: el motor de investigación del Investigador (la fase 1 del pipeline) no tiene tecnología elegida ni presupuesto estimado. Sin eso, el PoC de E4-S1 puede llegar en dos semanas con un resultado que force un rediseño profundo de toda la épica más cara. Los demás bloqueantes son solucionables en 1–3 días de decisiones con Carlos; ese no.

---

## Hallazgos priorizados

---

### 🔴 B-1 — El motor de investigación de la fase 1 es un agujero negro, no un riesgo documentado

**Dónde:** PRD Q-1, Arquitectura R-1, Épicas E4-S1.

El Investigador es la pieza que justifica el producto. Su fase 1 —investigar al prospecto y su industria con fuentes citadas y verificables— requiere acceso real a datos reales. El PRD dice "web search vía AI Gateway, scraping, APIs de research" como lista de opciones pero **no elige ninguna**. La Arquitectura lo nombra R-1 y lo pasa al PoC. Las Épicas dicen "PoC primero" pero E4-S1 cubre solo el resultado, no cómo llegar a él.

El problema concreto:
- El **Vercel AI Gateway no incluye web search nativo**. Las strings `anthropic/claude-*` llaman a Claude, pero Claude sin tool de búsqueda no puede citar URLs reales con fechas de acceso —exactamente lo que exige NFR-1, NFR-3 y FR-9.
- Para citar fuentes verificables desde la web (no del conocimiento de entrenamiento) se necesita una herramienta de búsqueda externa: Tavily, Brave Search API, Bing Search API, Perplexity API, o scraping propio. Ninguna está en el stack del addendum ni en las variables de entorno del documento de arquitectura.
- Si el PoC resulta que ninguna opción barata produce calidad de campo, la épica E4 completa (el foso) necesita rediseño. Eso invalida E5, E6 parcial y E7.
- El costo por Reporte (NFR-5) tampoco se puede estimar sin saber qué fuente de búsqueda se usa: Tavily cobra por búsqueda, scraping tiene latencia variable, APIs de research pueden ser prohibitivas.

**Lo que se necesita para desbloquear:** Carlos y el equipo técnico deben elegir la herramienta de búsqueda antes de escribir una sola línea de E4. Una sesión de 2 horas con un prototipo de la fase 1 contra un prospecto real (p. ej. Probemedic) con cada candidato (Tavily + Claude, Perplexity API, Brave + Claude) da la respuesta. Sin eso, el build nocturno de E4 parte sobre arena.

---

### 🔴 B-2 — El catálogo SOC v1 no existe como artefacto: solo existe como intención

**Dónde:** PRD §4.5 FR-19, PRD Q-3, Arquitectura R-5, Épicas E6-S1.

La compuerta C-1 (Fidelidad de catálogo) es el corazón del foso y de la diferenciación. Pero el Catálogo SOC —la base `Institución → Producto → paraQueSirve → condiciones → cuándoRecomendar`— no existe en ningún archivo del repositorio ni del data-room de SIM. Los documentos citan instituciones de ejemplo (Banorte, Konfío, Covalto, Afirme, Hey Banco, Xepelin, ION Financiera, Finbe ABC, Finsus Anticipa, Mifel) y productos de ejemplo, pero:

- El PRD marca `[SUPUESTO: lista exacta del subconjunto v1 la confirma Carlos; ver §8 Q-3]` — es decir, nadie sabe exactamente qué hay en el catálogo.
- Sin el catálogo real, el seed `catalogo-soc.ts` de E6-S1 no se puede escribir. Sin ese seed, E4 (el Investigador) no puede probar la compuerta C-1 con datos reales. E4-S1 (el PoC) dependería de un catálogo inventado para sus pruebas.
- La Épica E6 depende del catálogo confirmado por Carlos antes de construirse. Si E6 llega tarde, E4 y E5 (el Negociador, el Tramitador) funcionan con un catálogo incompleto y las recomendaciones son basura verificable.

**Lo que se necesita para desbloquear:** Carlos debe entregar el catálogo curado del subconjunto v1 —en una hoja de cálculo, un JSON, lo que sea— antes de que E4-S1 cierre. No es trabajo del equipo técnico; es datos de dominio que solo Carlos tiene. Si ese archivo no existe hoy, el build se construye sobre el supuesto más peligroso de todo el proyecto.

---

### 🔴 B-3 — El reporte sembrado fiel de Probemedic no existe como artefacto: es la referencia de calidad sin referencia

**Dónde:** PRD §6.1, PRD §11, Arquitectura R-6, Épicas E7-S3, E4-S9.

El "reporte sembrado fiel" de Probemedic aparece en 14 lugares distintos en los documentos como la referencia visual de calidad, el patrón de aceptación del PDF, el contenido de la demo sin claves, y el criterio de éxito del PoC. Pero:

- No existe ningún archivo que contenga ese reporte. No está en `docs/sim-handoff/`. No está en el seed. No hay un JSON con su estructura, ni un PDF de referencia.
- Los reportes reales de Las Aliadas y Probemedic que Carlos hizo a mano (con los que cerró los deals) tampoco están en el repositorio.
- Sin el reporte real como referencia, el criterio de aceptación de E4-S1 ("Carlos juzga si el resultado alcanza entregable con <15 min de retoque") es subjetivo sin punto de comparación documentado. El PoC podría pasar o fallar según el estado de ánimo de la sesión.
- El seed `expediente-probemedic.ts` y `render-reporte.ts` (el template HTML de PDF) no pueden construirse sin un reporte real de referencia.

**Lo que se necesita para desbloquear:** Carlos debe compartir los reportes reales de Las Aliadas y Probemedic como archivos (PDF o DOCX). Uno de ellos se convierte en el `seed.ts` del Investigador y en la plantilla del render de PDF. Sin esto, E4-S9, E7-S3 y la épica de calidad son aspiraciones sin ancla.

---

### 🔴 B-4 — Motor de generación de PDF: dependencia técnica sin elegir

**Dónde:** Arquitectura D-8, §8, `apps/api/pdf/render-reporte.ts`, Épicas E4-S9.

La arquitectura dice "api renderiza HTML canónico SOC|TALENT a PDF" pero **no especifica qué librería hace ese render**. Las opciones tienen implicaciones muy distintas en Railway:

- `puppeteer` / `playwright` en headless: necesita Chromium en el contenedor Docker; el Dockerfile de Railway necesita una imagen base distinta (node-bullseye o debian, no alpine). Peso del contenedor: +400 MB. Tiempo de arranque: +5–10 s.
- `@react-pdf/renderer`: genera PDF directamente desde React sin browser, funciona en Node sin headless. Limitaciones de CSS (no es HTML).
- `pdfkit`: bajo nivel, manual. Más control, más código.
- `html-pdf` / `pdf-lib`: alternativas más ligeras, calidad variable.

Esta decisión afecta el Dockerfile, la imagen base, el peso del deploy en Railway, y la fidelidad visual del PDF. Sin elegirla, E4-S9 empieza con el riesgo de que la primera prueba real del PDF en Railway tome 2–3 días de ajustes de infraestructura.

**Lo que se necesita para desbloquear:** decidir el motor de PDF antes de E4-S9. Recomendado: probar `@react-pdf/renderer` primero (sin Chromium) con el layout del reporte de Probemedic; si la fidelidad no alcanza, escalar a Puppeteer con imagen base adecuada.

---

### 🟡 I-1 — El mapa Etapa ↔ Entregable prerrequisito es un "default en código" sin definir

**Dónde:** PRD Q-2, PRD FR-7, Arquitectura R-8, Épicas E2-S6, E2-S7.

La máquina de estados del Expediente (qué entregable aprobado habilita cada avance de etapa) aparece como "default en código, afinado con Carlos". Pero este mapa es exactamente lo que hace que el progreso del Expediente sea honesto y reproducible (NFR-1 de UX, P-3). Sin el mapa definido:

- La función `derivar-progreso.ts` se escribe con supuestos del equipo técnico que pueden no reflejar el flujo real de venta de Carlos.
- E2-S7 y E4-S8 se conectan sobre un contrato incompleto: "el Reporte aprobado avanza a Investigado" es claro, pero ¿qué avanza a Recomendado, En acercamiento, En trámite, En cierre? No está en ningún documento.
- El riesgo no es técnico: es que Carlos lleve dos semanas usando la plataforma con una lógica de progreso que no refleja su flujo real y luego pida un rediseño de la máquina de estados.

**Lo que se necesita:** una sesión de 30 minutos con Carlos donde él define verbalmente "¿qué significa para ti que un prospecto está en Recomendado? ¿Qué tiene que haber pasado?" Eso se convierte en el mapa. Puede hacerse en paralelo con el build; no bloquea E1 ni E2, pero debe cerrarse antes de E2-S7.

---

### 🟡 I-2 — El contrato del worker de Tareas asume un loop in-process en Railway sin garantías de tiempo de vida

**Dónde:** Arquitectura D-4, §6.3, Épicas E3-S3.

El worker de Tareas es un "loop dentro del proceso api" en Railway. El flujo del Investigador puede tardar hasta 15 minutos. Railway cobra por tiempo de cómputo y puede reiniciar contenedores por memoria, actualizaciones o inactividad. La mitigación es "estado durable en Postgres + idempotencia", lo cual es correcto. Pero:

- El loop in-process no tiene mecanismo de throttle ni de concurrencia controlada explícito en los documentos. Con 3–5 asesores simultáneos disparando el Investigador al mismo tiempo, 3–5 generaciones de 15 minutos corren en el mismo proceso. Sin un pool de concurrencia, hay riesgo de agotamiento de memoria.
- La E3-S3 dice que "el worker retoma Tareas EN_CURSO huérfanas al arrancar", pero no especifica el tiempo de espera antes de considerarlas huérfanas ni si hay timeout de Tarea. Una generación que falla silenciosamente (timeout de la llamada a IA) puede dejar una Tarea EN_CURSO para siempre.

**Lo que se necesita:** antes de E3-S3, definir: (1) límite de concurrencia del worker (sugerido: max 2 generaciones simultáneas en piloto), (2) timeout de Tarea (sugerido: 20 minutos), y (3) qué pasa cuando el timeout vence (marca BLOQUEADA con motivo "tiempo de espera excedido"). Son 10 líneas de código y una constante; el riesgo de no definirlas es que el piloto con 3–5 asesores tire el servicio de Railway el primer día.

---

### 🟡 I-3 — El Reporte de Inteligencia como JSONB no tiene su esquema Zod (ReporteV1) definido, y toda la cadena depende de él

**Dónde:** Arquitectura D-2, §5.3, §7, Épicas E4-S2.

El contenido del Reporte se guarda como JSONB tipado en `EntregableVersion.contenido`, validado por el esquema `ReporteV1`. Este esquema es el contrato entre el Investigador (que lo produce), el visor del Reporte (que lo lee), el PDF renderer (que lo convierte), y la Verificación de citas C-2 (que lo audita). Sin embargo:

- El esquema `ReporteV1` no está definido en ningún documento. Su estructura (secciones, formato de citas inline, lista de brechas, recomendaciones embebidas vs. tabla relacional) está descrita en prosa en el PRD y la UX pero nunca como un esquema Zod o TypeScript concreto.
- Si el equipo empieza E4-S2 sin `ReporteV1` definido, cada pieza del pipeline lo inventa por su lado y luego no encajan.
- El esquema debe estar en `packages/shared/src/reporte/` antes de cualquier historia de E4.

**Lo que se necesita:** antes de E4-S2, la historia E4-S1 (PoC) debe producir como entregable la definición del esquema `ReporteV1` como tipado Zod, basado en la estructura de los reportes reales (B-3 anterior). Si B-3 se resuelve (Carlos entrega el reporte real), este punto se resuelve solo.

---

### 🟡 I-4 — La dependencia temporal Epica E6 antes de E4 no está garantizada; el PoC de E4-S1 necesita el seed del Catálogo

**Dónde:** Épicas FR Coverage Map nota, E4-S2, E6-S1.

El FR Coverage Map admite: "el seed mínimo del Catálogo nace dentro de E4 (lo que el Investigador necesita) y E6 lo completa." Esto crea una dependencia circular frágil:

- E4-S1 necesita un Catálogo mínimo para probar la compuerta C-1 (Fidelidad de catálogo). Ese mínimo sale de E6-S1.
- E6-S1 depende de E1-S2 (esquema de la DB), que es previo a E4.
- Pero E6-S1 también depende de que Carlos confirme el subconjunto exacto (Q-3 / B-2 de este reporte), que puede llegar tarde.
- Si Carlos tarda en entregar el catálogo, E4-S1 se construye con instituciones/productos inventados por el equipo. El PoC entonces no prueba la compuerta C-1 real; prueba una compuerta contra datos fake.

**Lo que se necesita:** ejecutar E6-S1 (seed mínimo) en paralelo con E1, no en secuencia después de E4. Requiere que Carlos entregue el catálogo antes de que E4-S1 arranque. Ver B-2.

---

### 🟡 I-5 — El gate humano solo valida estado APROBADO pero no valida la versión aprobada

**Dónde:** Arquitectura D-5 compuerta C-3, §6.2, Épicas E4-S8, E4-S9.

El endpoint `POST /entregables/:id/exportar` verifica `estado === APROBADO`. Correcto. Pero el modelo tiene `EntregableVersion` con múltiples versiones y `versionActual`. El riesgo concreto:

- El Asesor aprueba la versión 1. Luego edita el reporte (crea versión 2 en Borrador). ¿Puede exportar? Si el código verifica `Entregable.estado === APROBADO` (que sigue siendo APROBADO de la versión 1), el export podría generar el PDF de la versión 2 que no está aprobada.
- El documento de arquitectura dice "el PDF exportado lleva número de versión en metadatos" pero no especifica si el export usa la versión aprobada más reciente o la versión actual (que puede ser un borrador editado post-aprobación).
- Ninguna historia de épicas menciona este edge case.

**Lo que se necesita:** antes de E4-S9, aclarar en el contrato del endpoint: "`/exportar` siempre usa la versión con `aprobado = true` más reciente, independientemente de ediciones posteriores". Y la prueba de E4-S9 debe incluir el caso "editar después de aprobar → exportar usa la versión aprobada, no el borrador".

---

### 🟡 I-6 — La UX describe actualización en tiempo real pero el polling con backoff no tiene contrato de implementación definido

**Dónde:** Arquitectura D-7, Épicas E2-S2.

El polling de 5–10 s "con backoff cuando todo está quieto" aparece en D-7 pero no define:
- ¿Qué criterio activa el backoff? ¿Cuántas respuestas sin cambio antes de bajar la frecuencia?
- ¿Hasta qué intervalo máximo baja? ¿30 s? ¿60 s?
- ¿Qué evento vuelve a activar el polling rápido? ¿Una acción del usuario? ¿Una respuesta que indica Tareas activas?

Sin este contrato, el polling puede quedar fijo a 5 s (caro), o implementar un backoff que deje al Asesor viendo un estado congelado por 2 minutos mientras espera el reporte del Investigador. La historia E2-S2 dice "polling 5–10 s con backoff" sin criterios. No bloquea el build, pero producirá un PR de revisión fallido en la primera demo real.

---

### 🟢 M-1 — El comportamiento de la cola FIFO del worker no está garantizado para el piloto con múltiples asesores

**Dónde:** UX §5 C-1 supuesto S-1, Épicas E3-S3.

El supuesto UX S-1 dice "un empleado solo trabaja en un expediente a la vez en v1; cola FIFO". La arquitectura del worker no garantiza explícitamente que el Investigador no procese dos Expedientes de asesores distintos simultáneamente. En el piloto con 3–5 asesores, si dos disparan el Investigador al mismo tiempo, el worker los ejecuta en paralelo (Tareas independientes). El supuesto de "solo un expediente a la vez" aplica al contexto de UI del empleado (la tarjeta muestra un expediente), no a la ejecución real del worker.

Esto no es un bug bloqueante, pero produce una inconsistencia UX: el Investigador puede aparecer como "Trabajando en Probemedic" cuando en realidad está procesando también "Las Aliadas" para otro asesor. La lógica de `GET /empleados` debe resolverlo (¿qué muestra cuando el mismo rol tiene dos Tareas EN_CURSO de distintos asesores?). Menor, pero vale documentarlo antes de la primera sesión multiasesor.

---

### 🟢 M-2 — No hay historia para el refresh de tokens de Clerk en generaciones largas

**Dónde:** Arquitectura R-4, Épicas E8-S2.

La Arquitectura reconoce R-4 ("token vencido a mitad de flujo") y la mitiga en E8-S2 ("getToken() se refresca en cada llamada desde web"). Esta mitigación está en la historia de despliegue, no en E3-S3 (donde se diseña el worker) ni en E1-S3 (donde se diseña el auth). El worker ya no usa el token después de tener `asesorId`, correcto. Pero el polling desde `web` sí llama a la API cada 5–10 s con el JWT. Si la sesión de Clerk expira durante una generación de 15 minutos, el polling falla con 401 y la UI congela el estado. La historia de auth (E1-S3) no menciona el manejo de 401 de polling ni el refresco automático. Es minor para el piloto (Carlos no va a tener sesiones de >1h), pero en producción real es un edge case que produce confusión.

---

### 🟢 M-3 — El disclaimer de "no oferta vinculante" aparece en el PDF pero no en el visor inline

**Dónde:** PRD NFR-9, UX P-3 subtipo A, Épicas E4-S7.

La UX especifica que el disclaimer aparece en "la cabecera del reporte (dentro del cuerpo)" en el visor (P-3). La arquitectura lo menciona en `pdf/render-reporte.ts`. La historia E4-S7 dice que la cabecera lleva el disclaimer. Pero la historia E5-S3 (el Tramitador con cotización estimada) solo dice que "toda cifra está marcada como estimada" y el disclaimer aplica a cotizaciones también (NFR-9). No hay una historia o criterio de aceptación explícito que verifique el disclaimer en el entregable del Tramitador. Minor, pero si la cotización sale al cliente sin el disclaimer es un problema legal antes que técnico.

---

## Resumen de lo que bloquea el build

| # | Bloqueante | Dueño | Tiempo estimado |
|---|---|---|---|
| B-1 | Motor de investigación sin elegir (herramienta de búsqueda externa) | Carlos + técnico | 2h de PoC comparativo |
| B-2 | Catálogo SOC v1 no existe como artefacto | Carlos | 1 día de curación |
| B-3 | Reportes reales de Probemedic/Las Aliadas no compartidos | Carlos | 30 minutos |
| B-4 | Motor de generación de PDF sin elegir | Técnico | 2h de prototipo |

## Lo que puede avanzar mientras se resuelven los bloqueantes

- **E1 completa** (monorepo, auth, Prisma, R2, wrapper IA con fallback, shell de La Oficina) — ningún bloqueante la toca.
- **E2 completa** — los Expedientes, La Oficina, el progreso honesto, los filtros — excepto E2-S7 (mapa de etapas) que espera la sesión con Carlos (I-1, 30 minutos).
- **E3 parcial** — el orquestador de Sócrates y el worker, hasta definir los timeouts de Tarea (I-2).

---

## Recomendación

**Iniciar el build con E1 y E2 en paralelo con una sesión de media jornada con Carlos** donde se resuelvan B-2 (entregar el catálogo), B-3 (entregar los reportes reales) y I-1 (definir el mapa de etapas). Esa sesión desbloquea el 80% de los bloqueantes. B-1 (motor de búsqueda) y B-4 (motor de PDF) requieren un PoC técnico de 2–4 horas que puede correr en paralelo con E1/E2. Ninguna historia de E4 debe comenzar hasta que B-1, B-2 y B-3 estén cerrados; de lo contrario el build nocturno entrega un Investigador que investiga con datos inventados sobre una plantilla vacía.

---

*Revisión adversaria producida con lente cínico/general (BMAD). Ningún documento fue modificado. Los hallazgos son input para decisiones, no correcciones automáticas.*
