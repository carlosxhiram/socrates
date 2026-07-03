/**
 * validacion.ts — zValidator con el contrato de error de la casa (D-10).
 *
 * El default de @hono/zod-validator responde el ZodError crudo (inglés, shape
 * ajeno). Este wrapper devuelve 400 { error: { codigo, mensaje } } con los
 * mensajes de los esquemas Zod compartidos (ya en español de oficina).
 */
import { zValidator } from "@hono/zod-validator";
import type { ZodSchema } from "zod";

export function validarJson<T extends ZodSchema>(schema: T) {
  return zValidator("json", schema, (resultado, c) => {
    if (!resultado.success) {
      const detalles = resultado.error.issues
        .map((issue) => {
          const campo = issue.path.join(".");
          // Los esquemas compartidos traen mensajes propios en español; los
          // genéricos de Zod se sustituyen por una frase de oficina.
          const mensaje = /required|invalid|expected/i.test(issue.message)
            ? "revisa este dato"
            : issue.message;
          return campo ? `${campo}: ${mensaje}` : mensaje;
        })
        .join(" · ");
      return c.json(
        {
          error: {
            codigo: "DATOS_INVALIDOS",
            mensaje: `No pude guardar: ${detalles}`,
          },
        },
        400,
      );
    }
  });
}
