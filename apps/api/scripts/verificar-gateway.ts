/**
 * verificar-gateway.ts — prueba de cableado REAL del proveedor de IA (D-6, E1-S4).
 *
 * Objetivo: demostrar que, con AI_GATEWAY_API_KEY presente, el camino
 * `ProveedorIAGateway.generarTexto` llega de verdad hasta el Vercel AI Gateway
 * (import real de `ai` + `@ai-sdk/gateway`, request HTTP real) — no solo que el
 * código typecheckea. Como NO tenemos una clave real de Carlos, usamos una
 * clave FALSA: si la petición de verdad llega al Gateway, este responde con un
 * `GatewayAuthenticationError` (401, mensaje "AI Gateway authentication
 * failed..."). Eso es lo más lejos que se puede probar sin una clave real.
 *
 * Uso:
 *   AI_GATEWAY_API_KEY=clave-falsa NODE_USE_ENV_PROXY=1 pnpm --filter @socrates/api exec \
 *     tsx scripts/verificar-gateway.ts
 *
 * NODE_USE_ENV_PROXY=1 es necesario en este entorno: hay un proxy HTTPS
 * corporativo (HTTPS_PROXY) y el `fetch` nativo de Node (usado por
 * @ai-sdk/provider-utils) sólo lo respeta con esa bandera (Node >= 22.21).
 *
 * IMPORTANTE — cómo se distingue "llegamos hasta la autenticación" de "el
 * proxy nos bloqueó antes de llegar": @ai-sdk/gateway tipa sus errores por
 * CLASE, no solo por mensaje. `asGatewayError()` (fuente del paquete instalado,
 * node_modules/@ai-sdk/gateway/dist/index.mjs) hace:
 *   - Si el fetch nunca obtuvo una respuesta HTTP real del Gateway (network
 *     error / conexión abortada), `error.statusCode` es `undefined` y el
 *     `response` que intenta parsear es `{}` ⇒ NO valida contra el schema de
 *     error del Gateway ⇒ cae al catch-all `GatewayResponseError` con mensaje
 *     genérico "Invalid error response format: Gateway request failed".
 *   - Si el Gateway SÍ respondió (aunque sea con 401), el body valida contra
 *     el schema ⇒ produce `GatewayAuthenticationError` (name exacto:
 *     "GatewayAuthenticationError", type "authentication_error", statusCode
 *     401, mensaje que empieza con "AI Gateway authentication failed").
 * Este script usa el `name`/`type` real del error (no un regex sobre el
 * mensaje) para no confundir ambos casos — un `console.warn` con la palabra
 * "invalid" en el wrapper genérico casi engañó a una versión anterior de este
 * mismo script.
 */
import { crearProveedorIA, MODELOS } from "../src/ia/proveedor-ia.ts";

/** Captura el objeto Error crudo que proveedor-ia.ts manda a console.warn. */
function capturarErrorReal<T>(fn: () => Promise<T>): Promise<{ resultado: T; errorCrudo: unknown }> {
  const original = console.warn;
  let errorCrudo: unknown;
  console.warn = (...args: unknown[]) => {
    // proveedor-ia.ts llama: console.warn("[ProveedorIA] ...", err)
    const posible = args[args.length - 1];
    if (posible instanceof Error) errorCrudo = posible;
    original(...args);
  };
  return fn()
    .then((resultado) => ({ resultado, errorCrudo }))
    .finally(() => {
      console.warn = original;
    });
}

function nombreCadenaCausas(err: unknown): string[] {
  const nombres: string[] = [];
  let actual: unknown = err;
  let vueltas = 0;
  while (actual && vueltas < 8) {
    if (actual instanceof Error) {
      nombres.push(`${actual.name}: ${actual.message.split("\n")[0]}`);
      actual = (actual as Error & { cause?: unknown }).cause;
    } else {
      break;
    }
    vueltas++;
  }
  return nombres;
}

async function main() {
  const clave = process.env.AI_GATEWAY_API_KEY;
  if (!clave || clave.trim() === "") {
    console.error(
      "AI_GATEWAY_API_KEY no está definida. Este script necesita una clave " +
        "(puede ser falsa) para forzar el camino ProveedorIAGateway — con la " +
        "variable vacía sólo se ejercita el fallback, que ya cubre el unit test.",
    );
    process.exit(2);
  }

  console.log(`[verificar-gateway] AI_GATEWAY_API_KEY presente (longitud ${clave.length}), creando proveedor…`);
  const proveedor = crearProveedorIA();
  console.log("[verificar-gateway] proveedor.disponible =", proveedor.disponible);

  if (!proveedor.disponible) {
    console.error("[verificar-gateway] esperaba disponible=true con clave presente; revisar crearProveedorIA().");
    process.exit(1);
  }

  console.log("[verificar-gateway] modelo:", MODELOS.estandar);
  console.log("[verificar-gateway] llamando generarTexto()… (esto hace la request HTTP real al Gateway)");

  const { resultado, errorCrudo } = await capturarErrorReal(() =>
    proveedor.generarTexto({ prompt: "Di 'hola' en una palabra.", modelo: MODELOS.estandar }),
  );

  console.log("[verificar-gateway] resultado (contrato ResultadoGenerarTexto):", JSON.stringify(resultado, null, 2));
  if (errorCrudo instanceof Error) {
    console.log("[verificar-gateway] cadena de causas del error crudo:", nombreCadenaCausas(errorCrudo));
  }

  if (resultado.ok) {
    // Con una clave FALSA esto no debería pasar nunca. Si pasa, algo está mal
    // (¿el Gateway no está validando la clave? ¿estamos pegándole a un mock?).
    console.error(
      "[verificar-gateway] INESPERADO: la llamada tuvo éxito con una clave falsa. " +
        "Eso no demuestra el cableado de autenticación — investigar.",
    );
    process.exit(1);
  }

  if (resultado.motivo !== "fallo_temporal") {
    console.error(`[verificar-gateway] motivo inesperado: ${resultado.motivo} (se esperaba fallo_temporal)`);
    process.exit(1);
  }

  // Clasificación por CLASE real del error (ver comentario del módulo), no por
  // regex sobre el mensaje — el wrapper genérico de fallo de red también
  // contiene palabras como "invalid", lo cual produce falsos positivos si solo
  // se mira el texto.
  const nombreGateway = errorCrudo instanceof Error ? errorCrudo.name : undefined;
  const esErrorAutenticacionReal = nombreGateway === "GatewayAuthenticationError";
  const esWrapperDeRedSinRespuesta = nombreGateway === "GatewayResponseError";
  const statusCode =
    errorCrudo && typeof errorCrudo === "object" && "statusCode" in errorCrudo
      ? (errorCrudo as { statusCode?: unknown }).statusCode
      : undefined;

  console.log("");
  console.log("=== Veredicto ===");
  if (esErrorAutenticacionReal) {
    console.log(
      `✅ El Gateway respondió de verdad con GatewayAuthenticationError (statusCode=${statusCode}). ` +
        "Esto demuestra que la petición llegó hasta la autenticación del Vercel AI " +
        "Gateway usando `ai` + `@ai-sdk/gateway` instalados de verdad — es lo más " +
        "lejos que se puede llegar sin una AI_GATEWAY_API_KEY real; con una clave " +
        "real el siguiente paso (no cubierto aquí) sería una respuesta 200 con " +
        "texto generado.",
    );
    process.exit(0);
  } else if (esWrapperDeRedSinRespuesta) {
    console.log(
      "⚠️ El error es un GatewayResponseError genérico (statusCode=" +
        `${statusCode}, sin body de error real que validar) — @ai-sdk/gateway cae ` +
        "ahí cuando el fetch NUNCA obtuvo una respuesta HTTP del Gateway (fallo de " +
        "red/proxy antes de que el servidor de Vercel llegara a evaluar la clave). " +
        "En ESTE entorno confirmamos la causa exacta por separado: el proxy " +
        "corporativo (ver /root/.ccr/README.md) devuelve 403 al intentar el CONNECT " +
        "a ai-gateway.vercel.sh:443 (política de egress bloquea ese host — " +
        "confirmado con `curl` directo al proxy y visible en " +
        "`GET /__agentproxy/status` → recentRelayFailures). Por eso el fetch nativo " +
        "de Node reporta 'Request was cancelled' / RequestAbortedError en la cadena " +
        "de causas de arriba. CONCLUSIÓN HONESTA: en este entorno NO se puede " +
        "demostrar que la petición llegue hasta la autenticación del Gateway — el " +
        "bloqueo de política de egress ocurre antes. Lo que SÍ queda demostrado es " +
        "que el código real de `ai` + `@ai-sdk/gateway` (paquetes instalados, sin " +
        "especificador variable) se ejecuta, arma la request y la intenta contra " +
        "https://ai-gateway.vercel.sh — el import y el cableado son reales, solo la " +
        "red de este entorno no deja completar la ida y vuelta. No se puede llegar " +
        "más lejos sin cambiar la política de egress o correr esto fuera de este " +
        "entorno.",
    );
    process.exit(3);
  } else {
    console.log(
      `❓ Error de una clase no reconocida por este script (name=${nombreGateway ?? "desconocido"}). ` +
        "Ver 'resultado.detalle' y la cadena de causas arriba para diagnosticar a mano.",
    );
    process.exit(4);
  }
}

main().catch((err) => {
  console.error("[verificar-gateway] excepción no manejada (no debería pasar; generarTexto() no debe lanzar):", err);
  process.exit(1);
});
