/**
 * empleados-reales.integracion.ts — los 6 empleados REGISTRADOS de verdad
 * (registro.ts), sin inyectar ningún Empleado falso, contra el worker real.
 *
 * Corre en modo sin claves de IA (no hay ANTHROPIC_API_KEY en el entorno de
 * pruebas): confirma que la degradación de NFR-11 llega hasta el final del
 * cableado real — encargar → worker (registro por defecto) → Empleado real →
 * BLOQUEADA con el motivo digno del servicio no contratado, para los 6 roles.
 *
 * Requiere DATABASE_URL local migrada y sembrada. Corre con:
 *   pnpm --filter @socrates/api test:integracion
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { app } from "../src/app.js";
import { prisma } from "@socrates/db";
import { procesarUnaTarea } from "../src/worker/index.js";
import { ROLES_PANEL } from "@socrates/shared";

const EMPRESA_PRUEBA = "Prueba Empleados Reales";
const JSON_HEADERS = { "Content-Type": "application/json" };
const MOTIVO_SIN_SERVICIO =
  "La oficina aún no tiene el servicio de inteligencia contratado. En cuanto esté activo, retomo este encargo.";

async function limpiarPruebas() {
  await prisma.tarea.deleteMany({ where: { expediente: { empresa: EMPRESA_PRUEBA } } });
  await prisma.expediente.deleteMany({ where: { empresa: EMPRESA_PRUEBA } });
}

async function crearExpediente(): Promise<string> {
  const res = await app.request("/expedientes", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ empresa: EMPRESA_PRUEBA, ciudad: "Monterrey", industria: "Pruebas" }),
  });
  assert.equal(res.status, 201);
  const body = (await res.json()) as { id: string };
  return body.id;
}

before(async () => {
  const url = new URL(process.env.DATABASE_URL ?? "");
  if (!["localhost", "127.0.0.1", "::1", "[::1]"].includes(url.hostname) && process.env.PERMITIR_BASE_NO_LOCAL !== "1") {
    throw new Error(`test:integracion se niega a correr contra una base no local (${url.hostname}).`);
  }
  // Guardia adicional de esta suite: si alguien corre esto CON una llave real
  // puesta en el entorno, los asserts de abajo (BLOQUEADA/motivo digno) fallarían
  // porque de verdad llamaría a Anthropic — mejor decirlo claro que confundir.
  if (process.env.ANTHROPIC_API_KEY?.trim()) {
    throw new Error(
      "empleados-reales.integracion.ts asume modo SIN llaves de IA; quita ANTHROPIC_API_KEY para correr esta suite.",
    );
  }
  await prisma.$queryRaw`SELECT 1`;
  await limpiarPruebas();
});

after(async () => {
  await limpiarPruebas();
  await prisma.$disconnect();
});

for (const rol of ROLES_PANEL) {
  test(`${rol}: registrado de verdad, en modo sin claves degrada BLOQUEADA con el motivo digno`, async () => {
    const id = await crearExpediente();
    const encargo = await app.request(`/expedientes/${id}/tareas`, {
      method: "POST",
      headers: JSON_HEADERS,
      body: JSON.stringify({ empleadoRol: rol, descripcion: "Encargo de prueba" }),
    });
    assert.equal(encargo.status, 201);
    const tarea = (await encargo.json()) as { id: string };

    const procesado = await procesarUnaTarea(); // SIN override: usa el registro REAL
    assert.equal(procesado, true);

    const fresca = await prisma.tarea.findUniqueOrThrow({ where: { id: tarea.id } });
    assert.equal(fresca.estado, "BLOQUEADA");
    assert.equal(fresca.motivo, MOTIVO_SIN_SERVICIO);
    // \bIA\b exige "IA" como palabra suelta (nunca dentro de "inteligencia").
    assert.doesNotMatch(fresca.motivo ?? "", /\bagente\b|\bprompt\b|\bIA\b|\bmodelo\b|api\s*key/i);

    // Ningún Entregable a medias: NFR-1, nunca "Entregada" sin contenido real.
    const entregable = await prisma.entregable.findUnique({ where: { tareaId: tarea.id } });
    assert.equal(entregable, null);
  });
}
