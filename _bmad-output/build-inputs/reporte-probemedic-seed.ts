/**
 * reporte-probemedic-seed.ts
 * ───────────────────────────────────────────────────────────────────────────
 * Objeto `ReporteV1` poblado con el CONTENIDO REAL del reporte de Probemedic
 * (docs/reportes-referencia/Probemedic_Reporte_Inteligencia_Financiera_SOC_TALENT.pdf).
 *
 * Triple propósito (decisiones-bloqueantes B-3):
 *   1. SEED del demo sin claves (Modo sin claves, NFR-11) — el Investigador
 *      devuelve este reporte cuando no hay AI_GATEWAY_API_KEY.
 *   2. REFERENCIA DE CALIDAD del PoC del Investigador — la vara contra la que se
 *      mide la paridad de calidad antes de construir el pipeline caro (E4).
 *   3. REFERENCIA VISUAL del render PDF (R-6).
 *
 * IMPORTANTE: todas las cifras, fuentes, instituciones y productos aquí provienen
 * LITERALMENTE del PDF real. Cero invención (la calidad ES el producto).
 * Las brechas marcadas en el PDF (⚠ BRECHA DE INFORMACIÓN, N/D) se modelan como
 * respaldo {tipo:"brecha"}, no se inflan a hechos.
 *
 * Los `institucionId`/`productoId` de las recomendaciones de financiamiento son
 * placeholders con prefijo "soc_" que el seed del Catálogo (catalogo-soc.ts)
 * debe resolver a ids reales. Si no existen, C-1 los descarta — por diseño.
 */

// Usamos el tipo de ENTRADA: los campos con `.default()` (afirmaciones, fuentes,
// verificada, etc.) son opcionales al escribir; Zod los rellena al parsear. El
// objeto se valida en el build con `parsearReporteV1` antes de sembrarlo.
import type { ReporteV1Entrada } from "./ReporteV1";

const FECHA_REPORTE = "2026-03-18T00:00:00.000Z"; // "18 de marzo de 2026"
const ACCESO = "2026-03-18T00:00:00.000Z";

export const reporteProbemedicSeed: ReporteV1Entrada = {
  esquema: "ReporteV1",

  // ── PORTADA (p.1) ─────────────────────────────────────────────────────────
  metadatos: {
    titulo: "Reporte de Inteligencia Financiera y Comercial",
    subtitulo: "Caso Probemedic — Estructuración de Financiamiento",
    marca: "SOC | TALENT",
    lineaServicio: "Asesoría Financiera Estratégica — Línea Empresarial",
    cliente: {
      nombre: "Probemedic",
      descriptor: "Farmacéutica / Distribuidora de Oncología",
      domicilio: "Torre TOP, Piso 47 · Monterrey, Nuevo León",
      ciudad: "Monterrey, Nuevo León",
    },
    preparadoPor: {
      despacho: "Talent Consultoría Financiera | SOC Asesores",
      ciudad: "Monterrey, Nuevo León, México",
    },
    fecha: FECHA_REPORTE,
    clasificacion: "CONFIDENCIAL_USO_EXCLUSIVO_CLIENTE",
    disclaimer:
      "Este documento ha sido elaborado con fines de estructuración crediticia y asesoría financiera. La información contenida es de carácter analítico e informativo y no constituye una oferta vinculante de ninguna institución financiera.",
    pieConfidencialidad: "Talent Consultoría Financiera | Confidencial | Uso exclusivo del cliente",
  },

  // ── ÍNDICE (p.2) ──────────────────────────────────────────────────────────
  indice: [
    "I. Resumen Ejecutivo",
    "II. Perfil del Sector: Distribución Oncológica en México",
    "III. Cadena de Pagos: Aseguradoras Privadas e Instituciones Públicas",
    "IV. Perfil de Riesgo Crediticio — Sector Farmacéutico",
    "V. Panorama Bancario: Capital de Trabajo 25–35 M MXN (2026)",
    "VI. Cartas Compromiso / Standby Letters of Credit",
    "VII. Factoraje sobre Cuentas por Cobrar de Aseguradoras",
    "VIII. Casos Comparables y Benchmarks del Sector",
    "IX. Recomendaciones Estratégicas y Hoja de Ruta",
    "X. Brechas de Información y Consideraciones de Riesgo",
    "XI. Fuentes y Referencias",
  ],

  // ── I. RESUMEN EJECUTIVO (p.3) ────────────────────────────────────────────
  resumenEjecutivo: {
    introduccion: [
      "Probemedic es una distribuidora farmacéutica especializada en medicamentos oncológicos de alta especialidad, con sede en Torre TOP, Piso 47, Monterrey, Nuevo León. Opera exclusivamente en el segmento B2B hacia aseguradoras privadas a nivel nacional, con una cartera concentrada y de alto valor unitario —donde un solo medicamento puede superar los $1.2 millones de pesos—, generando ventas anuales en el orden de los $300 millones de pesos.",
    ],
    hallazgos: [
      {
        orden: 1,
        titulo: "Historial de buró impecable",
        descripcion: "Historial de buró impecable, con escasa deuda vigente.",
        afirmaciones: [
          {
            texto: "Historial de buró impecable, con escasa deuda vigente.",
            respaldo: {
              tipo: "fuente",
              fuentes: [{ titulo: "Brief estratégico SOC | TALENT (2026)", documento: "brief del cliente", periodo: "2026", fechaAcceso: ACCESO }],
              verificada: true,
            },
          },
        ],
      },
      {
        orden: 2,
        titulo: "Contabilidad dictaminada y situación fiscal en regla",
        descripcion:
          "Contabilidad dictaminada y situación fiscal en regla, con evidencia de sofisticación fiscal demostrada mediante devoluciones de IVA por $140–150 millones de pesos en los últimos tres años.",
        afirmaciones: [
          {
            texto: "Devoluciones de IVA por $140–150 millones de pesos en los últimos tres años.",
            respaldo: {
              tipo: "fuente",
              fuentes: [{ titulo: "Brief estratégico SOC | TALENT (2026)", documento: "brief del cliente", periodo: "2024–2026", fechaAcceso: ACCESO }],
              verificada: true,
            },
          },
        ],
      },
      {
        orden: 3,
        titulo: "Relación comercial consolidada con laboratorio ancla",
        descripcion: "Relación comercial consolidada con laboratorio ancla por $750 millones de pesos en compras.",
        afirmaciones: [
          {
            texto: "Relación con laboratorio ancla por $750 millones de pesos en compras.",
            respaldo: {
              tipo: "fuente",
              fuentes: [{ titulo: "Brief estratégico SOC | TALENT (2026)", documento: "brief del cliente", periodo: "2026", fechaAcceso: ACCESO }],
              verificada: true,
            },
          },
        ],
      },
    ],
    recomendaciones: [
      {
        clave: "Frente 1",
        titulo: "Mifel — Crédito quirografario + Carta Compromiso (prioridad urgente)",
        descripcion:
          "Activar de inmediato la relación directa de Carlos con los directivos de Mifel. Objetivo: línea quirografaria revolvente de $35 M MXN + Carta Compromiso bancaria emitida en plazo de 15 días hábiles desde aprobación.",
        impactoEsperado: "Desbloqueo de cuotas de inventario del laboratorio ancla.",
        institucionSugerida: "Mifel",
      },
      {
        clave: "Frente 2",
        titulo: "Factoraje paralelo (Finmedic / AF Banregio)",
        descripcion:
          "Contactar a Finmedic para cotizar factoraje sobre CxC de aseguradoras — instrumento paralelo y complementario a la línea bancaria. AF Banregio como segunda opción: anticipa 80%–95% de facturas; límite $30 M MXN.",
        impactoEsperado: "Acelera el ciclo de cobro de 30–55 días a 24–48 horas.",
        institucionSugerida: "Finmedic / AF Banregio",
      },
      {
        clave: "Frente 3",
        titulo: "Seguimiento activo con Banorte y Afirme",
        descripcion:
          "Crear grupo de seguimiento con los ejecutivos de cuenta en Banorte y Afirme. Si en 10 días hábiles no hay avance concreto, redirigir esfuerzos a Santander como alternativa. Usar la aprobación de Mifel como palanca de negociación.",
        institucionSugerida: "Banorte / Afirme / Santander",
      },
    ],
    tablaPerfilFinanciamiento: {
      titulo: "Perfil de financiamiento — Probemedic",
      columnas: ["Atributo", "Detalle"],
      filas: [
        ["Monto objetivo", "$25–35 M MXN (quirografario / moral)"],
        ["Monto ideal medio plazo", "$50–100 M MXN"],
        ["Propósito principal", "Capital de trabajo para pago a laboratorio ancla"],
        ["Catalizador crítico", "Carta compromiso bancaria para relación laboratorio"],
        ["Ventas anuales", "~$300 M MXN"],
        ["Perfil de riesgo", "Bajo — buró impecable, finanzas dictaminadas"],
        ["Garantía preferida", "Quirografaria / Moral"],
        ["Garantía alternativa", "Propiedades libres de gravamen (dueño)"],
        ["Estatus expediente", "Afirme y Banorte: en trámite (proceso lento)"],
        ["Instancia prioritaria", "Mifel — acceso gerencial directo disponible"],
      ],
      fuentes: [{ titulo: "Brief estratégico SOC | TALENT (2026)", documento: "brief del cliente", periodo: "2026" }],
    },
  },

  // ── PERFIL DEL CLIENTE (síntesis del §I/§IV) ──────────────────────────────
  perfilCliente: {
    historia: [],
    datosOperativos: {
      titulo: "Probemedic (Cliente) — datos operativos",
      columnas: ["Atributo", "Dato"],
      filas: [
        ["Empleados", "~300"],
        ["Sede", "Torre TOP Piso 47, Monterrey"],
        ["Ventas anuales", "$300 M MXN"],
        ["Diferenciador", "Operación 100% enfocada en oncología para aseguradoras privadas"],
      ],
      fuentes: [{ titulo: "Extendeal (2024); brief estratégico SOC | TALENT (2026)" }],
    },
    foda: {
      fortalezas: [
        { texto: "Buró impecable, pocos créditos vigentes — perfil limpio sin antecedentes de incumplimiento (MUY FAVORABLE)." },
        { texto: "Contabilidad dictaminada; devoluciones IVA $140–150 M en 3 años = sofisticación y transparencia fiscal máxima." },
        { texto: "Cartera de clientes de primer nivel: GNP, AXA, MetLife, SMNYL — aseguradoras reguladas por CNSF (MUY FAVORABLE)." },
        { texto: "Relación con laboratorio ancla $750 M MXN en compras — activo intangible de alto valor crediticio (DIFERENCIADOR CLAVE)." },
      ],
      oportunidades: [
        { texto: "Cuentas por cobrar a aseguradoras de primer nivel son activos de alta calidad para factoraje, con tasas más favorables que CxC de clientes genéricos." },
        { texto: "Reducción de 250 puntos base en tasas en 12 meses — ahorro anual de ~$750,000 MXN para una línea de $30 M MXN; argumento de urgencia para actuar ahora." },
        { texto: "Modelo óptimo crédito + factoraje en operación paralela: ciclo de liquidez completamente autónomo." },
      ],
      debilidades: [
        { texto: "Alta concentración en aseguradoras privadas; los bancos podrán requerir diversificación futura (NEUTRAL / BAJO RIESGO observado)." },
        { texto: "Dependencia 1:1 del laboratorio ancla — percibida como riesgo de concentración de proveedor (la carta compromiso alivia este riesgo al formalizarla)." },
        { texto: "Ciclo de capital de trabajo largo: desfase entre pago inmediato al laboratorio y cobro a 30–55 días a la aseguradora." },
      ],
      amenazas: [
        { texto: "Medicamentos de alto valor unitario ($1.2 M por evento) implican alta exposición por evento; mitigado verificando el respaldo del seguro médico de cada paciente." },
      ],
    },
  },

  // ── SECCIONES DE CUERPO (II–X) ────────────────────────────────────────────
  secciones: [
    // II — Perfil del Sector (p.4–5)
    {
      numero: "II",
      titulo: "Perfil del Sector: Distribución Oncológica en México",
      bloques: [],
      subsecciones: [
        {
          numero: "2.1",
          titulo: "Tamaño y Dinamismo del Mercado",
          bloques: [
            {
              tipo: "parrafo",
              texto:
                "México es el mercado de medicamentos oncológicos más relevante de América Latina. El tamaño del segmento en 2024 se estimó en aproximadamente USD 1.88 mil millones (~$38 mil millones de pesos), con una CAGR proyectada de entre 10.9% y 11% hacia 2032.",
              afirmaciones: [
                {
                  texto: "El mercado oncológico de México en 2024 se estimó en ~USD 1.88 mil millones (~$38 B MXN).",
                  respaldo: {
                    tipo: "fuente",
                    fuentes: [
                      { titulo: "Data Bridge Market Research", periodo: "2025", fechaAcceso: ACCESO },
                      { titulo: "Maximize Market Research", periodo: "2024", fechaAcceso: ACCESO },
                    ],
                    verificada: true,
                  },
                },
                {
                  texto: "CAGR proyectada 2024–2032 de 10.9%–11.0%; mercado proyectado 2032 de USD 4.3 mil millones.",
                  respaldo: {
                    tipo: "fuente",
                    fuentes: [{ titulo: "Grand View Research", periodo: "2022", fechaAcceso: ACCESO }],
                    verificada: true,
                  },
                },
              ],
            },
            {
              tipo: "tabla",
              tabla: {
                columnas: ["Indicador", "Valor"],
                filas: [
                  ["Mercado oncológico MX 2024 (est.)", "USD 1.88 Mil Millones (~$38 B MXN)"],
                  ["CAGR proyectada 2024–2032", "10.9% – 11.0%"],
                  ["Mercado proyectado 2032", "USD 4.3 Mil Millones"],
                  ["Mercado farmacéutico total MX 2025", "USD 18.2 Mil Millones"],
                  ["Incidencia de cáncer en México (2020)", "195,499 nuevos casos/año"],
                  ["Mortalidad por cáncer en México (2020)", "90,222 defunciones/año"],
                  ["Canal distribución predominante", "Farmacias hospitalarias (~55–60%)"],
                  ["Segmento de mayor crecimiento", "Ventas minoristas especializadas (CAGR 11%)"],
                ],
                fuentes: [
                  { titulo: "Data Bridge Market Research", periodo: "2025" },
                  { titulo: "Maximize Market Research", periodo: "2024" },
                  { titulo: "Roche México", periodo: "2022" },
                  { titulo: "Grand View Research", periodo: "2022" },
                ],
              },
            },
          ],
        },
        {
          numero: "2.3",
          titulo: "Laboratorios Oncológicos con Presencia Activa en México",
          bloques: [
            {
              tipo: "tabla",
              tabla: {
                columnas: ["Laboratorio", "Especialidad Oncológica Principal", "Características Relevantes"],
                filas: [
                  ["Roche / Genentech", "Cáncer de mama, pulmón, hepatocelular, linfomas", "Mayor empresa biotecnológica mundial; presencia desde 1945 en México"],
                  ["Pfizer Oncology", "Cánceres renales, hematológicos, sarcomas", "Alta penetración en aseguradoras privadas; terapia dirigida"],
                  ["Novartis", "Leucemias (Gleevec), pulmón, tiroides, neuroendocrinos", "Más de 80 años en México; oncología de precisión genómica"],
                  ["Bristol Myers Squibb", "Melanoma, pulmón, vejiga, estómago, colorrectal", "Inmunoterapias (Opdivo, Yervoy); alta facturación por tratamiento"],
                  ["AstraZeneca", "Ovario, mama HER2, pulmón EGFR", "Medicamentos dirigidos de alto costo; crecimiento acelerado en México"],
                  ["Merck (MSD)", "Melanoma, pulmón, cabeza y cuello (Keytruda)", "Inmunoterapia líder en ventas mundiales; alta demanda en aseguradoras"],
                  ["Neolpharma", "Medicamentos oncológicos genéricos / similares", "Segundo proveedor farmacéutico del sector público; referencia IFC USD 30 M (2021)"],
                ],
                fuentes: [
                  { titulo: "Roche México", periodo: "2024" },
                  { titulo: "Novartis México", periodo: "2025" },
                  { titulo: "Bristol Myers Squibb", periodo: "2025" },
                  { titulo: "IFC — Neolpharma case study" },
                ],
              },
            },
            {
              tipo: "callout",
              variante: "advertencia",
              titulo: "BRECHA DE INFORMACIÓN",
              texto:
                "El nombre específico del laboratorio ancla de Probemedic no se divulgó en el brief. Para efectos de estructuración de la carta compromiso bancaria, se recomienda que Probemedic lo identifique formalmente, ya que los bancos podrán requerir validar la relación comercial directamente con el laboratorio.",
              afirmaciones: [
                {
                  texto: "El nombre específico del laboratorio ancla de Probemedic no se divulgó en el brief.",
                  respaldo: {
                    tipo: "brecha",
                    motivo: "Dato no divulgado en el brief del cliente.",
                    recomendacion: "Probemedic debe identificar formalmente el laboratorio ancla; los bancos podrán requerir validar la relación comercial.",
                  },
                },
              ],
            },
          ],
        },
      ],
    },

    // III — Cadena de Pagos (p.6–7)
    {
      numero: "III",
      titulo: "Cadena de Pagos: Aseguradoras Privadas e Instituciones Públicas",
      bloques: [],
      subsecciones: [
        {
          numero: "3.1",
          titulo: "Estructura del Mercado Asegurador de Salud en México",
          bloques: [
            {
              tipo: "tabla",
              tabla: {
                columnas: ["Aseguradora", "Participación de Mercado GMM", "Perfil de Pago"],
                filas: [
                  ["GNP (Grupo Nacional Provincial)", "~27%", "Aseguradora nacional más grande; proceso de validación y autorización de facturas estructurado"],
                  ["AXA Seguros", "~19%", "Multinacional; procesos estandarizados de pago; plazos relativamente predecibles"],
                  ["MetLife México", "~14%", "Alta cobertura oncológica en pólizas individuales y colectivas"],
                  ["Seguros Monterrey NYL (SMNYL)", "~11%", "Fuerte presencia en noreste — relevante para Probemedic con base en Monterrey"],
                  ["Allianz, BBVA Seguros, Inbursa, y otros", "~29% combinado", "Participación complementaria; plazos de pago variables por aseguradora"],
                ],
                fuentes: [{ titulo: "CONDUSEF", periodo: "2016 — composición estructuralmente estable; distribución actualizada por AMIS 2021" }],
              },
            },
            {
              tipo: "callout",
              variante: "implicacion",
              titulo: "Implicación para el crédito",
              texto:
                "La naturaleza predecible y recurrente de los cobros a aseguradoras de primer nivel (GNP, AXA, MetLife, SMNYL) convierte estas cuentas por cobrar en activos de alta calidad para factoraje, con tasas de descuento más favorables que CxC de clientes genéricos.",
            },
          ],
        },
        {
          numero: "3.2",
          titulo: "Mecánica de la Cadena de Pago — Sector Privado",
          bloques: [
            {
              tipo: "lista",
              estilo: "pasos",
              items: [
                { texto: "PASO 1 — Prescripción y autorización previa: el médico oncólogo prescribe; la aseguradora emite pre-auth que puede tardar 24–72 horas." },
                { texto: "PASO 2 — Despacho y facturación: Probemedic entrega el medicamento y emite la factura CFDI a la aseguradora." },
                { texto: "PASO 3 — Validación documental: la aseguradora coteja factura vs. autorización previa y cobertura de póliza (5–15 días hábiles)." },
                { texto: "PASO 4 — Proceso de pago: una vez validada, el ciclo normal de pago es de 30 días calendario adicionales." },
                { texto: "PASO 5 — Conciliación: notas de crédito y ajustes por copagos, deducibles y coaseguros antes de cerrar la operación." },
              ],
            },
            {
              tipo: "parrafo",
              texto:
                "El ciclo total real —desde entrega hasta cobro— puede oscilar entre 35 y 55 días en condiciones normales, lo que genera una necesidad permanente y estructural de capital de trabajo.",
              afirmaciones: [
                {
                  texto: "El ciclo total de cobro oscila entre 35 y 55 días en condiciones normales.",
                  respaldo: {
                    tipo: "estimacion",
                    metodo: "Suma de los plazos de cada paso de la mecánica de pago del sector privado (pre-auth + validación 5–15 días + pago 30 días).",
                    fuentesBase: [{ titulo: "Brief estratégico SOC | TALENT (2026)", documento: "brief del cliente" }],
                  },
                },
              ],
            },
          ],
        },
      ],
    },

    // V — Panorama Bancario (p.10–13)
    {
      numero: "V",
      titulo: "Panorama Bancario: Líneas de Capital de Trabajo 25–35 M MXN (2026)",
      bloques: [],
      subsecciones: [
        {
          numero: "5.1",
          titulo: "Contexto de Tasas — TIIE de Fondeo (Marzo 2026)",
          bloques: [
            {
              tipo: "tabla",
              tabla: {
                columnas: ["Indicador", "Valor (18 mar 2026)"],
                filas: [
                  ["Tasa objetivo Banco de México", "7.00%"],
                  ["TIIE de fondeo a 1 día", "7.00%"],
                  ["TIIE 28 días", "7.28%"],
                  ["TIIE 91 días", "7.32%"],
                  ["TIIE 182 días", "7.39%"],
                  ["TIIE hace un año (18 mar 2025)", "9.50%"],
                  ["Reducción acumulada en 12 meses", "−250 puntos base"],
                ],
                fuentes: [{ titulo: "Banco de México — Sistema de Información Económica (SIE)", periodo: "18 de marzo de 2026", fechaAcceso: ACCESO }],
              },
            },
            {
              tipo: "parrafo",
              texto:
                "La reducción de 250 puntos base en 12 meses representa una mejora sustancial en el costo de financiamiento. Para una línea de $30 M MXN, equivale a un ahorro anual en intereses de aproximadamente $750,000 MXN frente a condiciones de hace un año.",
              afirmaciones: [
                {
                  texto: "Para una línea de $30 M MXN, la baja de tasas equivale a un ahorro anual de ~$750,000 MXN.",
                  respaldo: {
                    tipo: "estimacion",
                    metodo: "Reducción de 250 pb sobre $30 M MXN = $750,000 MXN/año.",
                    fuentesBase: [{ titulo: "Banco de México — SIE", periodo: "2026" }],
                  },
                },
              ],
            },
          ],
        },
        {
          numero: "5.3",
          titulo: "Tabla Comparativa Consolidada — Bancos",
          bloques: [
            {
              tipo: "tabla",
              tabla: {
                columnas: ["Banco", "Tasa Est. (TIIEF+)", "Comisión Apertura", "Plazo", "Factoraje", "Tiempo Aprobación", "Prioridad Estratégica"],
                filas: [
                  ["Mifel", "+4.5% – 6.5%", "1.5% – 2.0%", "12m renovable", "Sí / $30M MXN", "4–6 semanas", "★★★★★ PRIMERA"],
                  ["Banorte", "+4.5% – 7.0%", "Hasta 2.0%", "12–36m", "Sí", "Actualmente lento", "★★★ SEGUIMIENTO"],
                  ["Afirme", "N/D", "N/D", "N/D", "N/D", "Actualmente lento", "★★ SECUNDARIA"],
                  ["Santander", "+4.5% – 7.0%", "Variable", "12–36m", "Sí / $60M MXN", "6–8 semanas", "★★★★ SEGUNDA"],
                  ["BBVA", "+5.0% – 8.0%", "Desde 1.6%", "Hasta 36m", "Sí / $15M MXN", "6–10 semanas", "★★★ TERCERA"],
                  ["HSBC", "+5.5% – 9.0%", "Variable", "12–24m", "N/D explícito", "6–10 semanas", "★★ RESPALDO"],
                ],
                nota:
                  "Tasas son estimaciones de mercado basadas en publicaciones oficiales de cada banco y datos de Banorte (Anexo Comisiones mar. 2026). Las tasas exactas están sujetas al análisis de crédito individual de cada institución. TIIEF al 18/mar/2026 = 7.00%.",
                fuentes: [
                  { titulo: "mifel.com.mx/empresas/creditos" },
                  { titulo: "Banorte — Anexo de Comisiones Negocios y Empresas", periodo: "vigente al 9 de marzo de 2026" },
                  { titulo: "bbva.mx/empresas — Crédito Líquido Flex", periodo: "oct. 2025" },
                  { titulo: "santander.com.mx — Crédito Ágil PyME" },
                  { titulo: "empresas.hsbc.com.mx — Crédito Revolvente Empresarial" },
                ],
              },
            },
          ],
        },
      ],
    },

    // VIII — Casos Comparables y Benchmarks (p.18–19)
    {
      numero: "VIII",
      titulo: "Casos Comparables y Benchmarks del Sector",
      bloques: [],
      subsecciones: [
        {
          numero: "8.1",
          titulo: "Neolpharma — Financiamiento IFC / Banca Multilateral",
          bloques: [
            {
              tipo: "tabla",
              tabla: {
                columnas: ["Atributo", "Detalle"],
                filas: [
                  ["Empresa", "Neolpharma S.A. de C.V. — fabricante farmacéutico mexicano"],
                  ["Financiamiento recibido", "USD 30 millones en 2021 (IFC / International Finance Corporation)"],
                  ["Estructura", "USD 15 M convencional + USD 15 M concesionario (Programa de Financiamiento Combinado IFC–Canadá)"],
                  ["Relevancia para Probemedic", "La lógica es idéntica: una relación ancla verificable con un comprador de primer orden justifica financiamiento de mayor magnitud a tasa reducida"],
                ],
                fuentes: [{ titulo: "IFC — Neolpharma Case Study (PDF)", periodo: "2021", fechaAcceso: ACCESO }],
              },
            },
          ],
        },
        {
          numero: "8.3",
          titulo: "Benchmarks Operativos del Sector",
          bloques: [
            {
              tipo: "tabla",
              tabla: {
                columnas: ["Indicador", "Benchmark Sector", "Probemedic (Estimado)"],
                filas: [
                  ["Plazo de cobro a aseguradoras", "30–60 días", "~30 días (mejor que el promedio)"],
                  ["Razón capital de trabajo / ventas anuales necesaria", "8%–15%", "$24–45 M / $300 M ventas = 8%–15% ✓ en rango"],
                  ["Margen bruto distribución especialidad", "15%–25% (vs. 5%–12% genéricos)", "N/D — no divulgado; asumido superior por oncología"],
                  ["Cobertura de servicio de deuda estimada", "> 1.5x (requerimiento típico bancario)", "Con $300 M ventas y margen ~20%: $60 M EBITDA est. → cobertura holgada"],
                  ["Calificación de cartera CxC", "Investment grade si deudores son aseguradoras reguladas", "GNP, AXA, MetLife, SMNYL = investment grade implícito"],
                ],
              },
            },
            {
              tipo: "callout",
              variante: "nota",
              titulo: "Margen bruto — brecha",
              texto: "El margen bruto de distribución de especialidad de Probemedic no fue divulgado; se asume superior al promedio por su enfoque oncológico.",
              afirmaciones: [
                {
                  texto: "El margen bruto de Probemedic no fue divulgado.",
                  respaldo: { tipo: "brecha", motivo: "Dato no divulgado por el cliente.", recomendacion: "Solicitar el margen real para afinar la cobertura de servicio de deuda." },
                },
              ],
            },
          ],
        },
      ],
    },
  ],

  // ── RECOMENDACIONES DE FINANCIAMIENTO EMBEBIDAS (C-1) ─────────────────────
  // ids placeholder "soc_*" — el seed del Catálogo los resuelve a ids reales.
  recomendacionesFinanciamiento: [
    {
      necesidad: "Capital de trabajo para pago a laboratorio ancla",
      hallazgoOrigen: "Ciclo de capital de trabajo largo (35–55 días) + exigencia de carta compromiso del laboratorio.",
      productoId: "soc_mifel_credito_quirografario_revolvente",
      institucionId: "soc_mifel",
      productoNombre: "Línea de crédito quirografaria revolvente",
      institucionNombre: "Banco Mifel",
      montoPlazo: "$25 M – $50 M MXN · Revolvente / simple de corto plazo (12 meses renovable)",
      usoEspecifico: "Capital de trabajo permanente para pagar al laboratorio ancla sin depender del ciclo de cobro a aseguradoras.",
      requisitosClave: "Quirografaria con aval del dueño. Tiempo estimado de aprobación 4–6 semanas con expediente completo.",
      beneficioEsperado: "Habilita la carta compromiso bancaria → desbloqueo de cuotas de inventario del laboratorio.",
      inversionEstimada: "Tasa referencial TIIEF + 4.5% a TIIEF + 6.5% (≈ 11.5% – 13.5% anual); comisión de apertura 1.5% – 2.0%.",
    },
    {
      necesidad: "Aceleración del ciclo de cobro a aseguradoras",
      hallazgoOrigen: "CxC de aseguradoras de primer nivel (GNP, AXA, MetLife, SMNYL) = activos investment grade para factoraje.",
      productoId: "soc_finmedic_factoraje_salud",
      institucionId: "soc_finmedic",
      productoNombre: "Factoraje específico sector salud / aseguradoras",
      institucionNombre: "Finmedic (SOFOM)",
      montoPlazo: "Sujeto a cotización directa · Anticipo sobre CxC de aseguradoras",
      usoEspecifico: "Liquidez inmediata contra facturas emitidas; reduce el saldo utilizado de la línea revolvente conforme llegan cobros.",
      requisitosClave: "Cotización directa vía finmedic.mx (tasas no publicadas — brecha).",
      beneficioEsperado: "Acelera el ciclo de cobro de 35–55 días a 24–48 horas; opera en paralelo a la línea bancaria.",
      inversionEstimada: "~0.5%–1.0% cada 30 días ≈ 6%–12% anual sobre monto facturado (estimado).",
    },
    {
      necesidad: "Garantía comercial ante el laboratorio (no liquidez)",
      hallazgoOrigen: "El laboratorio ancla exige carta de respaldo financiero bancario como condición para asignar cuotas de inventario.",
      productoId: "soc_mifel_carta_compromiso",
      institucionId: "soc_mifel",
      productoNombre: "Carta Compromiso Bancaria / SBLC",
      institucionNombre: "Banco Mifel",
      montoPlazo: "12–24 meses · MXN o USD",
      usoEspecifico: "Habilitar la relación comercial con el laboratorio ancla — instrumento de garantía comercial, no de liquidez.",
      requisitosClave: "Requiere línea de crédito quirografaria activa. Iniciar con Carta Compromiso simple (5–10 días hábiles); escalar a SBLC formal solo si el laboratorio la rechaza.",
      beneficioEsperado: "Destrabe del inventario / cuotas del laboratorio.",
      inversionEstimada: "0.5%–1.5% anual sobre el monto de la carta (estimado).",
    },
  ],

  // ── X. BRECHAS DE INFORMACIÓN ─────────────────────────────────────────────
  brechas: [
    {
      tema: "Nombre del laboratorio ancla",
      descripcion: "No se divulgó en el brief. Los bancos podrán requerir validar la relación comercial directamente con el laboratorio.",
      recomendacion: "Probemedic debe identificar formalmente el laboratorio ancla antes de estructurar la carta compromiso.",
      severidad: "alta",
    },
    {
      tema: "Margen bruto de distribución",
      descripcion: "No divulgado; se asume superior al promedio (15%–25%) por el enfoque oncológico.",
      recomendacion: "Solicitar el margen real para afinar el cálculo de cobertura de servicio de deuda.",
      severidad: "media",
    },
    {
      tema: "Tasas de factoraje de Finmedic",
      descripcion: "Finmedic no publica tasas; requieren cotización directa.",
      recomendacion: "Contactar a Finmedic en paralelo a la gestión bancaria para obtener cotización formal.",
      severidad: "baja",
    },
  ],

  // ── ÍNDICE DE COBERTURA VERIFICADA (calculado por C-2) ────────────────────
  indiceCobertura: {
    totalAfirmaciones: 11,
    verificadas: 6,
    estimaciones: 3,
    brechas: 2,
    porcentajeCobertura: 54.5,
    verificadoEn: FECHA_REPORTE,
  },

  // ── XI. FUENTES Y REFERENCIAS (bibliografía consolidada) ──────────────────
  fuentes: [
    { titulo: "Data Bridge Market Research", periodo: "2025" },
    { titulo: "Maximize Market Research", periodo: "2024" },
    { titulo: "Roche México", periodo: "2022, 2024" },
    { titulo: "Grand View Research", periodo: "2022" },
    { titulo: "Novartis México", periodo: "2025" },
    { titulo: "Bristol Myers Squibb", periodo: "2025" },
    { titulo: "IFC — Neolpharma Case Study (PDF)", periodo: "2021" },
    { titulo: "CONDUSEF", periodo: "2016" },
    { titulo: "AMIS", periodo: "2021" },
    { titulo: "Banco de México — Sistema de Información Económica (SIE)", periodo: "18 de marzo de 2026" },
    { titulo: "Banco de México — Encuesta Trimestral de Evaluación Coyuntural del Mercado Crediticio", periodo: "Q2 2025 y Q4 2025 (El Economista, feb. 2026)" },
    { titulo: "mifel.com.mx/empresas/creditos" },
    { titulo: "Banorte — Anexo de Comisiones Negocios y Empresas", periodo: "marzo 2026" },
    { titulo: "bbva.mx/empresas — Crédito Líquido Flex; Carta de Crédito Standby", periodo: "oct. 2025" },
    { titulo: "santander.com.mx — Crédito Ágil PyME" },
    { titulo: "empresas.hsbc.com.mx — Crédito Revolvente Empresarial" },
    { titulo: "Xepelin", periodo: "2024" },
    { titulo: "Monex Grupo Financiero" },
    { titulo: "Finmedic.mx" },
    { titulo: "Extendeal", periodo: "2024" },
    { titulo: "Brief estratégico SOC | TALENT", periodo: "2026" },
  ],
};

export default reporteProbemedicSeed;
