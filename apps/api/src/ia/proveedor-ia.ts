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
import type { ProveedorIA, MensajeChatIA } from "@socrates/shared";

/** Re-exportamos para que las rutas lo usen sin importar shared directamente. */
export type { MensajeChatIA };

/** Modelos por defecto, por nivel de riesgo (configurable por env). */
export const MODELOS = {
  pesado: process.env.MODELO_PESADO ?? "anthropic/claude-opus-4.6",
  estandar: process.env.MODELO_ESTANDAR ?? "anthropic/claude-sonnet-4.6",
  mecanico: process.env.MODELO_MECANICO ?? "anthropic/claude-haiku-4.5",
} as const;

/** System prompt de Sócrates para el chat con el Asesor. */
const SYSTEM_SOCRATES = `Eres Sócrates, el gerente de un equipo de agentes de inteligencia financiera al servicio de un asesor de SOC | TALENT.
Tu voz es cálida, clara y de oficina: hablas en español sin jerga técnica. Eres el punto de contacto del asesor; escuchas, priorizas y delegas.
Tu equipo es:
  • El Prospector — identifica y cualifica oportunidades de venta.
  • El Investigador — analiza empresas y elabora reportes de inteligencia.
  • El Asesor de producto — recomienda los mejores productos financieros del catálogo SOC.
  • El Negociador — prepara guiones y argumentos de cierre.
  • El Tramitador — gestiona el proceso de solicitud y documentación.
  • El Gestor — da seguimiento post-venta y cultiva la relación con el cliente.
Cuando el asesor te pide algo, confirmas que lo entendiste, le dices a quién del equipo se lo encargarás y cuál es el siguiente paso concreto. Sé breve: dos o tres oraciones como máximo.`;

class ProveedorIAFallback implements ProveedorIA {
  readonly disponible = false;
  async generarTexto(): Promise<string> {
    // En modo sin claves los empleados NO deberían llamar esto; si lo hacen,
    // devolvemos una señal honesta en lugar de tronar.
    return "[sin conexión para investigación en vivo]";
  }

  async chatear(historial: MensajeChatIA[]): Promise<string> {
    // Fallback cálido: Sócrates acusa recibo y ofrece el siguiente paso.
    const ultimoMensaje = historial.filter((m) => m.rol === "USUARIO").at(-1);
    const texto = ultimoMensaje?.contenido ?? "";
    if (!texto) {
      return "Aquí estoy. ¿En qué te puedo ayudar hoy?";
    }
    const resumen = texto.length > 60 ? texto.slice(0, 57) + "..." : texto;
    return (
      `Recibí tu mensaje: "${resumen}". ` +
      `Hoy no tengo conexión con el equipo de IA, pero en cuanto esté disponible, ` +
      `le encargaré esto al integrante más adecuado de tu equipo y te aviso. ` +
      `¿Hay algo más urgente en lo que pueda orientarte mientras tanto?`
    );
  }
}

class ProveedorIAGateway implements ProveedorIA {
  readonly disponible = true;
  constructor(private readonly apiKey: string) {}

  private async _gateway() {
    const { generateText } = await import("ai");
    const gatewayPkg = "@ai-sdk/gateway";
    const { createGateway } = (await import(gatewayPkg)) as {
      createGateway: (cfg: { apiKey: string }) => (modelo: string) => unknown;
    };
    const gateway = createGateway({ apiKey: this.apiKey });
    return { generateText, gateway };
  }

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
      const { generateText, gateway } = await this._gateway();
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

  async chatear(historial: MensajeChatIA[], modelo?: string): Promise<string> {
    try {
      const { generateText, gateway } = await this._gateway();
      const messages = historial.map((m) => ({
        role: (m.rol === "USUARIO" ? "user" : "assistant") as "user" | "assistant",
        content: m.contenido,
      }));
      const { text } = await generateText({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        model: gateway(modelo ?? MODELOS.estandar) as never,
        system: SYSTEM_SOCRATES,
        messages,
      });
      return text;
    } catch (err) {
      console.warn("[ProveedorIA] chat falló, devolviendo fallback cálido:", err);
      const fallback = new ProveedorIAFallback();
      return fallback.chatear(historial);
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
