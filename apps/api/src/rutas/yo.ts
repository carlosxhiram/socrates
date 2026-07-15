/**
 * yo.ts — el estado del asesor actual (perfil + onboarding + suscripción).
 *
 * `GET /yo` alimenta al "portero" del frontend: incluye `siguientePaso`, que
 * calcula el SERVIDOR (derivarSiguientePaso). El cliente solo obedece.
 * `PATCH /yo/perfil` guarda los datos del Paso 1. `POST /yo/completar` marca la
 * bienvenida vista (Paso 3) — pero NUNCA otorga acceso: eso lo decide la
 * suscripción, verificada por el webhook.
 *
 * Tenencia: el asesor se deriva del token (c.get("asesorId")), nunca del payload.
 */
import { Hono } from "hono";
import { prisma } from "@socrates/db";
import {
  GuardarPerfilSchema,
  derivarSiguientePaso,
  SUSCRIPCION_CON_ACCESO_LECTURA,
  LEGAL,
  type YoDTO,
  type EstadoSuscripcion,
  type EtapaOnboarding,
} from "@socrates/shared";
import { validarJson } from "../middleware/validacion.js";
import type { AuthedVars } from "../middleware/auth.js";

export const yoRouter = new Hono<{ Variables: AuthedVars }>();

interface AsesorRow {
  id: string;
  nombre: string | null;
  email: string | null;
  nombreOficina: string | null;
  zona: string | null;
  especialidad: string | null;
  onboardingEtapa: string;
  estadoSuscripcion: string;
  pruebaTermina: Date | null;
  consentimientoTerminosEn: Date | null;
  consentimientoTerminosVersion: string | null;
  consentimientoAvisoEn: Date | null;
  consentimientoAvisoVersion: string | null;
}

function perfilCompleto(a: AsesorRow): boolean {
  return Boolean(a.nombreOficina && a.zona && a.especialidad);
}

/**
 * Constancia de consentimiento completa: ambas firmas (Términos y Aviso).
 * La FECHA es la firma; basta con que exista para tener la constancia.
 */
function consentimientoOk(a: AsesorRow): boolean {
  return Boolean(a.consentimientoTerminosEn && a.consentimientoAvisoEn);
}

function tieneAcceso(a: AsesorRow): boolean {
  // Acceso a la app (al menos lectura): cerrar el recibimiento solo registra que
  // vio la bienvenida, no es una escritura de negocio. La demo y la gracia
  // cuentan; el acceso lo concede el webhook, jamás el cliente.
  return SUSCRIPCION_CON_ACCESO_LECTURA.includes(a.estadoSuscripcion as EstadoSuscripcion);
}

/** Construye el YoDTO (con el siguientePaso derivado por el servidor). */
function aYoDTO(a: AsesorRow, esDemo: boolean): YoDTO {
  const estado = a.estadoSuscripcion as EstadoSuscripcion;
  return {
    asesorId: a.id,
    esDemo,
    perfil: {
      nombre: a.nombre,
      email: a.email,
      nombreOficina: a.nombreOficina,
      zona: a.zona,
      especialidad: a.especialidad,
    },
    onboardingEtapa: a.onboardingEtapa as EtapaOnboarding,
    suscripcion: {
      estado,
      pruebaTermina: a.pruebaTermina ? a.pruebaTermina.toISOString() : null,
    },
    siguientePaso: derivarSiguientePaso({
      perfilCompleto: perfilCompleto(a),
      estadoSuscripcion: estado,
      bienvenidaVista: a.onboardingEtapa === "completo",
      consentimientoOk: consentimientoOk(a),
    }),
  };
}

async function cargarAsesor(asesorId: string): Promise<AsesorRow | null> {
  return prisma.asesor.findUnique({ where: { id: asesorId } });
}

// ── GET /yo ──────────────────────────────────────────────────────────────────
yoRouter.get("/", async (c) => {
  const a = await cargarAsesor(c.get("asesorId"));
  if (!a) {
    return c.json({ error: { codigo: "NO_EXISTE", mensaje: "No encontré tu cuenta." } }, 404);
  }
  return c.json(aYoDTO(a, c.get("esDemo")));
});

// ── PATCH /yo/perfil — Paso 1 (datos de la oficina) ──────────────────────────
yoRouter.patch("/perfil", validarJson(GuardarPerfilSchema), async (c) => {
  const datos = c.req.valid("json");
  const actual = await cargarAsesor(c.get("asesorId"));
  if (!actual) {
    return c.json({ error: { codigo: "NO_EXISTE", mensaje: "No encontré tu cuenta." } }, 404);
  }

  // ── Consentimiento legal (Paso 1), fail-closed ──────────────────────────────
  // Si el asesor AÚN no tiene constancia, para continuar debe aceptar AMBOS
  // documentos (Términos y Aviso). Sin las dos banderas: 409, no se avanza la
  // etapa ni se escribe nada (ni perfil ni constancia). Si ya tenía constancia,
  // las banderas se ignoran: la fecha original es la firma y no se re-escribe.
  const yaTeniaConstancia = consentimientoOk(actual);
  if (!yaTeniaConstancia && !(datos.aceptaTerminos === true && datos.aceptaAviso === true)) {
    return c.json(
      {
        error: {
          codigo: "FALTA_CONSENTIMIENTO",
          mensaje:
            "Para continuar necesitas aceptar los Términos y Condiciones y confirmar que leíste el Aviso de Privacidad.",
        },
      },
      409,
    );
  }

  const a = await prisma.asesor.update({
    where: { id: actual.id },
    data: {
      nombreOficina: datos.nombreOficina,
      zona: datos.zona,
      especialidad: datos.especialidad,
      // Avanza el marcador de progreso si seguía en el primer paso.
      ...(actual.onboardingEtapa === "perfil" ? { onboardingEtapa: "pago" } : {}),
      // Constancia: se escribe UNA sola vez, en el mismo update del perfil, con
      // la fecha de ahora y la versión vigente de cada documento (LEGAL). Si ya
      // había constancia, no se toca (la firma original manda).
      ...(yaTeniaConstancia
        ? {}
        : {
            consentimientoTerminosEn: new Date(),
            consentimientoTerminosVersion: LEGAL.terminosVersion,
            consentimientoAvisoEn: new Date(),
            consentimientoAvisoVersion: LEGAL.avisoVersion,
          }),
    },
  });
  return c.json(aYoDTO(a, c.get("esDemo")));
});

// ── POST /yo/completar — Paso 3 (bienvenida vista) ───────────────────────────
yoRouter.post("/completar", async (c) => {
  const actual = await cargarAsesor(c.get("asesorId"));
  if (!actual) {
    return c.json({ error: { codigo: "NO_EXISTE", mensaje: "No encontré tu cuenta." } }, 404);
  }
  // No marcamos la bienvenida como vista si aún no hay perfil + acceso: el acceso
  // lo decide la suscripción (webhook), nunca el cliente. Defensa en profundidad.
  if (!perfilCompleto(actual) || !tieneAcceso(actual)) {
    return c.json(
      { error: { codigo: "AUN_NO", mensaje: "Aún te falta un paso del recibimiento." } },
      409,
    );
  }
  const a = await prisma.asesor.update({
    where: { id: actual.id },
    data: { onboardingEtapa: "completo" },
  });
  return c.json(aYoDTO(a, c.get("esDemo")));
});
