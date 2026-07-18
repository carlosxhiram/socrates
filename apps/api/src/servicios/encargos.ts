/**
 * encargos.ts — la lógica de "encargarle algo a un Empleado", en un solo lugar.
 *
 * La usan POST /expedientes/:id/tareas (encargo directo) y POST
 * /socrates/confirmar (el plan que propuso Sócrates) — misma tenencia, mismo
 * anti-duplicado, mismo chequeo de expediente cerrado. Un solo lugar evita que
 * las dos rutas diverjan con el tiempo.
 */
import { prisma } from "@socrates/db";
import { EMPLEADOS, ETAPAS_TERMINALES } from "@socrates/shared";
import type { RolEmpleado, EtapaExpediente } from "@socrates/shared";
import type { Prisma } from "@socrates/db";

export interface TareaCreada {
  id: string;
  empleadoRol: RolEmpleado;
  descripcion: string;
  estado: string;
  motivo: string | null;
  progresoPct: number | null;
  progresoNota: string | null;
  creadoEn: string;
}

export type ResultadoCrearTarea =
  | { estado: "OK"; tarea: TareaCreada }
  | { estado: "NO_EXISTE" }
  | { estado: "AJENO" }
  | { estado: "CERRADO" }
  | { estado: "CONFLICTO"; mensaje: string };

/**
 * Crea una Tarea para `empleadoRol` en `expedienteId`, validando tenencia,
 * que el expediente no esté cerrado, y que ese rol no tenga ya un encargo vivo
 * en el mismo expediente. `tx` opcional permite encadenar varias llamadas
 * dentro de una misma transacción (así lo usa /socrates/confirmar).
 */
export async function crearTareaEncargo(
  opts: {
    expedienteId: string;
    asesorId: string;
    empleadoRol: RolEmpleado;
    descripcion?: string;
    dependeDeId?: string;
  },
  tx: Prisma.TransactionClient | typeof prisma = prisma,
): Promise<ResultadoCrearTarea> {
  const expediente = await tx.expediente.findUnique({ where: { id: opts.expedienteId } });
  if (!expediente) return { estado: "NO_EXISTE" };
  if (expediente.asesorId !== opts.asesorId) return { estado: "AJENO" };
  if (ETAPAS_TERMINALES.includes(expediente.etapa as EtapaExpediente)) return { estado: "CERRADO" };

  const yaEnCurso = await tx.tarea.findFirst({
    where: {
      expedienteId: opts.expedienteId,
      empleadoRol: opts.empleadoRol,
      estado: { in: ["ENCARGADA", "EN_CURSO"] },
    },
  });
  if (yaEnCurso) {
    return {
      estado: "CONFLICTO",
      mensaje: `${EMPLEADOS[opts.empleadoRol].nombre} ya tiene un encargo en curso en este expediente.`,
    };
  }

  const descripcion = opts.descripcion?.trim() || EMPLEADOS[opts.empleadoRol].descripcion;
  const tarea = await tx.tarea.create({
    data: {
      expedienteId: opts.expedienteId,
      empleadoRol: opts.empleadoRol,
      descripcion,
      estado: "ENCARGADA",
      dependeDeId: opts.dependeDeId,
    },
  });

  return {
    estado: "OK",
    tarea: {
      id: tarea.id,
      empleadoRol: tarea.empleadoRol as RolEmpleado,
      descripcion: tarea.descripcion,
      estado: tarea.estado,
      motivo: tarea.motivo,
      progresoPct: tarea.progresoPct,
      progresoNota: tarea.progresoNota,
      creadoEn: tarea.creadoEn.toISOString(),
    },
  };
}
