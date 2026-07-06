/**
 * worker/index.ts — el loop in-process que ejecuta a los Empleados (B1).
 *
 * Sin broker externo (architecture.md §6.3): un loop dentro del proceso api que
 * reclama Tareas ENCARGADA cuyas dependencias ya se cumplieron, usando
 * `UPDATE ... WHERE id = (SELECT ... FOR UPDATE SKIP LOCKED)` — atómico incluso
 * con reinicio/blue-green o varias instancias del proceso a la vez (edge #8).
 *
 * Concurrencia máx 2 (I-2, piloto). Timeout de Tarea 20 min → BLOQUEADA con
 * motivo digno; al arrancar se retoman huérfanas (EN_CURSO vieja) para que un
 * reinicio del proceso nunca deje una Tarea varada para siempre (R-3).
 */
import { prisma } from "@socrates/db";
import { crearProveedorIA, esModoSinClaves } from "../ia/proveedor-ia.js";
import { crearCatalogoLector } from "../catalogo/catalogo-lector.js";
import { verificarRecomendaciones } from "../calidad/fidelidad-catalogo.js";
import { registroEmpleados as registroReal } from "../empleados/registro.js";
import {
  parsearReporteV1,
  parsearEntregableGenericoV1,
  type Empleado,
  type RolEmpleado,
  type EtapaExpediente,
  type ExpedienteConDatos,
  type EntradaEmpleado,
  type ContextoEjecucion,
  type ResultadoEmpleado,
  type ReporteV1,
  type EntregableGenericoV1,
  type RecomendacionFinanciamiento,
  type Brecha,
} from "@socrates/shared";

const CONCURRENCIA_MAX = 2;
const TIMEOUT_TAREA_MS = 20 * 60 * 1000;
const INTERVALO_TICK_MS = 2000;

type RegistroEmpleados = Partial<Record<RolEmpleado, Empleado>>;

interface OpcionesWorker {
  registro?: RegistroEmpleados;
  timeoutMs?: number;
}

interface TareaReclamada {
  id: string;
  expedienteId: string;
  empleadoRol: string;
  descripcion: string;
}

/** Reclama LA SIGUIENTE Tarea lista (dependencias cumplidas), o null si no hay. */
async function reclamarTarea(): Promise<TareaReclamada | null> {
  const filas = await prisma.$queryRaw<TareaReclamada[]>`
    UPDATE "Tarea"
    SET estado = 'EN_CURSO', "actualizadoEn" = now()
    WHERE id = (
      SELECT id FROM "Tarea"
      WHERE estado = 'ENCARGADA'
        AND ("dependeDeId" IS NULL OR "dependeDeId" IN (
          SELECT id FROM "Tarea" WHERE estado = 'ENTREGADA'
        ))
      ORDER BY "creadoEn" ASC
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    )
    RETURNING id, "expedienteId", "empleadoRol", descripcion
  `;
  return filas[0] ?? null;
}

/** Al arrancar: una Tarea EN_CURSO más vieja que el timeout es huérfana de un
 * proceso que murió a medias — se retoma (nunca se pierde, R-3). */
export async function recuperarHuerfanas(timeoutMs: number = TIMEOUT_TAREA_MS): Promise<number> {
  const umbral = new Date(Date.now() - timeoutMs);
  const resultado = await prisma.tarea.updateMany({
    where: { estado: "EN_CURSO", actualizadoEn: { lt: umbral } },
    data: { estado: "ENCARGADA", progresoPct: null, progresoNota: null },
  });
  return resultado.count;
}

/** Marca BLOQUEADA solo si la Tarea sigue EN_CURSO (candado optimista, patrón de la casa). */
async function marcarBloqueada(tareaId: string, motivo: string): Promise<void> {
  await prisma.tarea.updateMany({
    where: { id: tareaId, estado: "EN_CURSO" },
    data: { estado: "BLOQUEADA", motivo, progresoNota: null },
  });
}

function conTimeout<T>(promesa: Promise<T>, ms: number, alAgotarse: () => void): Promise<T> {
  return new Promise((resolve, reject) => {
    const temporizador = setTimeout(() => {
      alAgotarse();
      reject(new Error("tiempo_agotado"));
    }, ms);
    promesa.then(
      (valor) => {
        clearTimeout(temporizador);
        resolve(valor);
      },
      (err) => {
        clearTimeout(temporizador);
        reject(err);
      },
    );
  });
}

function brechaInfoATextoBrecha(info: { campo: string; motivo: string }): Brecha {
  return { tema: info.campo, descripcion: info.motivo, severidad: "media" };
}

async function entregarResultado(tarea: TareaReclamada, resultado: ResultadoEmpleado): Promise<void> {
  const borrador = resultado.entregables[0];
  if (!borrador) {
    // Ni bloqueo ni entregable: no hay nada honesto que ofrecer como "Entregada"
    // sin violar NFR-1 (nunca fingir un resultado que no existe).
    await marcarBloqueada(tarea.id, "No logré producir un entregable con lo que tenía; puedes reintentarlo.");
    return;
  }

  let contenido: ReporteV1 | EntregableGenericoV1;
  try {
    contenido =
      borrador.tipo === "reporte_inteligencia"
        ? parsearReporteV1(borrador.contenido)
        : parsearEntregableGenericoV1(borrador.contenido);
  } catch (err) {
    console.error("[worker] el entregable no cumplió su esquema:", err);
    await marcarBloqueada(tarea.id, "El resultado no cumplió el formato esperado; puedes reintentarlo.");
    return;
  }

  // Fidelidad C-1: solo se aplica si el entregable trae recomendaciones (hoy,
  // únicamente el Asesor de producto las llena).
  let recomendacionesValidas: RecomendacionFinanciamiento[] = [];
  if (contenido.recomendacionesFinanciamiento.length > 0) {
    const fidelidad = await verificarRecomendaciones(contenido.recomendacionesFinanciamiento, crearCatalogoLector());
    recomendacionesValidas = fidelidad.validas;
    contenido = {
      ...contenido,
      recomendacionesFinanciamiento: fidelidad.validas,
      brechas: [...contenido.brechas, ...fidelidad.brechas.map(brechaInfoATextoBrecha)],
    };
  }

  await prisma.$transaction(async (tx) => {
    const marcado = await tx.tarea.updateMany({
      where: { id: tarea.id, estado: "EN_CURSO" },
      data: { estado: "ENTREGADA", progresoPct: 100, progresoNota: null },
    });
    if (marcado.count === 0) return; // ya no estaba EN_CURSO (defensivo)

    const entregable = await tx.entregable.create({
      data: {
        expedienteId: tarea.expedienteId,
        tareaId: tarea.id,
        empleadoRol: tarea.empleadoRol,
        tipo: borrador.tipo,
        estado: "BORRADOR",
        versionActual: 1,
      },
    });
    const version = await tx.entregableVersion.create({
      data: {
        entregableId: entregable.id,
        version: 1,
        contenido: JSON.stringify(contenido),
      },
    });
    for (const rec of recomendacionesValidas) {
      await tx.recomendacion.create({
        data: {
          versionId: version.id,
          productoId: rec.productoId,
          hallazgo: rec.hallazgoOrigen || rec.necesidad,
          argumentoCierre: rec.beneficioEsperado || rec.usoEspecifico,
        },
      });
    }
  });
}

async function procesarTarea(
  tarea: TareaReclamada,
  registro: RegistroEmpleados,
  timeoutMs: number,
): Promise<void> {
  const rol = tarea.empleadoRol as RolEmpleado;
  const empleado = registro[rol];
  if (!empleado) {
    await marcarBloqueada(tarea.id, "Este especialista aún no está disponible.");
    return;
  }

  const expedienteRow = await prisma.expediente.findUnique({ where: { id: tarea.expedienteId } });
  if (!expedienteRow) {
    await marcarBloqueada(tarea.id, "No pude encontrar el expediente de este encargo.");
    return;
  }

  const expediente: ExpedienteConDatos = {
    id: expedienteRow.id,
    asesorId: expedienteRow.asesorId,
    empresa: expedienteRow.empresa,
    ciudad: expedienteRow.ciudad,
    industria: expedienteRow.industria,
    sitioWeb: expedienteRow.sitioWeb,
    rfc: expedienteRow.rfc,
    sucursales: expedienteRow.sucursales,
    notas: expedienteRow.notas,
    etapa: expedienteRow.etapa as EtapaExpediente,
  };

  const ctx: ContextoEjecucion = {
    asesorId: expediente.asesorId,
    expediente,
    catalogo: crearCatalogoLector(),
    ia: crearProveedorIA(),
    modoSinClaves: esModoSinClaves(),
    registrarProgreso: async (pct, nota) => {
      await prisma.tarea
        .update({ where: { id: tarea.id }, data: { progresoPct: pct, progresoNota: nota } })
        .catch(() => {}); // el progreso es informativo; una falla aquí no debe tumbar el encargo
    },
  };

  const entrada: EntradaEmpleado = { expedienteId: tarea.expedienteId, instruccion: tarea.descripcion };

  let seAgoto = false;
  let resultado: ResultadoEmpleado;
  try {
    resultado = await conTimeout(empleado.ejecutar(entrada, ctx), timeoutMs, () => {
      seAgoto = true;
    });
  } catch (err) {
    if (seAgoto) {
      await marcarBloqueada(tarea.id, "Tiempo de espera excedido.");
    } else {
      console.error("[worker] el empleado lanzó un error inesperado:", err);
      await marcarBloqueada(tarea.id, "Algo salió mal preparando este encargo; puedes reintentarlo.");
    }
    return;
  }

  if (resultado.bloqueo) {
    await marcarBloqueada(tarea.id, resultado.bloqueo.motivo);
    return;
  }

  await entregarResultado(tarea, resultado);
}

/**
 * Reclama y procesa UNA Tarea (si hay alguna lista). Pensado para tests de
 * integración deterministas — el loop real (`iniciarWorker`) lo usa por dentro.
 * Devuelve `true` si procesó algo, `false` si no había nada que hacer.
 */
export async function procesarUnaTarea(opciones: OpcionesWorker = {}): Promise<boolean> {
  const tarea = await reclamarTarea();
  if (!tarea) return false;
  await procesarTarea(tarea, opciones.registro ?? registroReal, opciones.timeoutMs ?? TIMEOUT_TAREA_MS);
  return true;
}

export interface ManejadorWorker {
  detener(): void;
}

/** Arranca el loop del worker (llamado una vez desde index.ts al levantar la api). */
export async function iniciarWorker(opciones: OpcionesWorker = {}): Promise<ManejadorWorker> {
  const registro = opciones.registro ?? registroReal;
  const timeoutMs = opciones.timeoutMs ?? TIMEOUT_TAREA_MS;

  const recuperadas = await recuperarHuerfanas(timeoutMs);
  if (recuperadas > 0) {
    console.warn(`[worker] ${recuperadas} tarea(s) huérfana(s) retomada(s) al arrancar.`);
  }

  const enProceso = new Set<string>();
  let detenido = false;

  const tick = async () => {
    if (detenido) return;
    while (!detenido && enProceso.size < CONCURRENCIA_MAX) {
      const tarea = await reclamarTarea();
      if (!tarea) break;
      enProceso.add(tarea.id);
      procesarTarea(tarea, registro, timeoutMs)
        .catch((err) => console.error("[worker] fallo inesperado procesando la tarea", tarea.id, err))
        .finally(() => enProceso.delete(tarea.id));
    }
  };

  const intervalo = setInterval(() => {
    tick().catch((err) => console.error("[worker] fallo inesperado en el tick", err));
  }, INTERVALO_TICK_MS);
  await tick(); // primer barrido inmediato, sin esperar el primer intervalo

  return {
    detener() {
      detenido = true;
      clearInterval(intervalo);
    },
  };
}
