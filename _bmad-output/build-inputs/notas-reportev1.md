# Notas de esquema — `ReporteV1`

Decisiones breves detrás del esquema Zod del cuerpo del Reporte. Derivado FIELMENTE de los
dos reportes reales (`docs/reportes-referencia/`) y alineado con la arquitectura (D-2, D-5, D-9)
y las decisiones del Director (`decisiones-bloqueantes.md` I-3, B-2, B-3).

## Origen del esquema
- La columna vertebral es **común a ambos reportes**: portada/metadatos → carta ejecutiva →
  resumen (hallazgos + recomendaciones) → secciones de cuerpo con tablas/citas → perfil/FODA →
  recomendaciones de financiamiento que apuntan al catálogo → brechas → fuentes.
- Probemedic aportó: tabla "Atributo/Detalle" del resumen, callouts ("Implicación", "Recomendación
  táctica", "⚠ BRECHA"), pasos numerados (mecánica de pago), benchmarks con "N/D — no divulgado",
  y la "Hoja de Ruta / Frentes". Las Aliadas aportó: **carta ejecutiva** firmada como sección
  propia, "5 Hallazgos + 5 Recomendaciones" numerados, **matriz FODA**, hitos de historia, y la
  tabla "Soluciones Financieras Recomendadas" (necesidad → producto → institución → uso).

## Las 3 invariantes de calidad están en la FORMA de los datos (no solo en prosa)
- **C-2 Verificación de citas** → primitiva `Afirmacion = { texto, respaldo }`, con `Respaldo`
  como **unión discriminada** `fuente | estimacion | brecha`. Cada cifra del cuerpo carga su
  respaldo; lo no respaldado se **degrada** a `brecha`, nunca se muestra como hecho. Esto hace
  el **índice de cobertura verificada** (`IndiceCobertura`) calculable — exigencia del caso
  borde #4 del Edge Hunter.
- **C-1 Fidelidad de catálogo** → `RecomendacionFinanciamiento` exige `institucionId` + `productoId`
  (ids reales del Catálogo SOC). Los `*Nombre` son solo copia legible para el render; **la verdad
  es el id**. La capa `fidelidad-catalogo.ts` descarta cualquier id inexistente → cero
  instituciones/productos alucinados (NFR-2).
- **C-3 Gate humano** → no vive en el contenido (es estado del `Entregable`), pero el
  `indiceCobertura` que produce C-2 alimenta la decisión de aprobar y el aviso de Sócrates.

## Decisiones puntuales
- **Tipos opcionales bien marcados.** `cartaEjecutiva`, `perfilCliente`, `tablaPerfilFinanciamiento`
  son opcionales: Las Aliadas trae carta + FODA completos; Probemedic los lleva implícitos. El
  esquema cubre ambos sin forzar campos vacíos.
- **Bloques como unión discriminada** (`parrafo | tabla | lista | callout`) en vez de HTML libre:
  mantiene el contenido estructurado y citables a nivel de bloque, y deja al render (Puppeteer,
  B-4) aplicar el estilo canónico SOC|TALENT con fidelidad.
- **Tablas tipadas** (`columnas`/`filas`/`nota`/`fuentes`) porque ambos reportes son densos en
  tablas y cada tabla trae su "Fuentes: ..." al pie — se conserva la trazabilidad por tabla.
- **`disclaimer` con default** = el texto literal de no-oferta-vinculante (NFR-9); el render lo
  estampa siempre.
- **`esquema: "ReporteV1"` literal** para versionar: migrar a `ReporteV2` no rompe JSONB viejo.
- **Fechas ISO 8601** (string `datetime`), se formatean a es-MX solo en la UI (arquitectura §5.3).
- Helpers `parsearReporteV1` / `esReporteV1Valido` para validar en el borde antes de tocar la BD (D-9).

## Ubicación de build (según I-3)
El esquema final vive en `packages/shared/src/reporte/`. Esta copia en `build-inputs/` es el
artefacto de diseño que el build de E1/E4 importa. El seed (`reporte-probemedic-seed.ts`) va a
`packages/db/.../seed/` y sirve de fallback del Modo sin claves + referencia de calidad del PoC.

## Ambigüedades / pendientes (a confirmar por Carlos o resolver en el PoC)
1. **Granularidad de afirmaciones**: ¿cada oración factual es una `Afirmacion`, o se agrupan por
   párrafo? Elegí oración (máxima auditabilidad), pero infla el JSONB. El PoC del Investigador
   dirá si el costo/latencia lo justifica o conviene agrupar.
2. **Citas como tabla vs. embebidas**: la arquitectura deja `Cita`/`Brecha` embebidas en JSONB por
   default v1 (modelo Prisma §7, comentario). Las modelé embebidas. Si se requiere auditoría cruzada
   (consultar "todas las afirmaciones que citan X fuente" entre reportes), habría que promoverlas a
   tablas — fácil a futuro porque ya están tipadas.
3. **`indiceCobertura` del seed**: el 54.5% es ilustrativo (los reportes reales no traen ese número;
   es una métrica nueva de Sócrates). El umbral con que Sócrates "advierte si es bajo" lo fija Carlos.
4. **Mapa hallazgo → recomendación**: dejé `hallazgoOrigen` como texto libre. Si se quiere ligar
   duro (FK) a un hallazgo concreto, se necesita id de hallazgo — pendiente de afinar con el modelo
   `Recomendacion` de Prisma.
