/**
 * empleados.ts — estado del equipo para el panel "Tu equipo" (UX P-4, C-1).
 *
 * Estado de cara al Asesor: Libre / Trabajando / Entregó (NUNCA "Procesando").
 * Se deriva de las Tareas activas del Asesor en sus Expedientes.
 */
import { Hono } from "hono";
import { prisma } from "@socrates/db";
import {
  EMPLEADOS,
  ROLES_PANEL,
  nombreEmpleado,
  cargoEmpleado,
  type RolEmpleado,
} from "@socrates/shared";
import type { AuthedVars } from "../middleware/auth.js";

export const empleadosRouter = new Hono<{ Variables: AuthedVars }>();

empleadosRouter.get("/", async (c) => {
  const asesorId = c.get("asesorId");

  // El asesor se deriva del token (NFR-8); leemos su override de nombres para
  // resolver el nombre a mostrar de cada empleado.
  const asesor = await prisma.asesor.findUnique({
    where: { id: asesorId },
    select: { nombresEquipo: true },
  });
  const nombres = (asesor?.nombresEquipo ?? {}) as Record<string, string>;

  // Tareas del Asesor con su Expediente, para saber dónde está cada empleado.
  const tareas = await prisma.tarea.findMany({
    where: { expediente: { asesorId } },
    include: { expediente: { select: { id: true, empresa: true } } },
    orderBy: { actualizadoEn: "desc" },
  });

  const estados = ROLES_PANEL.map((rol: RolEmpleado) => {
    const perfil = EMPLEADOS[rol];
    const delRol = tareas.filter((t) => t.empleadoRol === rol);
    const trabajando = delRol.find((t) => t.estado === "EN_CURSO" || t.estado === "ENCARGADA");
    const entrego = delRol.find((t) => t.estado === "ENTREGADA");

    let estado: "LIBRE" | "TRABAJANDO" | "ENTREGO" = "LIBRE";
    let expedienteActual: { id: string; empresa: string } | null = null;
    if (trabajando) {
      estado = "TRABAJANDO";
      expedienteActual = trabajando.expediente;
    } else if (entrego) {
      estado = "ENTREGO";
      expedienteActual = entrego.expediente;
    }

    return {
      rol,
      nombre: nombreEmpleado(rol, nombres),
      cargo: cargoEmpleado(rol),
      descripcion: perfil.descripcion,
      icono: perfil.icono,
      estado,
      expedienteActual,
    };
  });

  return c.json(estados);
});
