/**
 * catalogo.ts — leer el Catálogo SOC (FR-19).
 * Para UI/curaduría. Las condiciones se guardan como JSON serializado; se parsean
 * aquí para devolverlas estructuradas.
 */
import { Hono } from "hono";
import { prisma } from "@socrates/db";
import type { AuthedVars } from "../middleware/auth.js";
import { requiereSuscripcion } from "../middleware/suscripcion.js";

export const catalogoRouter = new Hono<{ Variables: AuthedVars }>();
catalogoRouter.use("*", requiereSuscripcion);

function parsearJSON<T>(valor: string, fallback: T): T {
  try {
    return JSON.parse(valor) as T;
  } catch {
    return fallback;
  }
}

catalogoRouter.get("/instituciones", async (c) => {
  const instituciones = await prisma.institucion.findMany({
    include: { productos: true },
    orderBy: { nombre: "asc" },
  });
  return c.json(
    instituciones.map((i) => ({
      id: i.id,
      nombre: i.nombre,
      tipo: i.tipo,
      cobertura: i.cobertura,
      productos: i.productos.map((p) => ({
        id: p.id,
        nombre: p.nombre,
        tipo: p.tipo,
        paraQueSirve: p.paraQueSirve,
        cuandoRecomendar: parsearJSON<string[]>(p.cuandoRecomendar, []),
        condiciones: parsearJSON<Record<string, unknown>>(p.condiciones, {}),
      })),
    })),
  );
});
