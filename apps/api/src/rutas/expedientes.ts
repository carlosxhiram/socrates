/**
 * expedientes.ts — La Oficina y los Expedientes (FR-4..7, E2).
 *
 * TODA lectura/escritura filtra por `asesorId` derivado del token (regla §5.5 #1),
 * NUNCA del payload. Un recurso ajeno responde 403 en lenguaje de oficina.
 */
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { prisma } from "@socrates/db";
import {
  CrearExpedienteSchema,
  EditarExpedienteSchema,
  derivarProgreso,
  type EstadoTarea,
  type RolEmpleado,
  type EtapaExpediente,
} from "@socrates/shared";
import type { AuthedVars } from "../middleware/auth.js";
import { requiereSuscripcion } from "../middleware/suscripcion.js";

export const expedientesRouter = new Hono<{ Variables: AuthedVars }>();
expedientesRouter.use("*", requiereSuscripcion);

type ExpedienteConRelaciones = {
  id: string;
  empresa: string;
  ciudad: string;
  industria: string;
  sitioWeb: string | null;
  rfc: string | null;
  sucursales: number | null;
  notas: string | null;
  etapa: string;
  motivoCierre: string | null;
  creadoEn: Date;
  actualizadoEn: Date;
  tareas: { empleadoRol: string; estado: string }[];
  entregables: { estado: string }[];
};

/** Construye el resumen de un Expediente para la tarjeta de La Oficina (C-2). */
function aResumen(e: ExpedienteConRelaciones) {
  const tareasTotales = e.tareas.length;
  const tareasEntregadas = e.tareas.filter((t) => t.estado === "ENTREGADA").length;
  const empleadosActivos = Array.from(
    new Set(
      e.tareas
        .filter((t) => (["ENCARGADA", "EN_CURSO"] as EstadoTarea[]).includes(t.estado as EstadoTarea))
        .map((t) => t.empleadoRol as RolEmpleado),
    ),
  );
  const entregablesEsperandoRevision = e.entregables.filter((d) => d.estado === "BORRADOR").length;
  const tieneBloqueo = e.tareas.some((t) => t.estado === "BLOQUEADA");

  return {
    id: e.id,
    empresa: e.empresa,
    ciudad: e.ciudad,
    industria: e.industria,
    etapa: e.etapa as EtapaExpediente,
    progreso: derivarProgreso({
      etapa: e.etapa as EtapaExpediente,
      tareasTotales,
      tareasEntregadas,
    }),
    empleadosActivos,
    entregablesEsperandoRevision,
    tieneBloqueo,
    creadoEn: e.creadoEn.toISOString(),
    actualizadoEn: e.actualizadoEn.toISOString(),
  };
}

// ── GET /expedientes — lista del Asesor (La Oficina, FR-5) ───────────────────
expedientesRouter.get("/", async (c) => {
  const asesorId = c.get("asesorId");
  const expedientes = await prisma.expediente.findMany({
    where: { asesorId },
    include: {
      tareas: { select: { empleadoRol: true, estado: true } },
      entregables: { select: { estado: true } },
    },
    orderBy: { actualizadoEn: "desc" },
  });
  // Orden: gate pendiente primero, luego última actividad (UX C-2).
  const resumenes = expedientes.map(aResumen);
  resumenes.sort((a, b) => {
    const ga = a.entregablesEsperandoRevision > 0 ? 1 : 0;
    const gb = b.entregablesEsperandoRevision > 0 ? 1 : 0;
    if (ga !== gb) return gb - ga;
    return b.actualizadoEn.localeCompare(a.actualizadoEn);
  });
  return c.json(resumenes);
});

// ── POST /expedientes — crear (FR-4; nace en PROSPECTO, 0%) ───────────────────
expedientesRouter.post("/", zValidator("json", CrearExpedienteSchema), async (c) => {
  const asesorId = c.get("asesorId");
  const datos = c.req.valid("json");
  const creado = await prisma.expediente.create({
    data: {
      asesorId,
      empresa: datos.empresa,
      ciudad: datos.ciudad,
      industria: datos.industria,
      sitioWeb: datos.sitioWeb || null,
      rfc: datos.rfc || null,
      sucursales: datos.sucursales ?? null,
      notas: datos.notas || null,
      etapa: "PROSPECTO",
      progreso: derivarProgreso({ etapa: "PROSPECTO" }),
    },
    include: {
      tareas: { select: { empleadoRol: true, estado: true } },
      entregables: { select: { estado: true } },
    },
  });
  return c.json(aResumen(creado), 201);
});

// ── GET /expedientes/:id — detalle (FR-6) ─────────────────────────────────────
expedientesRouter.get("/:id", async (c) => {
  const asesorId = c.get("asesorId");
  const id = c.req.param("id");
  const e = await prisma.expediente.findUnique({
    where: { id },
    include: {
      tareas: { orderBy: { creadoEn: "asc" } },
      entregables: { orderBy: { creadoEn: "asc" } },
    },
  });
  if (!e) {
    return c.json({ error: { codigo: "NO_EXISTE", mensaje: "No encontré ese expediente." } }, 404);
  }
  if (e.asesorId !== asesorId) {
    return c.json(
      { error: { codigo: "AJENO", mensaje: "Ese expediente no es tuyo." } },
      403,
    );
  }
  const resumen = aResumen(e as unknown as ExpedienteConRelaciones);
  return c.json({
    ...resumen,
    sitioWeb: e.sitioWeb,
    rfc: e.rfc,
    sucursales: e.sucursales,
    notas: e.notas,
    motivoCierre: e.motivoCierre,
    tareas: e.tareas.map((t) => ({
      id: t.id,
      empleadoRol: t.empleadoRol as RolEmpleado,
      descripcion: t.descripcion,
      estado: t.estado as EstadoTarea,
      motivo: t.motivo,
      creadoEn: t.creadoEn.toISOString(),
    })),
    entregables: e.entregables.map((d) => ({
      id: d.id,
      tipo: d.tipo,
      estado: d.estado,
      empleadoRol: (d.empleadoRol as RolEmpleado) ?? null,
      versionActual: d.versionActual,
      creadoEn: d.creadoEn.toISOString(),
    })),
  });
});

// ── PATCH /expedientes/:id — editar / avanzar Etapa / Ganado-Perdido (FR-4, FR-7) ─
expedientesRouter.patch("/:id", zValidator("json", EditarExpedienteSchema), async (c) => {
  const asesorId = c.get("asesorId");
  const id = c.req.param("id");
  const datos = c.req.valid("json");

  const existente = await prisma.expediente.findUnique({ where: { id } });
  if (!existente) {
    return c.json({ error: { codigo: "NO_EXISTE", mensaje: "No encontré ese expediente." } }, 404);
  }
  if (existente.asesorId !== asesorId) {
    return c.json({ error: { codigo: "AJENO", mensaje: "Ese expediente no es tuyo." } }, 403);
  }

  const nuevaEtapa = (datos.etapa ?? existente.etapa) as EtapaExpediente;
  const actualizado = await prisma.expediente.update({
    where: { id },
    data: {
      ...(datos.empresa !== undefined ? { empresa: datos.empresa } : {}),
      ...(datos.ciudad !== undefined ? { ciudad: datos.ciudad } : {}),
      ...(datos.industria !== undefined ? { industria: datos.industria } : {}),
      ...(datos.sitioWeb !== undefined ? { sitioWeb: datos.sitioWeb || null } : {}),
      ...(datos.rfc !== undefined ? { rfc: datos.rfc || null } : {}),
      ...(datos.sucursales !== undefined ? { sucursales: datos.sucursales } : {}),
      ...(datos.notas !== undefined ? { notas: datos.notas || null } : {}),
      ...(datos.etapa !== undefined ? { etapa: datos.etapa } : {}),
      ...(datos.motivoCierre !== undefined ? { motivoCierre: datos.motivoCierre } : {}),
      progreso: derivarProgreso({ etapa: nuevaEtapa }),
    },
    include: {
      tareas: { select: { empleadoRol: true, estado: true } },
      entregables: { select: { estado: true } },
    },
  });
  return c.json(aResumen(actualizado));
});
