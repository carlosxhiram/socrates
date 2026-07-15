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
 * Cuántos turnos previos se le mandan a Sócrates como contexto. Techo de
 * contexto y de costo: una conversación larga no reenvía su historia completa
 * en cada llamada cuando entre la llave real (NFR-5). No afecta lo que se guarda
 * ni lo que ve el Asesor: solo lo que viaja al equipo en vivo.
 */
const MAX_TURNOS_CONTEXTO = 20;

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
  // Tenencia dentro de la consulta (asesorId en el WHERE): una sesión inexistente
  // y una ajena son indistinguibles (404) — no se filtra su existencia y la
  // tenencia no depende de un chequeo posterior que un refactor pudiera soltar.
  const sesion = await prisma.sesion.findFirst({
    where: { id, asesorId },
    include: { mensajes: { orderBy: { creadoEn: "asc" } } },
  });
  if (!sesion) {
    return c.json(
      { error: { codigo: "NO_EXISTE", mensaje: "No encontré esa conversación." } },
      404,
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

    // Verificar tenencia dentro de la consulta (asesorId en el WHERE) y cargar el
    // historial. Inexistente y ajena son indistinguibles (404): no se filtra la
    // existencia de sesiones de otros asesores.
    const sesion = await prisma.sesion.findFirst({
      where: { id, asesorId },
      include: { mensajes: { orderBy: { creadoEn: "asc" } } },
    });
    if (!sesion) {
      return c.json(
        { error: { codigo: "NO_EXISTE", mensaje: "No encontré esa conversación." } },
        404,
      );
    }

    // Construir el historial para Sócrates: solo los últimos turnos (techo de
    // contexto/costo) + el mensaje recién enviado.
    const historial: MensajeChatIA[] = [
      ...sesion.mensajes.slice(-MAX_TURNOS_CONTEXTO).map((m) => ({
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

    // Bautizar la sesión con el primer mensaje si aún tiene el título por defecto.
    const nuevoTitulo =
      sesion.titulo === TITULO_DEFAULT
        ? textoLimpio.slice(0, 40) || TITULO_DEFAULT
        : sesion.titulo;

    // Persistir el turno del usuario y la respuesta de Sócrates en UNA sola
    // transacción: si la escritura falla, no queda un mensaje del usuario
    // huérfano sin respuesta. Timestamps explícitos con 1 ms de diferencia para
    // fijar el orden usuario→asistente: dentro de una transacción de Postgres,
    // now() es idéntico para ambos INSERT y el orden quedaría indefinido.
    const ahora = new Date();
    const despues = new Date(ahora.getTime() + 1);
    const [msgUsuario, msgAsistente] = await prisma.$transaction([
      prisma.mensaje.create({
        data: { sesionId: id, rol: "USUARIO", contenido: textoLimpio, creadoEn: ahora },
      }),
      prisma.mensaje.create({
        data: { sesionId: id, rol: "ASISTENTE", contenido: respuestaTexto, creadoEn: despues },
      }),
      prisma.sesion.update({
        where: { id },
        data: { titulo: nuevoTitulo, actualizadoEn: despues },
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
  // Tenencia en la consulta: inexistente y ajena son indistinguibles (404).
  const sesion = await prisma.sesion.findFirst({ where: { id, asesorId } });
  if (!sesion) {
    return c.json(
      { error: { codigo: "NO_EXISTE", mensaje: "No encontré esa conversación." } },
      404,
    );
  }
  // Los mensajes caen por ON DELETE CASCADE (definido en el esquema, Postgres).
  await prisma.sesion.delete({ where: { id } });
  return c.json({ eliminado: true });
});
