# Especificación maestra — "El equipo en marcha" (misión de lanzamiento, 2026-07-05)

> **Fuente de verdad de la construcción nocturna.** La escribe el Director (Fable) tras el
> reconocimiento profundo del 2026-07-05. Implementa las Etapas A1/A2, B1/B2, D y E del
> PLAN-DE-ORQUESTACION.md **sin contradecir ninguna decisión cerrada** (D-3, D-4, D-5,
> I-2, I-6, edge #8). Toda desviación deliberada está marcada como **[DESVÍO AUTORIZADO]**
> (preautorización global de Carlos para el lanzamiento, sesión 2026-07-05).

## 0. Reglas que NADIE viola esta noche

1. **NFR-11**: todo arranca y degrada honesto sin llaves. `ResultadoGenerarTexto` se
   chequea SIEMPRE por `ok` (jamás casts). Sin proveedor → Tarea BLOQUEADA con motivo
   digno u orientación honesta, nunca texto centinela dentro de un Entregable.
2. **NFR-14**: cero jerga en superficie. "Encárgale al Investigador", jamás "ejecutar
   agente/prompt/IA". **NFR-12**: español de México impecable.
3. **C-1**: `productoId` que no exista en el Catálogo → la recomendación SE DESCARTA y
   se registra brecha. Los ids `soc_*` del seed se quedan huérfanos A PROPÓSITO.
4. **C-2**: toda afirmación factual lleva `Respaldo` (fuente/estimacion/brecha). Sin
   búsqueda disponible las afirmaciones externas son `estimacion` o `brecha` — nunca
   "fuente" inventada. `verificada: true` SOLO con procedencia real (URL devuelta por
   el buscador para esa consulta).
5. **C-3**: nada llega a APROBADO sin clic humano. Sócrates NUNCA ejecuta sin confirmar.
6. **Tenencia**: `asesorId` SIEMPRE del token (patrón existente). Toda ruta nueva de
   negocio lleva su doble línea `requiereSuscripcion` en `app.ts`.
7. Migraciones: solo HACIA ADELANTE. dist/ es basura de build: **prohibido** usarlo como
   referencia. La rama `archivo/rama-fantasma-investigador-e2-e7` SÍ puede minarse
   (leer patrones con `git show archivo/rama-fantasma-investigador-e2-e7:ruta`), jamás mergearse.
8. Errores: contrato uniforme `{ error: { codigo, mensaje } }` con los códigos de la casa.

## 1. Arquitectura de la noche (qué construye quién)

```
CARRIL A (API núcleo)          CARRIL B (Empleados)         CARRILES C1/C2 (Web)
─────────────────────          ────────────────────         ────────────────────
POST /expedientes/:id/tareas   6 × Empleado.ejecutar()      Encargar UI + polling
Worker in-process (B1)         Pipeline Investigador (D-5)  Botón Aprobar (A1)
CatalogoLector real (B2)       EntregableGenericoV1 (Zod)   Visor genérico
Migración progreso Tarea       registro.ts (los 6)          Sócrates propone-confirma UI
/socrates/instruir+confirmar   Verificación C-1/C-2         Cerrar sesión, nombre, pulido
version obligatoria (A1)
esModoSinClaves + OIDC
```

Integración: cada carril = worktree + rama propia desde `claude/socrates-equipo-en-marcha`.
El Director integra, verifica en vivo y cierra con un solo PR a master.

## 2. Contratos nuevos (LITERALES — copiar tal cual)

### 2.1 Encargar trabajo — `POST /expedientes/:id/tareas`  (carril A)

Body (Zod): `{ empleadoRol: enum ROLES_PANEL, descripcion?: string.min(3).max(500) }`
- `descripcion` ausente → usar la descripción por defecto del rol (glosario `EMPLEADOS[rol].descripcion`).
- Muralla: `requiereSuscripcion` (añadir `app.use("/expedientes/*", ...)` ya existe — verificar que cubre subruta).
- Tenencia por expediente (patrón `findFirst` + 404/403 de la casa).
- **Regla anti-duplicado**: si existe Tarea del mismo `empleadoRol` en ese expediente con
  estado `ENCARGADA` o `EN_CURSO` → `409 { codigo: "CONFLICTO", mensaje: "El {nombre} ya
  tiene un encargo en curso en este expediente." }`.
- Expediente en etapa terminal (GANADO/PERDIDO) → `409 TRANSICION_INVALIDA` con mensaje digno.
- Respuesta `201`: TareaDTO (el existente, extendido — ver 2.3).

### 2.2 El worker (carril A) — decisiones CERRADAS del plan

- Loop in-process dentro del proceso api (`apps/api/src/worker/`), arranca con el servidor
  (`iniciarWorker()` desde index.ts), tick cada 2 s.
- Toma: `UPDATE "Tarea" SET estado='EN_CURSO', "actualizadoEn"=now() WHERE id = (
    SELECT id FROM "Tarea" WHERE estado='ENCARGADA' AND ("dependeDeId" IS NULL OR
    "dependeDeId" IN (SELECT id FROM "Tarea" WHERE estado='ENTREGADA'))
    ORDER BY "creadoEn" LIMIT 1 FOR UPDATE SKIP LOCKED) RETURNING *;` (edge #8: exactamente-una).
- Concurrencia máx **2** (I-2). Timeout **20 min** → BLOQUEADA motivo "Tiempo de espera excedido".
- Al arrancar, **retoma huérfanas**: Tareas EN_CURSO con `actualizadoEn` > 20 min → de vuelta a ENCARGADA.
- Ejecuta `registroEmpleados[rol].ejecutar(entrada, ctx)`; rol sin implementación →
  BLOQUEADA motivo "Este especialista aún no está disponible." (no debe pasar: carril B entrega los 6).
- `ctx.registrarProgreso(pct, nota)` → persiste en `Tarea.progresoPct/progresoNota` (migración 2.3).
- Resultado: por cada `BorradorEntregable` → transacción: `Entregable` (BORRADOR, tipo, rol,
  expedienteId, tareaId) + `EntregableVersion` v1 (contenido JSON validado ANTES de persistir)
  + Recomendaciones C-1 si aplica (ver 2.6) → Tarea ENTREGADA.
  `bloqueo` → BLOQUEADA con su motivo. Errores → BLOQUEADA motivo digno (NFR-14).
- Estado 100 % en Postgres (sobrevive reinicio). `modoSinClaves` → el empleado decide (ver 2.5).

### 2.3 Migración Prisma (carril A) — SOLO estas columnas

```prisma
model Tarea {
  // ... existentes ...
  progresoPct  Int?     // 0-100, lo escribe registrarProgreso
  progresoNota String?  // "Investigando la industria…" — visible al asesor (NFR-14)
}
```
Migración nueva hacia adelante (`prisma migrate dev --name progreso_de_tarea`).
`TareaDTO` (shared/dto) se extiende con `progresoPct?: number|null, progresoNota?: string|null`.

### 2.4 `EntregableGenericoV1` (carril B, en `packages/shared/src/entregables/EntregableGenericoV1.ts`)

Reusa los schemas EXPORTADOS de ReporteV1 (exportar desde ese módulo lo que falte:
`FuenteSchema`, `RespaldoSchema`, `AfirmacionSchema`, `TablaSchema`, `BloqueSchema`).

```ts
export const EntregableGenericoV1Schema = z.object({
  esquema: z.literal("entregable-generico"),
  version: z.literal(1),
  tipo: z.enum(["perfil_prospecto","recomendacion_productos","guion_acercamiento",
                "cotizacion_estimada","plan_seguimiento"]),
  titulo: z.string().min(1),
  subtitulo: z.string().optional(),
  resumen: z.array(z.string().min(1)).min(1),          // párrafos ejecutivos
  secciones: z.array(z.object({
    titulo: z.string().min(1),
    bloques: z.array(BloqueSchema).min(1),              // parrafo/tabla/lista/callout — los de ReporteV1
  })).min(1),
  recomendacionesFinanciamiento: z.array(z.object({     // SOLO asesor_producto la llena
    productoId: z.string().min(1),
    institucionId: z.string().min(1),
    razon: z.string().min(1),
    condicionesResumen: z.string().optional(),
  })).default([]),
  brechas: z.array(z.object({ campo: z.string(), motivo: z.string() })).default([]),
  fuentes: z.array(FuenteSchema).default([]),
});
```
`parsearEntregableGenericoV1(json: string)` espejo de `parsearReporteV1`. El Investigador
sigue emitiendo **ReporteV1** (tipo `reporte_inteligencia`) — el prerrequisito de etapa ya lo espera.

### 2.5 Los 6 empleados (carril B, `apps/api/src/empleados/`)

Un archivo por rol + `registro.ts` que exporta
`export const registroEmpleados: Partial<Record<RolEmpleado, Empleado>>` con los 6.

| Rol | tipo de entregable | Modelo | Esencia del encargo |
|---|---|---|---|
| INVESTIGADOR | `reporte_inteligencia` (ReporteV1) | pesado | Pipeline D-5 completo (abajo) |
| PROSPECTOR | `perfil_prospecto` | estandar | Califica al prospecto: potencial, señales, datos por completar |
| ASESOR_PRODUCTO | `recomendacion_productos` | estandar | Matchea el Catálogo REAL (C-1 dura) a la necesidad |
| NEGOCIADOR | `guion_acercamiento` | estandar | Guion de llamada + pitch + manejo de 5 objeciones |
| TRAMITADOR | `cotizacion_estimada` | estandar | Requisitos por producto + cotización estimada (no vinculante, con estimaciones C-2) |
| GESTOR | `plan_seguimiento` | mecanico | Plan de seguimiento con cadencia y siguientes pasos |

**Pipeline del Investigador (D-5, 6 fases con `registrarProgreso` en cada una):**
1. *Investigar* (15 %): industria+empresa. Con `ProveedorBusqueda.disponible` → consultas
   (industria en México, la empresa, riesgos del giro); guarda `{consulta, resultados}` como
   procedencia. Sin búsqueda → sigue con lo que hay en el expediente (todo será estimación/brecha).
2. *Perfil y FODA* (35 %): IA con contexto = expediente + hallazgos fase 1.
3. *Matcheo de catálogo* (55 %): candidatos desde `ctx.catalogo.listarProductos()`; la IA elige y
   razona SOLO sobre esos ids literales (el prompt lista los productos con sus ids reales).
4. *Brechas* (70 %): lo que el asesor debe conseguir del cliente.
5. *Redactar* (85 %): ensamblar ReporteV1 COMPLETO (metadatos con empresa/asesor reales,
   resumenEjecutivo, perfilCliente con FODA, secciones, recomendacionesFinanciamiento,
   indiceCobertura contado DE VERDAD sobre las afirmaciones emitidas).
6. *Verificar* (95 %): `parsearReporteV1` + fidelidad C-1 (2.6) + recuento de cobertura.
   Falla de parseo → UN reintento con el error como feedback; segundo fallo → bloqueo digno.
- La IA emite JSON (prompt: "responde únicamente el objeto JSON"); parsear con el Zod correspondiente.
- `modoSinClaves === true` → `{ bloqueo: { motivo: "La oficina aún no tiene el servicio de
  inteligencia contratado. En cuanto esté activo, retomo este encargo." } }` (NFR-14, sin jerga).
- Los otros 5 roles: misma disciplina (JSON → Zod → reintento único → bloqueo digno), una sola
  llamada de IA + su verificación; ASESOR_PRODUCTO pasa por fidelidad C-1 SIEMPRE.

### 2.6 Fidelidad de catálogo C-1 (carril A, `apps/api/src/calidad/fidelidad-catalogo.ts`)

`verificarRecomendaciones(recs, catalogo)` → por cada rec: `catalogo.buscarProducto(productoId)`;
no existe o `institucionId` no coincide con la del producto → FUERA + brecha
`{campo:"recomendacion", motivo:"Se descartó una sugerencia fuera del catálogo vigente."}`.
Las válidas se persisten como filas `Recomendacion` (FK real a Producto; la institución va
implícita vía producto — el modelo NO tiene institucionId directo). El worker la aplica a
TODO entregable con `recomendacionesFinanciamiento`.

### 2.7 CatalogoLector real (carril A, `apps/api/src/catalogo/catalogo-lector.ts`)

Implementa la interfaz del contrato sobre Prisma. `cuandoRecomendar`/`condiciones` son String
JSON → `JSON.parse` a mano (mina conocida). Cachear `listarProductos()` en memoria 5 min.

### 2.8 Sócrates gerente (carril A los endpoints; C2 la UI) — D-4, NUNCA autónomo

- `POST /socrates/instruir` body `{ texto: string.min(1), expedienteId?: string }` →
  - Con IA: prompt de intención con la lista REAL de expedientes del asesor (id+empresa) y el
    set CERRADO de roles; salida Zod:
    `{ tipo:"plan", resumen: string, expedienteId: string|null, empresaNueva?: {empresa,ciudad?,giro?},
       pasos: [{empleadoRol: ROLES_PANEL, descripcion: string}].min(1) }`
    o `{ tipo:"pregunta", pregunta: string }` (UNA sola pregunta ante ambigüedad).
  - Sin IA (fallback determinista): si `expedienteId` viene y el texto trae verbos de encargo →
    plan `[{INVESTIGADOR, descripcion del texto}]`; si no → `{tipo:"pregunta"}` honesta.
  - **No crea NADA en base.**
- `POST /socrates/confirmar` body `{ expedienteId: string, pasos:[{empleadoRol, descripcion}].min(1) }`
  → crea las Tareas encadenadas (`dependeDeId` = la anterior), mismas reglas 2.1. Devuelve TareaDTO[].
- Ambos bajo `requiereSuscripcion`. **Además (mina del recon): añadir la muralla a `/sesiones/*`.**

### 2.9 Aprobar con candado (A1 — carril A servidor, C1 botón)

- Servidor: `version` pasa a **OBLIGATORIA** (`400 DATOS_INVALIDOS` si falta) — hoy es opcional.
- UI: botón "Aprobar entregable" en el visor (solo si BORRADOR): confirmación breve
  ("Al aprobar, este entregable queda listo para usarse con tu prospecto."), manda
  `{version: versionActual}`; 409 VERSION_DESFASADA → aviso digno + recarga.

### 2.10 Polling I-6 (carril C1) — números CERRADOS

5 s mientras haya Tareas activas (ENCARGADA/EN_CURSO) o acción reciente del usuario; tras 3
sondeos sin cambio y sin Tareas activas → 30 s; cualquier acción del usuario o Tarea activa →
de vuelta a 5 s. Refresca el detalle del expediente (tareas con progresoPct/progresoNota,
entregables) sin parpadeos.

### 2.11 UI de encargo (carril C1)

En el expediente, sección "Equipo en este expediente": las 6 tarjetas de rol SIEMPRE visibles
(nombre, icono, descripción corta, estado en ESTE expediente). Cada una con botón **"Encargar"**
→ panel inline con la descripción editable pre-llenada → confirmar → Server Action nueva
(`encargarTarea` en `lib/acciones.ts`, contrato `ResultadoAccion`) → POST 2.1 → la tarjeta pasa
a "Trabajando…" con barra de progreso (progresoPct) y nota (progresoNota). BLOQUEADA → motivo
visible + botón "Reintentar" (crea Tarea nueva igual). Textos NFR-14.

### 2.12 UI de Sócrates que propone (carril C2)

En la conversación: cuando la respuesta del asistente venga acompañada de un plan (el endpoint
de mensajes NO cambia; la barra y el chat usan `/socrates/instruir` cuando el texto parece
encargo — heurística simple en el server action), se pinta una **tarjeta de plan**: resumen +
pasos (icono y nombre del rol + descripción) + botones "Ponlos a trabajar" (→ `/socrates/confirmar`
→ navega al expediente) y "Mejor no". La conversación guarda el intercambio como mensajes
normales. Si `tipo:"pregunta"` → se muestra como mensaje del asistente y ya.

### 2.13 Visor genérico (carril C2)

`app/entregables/[id]` hoy solo pinta ReporteV1. Añadir renderer para `entregable-generico`
(cualquier `tipo` del enum 2.4): cabecera (titulo/subtitulo/estado), resumen, secciones con los
mismos bloques visuales del reporte (REUSAR componentes de bloques si son extraíbles; si no,
versión ligera consistente con la paleta `marca/oficina/estado`), recomendaciones (si hay) con
nombre real de producto/institución, brechas como "Información pendiente", fuentes numeradas.
Botón Aprobar (2.9) para AMBOS tipos.

### 2.14 Detalles de pulido (carril C2)

1. **Cerrar sesión**: menú de cuenta discreto en la cabecera de la oficina (nombre de la
   oficina + "Cerrar sesión") — Clerk `signOut` (respetar modo demo: sin Clerk no se pinta).
2. **Nombre en el onboarding**: campo "Tu nombre" (opcional) en el paso 1; se persiste en el
   PATCH de perfil existente.
3. Estados vacíos y microcopy revisados en las pantallas tocadas (voz de oficina).

### 2.15 Llaves y modelos (carril A, `proveedor-ia.ts`)

`esModoSinClaves()` y `crearProveedorIA()` (LAS DOS COPIAS de la condición — mina conocida)
aceptan `AI_GATEWAY_API_KEY` **o** `VERCEL_OIDC_TOKEN` como llave presente (el SDK del gateway
usa OIDC solo). `/health` sigue reportando `modoSinClavesIA` con la nueva condición.
**[DESVÍO AUTORIZADO]** un `.env` sin AI_GATEWAY pero con OIDC ya no es "sin llaves".

## 3. Verificación (sin esto no hay lanzamiento)

- Cada carril: typecheck + unit + tests de integración NUEVOS de lo suyo (la batería corre
  en serie contra Postgres local; guardia anti-producción intacta).
- El Director integra carril por carril y **verifica en vivo con Playwright** cada pieza.
- **PoC del Investigador (Etapa C como validación)**: con la llave viva, generar un reporte
  real sobre un expediente de prueba y medir: ¿parsea ReporteV1? ¿citas con procedencia?
  ¿costo (tokens) y latencia dignos? ¿paridad visual con el seed de Probemedic?
  **[DESVÍO AUTORIZADO]**: el plan pone el PoC como gate PREVIO a construir D; Carlos
  preautorizó construir esta noche y correr el PoC como validación previa al lanzamiento.
- Panel adversarial (revisores independientes) sobre el diff completo antes del PR final.
- Recorrido E2E completo de asesor nuevo: registro → pago → encargar → ver progreso →
  reporte → aprobar → avanzar etapa → los otros 5 roles → Sócrates propone y confirma.

## 4. Reparto y orden

| Carril | Quién | Rama |
|---|---|---|
| A — API núcleo | Opus | `claude/socrates-carril-api` |
| B — Empleados | Opus | `claude/socrates-carril-empleados` |
| C1 — Web expediente | Sonnet | `claude/socrates-carril-web-expediente` |
| C2 — Web sesiones/visor/pulido | Sonnet | `claude/socrates-carril-web-pulido` |

Integración del Director en `claude/socrates-equipo-en-marcha` → un PR final a master.
Punto de encuentro A↔B: `apps/api/src/empleados/registro.ts` (A lo crea vacío, B lo llena).
C1/C2 en `lib/api-client.ts`: añadir SOLO al final del archivo, con comentario de sección.
