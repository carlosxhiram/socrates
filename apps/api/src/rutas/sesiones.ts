/**
 * sesiones.ts — Chat persistente del Asesor con el gerente Sócrates.
 *
 * Tenencia SIEMPRE por asesorId derivado del token (regla §5.5 #1),
 * NUNCA del payload. Respuestas cuerpo-directo; errores { error: { codigo, mensaje } }.
 */
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { prisma } from "@socrates/db";
import { CrearSesionSchema, EnviarMensajeSchema } from "@socrates/shared";
import type { AuthedVars } from "../middleware/auth.js";
import { crearProveedorIA } from "../ia/proveedor-ia.js";
import type { MensajeChatIA } from "@socrates/shared";

export const sesionesRouter = new Hono<{ Variables: AuthedVars }>();

const TITULO_DEFAULT = "Nueva conversación";

// ── GET /sesiones — lista del Asesor (orden por última actividad) ─────────────
sesionesRouter.get("/", async (c) => {
  const asesorId = c.get("asesorId");
  const sesiones = await prisma.sesion.findMany({
    where: { asesorId },
    include: { _count: { select: { mensajes: true } } },
    orderBy: { actualizadoEn: "desc" },
  });
  return c.json(
    sesiones.map((s) => ({
      id: s.id,
      titulo: s.titulo,
      actualizadoEn: s.actualizadoEn.toISOString(),
      cantidadMensajes: s._count.mensajes,
    })),
  );
});

// ── POST /sesiones — crea sesión vacía ───────────────────────────────────────
sesionesRouter.post("/", zValidator("json", CrearSesionSchema), async (c) => {
  const asesorId = c.get("asesorId");
  const datos = c.req.valid("json");
  const sesion = await prisma.sesion.create({
    data: {
      asesorId,
      titulo: datos.titulo?.trim() || TITULO_DEFAULT,
    },
    include: { _count: { select: { mensajes: true } } },
  });
  return c.json(
    {
      id: sesion.id,
      titulo: sesion.titulo,
      actualizadoEn: sesion.actualizadoEn.toISOString(),
      cantidadMensajes: sesion._count.mensajes,
    },
    201,
  );
});

// ── GET /sesiones/:id — detalle con mensajes ──────────────────────────────────
sesionesRouter.get("/:id", async (c) => {
  const asesorId = c.get("asesorId");
  const id = c.req.param("id");
  const sesion = await prisma.sesion.findUnique({
    where: { id },
    include: { mensajes: { orderBy: { creadoEn: "asc" } } },
  });
  if (!sesion) {
    return c.json(
      { error: { codigo: "NO_EXISTE", mensaje: "No encontré esa conversación." } },
      404,
    );
  }
  if (sesion.asesorId !== asesorId) {
    return c.json(
      { error: { codigo: "AJENA", mensaje: "Esa conversación no es tuya." } },
      403,
    );
  }
  return c.json({
    id: sesion.id,
    titulo: sesion.titulo,
    creadoEn: sesion.creadoEn.toISOString(),
    actualizadoEn: sesion.actualizadoEn.toISOString(),
    mensajes: sesion.mensajes.map((m) => ({
      id: m.id,
      rol: m.rol as "USUARIO" | "ASISTENTE",
      contenido: m.contenido,
      creadoEn: m.creadoEn.toISOString(),
    })),
  });
});

// ── POST /sesiones/:id/mensajes — envía mensaje y obtiene respuesta ───────────
sesionesRouter.post(
  "/:id/mensajes",
  zValidator("json", EnviarMensajeSchema),
  async (c) => {
    const asesorId = c.get("asesorId");
    const id = c.req.param("id");
    const { texto } = c.req.valid("json");

    // Verificar tenencia
    const sesion = await prisma.sesion.findUnique({
      where: { id },
      include: { mensajes: { orderBy: { creadoEn: "asc" } } },
    });
    if (!sesion) {
      return c.json(
        { error: { codigo: "NO_EXISTE", mensaje: "No encontré esa conversación." } },
        404,
      );
    }
    if (sesion.asesorId !== asesorId) {
      return c.json(
        { error: { codigo: "AJENA", mensaje: "Esa conversación no es tuya." } },
        403,
      );
    }

    // Guardar mensaje del usuario
    const msgUsuario = await prisma.mensaje.create({
      data: { sesionId: id, rol: "USUARIO", contenido: texto.trim() },
    });

    // Construir historial para la IA
    const historial: MensajeChatIA[] = [
      ...sesion.mensajes.map((m) => ({
        rol: m.rol as "USUARIO" | "ASISTENTE",
        contenido: m.contenido,
      })),
      { rol: "USUARIO", contenido: texto.trim() },
    ];

    // Llamar a la IA (real o fallback)
    const ia = crearProveedorIA();
    const respuestaTexto = await ia.chatear(historial);

    // Guardar respuesta del asistente + tocar actualizadoEn de la sesión
    const [msgAsistente] = await prisma.$transaction([
      prisma.mensaje.create({
        data: { sesionId: id, rol: "ASISTENTE", contenido: respuestaTexto },
      }),
      // Renombrar si el título es el default (usa el primer mensaje del usuario)
      ...(sesion.titulo === TITULO_DEFAULT
        ? [
            prisma.sesion.update({
              where: { id },
              data: {
                titulo: texto.trim().slice(0, 40),
                actualizadoEn: new Date(),
              },
            }),
          ]
        : [
            prisma.sesion.update({
              where: { id },
              data: { actualizadoEn: new Date() },
            }),
          ]),
    ]);

    return c.json({
      usuario: {
        id: msgUsuario.id,
        rol: "USUARIO" as const,
        contenido: msgUsuario.contenido,
        creadoEn: msgUsuario.creadoEn.toISOString(),
      },
      asistente: {
        id: msgAsistente.id,
        rol: "ASISTENTE" as const,
        contenido: msgAsistente.contenido,
        creadoEn: msgAsistente.creadoEn.toISOString(),
      },
    });
  },
);

// ── DELETE /sesiones/:id — elimina conversación ───────────────────────────────
sesionesRouter.delete("/:id", async (c) => {
  const asesorId = c.get("asesorId");
  const id = c.req.param("id");
  const sesion = await prisma.sesion.findUnique({ where: { id } });
  if (!sesion) {
    return c.json(
      { error: { codigo: "NO_EXISTE", mensaje: "No encontré esa conversación." } },
      404,
    );
  }
  if (sesion.asesorId !== asesorId) {
    return c.json(
      { error: { codigo: "AJENA", mensaje: "Esa conversación no es tuya." } },
      403,
    );
  }
  // Borrar mensajes primero (SQLite no tiene ON DELETE CASCADE por default en Prisma)
  await prisma.$transaction([
    prisma.mensaje.deleteMany({ where: { sesionId: id } }),
    prisma.sesion.delete({ where: { id } }),
  ]);
  return c.json({ eliminado: true });
});
