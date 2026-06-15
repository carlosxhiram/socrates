# Resolución de bloqueantes y casos borde — Director (Opus), 2026-06-14

Respuesta a la revisión adversaria (`readiness/`). Carlos pre-aprobó todas estas decisiones. El build DEBE honrarlas.

## Bloqueantes 🔴 resueltos

### B-1 — Motor de búsqueda del Investigador
**Decisión:** proveedor = **Tavily** (purpose-built para agentes de IA, devuelve fuentes citables), detrás de una interfaz `ProveedorBusqueda` (pluggable: `tavily` | `fallback-sembrado`). Requiere `TAVILY_API_KEY` (llave de Carlos, mañana). En desarrollo/PoC se valida la calidad usando las herramientas web del propio agente; en producción usa Tavily; sin clave → fallback sembrado que no truena.

### B-2 — Catálogo SOC v1
**Decisión:** se construye un **catálogo curado v1** a partir de los dos reportes reales (Las Aliadas, Probemedic) + el research de mercado. Fuente real, no inventada (esos reportes ya citan ~17 instituciones y sus productos). Archivo `catalogo-soc.json` (Institución → Producto → paraQueSirve → cuándoRecomendar → condiciones). Marcado para que Carlos lo expanda/corrija. Resuelto para el build; Carlos refina después.

### B-3 — Reportes reales de referencia
**Resuelto:** los PDFs reales ya están en `docs/reportes-referencia/`. Probemedic se usa como (1) referencia de calidad del PoC, (2) base del esquema `ReporteV1`, (3) plantilla del render PDF, (4) seed del demo sin claves.

### B-4 — Motor de PDF
**Decisión:** **Puppeteer (HTML→PDF)** en Railway, imagen base Debian (no alpine), reutilizando la plantilla HTML canónica SOC|TALENT (máxima fidelidad; ya tenemos plantillas HTML del estilo SIM). El visor web del Reporte (P-3) es el artefacto primario; el export a PDF es un slice acotado (si falla, el visor web sigue sirviendo). 

## Decisiones de afinación 🟡

- **I-1 (mapa de etapas del Expediente):** default propuesto por el Director → `Nuevo → Investigado` (Reporte aprobado) `→ Recomendado` (recomendación de producto aprobada) `→ En acercamiento` (guion/contacto listo) `→ En trámite` (expediente armado) `→ En cierre` (enviado a institución) `→ Colocado`. **Marcado para confirmación de Carlos (sesión de 30 min).**
- **I-2 (worker):** concurrencia máx **2** generaciones simultáneas (piloto); timeout de Tarea **20 min**; al vencer → `BLOQUEADA` motivo "tiempo de espera excedido".
- **I-3 (esquema ReporteV1):** Zod, derivado de los reportes reales; vive en `packages/shared/src/reporte/`. Lo produce el PoC antes de E4.
- **I-5 (export):** `/exportar` usa SIEMPRE la versión más reciente con `aprobado=true`, nunca el borrador editado después.
- **I-6 (polling):** 5 s activo; tras 3 sondeos sin cambio y sin Tareas activas → baja a 30 s; vuelve a 5 s ante acción del usuario o cualquier Tarea activa.

## Mitigaciones de casos borde (Edge Hunter)
- **#8 race del worker:** `SELECT … FOR UPDATE SKIP LOCKED` (o UPDATE…RETURNING atómico) → exactamente-una-ejecución, incluso con reinicio/blue-green.
- **#6 R2 falla en export:** aprobar y exportar son transacciones separadas; si el PutObject falla, queda "Aprobado, PDF pendiente" (estado en modelo + UX), reintentable.
- **#7 cambia clerkUserId:** resolver Asesor por `clerkUserId` **y** por email; loguear discrepancias; documentar recuperación manual para el piloto.
- **#1 fallo mid-pipeline:** persistir progreso parcial por fase; el reintento retoma desde la última fase completada cuando sea viable; la UI distingue "bloqueada (reintentable)" de "(error definitivo)".
- **#4 todas las citas inválidas:** calcular y persistir "índice de cobertura verificada" (% afirmaciones que pasan C-2); mostrarlo en la bandeja antes de abrir; Sócrates advierte si es bajo.
- **#2 dos asesores mismo expediente:** compartir/transferir = **Non-Goal v1**; el 403 se traduce a mensaje de oficina (no error técnico).
- **#3 datos insuficientes:** chequeo de densidad de datos antes de lanzar el Investigador; Sócrates avisa si son pocos ("el reporte puede tener más brechas; ¿agregas datos?").
- **#5 token vence en generación larga:** preservar la URL del Expediente como `redirectUrl` de Clerk; al volver, mostrar estado fresco sin esperar el siguiente ciclo.

## Estrategia de build (orden, honrando la revisión)
1. **Datos:** extraer reportes reales → `ReporteV1` + seed Probemedic; construir `catalogo-soc.json`.
2. **Cimientos (E1):** monorepo compilando (Next.js/Hono/Prisma/Clerk/R2/IA+fallback). Dev corre con **SQLite local** (sin Docker) + seed; Postgres en producción. git local (sin GitHub).
3. **PoC del Investigador (gate):** validar paridad de calidad + costo contra el reporte real de Probemedic ANTES de construir el pipeline caro de E4.
4. Solo con PoC verde → build completo (E2 Oficina/Expedientes, E3 Sócrates, E4 Investigador, E5/E6 resto + catálogo, E7 calidad/seed, E8 deploy-ready).
