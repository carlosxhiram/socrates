/**
 * proveedor-ia.ts — wrapper ÚNICO de IA (D-6, E1-S4).
 *
 * Envuelve el AI SDK (`generateText`) apuntando al Vercel AI Gateway con strings
 * "anthropic/claude-*". Toda llamada a IA pasa por aquí (regla §5.5 #4) para que
 * el fallback sea uniforme.
 *
 * Versiones verificadas contra el registro npm (ver commit): `ai@^5.0.210` +
 * `@ai-sdk/gateway@^2.0.109` (ambos publicados en pareja bajo el dist-tag
 * "ai-v5"; ai@^4.x usa el spec LanguageModelV1 y NINGUNA versión publicada de
 * @ai-sdk/gateway lo soporta — todas están en LanguageModelV2+ — así que la
 * combinación previa (`ai@^4.3` + import diferido de `@ai-sdk/gateway`) nunca
 * pudo funcionar en runtime).
 *
 * MODO SIN CLAVES (NFR-11): si falta AI_GATEWAY_API_KEY, `disponible = false` y
 * los empleados caen a su ruta de seed. NUNCA burbujea un 500 crudo.
 *
 * NFR-1: los fallos regresan { ok: false, motivo, detalle? } — nunca strings
 * "-centinela" indistinguibles de texto generado (ver ResultadoGenerarTexto).
 */
import type { ProveedorIA, ResultadoGenerarTexto } from "@socrates/shared";

/** Modelos por defecto, por nivel de riesgo (configurable por env). */
export const MODELOS = {
  pesado: process.env.MODELO_PESADO ?? "anthropic/claude-opus-4.6",
  estandar: process.env.MODELO_ESTANDAR ?? "anthropic/claude-sonnet-4.6",
  mecanico: process.env.MODELO_MECANICO ?? "anthropic/claude-haiku-4.5",
} as const;

class ProveedorIAFallback implements ProveedorIA {
  readonly disponible = false;
  async generarTexto(): Promise<ResultadoGenerarTexto> {
    // En modo sin claves los empleados NO deberían llamar esto; si lo hacen,
    // el caller debe revisar `ok` y caer a su ruta de seed (NFR-11).
    return { ok: false, motivo: "sin_claves" };
  }
}

class ProveedorIAGateway implements ProveedorIA {
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
      // de especificadores literales — el paquete SÍ está instalado, esto ya NO
      // es un import "opcional" por especificador variable.
      const { generateText } = await import("ai");
      const { createGateway } = await import("@ai-sdk/gateway");
      const gateway = createGateway({ apiKey: this.apiKey });
      const { text } = await generateText({
        model: gateway(opts.modelo ?? MODELOS.estandar),
        system: opts.sistema,
        prompt: opts.prompt,
      });
      return { ok: true, texto: text };
    } catch (err) {
      // Cualquier fallo de red/IA se traduce a señal manejable (nunca 500 crudo,
      // nunca un string-centinela indistinguible de texto real — NFR-1).
      console.warn("[ProveedorIA] llamada falló, devolviendo señal de fallback:", err);
      // Una llave rechazada es permanente (avisar a Carlos), no "temporal":
      // distinguirla evita que un caller reintente contra un 401 eterno.
      const { GatewayAuthenticationError } = await import("@ai-sdk/gateway");
      const esClaveInvalida = GatewayAuthenticationError.isInstance(err);
      return {
        ok: false,
        motivo: esClaveInvalida ? "clave_invalida" : "fallo_temporal",
        detalle: err instanceof Error ? err.message : String(err), // solo logs
      };
    }
  }
}

/**
 * Crea el proveedor de IA según el entorno.
 * Sin AI_GATEWAY_API_KEY ⇒ fallback (modoSinClaves).
 */
export function crearProveedorIA(): ProveedorIA {
  const apiKey = process.env.AI_GATEWAY_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    return new ProveedorIAFallback();
  }
  return new ProveedorIAGateway(apiKey);
}

/** ¿Estamos en Modo sin claves de IA? (para el ctx de los empleados). */
export function esModoSinClaves(): boolean {
  const apiKey = process.env.AI_GATEWAY_API_KEY;
  return !apiKey || apiKey.trim() === "";
}
