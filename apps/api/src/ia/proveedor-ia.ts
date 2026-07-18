/**
 * proveedor-ia.ts — wrapper ÚNICO de IA (D-6, E1-S4).
 *
 * Envuelve el AI SDK (`generateText`) hablando DIRECTO con la API de Anthropic
 * (Claude Console) vía `@ai-sdk/anthropic` — sin intermediario de facturación.
 * Toda llamada a IA pasa por aquí (regla §5.5 #4) para que el fallback sea
 * uniforme.
 *
 * Versiones verificadas contra el paquete instalado en este repo (no de
 * memoria): `ai@^5.0.210` + `@ai-sdk/anthropic@^2.0.85`, ambos sobre
 * LanguageModelV2.
 *
 * MODO SIN CLAVES (NFR-11): si falta ANTHROPIC_API_KEY, `disponible = false` y
 * los empleados caen a su ruta de seed/bloqueo digno. NUNCA burbujea un 500 crudo.
 *
 * NFR-1: los fallos regresan { ok: false, motivo, detalle? } — nunca strings
 * "-centinela" indistinguibles de texto generado (ver ResultadoGenerarTexto).
 */
import type {
  ProveedorIA,
  ResultadoGenerarTexto,
  MensajeChatIA,
} from "@socrates/shared";

/** Modelos por defecto, por nivel de riesgo (configurable por env). */
export const MODELOS = {
  pesado: process.env.MODELO_PESADO ?? "claude-opus-4-1-20250805",
  estandar: process.env.MODELO_ESTANDAR ?? "claude-sonnet-4-5-20250929",
  mecanico: process.env.MODELO_MECANICO ?? "claude-haiku-4-5-20251001",
} as const;

/**
 * Instrucción de sistema para Sócrates en el chat con el Asesor (Sesiones).
 * Voz de oficina, cero jerga técnica (NFR-14), es-MX (NFR-12). Sócrates escucha,
 * prioriza y delega — no ejecuta solo (§4.1 del PRD).
 */
const SISTEMA_SOCRATES = `Eres Sócrates, el gerente del equipo de la oficina de un asesor de crédito en México.
Tu voz es cálida, clara y de oficina: hablas en español de México, sin jerga técnica. Eres el punto de contacto del asesor; escuchas, priorizas y delegas.
Tu equipo es:
  • El Prospector — identifica y califica oportunidades de venta.
  • El Investigador — analiza empresas y arma su reporte de inteligencia financiera, con fuentes.
  • El Asesor de producto — recomienda el mejor financiamiento del catálogo SOC para cada necesidad.
  • El Negociador — prepara guiones, argumentos y manejo de objeciones.
  • El Tramitador — reúne requisitos y arma la cotización estimada.
  • El Gestor — da seguimiento, cierra y acompaña en la postventa.
Cuando el asesor te pide algo, confirmas que lo entendiste, le dices a quién del equipo se lo encargarías y cuál es el siguiente paso concreto. Si algo es ambiguo, haces UNA sola pregunta para aclararlo, sin inventar. Sé breve: dos o tres oraciones como máximo.`;

class ProveedorIAFallback implements ProveedorIA {
  readonly disponible = false;
  async generarTexto(): Promise<ResultadoGenerarTexto> {
    // En modo sin claves los empleados NO deberían llamar esto; si lo hacen,
    // el caller debe revisar `ok` y caer a su ruta de seed (NFR-11).
    return { ok: false, motivo: "sin_claves" };
  }

  async chatear(): Promise<ResultadoGenerarTexto> {
    // Sin claves no hay conversación en vivo: la RUTA revisa `ok` y persiste un
    // acuse honesto en voz de Sócrates (nunca un string-centinela — NFR-1).
    return { ok: false, motivo: "sin_claves" };
  }
}

/**
 * Una llave rechazada por Anthropic es permanente (401/403 — avisar a Carlos),
 * no "temporal": distinguirla evita que un caller reintente contra un error
 * eterno. El AI SDK expone `APICallError` con `statusCode` en el error.
 */
function esClaveInvalida(err: unknown): boolean {
  if (err && typeof err === "object" && "statusCode" in err) {
    const codigo = (err as { statusCode?: unknown }).statusCode;
    return codigo === 401 || codigo === 403;
  }
  return false;
}

class ProveedorIAAnthropic implements ProveedorIA {
  readonly disponible = true;
  private readonly apiKey: string;

  // Sin parameter properties: `node --test --experimental-strip-types` corre en
  // modo "strip-only" y no transforma esa azúcar sintáctica de TS (solo la
  // quita), así que un `constructor(private readonly apiKey: string) {}` truena
  // con ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX en cuanto un test importa este módulo.
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generarTexto(opts: {
    sistema?: string;
    prompt: string;
    modelo?: string;
  }): Promise<ResultadoGenerarTexto> {
    try {
      // Importación diferida (solo cuando hay clave y de verdad se invoca) pero
      // de especificadores literales — el paquete SÍ está instalado.
      const { generateText } = await import("ai");
      const { createAnthropic } = await import("@ai-sdk/anthropic");
      const anthropic = createAnthropic({ apiKey: this.apiKey });
      const { text } = await generateText({
        model: anthropic(opts.modelo ?? MODELOS.estandar),
        system: opts.sistema,
        prompt: opts.prompt,
      });
      return { ok: true, texto: text };
    } catch (err) {
      // Cualquier fallo de red/IA se traduce a señal manejable (nunca 500 crudo,
      // nunca un string-centinela indistinguible de texto real — NFR-1).
      console.warn("[ProveedorIA] llamada falló, devolviendo señal de fallback:", err);
      return {
        ok: false,
        motivo: esClaveInvalida(err) ? "clave_invalida" : "fallo_temporal",
        detalle: err instanceof Error ? err.message : String(err), // solo logs
      };
    }
  }

  async chatear(
    historial: MensajeChatIA[],
    modelo?: string,
  ): Promise<ResultadoGenerarTexto> {
    try {
      const { generateText } = await import("ai");
      const { createAnthropic } = await import("@ai-sdk/anthropic");
      const anthropic = createAnthropic({ apiKey: this.apiKey });
      const messages = historial.map((m) => ({
        role: (m.rol === "USUARIO" ? "user" : "assistant") as
          | "user"
          | "assistant",
        content: m.contenido,
      }));
      const { text } = await generateText({
        model: anthropic(modelo ?? MODELOS.estandar),
        system: SISTEMA_SOCRATES,
        messages,
      });
      return { ok: true, texto: text };
    } catch (err) {
      // Mismo contrato que generarTexto: fallo estructurado, jamás string-centinela.
      console.warn("[ProveedorIA] chat falló, devolviendo señal de fallback:", err);
      return {
        ok: false,
        motivo: esClaveInvalida(err) ? "clave_invalida" : "fallo_temporal",
        detalle: err instanceof Error ? err.message : String(err), // solo logs
      };
    }
  }
}

/**
 * Crea el proveedor de IA según el entorno.
 * Sin ANTHROPIC_API_KEY ⇒ fallback (modoSinClaves).
 */
export function crearProveedorIA(): ProveedorIA {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    return new ProveedorIAFallback();
  }
  return new ProveedorIAAnthropic(apiKey);
}

/** ¿Estamos en Modo sin claves de IA? (para el ctx de los empleados). */
export function esModoSinClaves(): boolean {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  return !apiKey || apiKey.trim() === "";
}
