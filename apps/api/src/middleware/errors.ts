/**
 * errors.ts — manejo uniforme de errores (D-10).
 * Forma: { error: { codigo, mensaje } } con `mensaje` en español de oficina.
 */
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";

export function manejadorErrores(err: Error, c: Context) {
  if (err instanceof HTTPException) {
    const res = err.getResponse();
    return res;
  }
  console.error("[api] error no manejado:", err);
  return c.json(
    {
      error: {
        codigo: "ERROR_INTERNO",
        mensaje: "Algo salió mal de nuestro lado. Inténtalo de nuevo en un momento.",
      },
    },
    500,
  );
}
