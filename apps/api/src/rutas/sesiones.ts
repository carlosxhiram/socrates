/**
 * sesiones.ts — Chat persistente del Asesor con el gerente Sócrates (Sesiones).
 *
 * Tenencia SIEMPRE por asesorId derivado del token (regla §5.5 #1), NUNCA del
 * payload. Respuestas cuerpo-directo; errores { error: { codigo, mensaje } }.
 *
 * NFR-11: sin AI_GATEWAY_API_KEY la conversación NO truena — Sócrates responde
 * con un acuse honesto en voz de oficina y el hilo se guarda igual. NFR-14: cero
 * jerga técnica en esa respuesta (nada de "IA/modelo/servicio no disponible").
 */
import { Hono } from "hono";
import { prisma } from "@socrates/db";
import {
  CrearSesionSchema,
  EnviarMensajeSchema,
  type MensajeChatIA,
} from "@socrates/shared";
import { validarJson } from "../middleware/validacion.js";
import type { AuthedVars } from "../middleware/auth.js";
import { crearProveedorIA } from "../ia/proveedor-ia.js";

export const sesionesRouter = new Hono<{ Variables: AuthedVars }>();

const TITULO_DEFAULT = "Nueva conversación";

/**
 * Acuse honesto de Sócrates cuando no hay conexión con el equipo en vivo.
 * Es contenido de oficina DELIBERADO (no un string-centinela): se persiste como
 * un turno normal de Sócrates. Cero jerga técnica (NFR-14).
 */
const ACUSE_SIN_SERVICIO_VIVO =
  "Te leo y ya lo anoté. Ahora mismo el equipo no está disponible para trabajarlo en vivo; " +
  "en cuanto vuelvan, retomo tu encargo y te aviso. ¿Hay algo más en lo que te pueda orientar mientras tanto?";

// ── GET /sesiones — lista del Asesor (orden por última actividad) ─────────────
sesionesRouter.get("/", async (c) => {
  const asesorId = c.get("asesorId");
  const sesiones = await prisma.sesion.findMany({
    where: { asesorId },
    include: {
      _count: { select: { mensajes: true } },
      mensajes: { orderBy: { creadoEn: "desc" }, take: 1 }, // último, para el resumen
    },
    orderBy: { actualizadoEn: "desc" },
  });
  return c.json(
    sesiones.map((s) => {
      const ultimo = s.mensajes[0];
      const resumen = ultimo
        ? ultimo.contenido.replace(/\s+/g, " ").trim().slice(0, 140)
        : undefined;
      return {
        id: s.id,
        titulo: s.titulo,
        actualizadoEn: s.actualizadoEn.toISOString(),
        cantidadMensajes: s._count.mensajes,
        resumen,
      };
    }),
  );
});

// ── POST /sesiones — crea sesión vacía ───────────────────────────────────────
sesionesRouter.post("/", validarJson(CrearSesionSchema), async (c) => {
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
  validarJson(EnviarMensajeSchema),
  async (c) => {
    const asesorId = c.get("asesorId");
    const id = c.req.param("id");
    // El esquema ya viene con trim() aplicado (no cuela espacios en blanco).
    const { texto: textoLimpio } = c.req.valid("json");

    // Verificar tenencia (y cargar el historial para la conversación)
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

    // Guardar el mensaje del usuario.
    const msgUsuario = await prisma.mensaje.create({
      data: { sesionId: id, rol: "USUARIO", contenido: textoLimpio },
    });

    // Construir el historial para Sócrates (incluye el mensaje recién enviado).
    const historial: MensajeChatIA[] = [
      ...sesion.mensajes.map((m) => ({
        rol: m.rol as "USUARIO" | "ASISTENTE",
        contenido: m.contenido,
      })),
      { rol: "USUARIO", contenido: textoLimpio },
    ];

    // Llamar a Sócrates. El proveedor NUNCA lanza: revisa `ok` y, si no hay
    // servicio en vivo (sin claves o fallo), degrada a un acuse honesto de
    // oficina — sin jerga técnica (NFR-14) y guardado como un turno normal.
    const ia = crearProveedorIA();
    const resultado = await ia.chatear(historial);
    const respuestaTexto = resultado.ok
      ? resultado.texto
      : ACUSE_SIN_SERVICIO_VIVO;

    // Guardar la respuesta de Sócrates + tocar la sesión (y bautizarla con el
    // primer mensaje si aún tiene el título por defecto).
    const nuevoTitulo =
      sesion.titulo === TITULO_DEFAULT
        ? textoLimpio.slice(0, 40) || TITULO_DEFAULT
        : sesion.titulo;
    const [msgAsistente] = await prisma.$transaction([
      prisma.mensaje.create({
        data: { sesionId: id, rol: "ASISTENTE", contenido: respuestaTexto },
      }),
      prisma.sesion.update({
        where: { id },
        data: { titulo: nuevoTitulo, actualizadoEn: new Date() },
      }),
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

// ── DELETE /sesiones/:id — elimina la conversación completa ───────────────────
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
  // Los mensajes caen por ON DELETE CASCADE (definido en el esquema, Postgres).
  await prisma.sesion.delete({ where: { id } });
  return c.json({ eliminado: true });
});
