/**
 * entregables.ts — ver y aprobar Entregables (FR-6, FR-13 parcial).
 *
 * En E1 se entregan: ver el Entregable (última versión) y el Gate humano
 * (aprobar). El editar/exportar pleno llega en E4. Toda lectura filtra por
 * tenencia (§5.5 #1); el export verificará APROBADO en el servidor (C-3).
 */
import { Hono } from "hono";
import { prisma } from "@socrates/db";
import type { AuthedVars } from "../middleware/auth.js";

export const entregablesRouter = new Hono<{ Variables: AuthedVars }>();

/** Verifica que el Entregable pertenezca al Asesor; devuelve el registro o null. */
async function cargarConTenencia(entregableId: string, asesorId: string) {
  const ent = await prisma.entregable.findUnique({
    where: { id: entregableId },
    include: { expediente: { select: { asesorId: true, empresa: true } } },
  });
  if (!ent) return { estado: "NO_EXISTE" as const };
  if (ent.expediente.asesorId !== asesorId) return { estado: "AJENO" as const };
  return { estado: "OK" as const, ent };
}

// ── GET /entregables/:id — ver (última versión) ──────────────────────────────
entregablesRouter.get("/:id", async (c) => {
  const asesorId = c.get("asesorId");
  const id = c.req.param("id");
  const res = await cargarConTenencia(id, asesorId);
  if (res.estado === "NO_EXISTE") {
    return c.json({ error: { codigo: "NO_EXISTE", mensaje: "No encontré ese entregable." } }, 404);
  }
  if (res.estado === "AJENO") {
    return c.json({ error: { codigo: "AJENO", mensaje: "Ese entregable no es tuyo." } }, 403);
  }

  const version = await prisma.entregableVersion.findFirst({
    where: { entregableId: id, version: res.ent.versionActual },
  });
  let contenido: unknown = null;
  if (version) {
    try {
      contenido = JSON.parse(version.contenido);
    } catch {
      contenido = null;
    }
  }

  return c.json({
    id: res.ent.id,
    tipo: res.ent.tipo,
    estado: res.ent.estado,
    empleadoRol: res.ent.empleadoRol,
    versionActual: res.ent.versionActual,
    empresa: res.ent.expediente.empresa,
    expedienteId: res.ent.expedienteId,
    contenido,
  });
});

// ── POST /entregables/:id/aprobar — Gate humano (FR-13, NFR-4) ───────────────
entregablesRouter.post("/:id/aprobar", async (c) => {
  const asesorId = c.get("asesorId");
  const id = c.req.param("id");
  const res = await cargarConTenencia(id, asesorId);
  if (res.estado === "NO_EXISTE") {
    return c.json({ error: { codigo: "NO_EXISTE", mensaje: "No encontré ese entregable." } }, 404);
  }
  if (res.estado === "AJENO") {
    return c.json({ error: { codigo: "AJENO", mensaje: "Ese entregable no es tuyo." } }, 403);
  }

  // Idempotente: aprobar dos veces no crea dos versiones.
  if (res.ent.estado === "APROBADO") {
    return c.json({ id: res.ent.id, estado: "APROBADO", yaEstaba: true });
  }

  await prisma.$transaction([
    prisma.entregable.update({ where: { id }, data: { estado: "APROBADO" } }),
    prisma.entregableVersion.updateMany({
      where: { entregableId: id, version: res.ent.versionActual },
      data: { aprobado: true },
    }),
  ]);

  return c.json({ id, estado: "APROBADO", yaEstaba: false });
});
