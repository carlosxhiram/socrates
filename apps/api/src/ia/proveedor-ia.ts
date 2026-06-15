/**
 * proveedor-ia.ts — wrapper ÚNICO de IA (D-6, E1-S4).
 *
 * Envuelve el AI SDK (`generateText`) apuntando al Vercel AI Gateway con strings
 * "anthropic/claude-*". Toda llamada a IA pasa por aquí (regla §5.5 #4) para que
 * el fallback sea uniforme.
 *
 * MODO SIN CLAVES (NFR-11): si falta AI_GATEWAY_API_KEY, `disponible = false` y
 * los empleados caen a su ruta de seed. NUNCA burbujea un 500 crudo.
 */
import type { ProveedorIA } from "@socrates/shared";

/** Modelos por defecto, por nivel de riesgo (configurable por env). */
export const MODELOS = {
  pesado: process.env.MODELO_PESADO ?? "anthropic/claude-opus-4.6",
  estandar: process.env.MODELO_ESTANDAR ?? "anthropic/claude-sonnet-4.6",
  mecanico: process.env.MODELO_MECANICO ?? "anthropic/claude-haiku-4.5",
} as const;

class ProveedorIAFallback implements ProveedorIA {
  readonly disponible = false;
  async generarTexto(): Promise<string> {
    // En modo sin claves los empleados NO deberían llamar esto; si lo hacen,
    // devolvemos una señal honesta en lugar de tronar.
    return "[sin conexión para investigación en vivo]";
  }
}

class ProveedorIAGateway implements ProveedorIA {
  readonly disponible = true;
  constructor(private readonly apiKey: string) {}

  async generarTexto(opts: {
    sistema?: string;
    prompt: string;
    modelo?: string;
  }): Promise<string> {
    try {
      // Importación diferida del AI SDK (solo cuando hay clave). El proveedor del
      // Gateway (`@ai-sdk/gateway`, `createGateway`) se carga por especificador
      // variable para no acoplar el typecheck del arranque sin claves a un paquete
      // opcional; cuando Carlos pegue la clave, se instala `@ai-sdk/gateway` y este
      // camino queda activo (arquitectura D-6).
      const { generateText } = await import("ai");
      const gatewayPkg = "@ai-sdk/gateway";
      const { createGateway } = (await import(gatewayPkg)) as {
        createGateway: (cfg: { apiKey: string }) => (modelo: string) => unknown;
      };
      const gateway = createGateway({ apiKey: this.apiKey });
      const { text } = await generateText({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        model: gateway(opts.modelo ?? MODELOS.estandar) as never,
        system: opts.sistema,
        prompt: opts.prompt,
      });
      return text;
    } catch (err) {
      // Cualquier fallo de red/IA se traduce a señal manejable (nunca 500 crudo).
      console.warn("[ProveedorIA] llamada falló, devolviendo señal de fallback:", err);
      return "[no fue posible completar la consulta de investigación]";
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
