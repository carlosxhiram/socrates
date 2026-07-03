/**
 * expedientes.integracion.ts — la máquina de Etapas contra la api REAL (FR-7).
 *
 * Corre la app Hono en proceso (app.request, sin puerto) contra el Postgres
 * local, en modo asesor demo (sin claves de Clerk — NFR-11). Verifica:
 *   - no se puede saltar Etapas hacia adelante (409, mensaje de oficina);
 *   - entrar a INVESTIGADO exige el Reporte de Inteligencia APROBADO (409);
 *   - Ganado/Perdido manual desde cualquier Etapa abierta, con motivo;
 *   - los terminales no se reabren (409);
 *   - el progreso persistido tras el PATCH es el derivado (con Tareas), no uno viejo.
 *
 * Requiere DATABASE_URL local migrada y sembrada. Corre con:
 *   pnpm --filter @socrates/api test:integracion
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { app } from "../src/app.js";
import { prisma } from "@socrates/db";
import { derivarProgreso } from "@socrates/shared";

const creados: string[] = [];

async function crearExpediente(): Promise<string> {
  const res = await app.request("/expedientes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ empresa: "Prueba Máquina Etapas", ciudad: "Monterrey", industria: "Pruebas" }),
  });
  assert.equal(res.status, 201);
  const body = (await res.json()) as { id: string; etapa: string; progreso: number };
  assert.equal(body.etapa, "PROSPECTO");
  creados.push(body.id);
  return body.id;
}

async function patchEtapa(id: string, cuerpo: Record<string, unknown>) {
  return app.request(`/expedientes/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cuerpo),
  });
}

before(async () => {
  // Guardia anti-producción (el test crea y borra expedientes).
  const url = new URL(process.env.DATABASE_URL ?? "");
  if (!["localhost", "127.0.0.1", "::1", "[::1]"].includes(url.hostname) && process.env.PERMITIR_BASE_NO_LOCAL !== "1") {
    throw new Error(`test:integracion se niega a correr contra una base no local (${url.hostname}).`);
  }
  await prisma.$queryRaw`SELECT 1`;
});

after(async () => {
  await prisma.entregableVersion.deleteMany({ where: { entregable: { expedienteId: { in: creados } } } });
  await prisma.entregable.deleteMany({ where: { expedienteId: { in: creados } } });
  await prisma.tarea.deleteMany({ where: { expedienteId: { in: creados } } });
  await prisma.expediente.deleteMany({ where: { id: { in: creados } } });
  await prisma.$disconnect();
});

test("saltarse Etapas responde 409 con mensaje de oficina", async () => {
  const id = await crearExpediente();
  const res = await patchEtapa(id, { etapa: "RECOMENDADO" });
  assert.equal(res.status, 409);
  const body = (await res.json()) as { error: { codigo: string; mensaje: string } };
  assert.equal(body.error.codigo, "TRANSICION_INVALIDA");
  assert.doesNotMatch(body.error.mensaje, /enum|state|transition/i);
});

test("entrar a INVESTIGADO sin Reporte aprobado responde 409 (prerrequisito)", async () => {
  const id = await crearExpediente();
  const res = await patchEtapa(id, { etapa: "INVESTIGADO" });
  assert.equal(res.status, 409);
  const body = (await res.json()) as { error: { codigo: string } };
  assert.equal(body.error.codigo, "PRERREQUISITO_FALTANTE");
});

test("entrar a INVESTIGADO con Reporte APROBADO avanza y persiste el progreso derivado", async () => {
  const id = await crearExpediente();
  // Simula el trabajo del Investigador ya aprobado (Gate humano pasado).
  const tarea = await prisma.tarea.create({
    data: { expedienteId: id, empleadoRol: "INVESTIGADOR", descripcion: "Reporte de prueba", estado: "ENTREGADA" },
  });
  await prisma.entregable.create({
    data: { expedienteId: id, tareaId: tarea.id, empleadoRol: "INVESTIGADOR", tipo: "reporte_inteligencia", estado: "APROBADO" },
  });

  const res = await patchEtapa(id, { etapa: "INVESTIGADO" });
  assert.equal(res.status, 200);

  const enBD = await prisma.expediente.findUniqueOrThrow({ where: { id } });
  assert.equal(enBD.etapa, "INVESTIGADO");
  assert.equal(
    enBD.progreso,
    derivarProgreso({ etapa: "INVESTIGADO", tareasTotales: 1, tareasEntregadas: 1 }),
    "el progreso persistido debe ser el derivado con las Tareas reales",
  );
});

test("Ganado manual con motivo funciona desde PROSPECTO; el terminal no se reabre", async () => {
  const id = await crearExpediente();
  const res = await patchEtapa(id, { etapa: "GANADO", motivoCierre: "Cerró con financiamiento externo" });
  assert.equal(res.status, 200);
  const enBD = await prisma.expediente.findUniqueOrThrow({ where: { id } });
  assert.equal(enBD.etapa, "GANADO");
  assert.equal(enBD.progreso, 100);
  assert.equal(enBD.motivoCierre, "Cerró con financiamiento externo");

  const reabrir = await patchEtapa(id, { etapa: "PROSPECTO" });
  assert.equal(reabrir.status, 409);
});

test("editar datos SIN tocar la etapa no dispara validación de transición", async () => {
  const id = await crearExpediente();
  const res = await patchEtapa(id, { notas: "Solo actualizo notas" });
  assert.equal(res.status, 200);
  const enBD = await prisma.expediente.findUniqueOrThrow({ where: { id } });
  assert.equal(enBD.etapa, "PROSPECTO");
  assert.equal(enBD.notas, "Solo actualizo notas");
});
