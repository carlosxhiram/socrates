/**
 * socrates.ts — Sócrates propone, el Asesor confirma (D-4, spec de la misión §2.8).
 *
 * POST /instruir interpreta la intención del Asesor y devuelve un PLAN
 * propuesto (o UNA pregunta si es ambiguo) — NUNCA toca la base. Solo
 * POST /confirmar, con el banderazo explícito del Asesor, crea las Tareas de
 * verdad (reusa crearTareaEncargo, misma tenencia/anti-duplicado que el
 * encargo directo). Sócrates NUNCA ejecuta solo (architecture.md §D-4).
 *
 * Sin IA (NFR-11): cae a un fallback determinista honesto — nunca inventa.
 */
import { Hono } from "hono";
import { prisma } from "@socrates/db";
import {
  InstruirSchema,
  ConfirmarSchema,
  RespuestaInstruirSchema,
  EMPLEADOS,
  type RespuestaInstruir,
} from "@socrates/shared";
import { validarJson } from "../middleware/validacion.js";
import type { AuthedVars } from "../middleware/auth.js";
import { crearProveedorIA } from "../ia/proveedor-ia.js";
import { crearTareaEncargo, type ResultadoCrearTarea } from "../servicios/encargos.js";

export const socratesRouter = new Hono<{ Variables: AuthedVars }>();

/** Verbos de encargo para el fallback determinista sin IA (spec §2.8). */
const VERBOS_ENCARGO =
  /\b(analiza|investiga|prepara|cotiza|arma|califica|recomienda|negocia|revisa|contacta|dame|hazme|necesito|quiero)\w*/i;

/** El AI SDK a veces envuelve el JSON en fences de markdown; los quita si están. */
function limpiarFencesJSON(texto: string): string {
  const match = texto.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  return (match?.[1] ?? texto).trim();
}

function preguntaGenerica(): RespuestaInstruir {
  return {
    tipo: "pregunta",
    pregunta: "Cuéntame de qué expediente se trata y qué necesitas que haga el equipo.",
  };
}

// ── POST /instruir — interpreta, PROPONE, no ejecuta ────────────────────────
socratesRouter.post("/instruir", validarJson(InstruirSchema), async (c) => {
  const asesorId = c.get("asesorId");
  const { texto, expedienteId } = c.req.valid("json");

  // La lista REAL de expedientes del asesor: la IA solo puede elegir un id de
  // aquí (o proponer empresaNueva) — nunca se le da libertad de inventar uno.
  const expedientes = await prisma.expediente.findMany({
    where: { asesorId },
    select: { id: true, empresa: true },
    orderBy: { actualizadoEn: "desc" },
    take: 30,
  });
  const idsValidos = new Set(expedientes.map((e) => e.id));
  if (expedienteId && !idsValidos.has(expedienteId)) {
    return c.json({ error: { codigo: "NO_EXISTE", mensaje: "No encontré ese expediente." } }, 404);
  }

  const ia = crearProveedorIA();
  let respuesta: RespuestaInstruir | null = null;

  if (ia.disponible) {
    const listado =
      expedientes.map((e) => `- ${e.id}: ${e.empresa}`).join("\n") ||
      "(el asesor todavía no tiene expedientes abiertos)";
    const sistema = `Eres Sócrates, el gerente de un equipo de agentes de inteligencia financiera al servicio de un asesor de crédito empresarial PYME en México.
El asesor te escribe en lenguaje natural qué necesita. Tu trabajo es interpretar la intención y proponer un plan de trabajo — NUNCA ejecutas nada tú mismo, solo propones.

Responde ÚNICAMENTE con un objeto JSON (sin texto antes ni después, sin fences), con UNA de estas dos formas EXACTAS:

{"tipo":"plan","resumen":"una frase de qué vas a hacer","expedienteId":"<uno de los ids listados abajo, o null>","pasos":[{"empleadoRol":"INVESTIGADOR|PROSPECTOR|ASESOR_PRODUCTO|NEGOCIADOR|TRAMITADOR|GESTOR","descripcion":"qué le encargas a ese empleado"}]}

{"tipo":"pregunta","pregunta":"tu única pregunta para aclarar"}

Usa "pregunta" si no queda claro de qué expediente habla o qué necesita — nunca adivines ni inventes un expedienteId fuera de esta lista:
${listado}

Los roles del equipo (nunca inventes otros): El Prospector (PROSPECTOR), El Investigador (INVESTIGADOR), El Asesor de producto (ASESOR_PRODUCTO), El Negociador (NEGOCIADOR), El Tramitador (TRAMITADOR), El Gestor (GESTOR).`;

    const resultado = await ia.generarTexto({ sistema, prompt: texto });
    if (resultado.ok) {
      try {
        const bruto = JSON.parse(limpiarFencesJSON(resultado.texto));
        const validado = RespuestaInstruirSchema.parse(bruto);
        if (validado.tipo === "plan" && validado.expedienteId && !idsValidos.has(validado.expedienteId)) {
          // La IA propuso un id que no existe en la lista que le dimos — no
          // confiamos en su palabra (C-1 aplica también aquí): mejor preguntar.
          respuesta = {
            tipo: "pregunta",
            pregunta: "¿Sobre cuál expediente hablamos? Dime el nombre de la empresa.",
          };
        } else {
          respuesta = validado;
        }
      } catch {
        respuesta = null; // JSON inválido o fuera de esquema: cae al fallback de abajo
      }
    }
  }

  if (!respuesta) {
    // Fallback determinista (spec §2.8, sin IA o si la respuesta no fue válida):
    // nunca inventa — solo propone lo más honesto que puede con lo que tiene.
    if (expedienteId && VERBOS_ENCARGO.test(texto)) {
      respuesta = {
        tipo: "plan",
        resumen: `Le pido a ${EMPLEADOS.INVESTIGADOR.nombre} que arranque con esto.`,
        expedienteId,
        pasos: [{ empleadoRol: "INVESTIGADOR", descripcion: texto }],
      };
    } else {
      respuesta = preguntaGenerica();
    }
  }

  return c.json(respuesta);
});

class ErrorConfirmar extends Error {
  constructor(
    public readonly estado: Exclude<ResultadoCrearTarea["estado"], "OK">,
    public readonly mensaje?: string,
  ) {
    super(`confirmar: ${estado}`);
  }
}

// ── POST /confirmar — el banderazo del Asesor: crea las Tareas de verdad ────
socratesRouter.post("/confirmar", validarJson(ConfirmarSchema), async (c) => {
  const asesorId = c.get("asesorId");
  const { expedienteId, pasos } = c.req.valid("json");

  try {
    const tareas = await prisma.$transaction(async (tx) => {
      const creadas = [];
      let anteriorId: string | undefined;
      for (const paso of pasos) {
        const resultado = await crearTareaEncargo(
          {
            expedienteId,
            asesorId,
            empleadoRol: paso.empleadoRol,
            descripcion: paso.descripcion,
            dependeDeId: anteriorId,
          },
          tx,
        );
        if (resultado.estado !== "OK") {
          throw new ErrorConfirmar(resultado.estado, resultado.estado === "CONFLICTO" ? resultado.mensaje : undefined);
        }
        creadas.push(resultado.tarea);
        anteriorId = resultado.tarea.id;
      }
      return creadas;
    });
    return c.json({ tareas }, 201);
  } catch (err) {
    if (err instanceof ErrorConfirmar) {
      switch (err.estado) {
        case "NO_EXISTE":
          return c.json({ error: { codigo: "NO_EXISTE", mensaje: "No encontré ese expediente." } }, 404);
        case "AJENO":
          return c.json({ error: { codigo: "AJENO", mensaje: "Ese expediente no es tuyo." } }, 403);
        case "CERRADO":
          return c.json(
            {
              error: {
                codigo: "TRANSICION_INVALIDA",
                mensaje: "Este expediente ya está cerrado; no se le pueden encargar más trabajos.",
              },
            },
            409,
          );
        case "CONFLICTO":
          return c.json(
            { error: { codigo: "CONFLICTO", mensaje: err.mensaje ?? "Ya hay un encargo en curso." } },
            409,
          );
      }
    }
    throw err;
  }
});
