/**
 * ReporteV1 — Esquema Zod del contenido del Reporte de Inteligencia Financiera y Comercial
 * de SOC | TALENT (línea empresarial).
 *
 * ───────────────────────────────────────────────────────────────────────────
 * QUÉ ES ESTO
 * ───────────────────────────────────────────────────────────────────────────
 * Este es el contrato de datos del CUERPO del Reporte — lo que se guarda como
 * JSONB tipado en `EntregableVersion.contenido` (arquitectura §5.3, D-2).
 * Se deriva FIELMENTE de los dos reportes reales de referencia:
 *   - Probemedic — Reporte de Inteligencia Financiera (estructuración de crédito).
 *   - Las Aliadas — Plan Estratégico de Crecimiento Financiero e Innovación.
 *
 * Ambos comparten una columna vertebral: metadatos → carta ejecutiva → resumen
 * (hallazgos + recomendaciones) → secciones de cuerpo con CITAS → perfil/FODA →
 * recomendaciones de financiamiento que apuntan al Catálogo SOC → fuentes.
 *
 * ───────────────────────────────────────────────────────────────────────────
 * POR QUÉ IMPORTA CADA PIEZA (la calidad ES el producto)
 * ───────────────────────────────────────────────────────────────────────────
 * Tres invariantes de la arquitectura viven en la FORMA de estos datos:
 *   C-1  Fidelidad de catálogo  → toda recomendación de financiamiento apunta a
 *        un `institucionId`/`productoId` REAL del Catálogo SOC. Cero alucinación.
 *   C-2  Verificación de citas  → toda afirmación factual carga su `respaldo`:
 *        o una Fuente {titulo,url,fechaAcceso} o una marca de Brecha. Lo no
 *        respaldado se DEGRADA a brecha, nunca se muestra como hecho citado.
 *   C-3  Gate humano             → no vive aquí (es estado del Entregable), pero
 *        el `indiceCobertura` que calculamos alimenta la decisión de aprobar.
 *
 * El esquema es estricto a propósito: si el Investigador produce algo fuera de
 * forma, Zod lo rechaza ANTES de tocar la base de datos (D-9).
 *
 * Idioma: todo el contenido de usuario en español (NFR-12).
 */

import { z } from "zod";

// ════════════════════════════════════════════════════════════════════════════
// 0. PRIMITIVAS DE TRAZABILIDAD — el corazón de la verificación de citas (C-2)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Una FUENTE citable. Cada cifra/afirmación del cuerpo del reporte debe poder
 * abrir su fuente. En los reportes reales esto son los "Fuentes: ..." al pie de
 * cada tabla (p. ej. "Data Bridge Market Research (2025)", "Banco de México —
 * SIE", "Banorte — Anexo de Comisiones mar. 2026").
 */
export const FuenteSchema = z.object({
  /** Título legible de la fuente, como aparecería en una bibliografía. */
  titulo: z.string().min(1),
  /** Editor / autor de la fuente (banco, despacho, organismo). Opcional. */
  editor: z.string().optional(),
  /** URL si la fuente es web (Tavily devuelve fuentes citables, B-1). */
  url: z.string().url().optional(),
  /** Documento de origen si la fuente NO es web (p. ej. "brief del cliente", PDF). */
  documento: z.string().optional(),
  /** Fecha en que se accedió/verificó la fuente. ISO 8601 (arquitectura §5.3). */
  fechaAcceso: z.string().datetime().optional(),
  /** Año/periodo que reporta la fuente, tal cual aparece en los reportes reales. */
  periodo: z.string().optional(),
});
export type Fuente = z.infer<typeof FuenteSchema>;

/**
 * El RESPALDO de una afirmación. Es la unión discriminada que materializa C-2:
 *  - "fuente"  → la afirmación está respaldada por ≥1 Fuente verificable.
 *  - "brecha"  → dato NO verificado/divulgado. En los reportes reales esto es
 *                el ⚠ "BRECHA DE INFORMACIÓN" (Probemedic §2.3) o el "N/D — no
 *                divulgado" (benchmarks Probemedic §8.3).
 *  - "estimacion" → cálculo/estimación del asesor a partir de fuentes (p. ej.
 *                "$24–45 M / $300 M ventas = 8–15% ✓", o "TIIEF + 4.5%–6.5%
 *                estimado"). Se marca explícitamente para no confundir estimado
 *                con hecho citado.
 *
 * Regla del verificador (C-2): si una afirmación factual queda sin fuente y no
 * es estimación honesta, se DEGRADA su respaldo a {tipo:"brecha"}.
 */
export const RespaldoSchema = z.discriminatedUnion("tipo", [
  z.object({
    tipo: z.literal("fuente"),
    /** Una o más fuentes que respaldan la afirmación. */
    fuentes: z.array(FuenteSchema).min(1),
    /** ¿Pasó el segundo pase de verificación de citas? (auditoría C-2). */
    verificada: z.boolean().default(false),
  }),
  z.object({
    tipo: z.literal("estimacion"),
    /** Cómo se llegó al número (base + supuesto). Trazabilidad honesta. */
    metodo: z.string().min(1),
    /** Fuentes base de la estimación, si las hay. */
    fuentesBase: z.array(FuenteSchema).default([]),
  }),
  z.object({
    tipo: z.literal("brecha"),
    /** Por qué no se pudo verificar (no divulgado, sin fuente pública, etc.). */
    motivo: z.string().min(1),
    /** Acción sugerida para cerrar la brecha (como en Probemedic §2.3, §X). */
    recomendacion: z.string().optional(),
  }),
]);
export type Respaldo = z.infer<typeof RespaldoSchema>;

/**
 * Una AFIRMACIÓN inline con su respaldo. Es la unidad atómica de verificación:
 * cada oración factual del cuerpo se modela así para que el índice de cobertura
 * verificada (decisiones #4) sea calculable y la UI pueda abrir cada fuente.
 */
export const AfirmacionSchema = z.object({
  /** El texto de la afirmación tal como se lee en el reporte. */
  texto: z.string().min(1),
  /** El respaldo (fuente | estimación | brecha) — esto es C-2 hecho dato. */
  respaldo: RespaldoSchema,
});
export type Afirmacion = z.infer<typeof AfirmacionSchema>;

/**
 * Una FILA de tabla con celdas tipadas. Los dos reportes son densos en tablas
 * (mercado, bancos, factoraje, FODA, soluciones financieras). Modelamos la
 * tabla como estructura para poder citar a nivel de fila cuando aplica
 * (p. ej. cada banco trae su "Fuente: bbva.mx ...").
 */
export const TablaSchema = z.object({
  titulo: z.string().optional(),
  columnas: z.array(z.string().min(1)).min(1),
  filas: z.array(z.array(z.string())).min(1),
  /** Nota al pie tipo "Tasas son estimaciones de mercado...". */
  nota: z.string().optional(),
  /** Fuentes de la tabla completa (el "Fuentes: ..." al pie). */
  fuentes: z.array(FuenteSchema).default([]),
});
export type Tabla = z.infer<typeof TablaSchema>;

// ════════════════════════════════════════════════════════════════════════════
// 1. METADATOS — la portada (Probemedic p.1, Las Aliadas p.1)
// ════════════════════════════════════════════════════════════════════════════

export const ClasificacionSchema = z.enum([
  "CONFIDENCIAL_USO_EXCLUSIVO_CLIENTE",
  "INTERNO",
  "BORRADOR",
]);

export const MetadatosSchema = z.object({
  /** Título mayor del reporte. P.ej. "Reporte de Inteligencia Financiera y Comercial". */
  titulo: z.string().min(1),
  /** Subtítulo/caso. P.ej. "Caso Probemedic — Estructuración de Financiamiento". */
  subtitulo: z.string().optional(),
  /** Marca de la línea de servicio. Default observado en ambos PDFs. */
  marca: z.string().default("SOC | TALENT"),
  lineaServicio: z.string().default("Asesoría Financiera Estratégica — Línea Empresarial"),

  /** Datos del CLIENTE (la empresa del prospecto). */
  cliente: z.object({
    nombre: z.string().min(1), // "Probemedic", "Las Aliadas"
    descriptor: z.string().optional(), // "Farmacéutica / Distribuidora de Oncología", "Grill & Cantina"
    domicilio: z.string().optional(), // "Torre TOP, Piso 47 · Monterrey, Nuevo León"
    ciudad: z.string().optional(),
  }),

  /** Quién lo PREPARÓ (el asesor SOC). */
  preparadoPor: z.object({
    despacho: z.string().default("Talent Consultoría Financiera | SOC Asesores"),
    asesor: z.string().optional(), // "Carlos Hiram Chávez"
    ciudad: z.string().optional(), // "Monterrey, Nuevo León, México"
  }),

  /** Fecha del reporte. ISO 8601; se formatea a es-MX en la UI. */
  fecha: z.string().datetime(),
  clasificacion: ClasificacionSchema.default("CONFIDENCIAL_USO_EXCLUSIVO_CLIENTE"),

  /**
   * DISCLAIMER de no-oferta-vinculante (NFR-9). Texto observado en Probemedic p.1:
   * "...La información contenida es de carácter analítico e informativo y no
   * constituye una oferta vinculante de ninguna institución financiera."
   * Se exige presente en TODO reporte; el render PDF lo estampa.
   */
  disclaimer: z
    .string()
    .min(1)
    .default(
      "Este documento ha sido elaborado con fines de estructuración crediticia y asesoría financiera. La información contenida es de carácter analítico e informativo y no constituye una oferta vinculante de ninguna institución financiera.",
    ),
  /** Pie de confidencialidad de cada página. */
  pieConfidencialidad: z
    .string()
    .default("Documento Confidencial — Uso exclusivo del cliente"),
});
export type Metadatos = z.infer<typeof MetadatosSchema>;

// ════════════════════════════════════════════════════════════════════════════
// 2. CARTA EJECUTIVA — la voz del asesor (Las Aliadas §1 "Carta Ejecutiva")
// ════════════════════════════════════════════════════════════════════════════

/**
 * Carta de apertura firmada. En Las Aliadas es una sección completa y cálida
 * ("Estimado Carlos, ..."). En Probemedic está implícita en el resumen, por eso
 * la marcamos OPCIONAL — no todo reporte la lleva, pero cuando la lleva tiene
 * esta forma.
 */
export const CartaEjecutivaSchema = z.object({
  lugarFecha: z.string().optional(), // "Monterrey, N.L., Marzo 2026"
  saludo: z.string().min(1), // "Estimado Carlos,"
  /** Párrafos del cuerpo de la carta, en orden. */
  parrafos: z.array(z.string().min(1)).min(1),
  despedida: z.string().default("Atentamente,"),
  firmante: z.object({
    nombre: z.string().min(1),
    cargo: z.string().optional(), // "SOC | TALENT — Línea Empresarial, Monterrey N.L."
  }),
});
export type CartaEjecutiva = z.infer<typeof CartaEjecutivaSchema>;

// ════════════════════════════════════════════════════════════════════════════
// 3. RESUMEN EJECUTIVO — hallazgos + recomendaciones (ambos reportes §I/§2)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Un HALLAZGO principal. En Las Aliadas son los "5 Hallazgos Principales"
 * numerados con título + cuerpo. En Probemedic son los pilares del perfil de
 * riesgo. Cada hallazgo factual carga afirmaciones respaldadas (C-2).
 */
export const HallazgoSchema = z.object({
  /** Orden de presentación (1..n). */
  orden: z.number().int().positive(),
  titulo: z.string().min(1), // "Mercado en auge", "Gap de financiamiento estructural"
  descripcion: z.string().min(1),
  /** Afirmaciones factuales del hallazgo, cada una con su respaldo. */
  afirmaciones: z.array(AfirmacionSchema).default([]),
});
export type Hallazgo = z.infer<typeof HallazgoSchema>;

/**
 * Una RECOMENDACIÓN ESTRATÉGICA de alto nivel (las "5 Recomendaciones
 * Estratégicas" R1..R5 de Las Aliadas; los "Tres Frentes" de Probemedic §IX).
 * Es el QUÉ hacer; el detalle con producto+institución vive en
 * `recomendacionesFinanciamiento` (sección 7). Aquí solo el resumen accionable.
 *
 * El `productoRefId` es OPCIONAL aquí pero, si se llena, DEBE existir en el
 * Catálogo (C-1) — lo valida la capa de fidelidad de catálogo en el servidor.
 */
export const RecomendacionEstrategicaSchema = z.object({
  clave: z.string().min(1), // "R1", "R2", "Frente 1"
  titulo: z.string().min(1), // "Crédito Revolvente Empresarial"
  descripcion: z.string().min(1),
  impactoEsperado: z.string().optional(), // "flujo de efectivo estabilizado, sin descapitalización"
  /** Institución sugerida en el resumen (texto visible al cliente). */
  institucionSugerida: z.string().optional(), // "Banorte o Konfío"
});
export type RecomendacionEstrategica = z.infer<typeof RecomendacionEstrategicaSchema>;

export const ResumenEjecutivoSchema = z.object({
  /** Párrafos de apertura del resumen (el "Probemedic es una distribuidora..."). */
  introduccion: z.array(z.string().min(1)).default([]),
  hallazgos: z.array(HallazgoSchema).min(1),
  recomendaciones: z.array(RecomendacionEstrategicaSchema).min(1),
  /**
   * Tabla de "Atributo / Detalle" del resumen de Probemedic (Monto objetivo,
   * Propósito, Garantía preferida, Perfil de riesgo, etc.). Opcional: no todo
   * reporte la lleva, pero es un patrón fuerte del caso de financiamiento.
   */
  tablaPerfilFinanciamiento: TablaSchema.optional(),
});
export type ResumenEjecutivo = z.infer<typeof ResumenEjecutivoSchema>;

// ════════════════════════════════════════════════════════════════════════════
// 4. SECCIONES DE CUERPO — el grueso del reporte, con citas inline (C-2)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Un BLOQUE de contenido dentro de una sección. Unión discriminada para cubrir
 * los formatos reales: párrafos, tablas, listas (viñetas / pasos numerados),
 * y "callouts" (las cajas "💡 Implicación para el crédito", "ℹ Recomendación
 * táctica" de Probemedic). Cada bloque puede portar afirmaciones respaldadas.
 */
export const BloqueSchema = z.discriminatedUnion("tipo", [
  z.object({
    tipo: z.literal("parrafo"),
    texto: z.string().min(1),
    /** Afirmaciones factuales del párrafo con su respaldo (C-2). */
    afirmaciones: z.array(AfirmacionSchema).default([]),
  }),
  z.object({
    tipo: z.literal("tabla"),
    tabla: TablaSchema,
  }),
  z.object({
    tipo: z.literal("lista"),
    /** "vinetas" = lista normal; "pasos" = proceso numerado (la mecánica de pago). */
    estilo: z.enum(["vinetas", "pasos"]).default("vinetas"),
    items: z.array(
      z.object({
        texto: z.string().min(1),
        afirmaciones: z.array(AfirmacionSchema).default([]),
      }),
    ).min(1),
  }),
  z.object({
    tipo: z.literal("callout"),
    /** Tono del callout, espejo de las cajas de los reportes reales. */
    variante: z.enum(["implicacion", "recomendacion", "advertencia", "nota"]).default("nota"),
    titulo: z.string().optional(), // "Implicación para el crédito:", "Recomendación táctica:"
    texto: z.string().min(1),
    afirmaciones: z.array(AfirmacionSchema).default([]),
  }),
]);
export type Bloque = z.infer<typeof BloqueSchema>;

/**
 * Una SECCIÓN de cuerpo (las romanas I..XI de Probemedic; las numeradas 1..7 de
 * Las Aliadas). Soporta subsecciones (2.1, 2.2, ...) recursivamente con un solo
 * nivel de anidamiento — suficiente para ambos reportes reales.
 */
export const SubSeccionSchema = z.object({
  numero: z.string().optional(), // "2.1", "5.2"
  titulo: z.string().min(1),
  bloques: z.array(BloqueSchema).default([]),
});
export type SubSeccion = z.infer<typeof SubSeccionSchema>;

export const SeccionCuerpoSchema = z.object({
  numero: z.string().optional(), // "II", "IV", "5"
  titulo: z.string().min(1), // "Perfil del Sector: Distribución Oncológica en México"
  bloques: z.array(BloqueSchema).default([]),
  subsecciones: z.array(SubSeccionSchema).default([]),
});
export type SeccionCuerpo = z.infer<typeof SeccionCuerpoSchema>;

// ════════════════════════════════════════════════════════════════════════════
// 5. PERFIL DEL CLIENTE + FODA (Las Aliadas §5; Probemedic §I/§IV)
// ════════════════════════════════════════════════════════════════════════════

/** Un ítem de FODA con su respaldo opcional (la matriz FODA de Las Aliadas p.10). */
export const ItemFodaSchema = z.object({
  texto: z.string().min(1),
  respaldo: RespaldoSchema.optional(),
});

export const FodaSchema = z.object({
  fortalezas: z.array(ItemFodaSchema).default([]),
  oportunidades: z.array(ItemFodaSchema).default([]),
  debilidades: z.array(ItemFodaSchema).default([]),
  amenazas: z.array(ItemFodaSchema).default([]),
});
export type Foda = z.infer<typeof FodaSchema>;

export const PerfilClienteSchema = z.object({
  /** Hitos de historia/evolución (Las Aliadas: 2014, 2014–2020, 2021–2024...). */
  historia: z.array(
    z.object({
      periodo: z.string().min(1), // "2014 — El origen"
      descripcion: z.string().min(1),
    }),
  ).default([]),
  /** Datos operativos clave del prospecto (sucursales, empleados, ventas). */
  datosOperativos: TablaSchema.optional(),
  foda: FodaSchema.optional(),
});
export type PerfilCliente = z.infer<typeof PerfilClienteSchema>;

// ════════════════════════════════════════════════════════════════════════════
// 6. RECOMENDACIONES DE FINANCIAMIENTO EMBEBIDAS — la capa de síntesis (C-1)
// ════════════════════════════════════════════════════════════════════════════

/**
 * El CORAZÓN del valor de SOC y donde C-1 (fidelidad de catálogo) es ley.
 * Es la tabla "Soluciones Financieras Recomendadas" de Las Aliadas §7 y la
 * "Hoja de Ruta / Frentes" de Probemedic §IX: cada fila MAPEA una necesidad
 * real del cliente → un producto del Catálogo SOC → institución → uso específico.
 *
 * Regla dura (C-1, NFR-2): `institucionId` y `productoId` DEBEN existir en las
 * tablas `Institucion`/`Producto` del Catálogo. Si la capa de síntesis intenta
 * recomendar algo que no está en el catálogo, se DESCARTA y se anota como brecha
 * — cero instituciones/productos alucinados. Los campos `*Nombre` son la copia
 * legible (para el render), pero la VERDAD es el id.
 */
export const RecomendacionFinanciamientoSchema = z.object({
  /** La necesidad detectada que origina la recomendación (trazable al hallazgo). */
  necesidad: z.string().min(1), // "Capital de trabajo mensual", "Apertura de nueva sucursal"
  /** Hallazgo de origen — por qué surgió esta recomendación (trazabilidad). */
  hallazgoOrigen: z.string().optional(),

  /** Referencia REAL al Catálogo SOC (C-1). Estos ids se validan contra la BD. */
  productoId: z.string().min(1),
  institucionId: z.string().min(1),

  /** Copia legible para el render (nunca sustituye al id como fuente de verdad). */
  productoNombre: z.string().min(1), // "Crédito Revolvente Empresarial"
  institucionNombre: z.string().min(1), // "Banorte"

  montoPlazo: z.string().optional(), // "Desde $100,000 MXN · Plazo 12 a 60 meses"
  usoEspecifico: z.string().min(1), // "Cubrir nóminas, insumos... en picos de demanda"
  requisitosClave: z.string().optional(), // "Mín. 1 año operando, estados de cuenta 3-6 meses..."
  /** Beneficio esperado / impacto (las cajas verdes de Las Aliadas §6). */
  beneficioEsperado: z.string().optional(),
  inversionEstimada: z.string().optional(),
});
export type RecomendacionFinanciamiento = z.infer<typeof RecomendacionFinanciamientoSchema>;

// ════════════════════════════════════════════════════════════════════════════
// 7. ÍNDICE DE COBERTURA VERIFICADA — la métrica de confianza (decisiones #4)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Resultado AUDITABLE de la verificación de citas (C-2). Se muestra en la bandeja
 * ANTES de abrir el reporte y Sócrates advierte si es bajo. Lo calcula el segundo
 * pase del Investigador y se persiste también en `EntregableVersion.verificacion`.
 */
export const IndiceCoberturaSchema = z.object({
  /** Total de afirmaciones factuales detectadas en el reporte. */
  totalAfirmaciones: z.number().int().nonnegative(),
  /** Cuántas pasaron C-2 (respaldo tipo "fuente" verificada). */
  verificadas: z.number().int().nonnegative(),
  /** Cuántas son estimaciones honestas (respaldo tipo "estimacion"). */
  estimaciones: z.number().int().nonnegative(),
  /** Cuántas quedaron como brecha (respaldo tipo "brecha"). */
  brechas: z.number().int().nonnegative(),
  /** % de cobertura = verificadas / totalAfirmaciones (0..100). */
  porcentajeCobertura: z.number().min(0).max(100),
  /** Sello de cuándo se corrió la verificación. */
  verificadoEn: z.string().datetime().optional(),
});
export type IndiceCobertura = z.infer<typeof IndiceCoberturaSchema>;

/**
 * Una BRECHA de información explícita (las ⚠ "BRECHA DE INFORMACIÓN" de
 * Probemedic). Se agregan aquí para la sección "X. Brechas de Información y
 * Consideraciones de Riesgo" — lo no verificado vive FUERA del cuerpo, marcado.
 */
export const BrechaSchema = z.object({
  tema: z.string().min(1), // "Nombre del laboratorio ancla"
  descripcion: z.string().min(1),
  /** Acción para cerrarla. */
  recomendacion: z.string().optional(),
  severidad: z.enum(["alta", "media", "baja"]).default("media"),
});
export type Brecha = z.infer<typeof BrechaSchema>;

// ════════════════════════════════════════════════════════════════════════════
// 8. EL REPORTE COMPLETO — ReporteV1
// ════════════════════════════════════════════════════════════════════════════

export const ReporteV1Schema = z.object({
  /** Versión del esquema. Permite migrar a ReporteV2 sin romper datos viejos. */
  esquema: z.literal("ReporteV1").default("ReporteV1"),

  metadatos: MetadatosSchema,

  /** Índice del reporte ("Contenido del Reporte" de Probemedic p.2). Opcional. */
  indice: z.array(z.string().min(1)).default([]),

  /** Carta de apertura firmada (presente en Las Aliadas; opcional en general). */
  cartaEjecutiva: CartaEjecutivaSchema.optional(),

  resumenEjecutivo: ResumenEjecutivoSchema,

  /** Perfil del cliente + FODA (puede ser una sección propia o ir aquí). */
  perfilCliente: PerfilClienteSchema.optional(),

  /** El cuerpo: las secciones numeradas con sus bloques y citas inline. */
  secciones: z.array(SeccionCuerpoSchema).min(1),

  /**
   * Recomendaciones de financiamiento embebidas que apuntan al Catálogo SOC.
   * Cada una con `institucionId`/`productoId` reales (C-1).
   */
  recomendacionesFinanciamiento: z.array(RecomendacionFinanciamientoSchema).default([]),

  /** Brechas de información declaradas (lo no verificado, marcado). */
  brechas: z.array(BrechaSchema).default([]),

  /** Métrica de confianza calculada por la verificación de citas (C-2). */
  indiceCobertura: IndiceCoberturaSchema.optional(),

  /**
   * Bibliografía consolidada — la sección "XI. Fuentes y Referencias".
   * Es la unión de todas las Fuentes citadas en el cuerpo, deduplicada.
   */
  fuentes: z.array(FuenteSchema).default([]),
});

/**
 * `ReporteV1` = el dato YA PARSEADO (salida de Zod). Aquí los campos con
 * `.default()` ya están poblados, así que son obligatorios. Úsalo para el dato
 * que sale de `parsearReporteV1` / lee del JSONB de la BD.
 */
export type ReporteV1 = z.infer<typeof ReporteV1Schema>;

/**
 * `ReporteV1Entrada` = el objeto que UNO ESCRIBE para alimentar al esquema
 * (entrada de Zod). Aquí los campos con `.default()` son OPCIONALES — Zod los
 * rellena al parsear. Es el tipo correcto para el seed escrito a mano y para la
 * salida estructurada del Investigador antes de validar (evita tener que poner
 * `afirmaciones: []` / `fuentes: []` en cada bloque sin citas).
 */
export type ReporteV1Entrada = z.input<typeof ReporteV1Schema>;

/**
 * Helper de validación para el borde (D-9): valida un objeto desconocido contra
 * el esquema y devuelve el resultado tipado o lanza el ZodError. Lo usan el
 * Investigador (antes de persistir el JSONB) y la ruta de edición del Reporte.
 */
export function parsearReporteV1(entrada: unknown): ReporteV1 {
  return ReporteV1Schema.parse(entrada);
}

export function esReporteV1Valido(entrada: unknown): boolean {
  return ReporteV1Schema.safeParse(entrada).success;
}
