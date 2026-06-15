---
title: "PRD: Sócrates — la plataforma de SOC | TALENT"
status: draft
created: 2026-06-14
updated: 2026-06-14
pm: John (BMAD)
idioma: es-MX
fuentes:
  - _bmad-output/planning-artifacts/briefs/brief-SOC-2026-06-14/brief.md
  - _bmad-output/planning-artifacts/briefs/brief-SOC-2026-06-14/addendum.md
  - docs/sim-handoff/07-prd-mvp.md
  - docs/sim-handoff/reporte-innovacion-v0.2.md
  - docs/sim-handoff/01-one-pager.md
  - docs/sim-handoff/08-research-de-mercado.md
  - docs/sim-handoff/DECISIONES.md
---

# PRD: Sócrates — la plataforma de SOC | TALENT
*Título de trabajo confirmado: "Sócrates". El producto es la plataforma; "Sócrates" es a la vez el nombre del producto y el del gerente (la tortuga, mascota de SOC) que el asesor dirige.*

---

## 0. Propósito del documento

Este PRD es la fuente de verdad de producto para **Sócrates v1**. Está escrito para el PM (John), para Carlos (dueño/design partner), y para los flujos BMAD que se derivan de aquí: **UX** (`bmad-ux`), **Arquitectura** (`bmad-create-architecture`) y **Épicas e Historias** (`bmad-create-epics-and-stories`). Es un PRD *cabeza de cadena*: lo que aquí queda mal definido se propaga a los tres.

Cómo está estructurado: vocabulario anclado en el **§3 Glosario** (los términos de oficina se usan idénticos en todo el documento, sin sinónimos); las capacidades agrupadas por **§4 Funcionalidades** con **Requisitos Funcionales (FR) numerados global y establemente** anidados; los **Requisitos No Funcionales (NFR) transversales** en su propia sección §10; los supuestos marcados en línea con `[SUPUESTO: …]` e indexados en §13. Las decisiones de *cómo* técnico (stack, transporte, contratos internos) viven en el **addendum** del brief (`brief-SOC-2026-06-14/addendum.md`) y se citan, no se duplican.

Este PRD **construye sobre** el data-room de SIM (one-pager, research de mercado, reporte de innovación v0.2) y sobre el PRD del MVP "El Investigador" (`docs/sim-handoff/07-prd-mvp.md`). Ese documento de SIM cubría a fondo UN solo empleado; este PRD lo absorbe y lo amplía a **toda la oficina** (Sócrates + 6 empleados + expedientes), conservando intacta su doctrina de calidad.

> **Regla de honestidad heredada de SIM:** lo comprobado en campo va sin marca o como hecho; lo inferido por el PM va marcado `[SUPUESTO: …]`. No se rellenan huecos con cifras plausibles disfrazadas de dato real.

---

## 1. Visión

El asesor financiero de SOC abre Sócrates y **entra a su oficina**. No ve un chat ni un tablero de métricas: ve a su gente trabajar. Le habla en lenguaje natural a **Sócrates** —el gerente, una tortuga, la mascota de SOC— y Sócrates planifica, reparte el trabajo entre seis empleados y le reporta como lo haría un buen jefe de equipo. La sensación nuclear, declarada por Carlos, es la de un dueño que **paga por ver que alguien hace lo que él debería estar haciendo**: prospectar, investigar, recomendar el producto correcto, acercarse, tramitar y cerrar.

La oficina está organizada por **expedientes**: cada prospecto o cliente es una carpeta con su **progreso visible**, los empleados que trabajan en él, y sus entregables. El corazón ya está probado en campo: el **Investigador** genera Reportes de Inteligencia Financiera a la medida de cada prospecto —estudia el negocio mejor que su propio dueño, con fuentes verificables, y amarra cada hallazgo a un producto específico de una institución específica del catálogo de ~55 aliadas de SOC, con el argumento de cierre listo—. Carlos cerró sus dos mejores deals con dos de estos reportes hechos a mano (Las Aliadas, Probemedic). Sócrates convierte ese ritual manual en un sistema reproducible para toda la red.

Por qué importa: la IA generativa maduró justo cuando la industria PYME sigue operando a mano —reuniones de dos horas, memorización humana, búsqueda en Google antes de cada cita—. Sócrates es el "picks y palas" de los ~2,000 asesores de SOC: empieza como jugada de SOC | TALENT, gana tracción documentada, y se vende, renta o se negocia con SOC Corporativo. La promesa es simple y grande: **darle a cada asesor el ejército de empleados que hoy solo el mejor vendedor tiene.**

---

## 2. Usuario objetivo

### 2.1 Jobs To Be Done (lo que el asesor "contrata" a Sócrates para que haga)

- **Funcional — Llegar preparado:** *"Tengo una cita con una PYME esta semana. Necesito llegar sabiendo más de su negocio que su dueño, con una recomendación concreta y vendible (producto + institución + argumento), en minutos, no en una tarde de trabajo experto."*
- **Funcional — Que el equipo accione, no solo informe:** *"No quiero un buscador. Quiero que alguien prospecte por mí, investigue, arme el guion, prepare el expediente y me persiga el cierre — y yo sólo dirigir y dar el visto bueno."*
- **Funcional — No perder el hilo:** *"Tengo 10–40 prospectos vivos. Necesito ver de un vistazo en qué va cada uno, quién está trabajándolo y qué falta — sin llenar yo mismo un CRM."*
- **Emocional — Sentirse el dueño con equipo, no el operador solo:** *"Quiero entrar a mi oficina y ver a mi gente trabajando para mí."* Esta sensación ES el producto (decisión de Carlos, `DECISIONES.md` 2026-06-13).
- **Social — Verse como el más profesional de la sala:** *"Quiero entregar un documento de consultoría con marca SOC | TALENT que me posicione como el mejor informado, no un PDF genérico de ChatGPT."*
- **Económico — Convertir tiempo en comisión:** *"Cada hora que no gasto investigando a mano es una hora vendiendo. Cada deal que cierro mejor vale $25,000–$50,000 MXN de comisión."*

### 2.2 No-usuarios en v1 (frontera explícita de audiencia)

- **El cliente final / la PYME** — recibe el resultado (el reporte, la cotización) a través del asesor; nunca usa la herramienta.
- **El asesor SOC fuera de la franquicia TALENT de Carlos** — la red de ~2,000 asesores es el objetivo de expansión, no de v1. v1 es jugada de SOC | TALENT (piloto 3–5 asesores en Monterrey).
- **SOC Corporativo como administrador** — Corporativo es el comprador del *exit*, no un usuario operativo en v1. Sin login corporativo, sin roles administrativos, sin panel de supervisión de red.
- **Áreas de las instituciones financieras** — no operan en la plataforma; aparecen solo como datos del catálogo.

### 2.3 Journeys de usuario clave

*Narrativas con protagonista nombrado que la plataforma habilita. Numeradas UJ-1 … UJ-N. Los FR las referencian en línea ("realiza UJ-3").*

- **UJ-1. Carlos abre su oficina y delega en lenguaje natural.**
  - **Persona + contexto:** Carlos, Director Comercial de SOC | TALENT, 12–20 prospectos vivos esta semana. Es experto: sabe vender crédito PYME y leer un reporte; lo que no tiene es tiempo ni reproducibilidad.
  - **Estado de entrada:** autenticado vía Clerk; aterriza en la vista **La Oficina** (su lista de expedientes con progreso).
  - **Camino:** (1) Le escribe a **Sócrates** en lenguaje de oficina: *"Tengo cita el jueves con una distribuidora farmacéutica, se llama Probemedic, está en Monterrey. Necesito todo listo."* (2) Sócrates entiende la intención, **abre/identifica el expediente**, redacta un plan ("le pido al Investigador el reporte, al Asesor que matchee producto, al Negociador el guion"), y **delega** las tareas a los empleados. (3) Carlos ve aparecer las tareas en el expediente, cada una asignada a un empleado, cada una con su estado (encargada → en curso → entregada).
  - **Clímax:** Sócrates le reporta de vuelta, en lenguaje de jefe: *"Listo. El Investigador entregó el reporte (está para tu revisión), el Asesor propuso 3 productos, el Negociador tiene el guion. ¿Reviso algo más?"*
  - **Resolución:** Carlos tiene el expediente avanzado sin haber tocado un formulario de IA. Próximo: revisar el reporte (UJ-3).
  - **Caso límite:** si la intención es ambigua ("prepárame todo" sin nombrar prospecto), Sócrates pregunta de vuelta en una sola frase, no inventa un expediente.

- **UJ-2. Carlos vive su semana desde la lista de expedientes.**
  - **Persona + contexto:** mismo Carlos, lunes en la mañana, quiere saber dónde poner su energía.
  - **Estado de entrada:** autenticado, en **La Oficina**.
  - **Camino:** ve sus expedientes como **carpetas con barra de progreso**; cada una muestra etapa actual (Prospecto → Investigado → Recomendado → En acercamiento → En trámite → En cierre), qué empleados trabajan en ella, y si hay algo esperando su visto bueno. (2) Filtra por "necesitan mi revisión". (3) Entra a uno.
  - **Clímax:** en 10 segundos sabe qué expediente está caliente y qué bloquea su avance (un reporte por aprobar, una cotización por enviar).
  - **Resolución:** abre el expediente prioritario; el resto sigue corriendo solo.
  - **Caso límite:** si un empleado falló una tarea (p. ej. no encontró datos), el expediente lo muestra como **bloqueo visible con motivo**, no como progreso falso.

- **UJ-3. El Investigador entrega y Carlos pasa el gate de calidad.** *(el flujo punta de lanza, probado en campo)*
  - **Persona + contexto:** Carlos prepara la cita de Probemedic; el Investigador ya generó el **Reporte de Inteligencia** como **borrador**.
  - **Estado de entrada:** autenticado, dentro del expediente Probemedic, pestaña de entregables.
  - **Camino:** (1) abre el reporte borrador con todas las secciones canónicas (resumen ejecutivo, panorama de industria con cifras, análisis del prospecto, FODA/perfil de riesgo, recomendaciones con producto SOC, benchmarks, **brechas de información**, fuentes). (2) Cada afirmación cuantitativa muestra su **cita verificable**; las recomendaciones amarran hallazgo → producto → institución del **catálogo SOC** → argumento de cierre. (3) Carlos edita una frase, verifica dos fuentes con un clic, marca el reporte como **aprobado**.
  - **Clímax:** exporta a **PDF con marca SOC | TALENT** (a R2), idéntico en pulcritud a los reportes Las Aliadas/Probemedic. Ese PDF cierra el deal.
  - **Resolución:** el expediente avanza de etapa; el entregable queda versionado y guardado.
  - **Caso límite:** si intenta exportar **sin aprobar** (gate humano), el sistema lo bloquea y marca el documento como borrador — el gate no se salta en v1.

- **UJ-4. Carlos dirige al resto del equipo a lo largo del flujo.**
  - **Persona + contexto:** el deal de Probemedic avanza; toca acercarse, tramitar y cerrar.
  - **Camino:** dentro del expediente, le pide a Sócrates (o directo a cada empleado) que avance: el **Asesor** confirma el producto del catálogo; el **Negociador** entrega pitch, guion y manejo de objeciones; el **Tramitador** arma la lista de expediente/requisitos y una cotización estimada; el **Gestor** propone los siguientes pasos de seguimiento y postventa.
  - **Clímax:** cada empleado deja su **entregable** en el expediente, con progreso visible y bajo el mismo gate humano cuando el entregable sale al cliente.
  - **Resolución:** el expediente llega a "En cierre" con todos los entregables listos para que Carlos accione en la vida real.
  - **Caso límite:** si un empleado depende de algo que aún no existe (p. ej. el Negociador necesita el reporte del Investigador y aún no está aprobado), Sócrates lo señala como **dependencia pendiente**, no produce un entregable a ciegas.

- **UJ-5. Sin claves externas, la oficina sigue mostrando valor (demo/seed).**
  - **Persona + contexto:** Carlos enseña Sócrates a un asesor aliado en una laptop sin conexión a la IA real / sin claves de proveedor.
  - **Camino:** entra; los expedientes **Las Aliadas** y **Probemedic** ya están sembrados; el reporte de Probemedic sembrado fiel se abre completo; los empleados responden con su **fallback** (resultado sembrado o mensaje honesto) sin que la app truene.
  - **Clímax:** el aliado ve la oficina viva y el reporte real aunque no haya IA en vivo.
  - **Resolución:** cuando hay claves, el mismo flujo genera contenido nuevo en vivo.

---

## 3. Glosario

*Los flujos downstream y todo lector deben usar estos términos exactamente. FR, UJ y SM los usan verbatim. Introducir un sinónimo en cualquier parte del PRD es una violación de disciplina. El lenguaje es de **oficina**, nunca de IA: se dice "empleado", "encargo", "entregable", "el Investigador entregó" — nunca "modelo", "prompt", "agente", "chatbot" en la superficie del producto.*

- **Sócrates** — (a) el producto/plataforma; (b) el **gerente**: tortuga, mascota de SOC, único interlocutor en lenguaje natural del Asesor. Orquesta (planifica y delega a los Empleados) y reporta de vuelta. No produce entregables de cliente él mismo; coordina a quienes los producen.
- **Asesor** — el usuario humano de Sócrates: el asesor financiero de SOC | TALENT. Dirige; no opera a mano. Es el dueño de sus Expedientes. (Autenticado vía Clerk; cada Asesor solo ve lo suyo.)
- **Empleado** — uno de los seis roles de IA que accionan por el Asesor. Conjunto cerrado en v1: **Prospector, Investigador, Asesor de producto, Negociador, Tramitador, Gestor**. (Nota de desambiguación: "Asesor" a secas = el humano usuario; el empleado se nombra **"Asesor de producto"** para evitar choque.) Todos comparten el contrato común `ejecutar(entrada, ctx) → resultado` (addendum).
- **Prospector** — Empleado que prospecta y califica prospectos a partir de criterios del Asesor. En v1 el Asesor trae sus prospectos; el Prospector los **califica/enriquece**, no caza a escala.
- **Investigador** — Empleado punta de lanza. Genera el **Reporte de Inteligencia** a la medida del prospecto: investigación con fuentes + síntesis contra el Catálogo SOC + argumento de cierre. Probado en campo.
- **Asesor de producto** — Empleado que matchea cada necesidad detectada con un Producto de una Institución del **Catálogo SOC**.
- **Negociador** — Empleado que produce pitch, guion de acercamiento y manejo de objeciones para un Expediente.
- **Tramitador** — Empleado que arma el expediente operativo: lista de requisitos/documentos, cotización estimada, pasos de trámite.
- **Gestor** — Empleado que propone seguimiento, cierre y postventa.
- **Expediente** — la **columna vertebral**. Carpeta por prospecto/cliente, propiedad de un Asesor. Tiene: estado (= **Etapa**), **progreso** (%), los Empleados que trabajan en él, sus Tareas y sus Entregables. (Modelo de datos: `Asesor → Expediente → Tarea + Entregable`, addendum.)
- **Etapa** — el estado de avance de un Expediente en el flujo: **Prospecto → Investigado → Recomendado → En acercamiento → En trámite → En cierre** (+ estados terminales **Ganado / Perdido**). El progreso (%) se deriva de la Etapa y de las Tareas completadas.
- **Tarea** — unidad de trabajo dentro de un Expediente, asignada a un Empleado, con su propio estado (**Encargada → En curso → Entregada → Bloqueada**). Producida por delegación de Sócrates o por encargo directo del Asesor.
- **Entregable** — artefacto producido por un Empleado y guardado en el Expediente (Reporte de Inteligencia, guion, lista de requisitos, cotización, etc.). Tiene estado **Borrador / Aprobado** y, cuando aplica, un archivo en **R2**.
- **Reporte de Inteligencia** — el Entregable estrella del Investigador. Documento tipo consultoría en el formato canónico SOC | TALENT, exportable a PDF.
- **Catálogo SOC** — base de conocimiento curada: **Institución → Producto → para qué sirve → condiciones típicas → cuándo recomendarlo**. Subconjunto curado en v1 (instituciones de los reportes reales); expandible a las 55. Es el **foso**.
- **Institución** — entidad financiera aliada de SOC (Banorte, Konfío, Covalto, Afirme, etc.). Vive en el Catálogo SOC.
- **Producto (financiero)** — producto de una Institución (Crédito Revolvente, Arrendamiento Puro, Factoraje, Standby LC, Seguro PYME, etc.). Vive en el Catálogo SOC.
- **Recomendación** — unidad de la capa de síntesis: hallazgo → Producto específico → Institución específica → argumento de cierre. Solo usa Productos/Instituciones existentes en el Catálogo SOC.
- **Cita** — referencia verificable (URL o documento) que respalda una afirmación cuantitativa del Reporte. Toda afirmación cuantitativa lleva su Cita.
- **Brecha de información** — dato clave que el sistema **no** pudo verificar; se marca explícitamente como brecha, nunca se inventa en el cuerpo.
- **Gate humano** — paso obligatorio de revisión/aprobación del Asesor antes de que un Entregable salga al cliente. No se salta en v1.
- **Capa de síntesis** — el motor que convierte investigación + Catálogo SOC en Recomendaciones accionables. El corazón y el foso del producto.
- **Verificación de citas** — segundo pase que confirma que cada Cita realmente respalda lo afirmado, antes de mostrar el borrador al Asesor.
- **Modo sin claves (fallback)** — modo de operación con datos sembrados (seed) cuando no hay claves de IA/proveedor; la app no truena y muestra valor con los Expedientes Las Aliadas y Probemedic.

---

## 4. Funcionalidades

*Cada subsección es una funcionalidad coherente: descripción de comportamiento primero, FR anidados, NFR específicos y notas opcionales. Los FR están numerados global y establemente (FR-1 … FR-N). Lenguaje de oficina obligatorio en toda la superficie.*

### 4.1 Sócrates, el gerente (orquestación y reporte)

**Descripción:** El Asesor le habla a Sócrates en lenguaje natural de oficina. Sócrates interpreta la intención, identifica o abre el Expediente correcto, **planifica** (decide qué Empleados intervienen y en qué orden), **delega** creando Tareas, y **reporta** de vuelta el avance como lo haría un jefe de equipo. Sócrates es el único interlocutor conversacional; los Empleados accionan, no charlan. Sócrates nunca produce un Entregable de cliente por sí mismo: coordina a quien lo produce. Cuando la intención es ambigua o falta un dato indispensable, pregunta de vuelta en una sola frase en lugar de inventar. Realiza UJ-1, UJ-4.

**Requisitos Funcionales:**

#### FR-1: Interpretar la intención del Asesor en lenguaje natural

El Asesor puede escribirle a Sócrates en lenguaje de oficina (sin sintaxis ni comandos) y Sócrates determina la intención, el Expediente objetivo y los Empleados a involucrar. Realiza UJ-1.

**Consecuencias (testables):**
- Dado un mensaje que nombra un prospecto y un objetivo ("prepárame todo para X"), Sócrates identifica un Expediente existente o propone crear uno, y enumera las Tareas que delegará antes de ejecutarlas.
- Dado un mensaje ambiguo (sin prospecto identificable o sin objetivo), Sócrates responde con **una** pregunta de aclaración y **no** crea Expediente ni Tareas hasta resolverla.
- La superficie de respuesta usa lenguaje de oficina; **nunca** expone términos de IA ("modelo", "prompt", "token", "agente").

#### FR-2: Planificar y delegar Tareas a los Empleados

Sócrates puede descomponer un encargo en Tareas, asignar cada una al Empleado correcto y dispararlas, respetando dependencias entre Empleados. Realiza UJ-1, UJ-4.

**Consecuencias (testables):**
- Cada Tarea creada queda visible en el Expediente con: Empleado asignado, estado inicial **Encargada**, y descripción legible.
- Si una Tarea depende de otra (p. ej. el Negociador requiere el Reporte del Investigador aprobado), Sócrates **no** la dispara hasta cumplir la dependencia y la marca como dependencia pendiente.
- El Asesor puede vetar/ajustar el plan propuesto antes de que se ejecute (puede quitar Empleados del encargo).

#### FR-3: Reportar avance de vuelta al Asesor

Sócrates puede resumir, a petición o al completarse el trabajo, qué Empleados entregaron, qué quedó pendiente y qué espera el visto bueno del Asesor. Realiza UJ-1.

**Consecuencias (testables):**
- Tras completarse las Tareas de un encargo, Sócrates emite un resumen que lista Entregables producidos y los que requieren Gate humano.
- El resumen distingue explícitamente "listo / esperando tu revisión / bloqueado (con motivo)".

**NFR específicos:** la respuesta de orquestación de Sócrates (interpretar + plan propuesto) debe sentirse conversacional: ver NFR-7 (latencia de primer acuse ≤ 3 s).

**Notas:** `[SUPUESTO: en v1 Sócrates orquesta de forma síncrona-asistida — el Asesor ve el plan y confirma; no hay ejecución 100% autónoma en segundo plano sin que él lo vea. La autonomía total queda fuera por la misma razón que el Gate humano.]`

---

### 4.2 Los Expedientes (la columna vertebral)

**Descripción:** El Asesor vive organizado por Expedientes. **La Oficina** es la vista raíz: la lista de sus Expedientes como carpetas, cada una con barra de **progreso**, Etapa actual, Empleados activos y señal de "necesita tu revisión". Dentro de un Expediente, el Asesor ve sus Tareas (con estado por Empleado) y sus Entregables (con estado Borrador/Aprobado). El progreso es **visible y honesto**: un fallo de un Empleado se muestra como Bloqueo con motivo, no como avance falso. Realiza UJ-2.

**Requisitos Funcionales:**

#### FR-4: Crear y gestionar Expedientes por prospecto/cliente

El Asesor (o Sócrates por delegación) puede crear un Expediente con los datos mínimos del prospecto (empresa, ciudad, industria) y opcionales (web, RFC, # sucursales, notas). Realiza UJ-1, UJ-2.

**Consecuencias (testables):**
- Un Expediente nuevo nace en Etapa **Prospecto** con progreso 0% y sin Entregables.
- Cada Expediente pertenece a un único Asesor; un Asesor solo ve y opera sus propios Expedientes (ver NFR-8, aislamiento multi-asesor).
- Los campos mínimos (empresa, ciudad, industria) son obligatorios; los opcionales no bloquean la creación.

#### FR-5: Mostrar la lista de Expedientes con progreso (La Oficina)

El Asesor puede ver todos sus Expedientes con su Etapa, progreso (%), Empleados activos y estado de revisión pendiente, y filtrarlos. Realiza UJ-2.

**Consecuencias (testables):**
- Cada tarjeta de Expediente muestra: nombre del prospecto, Etapa, barra de progreso, Empleados trabajando, y un indicador si hay algún Entregable esperando Gate humano.
- El Asesor puede filtrar al menos por "necesitan mi revisión" y por Etapa.
- La lista refleja cambios de estado de Tareas/Entregables sin que el Asesor recargue manualmente. `[SUPUESTO: actualización por polling o evento; mecanismo concreto lo decide Arquitectura.]`

#### FR-6: Ver el detalle de un Expediente (Tareas + Entregables + Empleados)

El Asesor puede abrir un Expediente y ver sus Tareas (estado por Empleado), sus Entregables (Borrador/Aprobado) y la Etapa, con el progreso derivado. Realiza UJ-2, UJ-3, UJ-4.

**Consecuencias (testables):**
- Cada Tarea muestra Empleado, estado (**Encargada / En curso / Entregada / Bloqueada**) y, si Bloqueada, el **motivo**.
- El progreso (%) del Expediente se deriva de la Etapa y de las Tareas completadas, de forma determinista y reproducible.
- Un Entregable abierto desde el Expediente muestra su estado Borrador/Aprobado y, si tiene archivo, el enlace a R2.

#### FR-7: Avanzar la Etapa del Expediente

El Expediente puede avanzar de Etapa (Prospecto → Investigado → Recomendado → En acercamiento → En trámite → En cierre → Ganado/Perdido) conforme se completan Entregables clave. Realiza UJ-2, UJ-4.

**Consecuencias (testables):**
- El avance de Etapa ocurre por una transición válida; no se puede saltar a una Etapa cuyo Entregable prerrequisito no existe/no está Aprobado. `[SUPUESTO: el mapa exacto Etapa↔Entregable prerrequisito se afina con Carlos; el default va en §8 Q-2.]`
- El Asesor puede marcar manualmente **Ganado** o **Perdido** en cualquier momento, con motivo opcional.

---

### 4.3 El Investigador y el Reporte de Inteligencia (punta de lanza)

**Descripción:** Es el flujo probado en campo y el más profundo del producto. A partir del Expediente (empresa + ciudad + industria + opcionales), el Investigador ejecuta un **pipeline de síntesis** que: (1) investiga al prospecto y su industria con fuentes citadas; (2) construye perfil de negocio + FODA/perfil de riesgo con datos reales; (3) **matchea** cada necesidad detectada contra el Catálogo SOC produciendo Recomendaciones (producto + institución + argumento de cierre); (4) marca como **Brecha de información** lo no verificado; (5) ensambla el Reporte en el formato canónico SOC | TALENT; (6) corre la **Verificación de citas**; y entrega el Reporte como **Borrador** sujeto al **Gate humano**. La calidad/precisión a escala ES el producto: un dato mal citado o una institución/producto inventado es el veneno. Realiza UJ-3.

**Requisitos Funcionales:**

#### FR-8: Generar el Reporte de Inteligencia desde el Expediente

El Investigador puede generar, a partir de los datos del Expediente, un Reporte borrador con todas las secciones canónicas. Realiza UJ-3.

**Consecuencias (testables):**
- El Reporte incluye, como mínimo: portada/carta ejecutiva, resumen ejecutivo (hallazgos + recomendaciones), panorama de industria con cifras, análisis del prospecto, FODA/perfil de riesgo, Recomendaciones con Producto SOC, benchmarks, **Brechas de información** y **Fuentes**.
- El Reporte se crea en estado **Borrador** y se asocia al Expediente como Entregable.
- La generación muestra progreso por sección (investigando industria → analizando empresa → FODA → matcheando productos → redactando → verificando).

#### FR-9: Citar toda afirmación cuantitativa con fuente verificable

Cada afirmación cuantitativa del Reporte (cifra de mercado, monto, fecha, %) lleva una **Cita** rastreable a su fuente. Realiza UJ-3.

**Consecuencias (testables):**
- 0 cifras presentadas como hecho sin Cita asociada (medible por auditoría del Reporte).
- Cada Cita expone su fuente (URL/documento) de forma que el Asesor pueda abrirla y defenderla ante el cliente (Trazabilidad, NFR-3).
- Un dato no verificable **no** aparece como hecho en el cuerpo: va a Brechas de información (FR-11).

#### FR-10: Producir Recomendaciones accionables contra el Catálogo SOC (capa de síntesis)

Para cada necesidad financiera detectada, el Investigador (con el Asesor de producto, §4.4) produce ≥1 Recomendación = Producto específico + Institución específica del Catálogo SOC + argumento de cierre en una frase. Realiza UJ-3, UJ-4.

**Consecuencias (testables):**
- Toda Recomendación referencia **solo** Productos e Instituciones existentes en el Catálogo SOC; **0** instituciones/productos inventados (Fidelidad de catálogo, NFR-2).
- Un hallazgo sin Producto aplicable se deja **sin** Recomendación forzada (no se fabrica un match falso) y, si aplica, se nota como Brecha.
- Cada Recomendación es trazable al hallazgo que la originó.

#### FR-11: Marcar Brechas de información (honestidad como feature)

El Reporte marca explícitamente todo dato clave que no pudo verificarse, en una sección de Brechas de información. Realiza UJ-3.

**Consecuencias (testables):**
- Cada Brecha describe qué dato falta y, cuando aplica, cómo conseguirlo (ej.: "el nombre del laboratorio ancla no se divulgó; se recomienda identificarlo formalmente").
- Ningún dato marcado como Brecha aparece simultáneamente como hecho en el cuerpo.

#### FR-12: Verificar las citas antes de mostrar el borrador

El sistema corre un segundo pase de **Verificación de citas** que confirma que cada Cita respalda lo afirmado, antes de presentar el Reporte al Asesor. Realiza UJ-3.

**Consecuencias (testables):**
- Una afirmación cuya Cita no la respalda se degrada (se mueve a Brecha o se elimina), **no** se muestra como hecho citado.
- El resultado de la verificación es auditable (qué afirmaciones pasaron, cuáles se degradaron).

#### FR-13: Editar, aprobar (Gate humano) y exportar el Reporte a PDF

El Asesor puede editar cualquier sección del Reporte, aprobarlo (Gate humano) y exportarlo a PDF con marca SOC | TALENT a R2. Realiza UJ-3.

**Consecuencias (testables):**
- Mientras no esté Aprobado, el Reporte permanece en **Borrador**; al Aprobar, queda **Aprobado** y versionado.
- El PDF exportado lleva identidad SOC | TALENT, paginación, pie "Documento Confidencial — Uso Exclusivo del Cliente" y el **disclaimer de no oferta vinculante** (NFR-9), visualmente equivalente a los reportes Las Aliadas/Probemedic.
- Intentar exportar un Reporte **no Aprobado** para el cliente se bloquea o se marca explícitamente como borrador (Gate humano, NFR-4).

**NFR específicos:** generación de un Reporte ≤ 15 min (NFR-6, a calibrar); costo por Reporte muy por debajo del valor de un deal (NFR-5).

**Notas:** `[NOTA PARA PM] Plantilla: ¿formato Las Aliadas (comercial/narrativo) y formato Probemedic (financiero/riesgo) son dos plantillas seleccionables, o una sola adaptable al perfil? Default v1: una plantilla canónica única que incluye todas las secciones; ver §8 Q-4.`

---

### 4.4 El equipo: Prospector, Asesor de producto, Negociador, Tramitador, Gestor

**Descripción:** Los cinco Empleados restantes completan el flujo del asesor (prospectar → matchear → acercarse → tramitar → cerrar). Comparten el contrato común de Empleado, viven dentro de Expedientes, producen Entregables sujetos al Gate humano cuando salen al cliente, y operan bajo las mismas reglas de calidad (citas/fidelidad de catálogo cuando manejan datos financieros). En v1 su profundidad es menor que la del Investigador, pero su comportamiento, sus entradas/salidas y sus Entregables quedan especificados. Realiza UJ-4.

**Requisitos Funcionales:**

#### FR-14: Prospector — calificar/enriquecer prospectos

El Prospector puede tomar un prospecto que el Asesor trae y producir una **calificación/enriquecimiento** (giro, tamaño aproximado, señales de bancabilidad, encaje con el perfil objetivo) como Entregable del Expediente. Realiza UJ-4.

**Consecuencias (testables):**
- Produce un Entregable de calificación con campos legibles y, cuando hay cifras, con Citas (NFR-1/NFR-3).
- En v1 **no** caza prospectos a escala ni hace outbound automático (Non-Goal §5); opera sobre el prospecto que el Asesor aporta.

#### FR-15: Asesor de producto — matchear Producto/Institución del Catálogo SOC

El Asesor de producto puede tomar las necesidades detectadas en un Expediente y proponer el match Producto + Institución del Catálogo SOC, alimentando las Recomendaciones (junto con FR-10). Realiza UJ-4.

**Consecuencias (testables):**
- Solo propone Productos/Instituciones del Catálogo SOC (Fidelidad de catálogo, NFR-2).
- Cada propuesta incluye el "para qué sirve" y "cuándo recomendarlo" tomados del Catálogo, no inventados.

#### FR-16: Negociador — pitch, guion y manejo de objeciones

El Negociador puede producir, para un Expediente, un Entregable con pitch, guion de acercamiento y respuestas a objeciones, basado en el Reporte/Recomendaciones del Expediente. Realiza UJ-4.

**Consecuencias (testables):**
- El guion referencia las Recomendaciones del Expediente (no genérico); si el Reporte aún no está Aprobado, la Tarea queda como dependencia pendiente (FR-2).
- El Entregable está sujeto al Gate humano si se va a usar frente al cliente.

#### FR-17: Tramitador — lista de requisitos y cotización estimada

El Tramitador puede armar, para un Expediente, la lista de documentos/requisitos del trámite y una cotización estimada del Producto recomendado, como Entregable. Realiza UJ-4.

**Consecuencias (testables):**
- La lista de requisitos corresponde al Producto/Institución del Catálogo SOC recomendado.
- Toda cifra de la cotización es estimada y marcada como tal; no se presenta como oferta vinculante (NFR-9). `[SUPUESTO: las condiciones de cotización salen del Catálogo SOC ("condiciones típicas"), no de un sistema de la institución; integración real fuera de v1.]`

#### FR-18: Gestor — seguimiento, cierre y postventa

El Gestor puede proponer, para un Expediente, los siguientes pasos de seguimiento, recordatorios de cierre y acciones de postventa, como Entregable. Realiza UJ-4.

**Consecuencias (testables):**
- Propone acciones concretas ligadas a la Etapa actual del Expediente.
- Cuando sugiere avanzar a **Ganado/Perdido**, lo deja como propuesta para el Asesor (no cambia la Etapa por sí mismo).

**Notas:** `[NOTA PARA PM] La profundidad relativa de estos cinco Empleados en v1 vs. el Investigador es deliberadamente menor; la épica E5 los entrega "completos en comportamiento, ligeros en sofisticación". Revisar con Carlos si alguno (probablemente el Negociador) merece subir de profundidad para el piloto.`

---

### 4.5 El Catálogo SOC (la base de conocimiento — el foso)

**Descripción:** Base estructurada **Institución → Producto → para qué sirve → condiciones típicas → cuándo recomendarlo**. Es el insumo de la capa de síntesis y el foso del producto: ninguna herramienta genérica lo tiene. En v1 se curan a mano las instituciones/productos que aparecen en los reportes reales (subconjunto), con una estructura que permite crecer a las 55. Es consultable por los Empleados (Investigador, Asesor de producto, Tramitador) y mantenible por Carlos.

**Requisitos Funcionales:**

#### FR-19: Mantener un Catálogo SOC estructurado y curado

El sistema mantiene un Catálogo SOC consultable con la estructura Institución → Producto → uso → condiciones típicas → cuándo recomendar; el subconjunto v1 incluye al menos las instituciones/productos de los reportes reales. Realiza UJ-3, UJ-4.

**Consecuencias (testables):**
- El Catálogo v1 incluye, como mínimo, las Instituciones de los reportes (p. ej. Banorte, Konfío, Covalto, Afirme, Hey Banco, Xepelin, ION Financiera, Finbe ABC, Finsus Anticipa, Mifel) y Productos (Crédito Revolvente, Arrendamiento Puro, Anticipo de Ventas, Crédito Simple, Factoraje, Standby LC, Seguro PYME+Vida+GMM). `[SUPUESTO: lista exacta del subconjunto v1 la confirma Carlos; ver §8 Q-3.]`
- La capa de síntesis solo puede recomendar entradas existentes en el Catálogo (Fidelidad de catálogo, NFR-2).
- El Catálogo es editable/curable sin redeploy de la app. `[SUPUESTO: vía datos en Postgres (seed + edición), no hardcode.]`

**Notas:** `[NOTA PARA PM] Quién mantiene el Catálogo y con qué herramienta (seed inicial vs. edición continua) es decisión de Carlos; en v1 basta seed curado + edición vía datos. La curaduría completa de las 55 instituciones es Non-Goal §5.`

---

### 4.6 Identidad, acceso y persistencia (cimientos)

**Descripción:** Sócrates es multi-asesor desde v1 a escala de piloto: cada Asesor entra con su cuenta (Clerk) y solo ve sus Expedientes. Los Entregables con archivo (PDFs) se guardan en R2. Los datos viven en Postgres (Railway) vía Prisma. El producto debe **arrancar y demostrar valor sin claves externas** mediante seed y fallback.

**Requisitos Funcionales:**

#### FR-20: Autenticación y aislamiento por Asesor (Clerk)

El Asesor se autentica vía Clerk y solo accede a sus propios Expedientes, Tareas y Entregables. Realiza UJ-1, UJ-2.

**Consecuencias (testables):**
- Un Asesor autenticado **no** puede leer ni operar Expedientes de otro Asesor (aislamiento, NFR-8).
- Las rutas/operaciones de datos requieren sesión válida; sin sesión, no hay acceso a datos de Expediente.

#### FR-21: Persistir Entregables y archivos (R2 + Postgres)

El sistema persiste los Entregables y, cuando tienen archivo (PDF del Reporte), los guarda en R2 con referencia desde el Expediente. Realiza UJ-3.

**Consecuencias (testables):**
- Un PDF exportado queda almacenado en R2 y recuperable desde el Expediente que lo originó.
- Un fallo de generación **no** pierde el trabajo capturado del Expediente (Confiabilidad, NFR-10).

#### FR-22: Operar en Modo sin claves (seed + fallback)

El sistema arranca y muestra valor sin claves de IA/proveedor: expedientes sembrados (Las Aliadas, Probemedic), Reporte de Probemedic sembrado fiel, y Empleados con fallback que no truena. Realiza UJ-5.

**Consecuencias (testables):**
- Sin claves configuradas, La Oficina muestra los Expedientes sembrados y el Reporte de Probemedic se abre completo.
- Cuando un Empleado se invoca sin claves, devuelve un resultado sembrado o un mensaje honesto de "sin servicio de IA" — **nunca** un error que rompa la app.
- Con claves presentes, el mismo flujo genera contenido en vivo (IA real con fallback).

---

## 5. Non-Goals (explícitos)

*Lo que Sócrates **no** es y **no** hará en v1. Esta lista hace trabajo pesado para downstream: previene el "ya que estoy, agrego esto cerca" en cada nivel (épica, historia, código).*

- **No es un chat ni un dashboard.** Es una oficina con empleados. Nada en la superficie debe parecer un chatbot genérico ni un tablero de BI.
- **No expone lenguaje de IA.** "Modelo", "prompt", "agente", "token", "LLM" no aparecen jamás en el producto de cara al Asesor.
- **No hay generación 100% autónoma sin humano.** El Gate humano es el control de calidad; quitarlo introduce el veneno.
- **No hay facturación / cobros / suscripción dentro del producto** en v1 (el valor se mide en deals y calidad, no en MRR).
- **No hay multi-tenant a gran escala** (los ~2,000 asesores, roles, supervisión de red, login corporativo). v1 sirve al piloto (3–5 asesores).
- **No hay integración con SISEC ni con SOC Universidad**, ni con CRMs, ni con sistemas de las instituciones. El Tramitador estima desde el Catálogo, no consulta a la institución.
- **No prospecta a escala / outbound automático.** El Asesor trae sus prospectos; el Prospector califica.
- **No cura las 55 instituciones completas** en v1 — solo el subconjunto de los reportes reales.
- **No es app móvil nativa** — web de escritorio en v1 (el asesor prepara la cita en su computadora).
- **No soporta idiomas distintos al español de México** ni industrias fuera de PYME mexicana.
- **No usa GitHub remoto ni CI/CD por Actions** — deploy por CLI de Vercel/Railway (restricción de Carlos, addendum).

---

## 6. Alcance del MVP

### 6.1 Dentro (v1)

- **Sócrates** (gerente): interpretar, planificar, delegar, reportar — lenguaje de oficina.
- **Los 6 Empleados**: Investigador a fondo (pipeline completo + citas + síntesis + verificación + gate + PDF) y los otros cinco completos en comportamiento.
- **Expedientes** con Etapa, progreso visible, Tareas por Empleado, Entregables Borrador/Aprobado; vista **La Oficina** (lista + filtros) y detalle.
- **Reporte de Inteligencia** real en formato canónico SOC | TALENT, exportable a PDF.
- **Catálogo SOC** curado (subconjunto de los reportes reales), consultable y editable por datos.
- **Calidad como producto**: verificación de citas + Gate humano + Brechas de información + Fidelidad de catálogo.
- **Cimientos**: Clerk (auth, aislamiento por asesor), R2 (PDFs), Postgres/Prisma en Railway, web Next.js en Vercel, IA vía Vercel AI Gateway con strings "provider/model" (Claude) + AI SDK.
- **Modo sin claves**: seed (Las Aliadas + Probemedic, Reporte de Probemedic sembrado fiel) + fallback.

### 6.2 Fuera del MVP (con razón)

- Facturación / suscripción / billing — el modelo es comisión de instituciones, no SaaS al asesor todavía.
- Multi-tenant a gran escala, roles, supervisión corporativa, login de SOC Corporativo — llega con tracción.
- Integración SISEC / SOC Universidad / CRM / sistemas de instituciones — no necesario para probar la hipótesis. `[NOTA PARA PM] el Tramitador con cotización real desde la institución es lo primero que pedirá el piloto; revisar para v2.`
- Catálogo completo de 55 instituciones perfectamente curado — solución 90/10; se amplía incremental.
- Prospección automática / outbound a escala — el Prospector califica, no caza.
- App móvil nativa — web basta en v1.
- Generación autónoma sin Gate humano — llega solo cuando la precisión a escala esté probada.
- Auto-mejora del Catálogo por feedback de campo (flywheel) — deseable, fuera de v1.

---

## 7. Métricas de éxito

*Cada SM referencia el/los FR que valida. Las contra-métricas vigilan el único veneno: el dato mal citado a escala.*

**Primarias**
- **SM-1 — Paridad de calidad:** % de Reportes generados que Carlos consideraría "entregables al cliente con < 15 min de retoque". Objetivo: **≥ 80%** sobre un lote N≥10 de prospectos reales. Valida FR-8, FR-10, FR-13. `[SUPUESTO: umbral 80% propuesto; calibrar con Carlos.]`
- **SM-2 — Deal cerrado atribuible (estrella polar de negocio):** créditos colocados con un Reporte 100% generado por Sócrates. Objetivo: **≥ 1 deal** en el primer trimestre del piloto. Valida FR-8…FR-13. `[SUPUESTO: umbral a confirmar.]`

**Secundarias**
- **SM-3 — Adopción del equipo completo:** # de Expedientes que avanzan ≥1 Etapa con intervención de al menos 2 Empleados distintos por semana. Valida FR-2, FR-7, FR-14…FR-18.
- **SM-4 — Horas ahorradas por Expediente:** tiempo de "ingreso → borrador listo" vs. la línea base manual (~2–3 h). Objetivo: **≤ 15 min** por Reporte. Valida FR-8, NFR-6. `[SUPUESTO: umbral de tiempo a calibrar.]`
- **SM-5 — Reportes llevados a cita / asesores activos por semana:** señal de uso real en el piloto. Valida FR-5, FR-8.

**Contra-métricas (no optimizar)**
- **SM-C1 — Incidentes de dato mal citado / producto inventado que lleguen al cliente:** objetivo **0**. El Gate humano y la Verificación de citas deben atraparlo al 100%. Contrapesa SM-2/SM-4 (no acelerar a costa de precisión). Vigila FR-9, FR-10, FR-12, NFR-1, NFR-2.
- **SM-C2 — "Velocidad falsa":** % de Reportes aprobados que luego Carlos tuvo que rehacer por fondo (no por estilo). Mantener bajo; contrapesa SM-4 (rápido pero malo no cuenta).

---

## 8. Preguntas abiertas

1. **Motor de investigación del Investigador:** ¿qué fuentes/herramientas de búsqueda pública usa (web search vía AI Gateway, scraping, APIs de research)? Define costo, latencia y calidad de fuentes. — dueño: Arquitectura/Carlos · antes del PoC del pipeline.
2. **Mapa Etapa ↔ Entregable prerrequisito:** ¿qué Entregable aprobado habilita cada avance de Etapa (FR-7)? — dueño: Carlos + PM · durante construcción.
3. **Subconjunto exacto del Catálogo SOC v1** (instituciones + productos + condiciones típicas) y quién lo mantiene. — dueño: Carlos · antes de construir la capa de síntesis.
4. **Plantilla(s) de Reporte:** una canónica adaptable vs. dos seleccionables (Las Aliadas vs. Probemedic). — dueño: PM/Carlos · durante construcción.
5. **Techo de costo por Reporte** y margen objetivo (NFR-5). — dueño: Arquitectura · durante el PoC.
6. **Profundidad relativa de los 5 Empleados** en v1 (¿sube el Negociador?). — dueño: Carlos.
7. **Validación legal** (LFPDPPP por RFC/datos fiscales; límites de "no oferta vinculante"). — dueño: Carlos + experto legal · antes de manejar datos de prospectos a escala / abrir a más asesores. *(No bloquea el piloto cerrado con datos de Carlos.)*
8. **Mecanismo de actualización de La Oficina** (polling vs. eventos) para reflejar progreso de Tareas (FR-5). — dueño: Arquitectura.

---

## 9. Panorama de Épicas

*Lista para que Arquitectura y el flujo de Épicas e Historias deriven el plan de construcción. Orden propuesto = orden de dependencia y de riesgo (lo más incierto/cimiento primero). El detalle de historias se produce en `bmad-create-epics-and-stories`.*

- **E1 — Cimientos de plataforma.** Monorepo pnpm+Turborepo (`apps/web`, `apps/api`, `packages/shared`, `packages/db`), Next.js en Vercel, Hono+Postgres en Railway, Prisma, Clerk (auth + aislamiento por asesor), R2 (storage), Vercel AI Gateway + AI SDK, y el seed/fallback Modo sin claves. (FR-20, FR-21, FR-22)
- **E2 — El Expediente y La Oficina.** Modelo Asesor→Expediente→Tarea+Entregable; creación de Expedientes, lista La Oficina con progreso y filtros, detalle, Etapas y derivación de progreso. La columna vertebral. (FR-4…FR-7)
- **E3 — Sócrates, el gerente.** Interpretación de intención en lenguaje de oficina, planificación, delegación de Tareas con dependencias, y reporte de avance. El interlocutor. (FR-1…FR-3)
- **E4 — El Investigador y el Reporte (motor de síntesis + calidad).** Pipeline investigación→FODA→síntesis contra Catálogo→Recomendaciones, citas verificables, verificación de citas, Brechas, ensamblado canónico, Gate humano, export a PDF. El foso y el riesgo técnico real; PoC primero. (FR-8…FR-13)
- **E5 — El resto del equipo.** Prospector, Asesor de producto, Negociador, Tramitador, Gestor: contrato común de Empleado, Entregables, dependencias entre Empleados, Gate humano cuando salen al cliente. (FR-14…FR-18)
- **E6 — El Catálogo SOC.** Estructura curada Institución→Producto→uso→condiciones→cuándo; seed del subconjunto v1; consulta por los Empleados; edición por datos. El insumo del foso. (FR-19)
- **E7 — Calidad como producto (transversal).** Endurecer Verificación de citas, Fidelidad de catálogo, Gate humano y Trazabilidad como red de seguridad medible; instrumentar SM-C1/SM-C2. Cruza E4 y E5. (NFR-1…NFR-4, NFR-9)

---

## 10. Requisitos No Funcionales (transversales)

*En este producto, los NFR de calidad/precisión NO son secundarios: el Consejo de SIM los declaró "el producto". Por eso encabezan.*

- **NFR-1 — Precisión / veracidad (primer orden):** 100% de afirmaciones cuantitativas con Cita verificable; **0** cifras inventadas presentadas como hecho. Lo no verificable va a Brechas, no al cuerpo. Mide SM-C1.
- **NFR-2 — Fidelidad de catálogo (primer orden):** el sistema **solo** recomienda Productos/Instituciones existentes en el Catálogo SOC; jamás alucina una institución o un producto.
- **NFR-3 — Trazabilidad:** toda Cita rastreable a su fuente (URL/documento) para que el Asesor la defienda ante el cliente.
- **NFR-4 — Gate humano obligatorio:** ningún Entregable llega al cliente sin aprobación humana en v1; el Gate no se puede saltar.
- **NFR-5 — Costo por Reporte:** el costo de cómputo/IA por Reporte debe quedar muy por debajo del valor de un deal. Fijar techo de referencia durante el PoC. `[SUPUESTO: techo numérico 🔴 pendiente — estimar llamadas de investigación + síntesis + verificación + render.]`
- **NFR-6 — Latencia:** generación de un Reporte ≤ 15 min; La Oficina y la edición responden fluidas. `[SUPUESTO: umbral a calibrar.]`
- **NFR-7 — Capacidad de respuesta de Sócrates:** primer acuse del gerente al Asesor ≤ 3 s; el plan propuesto se muestra antes de ejecutar. `[SUPUESTO: umbral propuesto por PM.]`
- **NFR-8 — Seguridad y aislamiento multi-asesor (Clerk):** cada Asesor solo accede a sus datos; las operaciones requieren sesión válida; sin filtración entre asesores en el piloto.
- **NFR-9 — Disclaimer / no oferta vinculante:** cada Reporte y cotización estampa el aviso de "información analítica, no constituye oferta vinculante de ninguna institución".
- **NFR-10 — Confiabilidad:** disponible cuando el asesor prepara una cita; un fallo de generación no pierde el trabajo capturado del Expediente.
- **NFR-11 — Resiliencia sin claves (fallback):** sin claves de IA/proveedor, la app no truena: opera en Modo sin claves con seed y fallback honesto (sostiene la demo y el desarrollo).
- **NFR-12 — Idioma:** español de México con ortografía perfecta (acentos, ñ) en toda la superficie y en los Entregables.
- **NFR-13 — Privacidad / datos:** manejo de RFC y datos fiscales con seriedad; preparar el terreno para LFPDPPP antes de escalar a más asesores (ver §8 Q-7). `[SUPUESTO: en el piloto cerrado con datos de Carlos el riesgo es acotado; la política formal se valida antes de abrir.]`
- **NFR-14 — Lenguaje de oficina (anti-IA):** ningún término de IA en la superficie del producto; la metáfora de oficina es inviolable (decisión de Carlos).

---

## 11. Restricciones y guardarraíles

- **Stack fijado (no negociable en v1, detalle en addendum):** Vercel (Next.js App Router, TS, Tailwind) · Railway (Hono + Postgres) · Cloudflare R2 · Clerk · IA vía Vercel AI Gateway con strings "provider/model" (Claude por defecto) + AI SDK · monorepo pnpm+Turborepo · Prisma · TypeScript end-to-end · git local sin GitHub remoto (deploy por CLI).
- **Calidad antes que velocidad de salida al cliente:** ante duda entre rapidez y precisión, gana precisión (SM-C1/SM-C2 lo vigilan).
- **Seed obligatorio:** Las Aliadas y Probemedic siempre disponibles; el Reporte de Probemedic sembrado fiel es el patrón de calidad de referencia visual.
- **Privacidad/legal marcada, no inventada aquí:** LFPDPPP y límites de asesoría regulada se derivan a experto (§8 Q-7); el disclaimer (NFR-9) es obligatorio desde el día 1.

---

## 12. Por qué ahora

El costo de IA cayó ~40× en 18 meses (generar un reporte profundo cuesta centavos), la IA vertical triplicó participación en 2025, el crédito PYME en México creció 16.5% en 2025 y el nearshoring + Mundial 2026 disparan la demanda de crédito — justo cuando el 65% de las PYMEs sigue no bancarizada y el asesor opera a mano. La ventana es ahora: el primero en anclar el flujo de trabajo del asesor SOC gana el hábito. Y corre el reloj del *commodity*: mientras el Reporte siga siendo artesanal, cualquiera con dos horas y un LLM lo imita; productizarlo con calidad blindada antes de que se vuelva commodity ES la carrera (síntesis del Consejo SIM v0.2: "los dos relojes").

---

## 13. Índice de supuestos

*Cada `[SUPUESTO]` del documento, para confirmación explícita con Carlos:*

- §4.1 (FR-3 notas) — Sócrates orquesta de forma síncrona-asistida en v1; sin autonomía total en segundo plano.
- §4.2 (FR-5) — actualización de La Oficina por polling o evento (mecanismo lo decide Arquitectura).
- §4.2 (FR-7) — el mapa exacto Etapa↔Entregable prerrequisito se afina con Carlos.
- §4.3 (FR-13 notas) — plantilla canónica única en v1 (vs. dos seleccionables).
- §4.4 (FR-17) — condiciones de cotización salen del Catálogo SOC, no de la institución.
- §4.5 (FR-19) — lista exacta del subconjunto del Catálogo v1 la confirma Carlos; Catálogo editable por datos sin redeploy.
- §7 (SM-1, SM-2, SM-4) — umbrales 80% paridad / ≥1 deal / ≤15 min a calibrar con Carlos.
- §10 (NFR-5) — techo numérico de costo por Reporte pendiente de estimar en el PoC.
- §10 (NFR-6, NFR-7) — umbrales de latencia (15 min reporte / 3 s acuse) a calibrar.
- §10 (NFR-13) — riesgo de privacidad acotado en el piloto cerrado; política LFPDPPP formal antes de abrir.

---

*PRD producido por John (PM, BMAD) · método BMAD (Essential Spine + Adapt-In Menu) · ancla en el data-room de SIM v0.2 (Score 8.0 · Viabilidad 6.5) y en el PRD del MVP "El Investigador". Siguiente en la cadena: `bmad-ux` → `bmad-create-architecture` → `bmad-create-epics-and-stories`.*
