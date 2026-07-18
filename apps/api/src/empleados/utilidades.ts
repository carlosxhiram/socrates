/**
 * utilidades.ts — lo común entre los 5 empleados que NO son el Investigador:
 * una llamada de IA que produce un EntregableGenericoV1, con UN reintento si
 * el JSON no parsea o no valida (le manda el motivo como retroalimentación).
 *
 * NFR-1: si la IA no responde `ok` (sin_claves/clave_invalida/fallo_temporal),
 * no tiene caso reintentar aquí — el caller decide el bloqueo digno.
 */
import { z } from "zod";
import type { ProveedorIA, ProductoCatalogo } from "@socrates/shared";

export const BLOQUEO_SIN_SERVICIO = {
  motivo: "La oficina aún no tiene el servicio de inteligencia contratado. En cuanto esté activo, retomo este encargo.",
};

export const BLOQUEO_SIN_RESULTADO = {
  motivo: "No logré armar el entregable con la información disponible; puedes reintentarlo.",
};

/** El AI SDK a veces envuelve el JSON en fences de markdown; los quita si están. */
export function limpiarFencesJSON(texto: string): string {
  const match = texto.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  return (match?.[1] ?? texto).trim();
}

/**
 * Le pide a `ia` un JSON que cumpla `schema`, con UN reintento si el primero
 * no parsea/valida. Nunca lanza: si ambos intentos fallan (o la IA no está
 * disponible), devuelve null.
 */
export async function generarJSONValidado<T>(
  ia: ProveedorIA,
  sistema: string,
  prompt: string,
  // Input fijo en `any` (no el default Output=Input de ZodType): así T se
  // infiere SIEMPRE del tipo de SALIDA (con los .default() ya resueltos, p.ej.
  // FodaSchema's arrays quedan requeridas), no de la forma de entrada
  // pre-parseo — que es la que TS usaría por defecto y rompería el .foda.*.
  schema: z.ZodType<T, z.ZodTypeDef, any>,
): Promise<T | null> {
  let retro: string | undefined;
  for (let intento = 0; intento < 2; intento++) {
    const promptFinal = retro
      ? `${prompt}\n\nTu intento anterior no cumplió el formato exacto (${retro}). Corrígelo y responde de nuevo ÚNICAMENTE el JSON.`
      : prompt;
    const resultado = await ia.generarTexto({ sistema, prompt: promptFinal });
    if (!resultado.ok) return null;
    try {
      const bruto = JSON.parse(limpiarFencesJSON(resultado.texto));
      return schema.parse(bruto);
    } catch (err) {
      retro = err instanceof Error ? err.message.slice(0, 300) : String(err).slice(0, 300);
    }
  }
  return null;
}

/**
 * El bloque de instrucciones de formato compartido por los 5 empleados
 * genéricos: la forma EXACTA del JSON que deben producir (EntregableGenericoV1).
 */
export function instruccionesFormatoGenerico(tipo: string): string {
  return `Responde ÚNICAMENTE un objeto JSON (sin texto antes ni después, sin fences de markdown) con esta forma EXACTA:
{
  "esquema": "entregable-generico",
  "version": 1,
  "tipo": "${tipo}",
  "titulo": "string",
  "subtitulo": "string (opcional, puedes omitirlo)",
  "resumen": ["2 a 4 frases ejecutivas, lo primero que lee el asesor"],
  "secciones": [
    {
      "titulo": "string",
      "bloques": [
        { "tipo": "parrafo", "texto": "string", "afirmaciones": [] },
        { "tipo": "lista", "estilo": "vinetas", "items": [{ "texto": "string", "afirmaciones": [] }] },
        { "tipo": "callout", "variante": "recomendacion", "titulo": "string (opcional)", "texto": "string", "afirmaciones": [] }
      ]
    }
  ],
  "recomendacionesFinanciamiento": [],
  "brechas": [{ "tema": "string", "descripcion": "string", "recomendacion": "string (opcional)", "severidad": "media" }],
  "fuentes": []
}
Reglas del formato:
- Cada bloque necesita su "tipo" literal exacto: "parrafo", "lista" (estilo "vinetas" o "pasos"), "tabla" (con {"tabla":{"columnas":[...],"filas":[[...]],"fuentes":[]}}), o "callout" (variante "implicacion"|"recomendacion"|"advertencia"|"nota"). No inventes otros tipos de bloque.
- El array "afirmaciones" de cada bloque va vacío salvo que cites un dato externo verificable — en ese caso agrega {"texto":"...", "respaldo": {"tipo":"estimacion","metodo":"tu razonamiento","fuentesBase":[]}}. NUNCA inventes una fuente real que no tengas (di "estimacion", nunca "fuente" sin URL verdadera).
- "brechas": lo que el asesor debería conseguir del cliente para completar el trabajo (información no divulgada, honesto).
- Si el encargo no trae "recomendacionesFinanciamiento" (solo el Asesor de producto las llena), deja ese array vacío.
- Español de México impecable, sin jerga técnica: escribe como lo escribiría un consultor senior de crédito empresarial, no una máquina.`;
}

/**
 * Los productos del catálogo REAL en texto plano para el prompt (C-1): la IA
 * solo puede citar los ids LITERALES de esta lista, nunca inventar los propios.
 * Usado por El Asesor de producto y por El Investigador (fase de matcheo).
 */
export function listadoCatalogoParaPrompt(productos: ProductoCatalogo[]): string {
  return productos
    .map(
      (p) =>
        `- productoId="${p.id}" institucionId="${p.institucionId}" institucion="${p.institucionNombre}" nombre="${p.nombre}" tipo="${p.tipo}" paraQueSirve="${p.paraQueSirve}" cuandoRecomendar=${JSON.stringify(p.cuandoRecomendar)} condiciones="${p.condiciones}"`,
    )
    .join("\n");
}
