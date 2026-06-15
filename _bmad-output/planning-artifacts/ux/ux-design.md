---
title: "Especificación de UX: Sócrates — La Oficina"
status: draft
created: 2026-06-14
updated: 2026-06-14
ux: Sally (BMAD)
fuentes:
  - _bmad-output/planning-artifacts/prd/prd.md
  - _bmad-output/planning-artifacts/briefs/brief-SOC-2026-06-14/brief.md
  - _bmad-output/planning-artifacts/briefs/brief-SOC-2026-06-14/addendum.md
  - docs/sim-handoff/07-prd-mvp.md
  - docs/sim-handoff/DECISIONES.md
idioma: es-MX
plataforma: web escritorio (Next.js / Vercel)
---

# Especificación de UX: Sócrates — La Oficina

> **Regla de lenguaje:** esta especificación usa el mismo glosario del PRD, verbatim. "Empleado", "Expediente", "Entregable", "Etapa", "Encargo", "Gate humano". Jamás "agente", "modelo", "prompt", "IA", "chatbot". La metáfora de oficina es inviolable.

---

## 1. Principios de UX

Los seis principios que gobiernan cada decisión de diseño en Sócrates. Ante un conflicto entre principios, el orden aquí es el orden de prioridad.

### P-1 — Empleados, no IA (el principio raíz)

El asesor no "usa IA". El asesor **tiene un equipo**. Todo el lenguaje de interfaz es de oficina: los empleados "trabajan", "entregan", "están ocupados", "esperan tu visto bueno". Ninguna pantalla, etiqueta, mensaje de error o tooltip expone términos de tecnología. Este principio es anterior a cualquier conveniencia técnica: si la solución más fácil rompe la metáfora, se descarta.

*Consecuencia directa:* el estado de un empleado es "Trabajando" o "Libre", nunca "Procesando" ni "Generando". Un fallo es "No pudo completar el encargo — [motivo legible]", nunca un error de API.

### P-2 — El expediente como centro de gravedad

El asesor vive en sus expedientes. La vista raíz no es un dashboard de métricas ni un inbox de mensajes: es la lista de carpetas de sus prospectos y clientes. Toda acción relevante lleva a un expediente o parte de uno. Sócrates es el camino más rápido para llegar ahí; los expedientes son donde el trabajo ocurre.

### P-3 — Progreso honesto, nunca progreso falso

Si un empleado falla o queda bloqueado, el expediente lo muestra como **bloqueo visible con motivo**, no como porcentaje de avance ficticio. Un 60% que mienta es peor que un 40% honesto. El asesor necesita confiar en el progreso que ve para tomar decisiones reales (a qué prospecto ir mañana).

### P-4 — El gate humano es una característica, no una fricción

La revisión y aprobación del asesor antes de que un entregable salga al cliente no es un paso burocrático: es la firma del asesor en su trabajo. La UX lo presenta así. El botón de aprobación es prominente y satisfactorio; el estado "Borrador esperando tu revisión" es una invitación, no un obstáculo.

### P-5 — Calidad visible, no calidad implícita

Las citas, las fuentes verificables, las brechas de información marcadas y el sello SOC | TALENT en el PDF no son detalles de backend: son elementos de interfaz que el asesor ve y puede tocar. La calidad debe *verse* para que el asesor la defienda frente a su cliente.

### P-6 — Estética premium sin ostentación

La sensación es la de una herramienta profesional de alto valor: limpia, flat, con espacio suficiente para respirar. Sin gradientes de consumo ni iconografía de startup. El color y la tipografía refuerzan credibilidad, no playfulness. El asesor usa esto en una reunión con el dueño de una empresa; la interfaz no puede lucir amateur.

---

## 2. Base: forma, sistema de UI y plataforma

- **Plataforma:** web escritorio (viewport mínimo 1280 px); el asesor prepara sus citas en computadora.
- **Sistema de UI base:** shadcn/ui sobre Tailwind CSS — componentes accesibles y minimalistas que se extienden sin contradicción.
- **Tipografía:** familia sans-serif de alta legibilidad en pantalla (Inter o equivalente del sistema de diseño); jerarquía de tres niveles: título de sección, etiqueta de metadato, cuerpo de entregable.
- **Color:** paleta neutral dominante (blancos, grises fríos) con un acento corporativo (azul oscuro o verde oscuro, por definir con Carlos en sesión de marca). El acento se reserva para acciones primarias y estados de atención.
- **Iconografía:** set mínimo y consistente; cada empleado tiene un ícono de rol (no un avatar de robot), al estilo de un organigrama de empresa.
- **Modo claro:** único en v1. [SUPUESTO: modo oscuro fuera de v1.]
- **Idioma y localización:** español de México con ortografía perfecta (acentos, ñ) en el 100% de la superficie.

---

## 3. Arquitectura de información (mapa de pantallas)

```
Sócrates — La Oficina
│
├── [P-0] Autenticación (Clerk)
│     └── Login / Registro (Clerk-hosted UI con marca SOC)
│
├── [P-1] La Oficina — vista raíz (dashboard de expedientes)
│     ├── Barra de comando de Sócrates (siempre visible)
│     ├── Panel "Tu equipo" (tarjetas de empleados, colapsable)
│     └── Lista de Expedientes (tarjetas con progreso)
│           └── → [P-2] Detalle de Expediente
│
├── [P-2] Detalle de Expediente
│     ├── Cabecera del expediente (nombre, etapa, progreso)
│     ├── Pestaña "Equipo en este expediente" (tareas por empleado)
│     ├── Pestaña "Entregables" (bandeja de entregables)
│     │     └── → [P-3] Visor/Editor de Entregable
│     └── Panel lateral de Sócrates (contexto del expediente)
│
├── [P-3] Visor y Editor de Entregable
│     ├── (Subtipo A) Reporte de Inteligencia
│     │     ├── Cuerpo del reporte con citas inline
│     │     ├── Panel de citas y fuentes
│     │     ├── Sección de Brechas de información
│     │     ├── Barra de acciones: Editar · Aprobar · Exportar PDF
│     │     └── Indicador de estado: Borrador / Aprobado
│     └── (Subtipo B) Otros entregables (guion, lista de requisitos, etc.)
│           ├── Cuerpo del entregable
│           └── Barra de acciones: Aprobar · Exportar [SUPUESTO: no todos exportan a PDF]
│
├── [P-4] Vista de Empleado (perfil de rol)
│     ├── Identidad del empleado (nombre, rol, ícono)
│     ├── Descripción de qué hace en lenguaje de oficina
│     ├── Historial de encargos completados (con links a expedientes)
│     └── Estado actual: Libre / Trabajando en [Expediente X]
│
└── [P-5] Generación del Reporte de Inteligencia (modal/flujo guiado)
      ├── Paso 1: Datos del prospecto (empresa, ciudad, industria + opcionales)
      ├── Paso 2: Progreso de generación (por sección, en lenguaje de oficina)
      └── Paso 3: Borrador listo → ir a [P-3]
```

**Total de pantallas de primer nivel:** 6 (Autenticación, La Oficina, Detalle de Expediente, Visor/Editor de Entregable, Vista de Empleado, Generación de Reporte).

---

## 4. Voz y tono (microcopia)

La voz de Sócrates es la de un gerente capaz que rinde cuentas: informado, directo, sin tecnicismos, con afecto profesional. Habla como hablaría el mejor jefe que el asesor ha tenido.

| Situación | Lo que dice Sócrates | Lo que NO dice |
|---|---|---|
| Plan listo para confirmar | "Listo. Le pedí al Investigador el reporte de Probemedic, al Asesor de producto que identifique el mejor crédito, y al Negociador el guion. ¿Arranco?" | "He procesado tu solicitud y generaré los outputs..." |
| Tarea en curso | "El Investigador está trabajando en el reporte de Probemedic." | "Generando respuesta con modelo claude-3..." |
| Entregable listo | "El Investigador entregó el reporte. Está esperando tu revisión antes de salir." | "Task completed. Status: DONE." |
| Bloqueo por dependencia | "El Negociador necesita el reporte del Investigador aprobado antes de arrancar." | "Dependency error: prerequisite task incomplete." |
| Sin datos suficientes | "¿Para qué prospecto preparamos esto? Necesito el nombre para abrir el expediente." | "Input required: prospect_name is null." |
| Fallback sin claves | "Ahora mismo no tengo conexión para hacer investigación en vivo. Te muestro el expediente Probemedic como referencia." | "API error 503: service unavailable." |

**Regla de microcopia:** si una cadena de texto menciona una palabra técnica, está mal. Toda comunicación es en primera persona de Sócrates o en tercera persona de los empleados, nunca del sistema.

---

## 5. Componentes clave

### C-1: Tarjeta de Empleado

Aparece en el panel "Tu equipo" de La Oficina y en el detalle de expediente.

```
┌─────────────────────────────────────────┐
│  [ícono de rol]   INVESTIGADOR          │
│                   ● Trabajando          │  ← badge de estado
│                   Expediente: Probemedic │
│                                         │
│  [ Ver perfil ]                         │
└─────────────────────────────────────────┘
```

**Estados del empleado:**
- **Libre** — badge gris neutro. Sin sub-texto de expediente.
- **Trabajando** — badge azul (acento). Sub-texto: "Expediente: [nombre]".
- **Entregó** — badge verde. Sub-texto: "Entregó a [Expediente]. [Ver entregable →]".

[SUPUESTO: un empleado solo trabaja en un expediente a la vez en v1; la cola de tareas es FIFO.]

**Click en tarjeta:** abre [P-4] Vista de Empleado.

### C-2: Tarjeta de Expediente

Aparece en la lista de La Oficina. Es la unidad de navegación primaria del asesor.

```
┌─────────────────────────────────────────────────┐
│  PROBEMEDIC                    En investigación  │  ← etapa actual
│  Distribución farmacéutica · Monterrey           │
│                                                  │
│  ████████████░░░░░░░░  45%                       │  ← barra de progreso
│                                                  │
│  [Investigador] [Asesor de producto]             │  ← empleados activos (chips)
│                                                  │
│  ⚠ 1 entregable esperando tu revisión            │  ← indicador de gate pendiente
└─────────────────────────────────────────────────┘
```

**Variantes por estado:**
- Sin indicador de gate: expediente avanzando sin bloqueos.
- Con ⚠ amarillo: hay uno o más entregables en borrador esperando aprobación.
- Con 🔴 rojo: hay una tarea bloqueada (con motivo al expandir).
- Con marca "Ganado" / "Perdido": expediente cerrado, tono gris.

**Click en tarjeta:** abre [P-2] Detalle de Expediente.

**Ordenamiento por defecto:** expedientes con gate pendiente primero, luego por última actividad. [SUPUESTO: el asesor puede cambiar el orden.]

### C-3: Barra de Comando de Sócrates

Componente persistente en la parte inferior de La Oficina y en el detalle de Expediente. No es un chat: es la línea directa al gerente.

```
┌─────────────────────────────────────────────────────────────┐
│ 🐢  ¿Qué necesitas? Escríbeme en lenguaje natural...        │
│                                                     [Enviar] │
└─────────────────────────────────────────────────────────────┘
```

**Comportamiento:**
- Campo de texto de una línea (expandible a multilinea si el mensaje crece).
- Placeholder en voz de Sócrates: "¿Qué necesitas?" en La Oficina; "¿Qué hacemos con este expediente?" en el detalle de uno.
- Al enviar: el campo se limpia; aparece un panel de respuesta de Sócrates encima del campo con el plan propuesto y botones de confirmación/ajuste.
- El plan propuesto siempre se muestra antes de ejecutarse (el asesor puede aprobar, quitar empleados, o cancelar). Esto cumple el principio de orquestación síncrona-asistida del PRD.
- Sócrates nunca ejecuta sin confirmar; siempre pide el banderazo.

**Panel de respuesta de Sócrates:**
```
┌─────────────────────────────────────────────────────────────┐
│ 🐢  Entendido. Para Probemedic voy a:                       │
│      • Pedirle al Investigador el reporte de inteligencia   │
│      • Pedirle al Asesor de producto que identifique el     │
│        mejor financiamiento                                 │
│      • Pedirle al Negociador el guion de acercamiento       │
│                                                             │
│      [Sí, arranca]   [Ajustar]   [Cancelar]                 │
└─────────────────────────────────────────────────────────────┘
```

### C-4: Bandeja de Entregables por Expediente

Aparece en la pestaña "Entregables" de [P-2]. Es la lista de lo que el equipo ha producido para ese prospecto.

```
┌──────────────────────────────────────────────────────────────┐
│ ENTREGABLES — Probemedic                                     │
├──────────────────────────────────────────────────────────────┤
│  [Investigador]  Reporte de Inteligencia   ● Borrador        │
│                  Generado el 14 jun 2026   [Revisar →]       │
├──────────────────────────────────────────────────────────────┤
│  [Asesor prod.]  Recomendaciones de producto  ● Borrador     │
│                  Generado el 14 jun 2026      [Revisar →]    │
├──────────────────────────────────────────────────────────────┤
│  [Negociador]    Guion de acercamiento     ◌ Pendiente       │
│                  Esperando: Reporte aprobado                 │
└──────────────────────────────────────────────────────────────┘
```

**Estados de entregable:**
- **Borrador** — badge amarillo. CTA: "Revisar →" (lleva a [P-3]).
- **Aprobado** — badge verde. CTA: "Ver" / "Exportar PDF" (si aplica).
- **Pendiente** — badge gris. Sub-texto: "Esperando: [dependencia]". Sin CTA.
- **Bloqueado** — badge rojo. Sub-texto: "El Investigador no pudo completar: [motivo]". CTA: "Reintentar" o "Escalar a Sócrates".

### C-5: Cuerpo del Reporte de Inteligencia (Visor)

El componente más complejo del producto. Aparece en [P-3] subtipo A.

**Estructura de cita inline:**
Toda afirmación cuantitativa en el cuerpo lleva una marca de cita discreta (número superíndice o subrayado punteado). Al hacer click o hover, aparece un tooltip con la fuente: URL + título + fecha de acceso. El panel lateral de "Fuentes" lista todas las citas con su enlace abierto.

```
El mercado de distribución farmacéutica en México alcanzó
$284 mil millones MXN en 2025 [¹], con una tasa de
crecimiento del 8.3% anual [²]...

[Panel lateral de Fuentes]
¹ COFEPRIS — Informe de Mercado Farmacéutico 2025
  cofepris.gob.mx/... · accedido jun 2026
² CANACINTRA — Anuario de Industria Química 2025
  canacintra.org.mx/... · accedido jun 2026
```

**Sección de Brechas de información:**
Aparece al final del reporte, con fondo diferenciado (amarillo claro o borde izquierdo de acento). Cada brecha lista qué dato falta y, cuando aplica, cómo conseguirlo.

```
┌─ BRECHAS DE INFORMACIÓN ─────────────────────────────────┐
│ ⚠ Nombre del laboratorio ancla (distribuidor principal)  │
│   No divulgado públicamente. Se recomienda preguntar     │
│   directamente al director general en la cita.          │
│                                                          │
│ ⚠ Volumen de cuentas por cobrar con aseguradoras         │
│   Dato no disponible en fuentes públicas. Solicitarlo   │
│   durante la presentación.                              │
└──────────────────────────────────────────────────────────┘
```

**Barra de acciones del Reporte:**
```
[Editar sección]   [Verificar fuente]   [Aprobar reporte ✓]   [Exportar PDF]
```
- "Aprobar reporte ✓" es el gate humano: cambia el estado de Borrador a Aprobado. Acción con confirmación de un paso ("¿Confirmas que este reporte está listo para el cliente?").
- "Exportar PDF" solo está habilitado cuando el estado es Aprobado.

### C-6: Barra de Progreso del Expediente

Barra horizontal que aparece en la tarjeta de expediente (C-2) y en la cabecera de [P-2].

**Composición visual:**
- Segmento completado: relleno sólido (color acento).
- Segmento en progreso: relleno punteado o animación sutil.
- Segmento bloqueado: relleno rojo.
- Etiqueta de etapa actual al extremo derecho.

**Derivación del porcentaje:** determinista a partir de la Etapa y las Tareas completadas (definida en la lógica del PRD FR-6). No es una estimación: es un cálculo reproducible que el asesor puede entender.

**Etapas visibles como hitos en la barra:**
`Prospecto → Investigado → Recomendado → En acercamiento → En trámite → En cierre`

---

## 6. Estados del sistema

### 6.1 Estados de Empleado

| Estado | Label en UI | Badge | Comportamiento |
|---|---|---|---|
| Libre | "Libre" | Gris neutro | Disponible para recibir encargos. |
| Trabajando | "Trabajando" | Azul (acento) | Muestra expediente activo. No acepta nuevos encargos. |
| Entregó | "Entregó" | Verde | Link a entregable. Vuelve a Libre tras confirmación. |
| [no aplica en UI] | — | — | El estado "bloqueado" es del entregable/tarea, no del empleado. |

### 6.2 Estados de Tarea

| Estado | Label en UI | Descripción |
|---|---|---|
| Encargada | "Encargada" | Sócrates la asignó; el empleado no ha arrancado. |
| En curso | "En curso" | El empleado está trabajando. |
| Entregada | "Entregada" | El empleado produjo el entregable. |
| Bloqueada | "Bloqueada — [motivo]" | No puede avanzar: falta una dependencia o hubo un error. |

### 6.3 Estados de Entregable

| Estado | Label en UI | Descripción |
|---|---|---|
| Borrador | "Borrador" | Producido por el empleado; esperando revisión del asesor. |
| Aprobado | "Aprobado" | El asesor lo revisó y aprobó (gate humano completado). |
| Pendiente | "Pendiente" | La tarea que lo produce aún no arrancó (por dependencia). |
| Bloqueado | "Bloqueado" | La tarea falló; el entregable no existe. Motivo visible. |

### 6.4 Etapas del Expediente

| Etapa | Descripción breve |
|---|---|
| Prospecto | Creado, sin trabajo del equipo. |
| Investigado | Reporte de Inteligencia entregado (al menos Borrador). |
| Recomendado | Recomendaciones de producto aprobadas. |
| En acercamiento | Guion del Negociador disponible. |
| En trámite | Tramitador generó lista de requisitos y cotización. |
| En cierre | Gestor tiene los pasos de seguimiento. |
| Ganado | Marcado manualmente por el asesor. |
| Perdido | Marcado manualmente por el asesor. |

---

## 7. Flujos principales

### Flujo F-1: El asesor delega en lenguaje natural (UJ-1)

**Protagonista:** Carlos, lunes 8 AM, tiene cita el jueves con Probemedic.

1. Carlos abre Sócrates → aterriza en **La Oficina** (lista de expedientes).
2. Escribe en la barra de Sócrates: "Tengo cita el jueves con Probemedic, una distribuidora farmacéutica de Monterrey. Necesito todo listo."
3. Sócrates responde con el **plan propuesto** (panel encima del campo). Lista: Investigador → reporte; Asesor de producto → recomendaciones; Negociador → guion. Botones: "Sí, arranca" / "Ajustar" / "Cancelar".
4. Carlos hace click en **"Sí, arranca"**.
5. El expediente de Probemedic aparece en La Oficina (o se actualiza si existía). Las tarjetas de Investigador, Asesor de producto y Negociador cambian a estado "Trabajando".
6. La barra de progreso del expediente avanza con cada tarea completada.
7. Cuando el Investigador entrega: badge de "Entregó" + notificación de Sócrates en la barra: "El Investigador entregó el reporte de Probemedic. Está esperando tu revisión."

**Caso límite:** si Carlos escribe "prepárame todo" sin nombrar prospecto, Sócrates responde: "¿Para qué prospecto preparamos esto? Dime el nombre y arrancamos." No crea expediente ni tareas.

---

### Flujo F-2: El asesor vive su semana desde La Oficina (UJ-2)

**Protagonista:** Carlos, lunes AM, revisión semanal.

1. Abre Sócrates → La Oficina. Ve sus expedientes ordenados: primero los que tienen gate pendiente (⚠).
2. Aplica filtro "Esperando mi revisión". La lista se reduce a 2 expedientes.
3. Ve Probemedic primero: barra al 45%, etapa "Investigado", badge ⚠ "1 entregable esperando".
4. Click en la tarjeta → abre **Detalle del Expediente** → pestaña "Entregables" → Reporte de Inteligencia en estado Borrador.
5. Click en "Revisar →" → abre el **Visor del Reporte**.
6. Revisa, ajusta una frase, verifica dos citas. Hace click en **"Aprobar reporte ✓"** → confirmación de un paso → estado cambia a Aprobado.
7. Automáticamente: el Negociador (que estaba Pendiente por dependencia) cambia a "Encargada" / "En curso". La barra de progreso sube.
8. Carlos vuelve a La Oficina: el ⚠ de Probemedic desapareció; el expediente sigue avanzando solo.

---

### Flujo F-3: Generación y aprobación del Reporte de Inteligencia (UJ-3)

**Protagonista:** Carlos, preparando a Probemedic.

1. Desde el detalle del expediente Probemedic → botón "Pedir reporte al Investigador" (o desde la barra de Sócrates).
2. Si el expediente no tiene datos del prospecto: aparece el formulario de captura (empresa, ciudad, industria + opcionales). Si ya tiene datos: confirma y arranca.
3. Abre el **modal de generación** con progreso por sección:
   - "El Investigador está investigando la industria farmacéutica..." ✓
   - "Analizando a Probemedic..." ✓
   - "Construyendo el FODA y perfil de riesgo..." ✓
   - "Identificando los mejores productos SOC para este prospecto..." ✓
   - "Redactando el reporte..." ✓
   - "Verificando fuentes y citas..." ✓
   - "Borrador listo. → Revisar"
4. Click en "Revisar" → **Visor del Reporte** (P-3).
5. El asesor lee sección por sección. Las citas son clickeables. La sección de Brechas está al final.
6. Edita lo que necesita. Aprueba.
7. Click en **"Exportar PDF"** → descarga + guarda en R2 + el expediente registra el PDF como entregable Aprobado con fecha y versión.

**Gate humano:** el botón "Exportar PDF" está deshabilitado (grisado, tooltip "Primero aprueba el reporte") si el estado es Borrador.

---

### Flujo F-4: El asesor dirige al equipo completo (UJ-4)

**Protagonista:** Carlos, deal de Probemedic avanzando.

1. Reporte aprobado → el Negociador ya tiene su encargo (arrancó automáticamente por dependencia).
2. Carlos le escribe a Sócrates en el detalle del expediente: "¿Dónde estamos con el guion del Negociador?"
3. Sócrates responde: "El Negociador está trabajando en el guion. Entrega estimada: dentro de unos minutos."
4. Guion entregado → Carlos lo revisa, aprueba, decide usarlo.
5. Carlos le pide a Sócrates: "Que el Tramitador prepare la lista de requisitos para el crédito revolvente de Banorte."
6. Sócrates confirma el plan → Carlos aprueba → Tramitador arranca.
7. Expediente avanza a etapa "En trámite". Barra de progreso sube.

---

### Flujo F-5: Demo sin claves externas (UJ-5)

**Protagonista:** Carlos mostrando Sócrates a un asesor aliado.

1. Sin claves de IA configuradas → la app arranca en modo seed.
2. La Oficina muestra dos expedientes sembrados: Las Aliadas y Probemedic. Ambos con progreso realista.
3. Click en Probemedic → Detalle → Entregables → Reporte de Inteligencia (sembrado fiel, estado Aprobado).
4. El asesor ve el reporte completo, con citas, brechas, y PDF generado.
5. Si intenta generar un nuevo reporte → Sócrates dice: "Ahora mismo no tengo conexión para investigar en vivo. Te muestro el expediente Probemedic como referencia de lo que puedo hacer."
6. La app no truena. El aliado ve el valor.

---

## 8. Descripción de pantallas

### P-0: Autenticación (Clerk)

**Propósito:** acceso al sistema. Multi-asesor desde v1.

**Componentes:**
- UI de Clerk con personalización de marca: logo SOC | TALENT, colores del sistema.
- Opciones: correo/contraseña (mínimo); opcionalmente Google OAuth. [SUPUESTO: método exacto lo define Carlos con Clerk.]
- Tras autenticación exitosa → redirige a P-1 (La Oficina).

**Sin acceso:** sin sesión válida, cualquier ruta redirige a P-0. No hay contenido visible sin autenticación (aislamiento NFR-8).

---

### P-1: La Oficina (vista raíz)

**Propósito:** vista principal del día a día del asesor. Estado de toda su cartera de un vistazo.

**Layout:** dos columnas.

**Columna izquierda (30%):** panel "Tu equipo"
- Título: "Tu equipo"
- Tarjetas C-1 de los 7 roles: Sócrates (gerente, ícono de tortuga), Prospector, Investigador, Asesor de producto, Negociador, Tramitador, Gestor.
- Colapsable para dar más espacio a los expedientes. [SUPUESTO: estado colapsado/expandido persiste en localStorage.]

**Columna derecha (70%):** lista de expedientes
- Título: "Expedientes"
- Barra de herramientas: filtros (Todos / Esperando mi revisión / Por etapa) + botón "Nuevo expediente".
- Lista de tarjetas C-2, una por expediente.
- Estado vacío (si no hay expedientes): mensaje de Sócrates invitando a crear el primero o a escribirle.

**Barra de Sócrates (C-3):** fija en la parte inferior, ancho completo.

**Accesibilidad:**
- La lista de expedientes es navegable con teclado (Tab entre tarjetas, Enter para abrir).
- Los badges de estado tienen texto alternativo legible por lector de pantalla.
- El filtro "Esperando mi revisión" es el primer resultado de Tab desde el campo de filtro (tarea más urgente primero).

---

### P-2: Detalle de Expediente

**Propósito:** centro de operaciones para un prospecto o cliente específico.

**Cabecera:**
- Nombre del prospecto (tipografía prominente).
- Subtítulo: industria · ciudad.
- Barra de progreso (C-6) con etapa actual.
- Botón "Marcar como Ganado / Perdido".

**Pestañas:**
1. **Equipo** — lista de tareas activas por empleado, con estado (C-1 compacto + estado de tarea).
2. **Entregables** — bandeja C-4 con todos los entregables del expediente.
3. **Datos del prospecto** — formulario de datos capturados (empresa, ciudad, industria, opcionales). Editable.

**Panel lateral derecho (20%):** Sócrates contextualizado.
- Pequeño resumen de qué está pasando en este expediente: "El Investigador entregó. El Negociador está trabajando."
- Campo de Sócrates (C-3 compacto) con placeholder: "¿Qué hacemos con [nombre]?"

**Navegación:** breadcrumb "La Oficina > [Nombre del expediente]".

---

### P-3: Visor y Editor de Entregable

**Propósito:** leer, editar y aprobar el trabajo de un empleado.

#### Subtipo A: Reporte de Inteligencia

**Layout:** dos columnas.

**Columna principal (75%):** cuerpo del reporte.
- Secciones navegables con índice lateral (tabla de contenidos sticky).
- Citas inline en afirmaciones cuantitativas (número superíndice + tooltip).
- Sección de Brechas de información destacada al final.
- Modo de edición: inline (click en párrafo lo vuelve editable). Cambios guardados automáticamente como nueva versión de borrador.

**Columna lateral (25%):** panel de fuentes.
- Lista numerada de todas las citas del reporte.
- Cada cita: título de fuente + URL + fecha de acceso + botón "Abrir fuente".

**Barra superior (fija):**
- Estado del documento: "Borrador" (badge amarillo) o "Aprobado" (badge verde).
- Acciones: `[← Volver al expediente]` · `[Editar]` · `[Aprobar reporte ✓]` · `[Exportar PDF]`
- "Exportar PDF" deshabilitado si estado es Borrador.

**Cabecera del reporte (dentro del cuerpo):**
- Logo SOC | TALENT.
- Nombre del prospecto y fecha.
- Disclaimer: "Documento de análisis informativo. No constituye oferta vinculante de ninguna institución financiera."

#### Subtipo B: Otros entregables

**Layout:** columna única (más estrecho).

**Cuerpo:** texto estructurado del entregable (guion, lista de requisitos, propuesta de seguimiento, etc.).

**Barra superior:** misma lógica de estado y aprobación. No todos tienen "Exportar PDF". [SUPUESTO: exportar a PDF se habilita por tipo de entregable; en v1 solo el Reporte de Inteligencia genera PDF de cliente.]

---

### P-4: Vista de Empleado

**Propósito:** el asesor conoce a su equipo; entiende qué hace cada empleado y en qué está.

**Cabecera:**
- Ícono de rol (grande, identitario).
- Nombre del empleado: "El Investigador".
- Estado actual: badge de estado (Libre / Trabajando / Entregó).
- Si está trabajando: "Trabajando en Expediente: [nombre → link]".

**Cuerpo:**
- **Qué hace:** descripción en lenguaje de oficina de las responsabilidades del empleado. Ej. para el Investigador: "Estudia el negocio de tu prospecto mejor que su propio dueño. Investiga la industria, construye el perfil de riesgo y te entrega un reporte con el mejor financiamiento disponible y el argumento listo para cerrar."
- **Sus entregables:** los tipos de documentos que produce este empleado.
- **Historial:** lista de encargos completados (Expediente, tipo de entregable, fecha). Máx. 10 últimos en v1. [SUPUESTO]

**Navegación:** breadcrumb "La Oficina > [Nombre del Empleado]". Botón "Volver".

---

### P-5: Generación del Reporte de Inteligencia (modal/flujo guiado)

**Propósito:** capturar datos del prospecto si faltan y mostrar el progreso de generación. Es el flujo más crítico del producto.

**Activación:** desde el detalle del expediente (botón o comando a Sócrates).

**Paso 1: Datos del prospecto** (solo si faltan)
- Campos mínimos (obligatorios): Nombre de la empresa, Ciudad/Estado, Industria/Giro.
- Campos opcionales: Sitio web, RFC, Número de sucursales/empleados, Notas libres.
- Si el expediente ya tiene todos los mínimos, este paso se salta.
- CTA: "El Investigador arranca →"

**Paso 2: Progreso de generación**
- Pantalla de espera con progreso secuencial por sección (texto + ícono de check al completar):
  1. "Investigando la industria [Giro] en [Ciudad]..."
  2. "Analizando a [Empresa]..."
  3. "Construyendo FODA y perfil de riesgo crediticio..."
  4. "Identificando los mejores productos y condiciones del catálogo SOC..."
  5. "Redactando el reporte..."
  6. "Verificando fuentes y citas..."
- Nota de transparencia (pequeña, al pie): "El Investigador puede tardar hasta 15 minutos en reportes complejos."
- Si el usuario navega fuera: la generación continúa en segundo plano; al volver aparece la notificación de Sócrates. [SUPUESTO: la generación es resiliente a navegación fuera del modal.]

**Paso 3: Borrador listo**
- Mensaje de Sócrates: "El Investigador entregó el reporte de [Empresa]. Está esperando tu revisión."
- CTA: "Revisar reporte →" → lleva a P-3 Subtipo A.

---

## 9. Accesibilidad y responsive

### Accesibilidad (nivel mínimo WCAG 2.1 AA)

- **Contraste:** todos los textos y componentes de UI cumplen contraste 4.5:1 mínimo (texto normal) y 3:1 (texto grande y componentes UI).
- **Navegación por teclado:** todas las acciones primarias accesibles con Tab/Shift+Tab/Enter/Escape. El orden de Tab sigue el flujo visual lógico.
- **Lectores de pantalla:** los badges de estado tienen `aria-label` descriptivo ("Estado: Trabajando en Expediente Probemedic"). Las barras de progreso tienen `role="progressbar"` con `aria-valuenow`, `aria-valuemin`, `aria-valuemax`. Las tarjetas de expediente son `<article>` con `aria-label` que incluye el nombre del prospecto.
- **Foco visible:** el indicador de foco es claramente visible (outline de 2px mínimo sobre fondo contrastado).
- **Mensajes de estado:** las actualizaciones de estado (tarea completada, entregable listo) se anuncian con `aria-live="polite"` para no interrumpir al usuario.
- **Formularios:** todos los campos tienen `<label>` asociado. Los campos obligatorios están marcados con `aria-required="true"` y un indicador visual.
- **Imágenes y íconos:** los íconos de empleado tienen `alt` descriptivo o son decorativos con `aria-hidden="true"` cuando el texto adyacente los describe.

### Responsive (escritorio prioritario)

- **1280 px mínimo:** viewport de diseño base. Los layouts de dos columnas se mantienen.
- **1440–1920 px:** el contenido se ancla en un `max-width: 1400px` con márgenes automáticos; la densidad de información no cambia.
- **< 1280 px (tablet/laptop pequeña):** [SUPUESTO] el panel "Tu equipo" colapsa automáticamente; la lista de expedientes ocupa el 100% del ancho. La barra de Sócrates permanece.
- **Móvil:** fuera de alcance en v1 (declarado Non-Goal en el PRD). Sin diseño móvil responsivo comprometido.
- **Impresión / PDF:** el Reporte de Inteligencia tiene hoja de estilos de impresión que elimina la barra lateral y la barra de acciones, dejando solo el cuerpo del reporte con la identidad SOC | TALENT.

---

## 10. Notas de implementación para Arquitectura

Estas notas no son decisiones de UX sino observaciones de la interfaz que tienen impacto en el contrato técnico:

1. **Actualización en tiempo real de La Oficina:** el asesor no debe recargar la página para ver que un empleado entregó. La arquitectura debe decidir entre polling ligero (cada 5–10 s) o WebSocket/SSE (addendum §8 Q-8).
2. **Generación en segundo plano:** el flujo de generación (P-5) debe ser resiliente a navegación; el estado de la tarea debe persistir en Postgres, no en memoria del cliente.
3. **Gate humano en la API:** el endpoint de exportar PDF debe verificar el estado `Aprobado` del entregable antes de procesar; el bloqueo no es solo de UI.
4. **Versionado de entregables:** cuando el asesor edita y vuelve a aprobar un entregable, se crea una nueva versión (no se sobreescribe). El PDF exportado lleva número de versión en metadatos.
5. **Fallback sin claves:** la lógica de fallback (modo sin claves) debe ser transparente a la UI; los componentes de estado de empleado y progreso funcionan igual con datos seed.
6. **Aislamiento de datos:** la query de expedientes siempre filtra por `userId` (del token de Clerk); nunca hay una query "dame todos los expedientes" sin filtro.

---

## 11. Supuestos marcados ([SUPUESTO])

| # | Supuesto | Impacto si cambia |
|---|---|---|
| S-1 | Un empleado solo trabaja en un expediente a la vez en v1; cola FIFO. | Cambiaría el estado de la tarjeta de empleado (podría mostrar múltiples expedientes). |
| S-2 | El estado colapsado/expandido del panel "Tu equipo" persiste en localStorage. | Decisión de UX menor; no afecta el flujo. |
| S-3 | La generación del reporte es resiliente a navegación fuera del modal; persiste en Postgres. | Si no, el modal debe mantenerse abierto (flujo bloqueante). |
| S-4 | Solo el Reporte de Inteligencia genera PDF de cliente en v1; otros entregables no exportan a PDF. | Si el Negociador o Tramitador también exportan, se extiende la barra de acciones de P-3 subtipo B. |
| S-5 | El método de autenticación Clerk es correo/contraseña mínimo + opcionalmente Google OAuth. | Clerk-hosted UI se configura; no afecta pantallas propias. |
| S-6 | Máximo 10 encargos históricos visibles en P-4 Vista de Empleado en v1. | Paginación si se sube el límite. |
| S-7 | El viewport mínimo soportado es 1280 px; no hay diseño responsivo para móvil en v1. | Declarado Non-Goal; sin impacto en v1. |
| S-8 | El mecanismo de actualización en tiempo real (polling vs. SSE) lo decide Arquitectura. | La UX asume que el estado se actualiza sin recarga manual; el mecanismo es transparente. |

---

## 12. Flujo de estado: ciclo de vida de un Expediente (visual)

```
[Creado]
    │
    ▼
PROSPECTO ──────────────────────────────────────────┐
    │ Investigador entrega Reporte (Borrador)        │
    ▼                                               │
INVESTIGADO (⚠ gate pendiente)                      │
    │ Asesor aprueba Reporte                        │
    ▼                                               │
RECOMENDADO                                         │ En cualquier
    │ Negociador entrega guion                      │ momento:
    ▼                                               │
EN ACERCAMIENTO                                     │ → PERDIDO
    │ Tramitador entrega lista+cotización            │
    ▼                                               │
EN TRÁMITE                                          │
    │ Gestor entrega plan de seguimiento            │
    ▼                                               │
EN CIERRE ──────────────────────────────────────────┘
    │ Asesor marca manualmente
    ▼
GANADO
```

---

*Especificación producida por Sally (UX Designer, BMAD) · método BMAD (EXPERIENCE.md) · fuentes: PRD Sócrates v1 · brief SOC-2026-06-14 · addendum · docs/sim-handoff. Siguiente en la cadena: `bmad-create-architecture` → `bmad-create-epics-and-stories`.*
