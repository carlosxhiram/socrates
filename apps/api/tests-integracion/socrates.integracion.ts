/**
 * socrates.integracion.ts — Sócrates propone, el Asesor confirma (spec §2.8).
 *
 * Corre en modo sin claves de IA (no se define AI_GATEWAY_API_KEY en el
 * entorno de pruebas) — ejercita a propósito el fallback determinista de
 * /instruir y la atomicidad de /confirmar. Requiere DATABASE_URL local
 * migrada y sembrada. Corre con:
 *   pnpm --filter @socrates/api test:integracion
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { app } from "../src/app.js";
import { prisma } from "@socrates/db";
import { procesarUnaTarea } from "../src/worker/index.js";

const EMPRESA_PRUEBA = "Prueba Socrates Instruir Confirmar";
const CLERK_ID_OTRO = "otro-asesor-prueba-socrates";
const JSON_HEADERS = { "Content-Type": "application/json" };

const creadosExpediente: string[] = [];
let otroAsesorId: string;

async function limpiarPruebas() {
  await prisma.tarea.deleteMany({ where: { expediente: { empresa: EMPRESA_PRUEBA } } });
  await prisma.expediente.deleteMany({ where: { empresa: EMPRESA_PRUEBA } });
  await prisma.asesor.deleteMany({ where: { clerkUserId: CLERK_ID_OTRO } });
}

async function crearExpediente(): Promise<string> {
  const res = await app.request("/expedientes", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ empresa: EMPRESA_PRUEBA, ciudad: "Monterrey", industria: "Pruebas" }),
  });
  assert.equal(res.status, 201);
  const body = (await res.json()) as { id: string };
  creadosExpediente.push(body.id);
  return body.id;
}

async function encargar(expedienteId: string, empleadoRol: string, descripcion: string) {
  return app.request(`/expedientes/${expedienteId}/tareas`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ empleadoRol, descripcion }),
  });
}

/** Drena cualquier Tarea ENCARGADA que haya quedado suelta (ver nota en
 * encargos-y-worker.integracion.ts: el FIFO del worker es global). */
async function drenarCola(): Promise<void> {
  while (await procesarUnaTarea({ registro: {} })) {
    // sigue drenando
  }
}

before(async () => {
  const url = new URL(process.env.DATABASE_URL ?? "");
  if (!["localhost", "127.0.0.1", "::1", "[::1]"].includes(url.hostname) && process.env.PERMITIR_BASE_NO_LOCAL !== "1") {
    throw new Error(`test:integracion se niega a correr contra una base no local (${url.hostname}).`);
  }
  await prisma.$queryRaw`SELECT 1`;
  await limpiarPruebas();
  const otro = await prisma.asesor.create({
    data: {
      clerkUserId: CLERK_ID_OTRO,
      nombre: "Otro Asesor",
      email: "otro-socrates@example.com",
      estadoSuscripcion: "activa",
      nombreOficina: "Otra Oficina",
    },
  });
  otroAsesorId = otro.id;
});

after(async () => {
  await limpiarPruebas();
  await prisma.$disconnect();
});

// ── POST /socrates/instruir ──────────────────────────────────────────────────

test("instruir con expedienteId inexistente responde 404", async () => {
  const res = await app.request("/socrates/instruir", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ texto: "Analiza esta empresa", expedienteId: "no-existe-este-id" }),
  });
  assert.equal(res.status, 404);
});

test("instruir (sin IA) con verbo de encargo + expedienteId propone al Investigador", async () => {
  const id = await crearExpediente();
  const res = await app.request("/socrates/instruir", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ texto: "Analiza a esta empresa y dime qué producto le conviene", expedienteId: id }),
  });
  assert.equal(res.status, 200);
  const body = (await res.json()) as { tipo: string; expedienteId: string; pasos: { empleadoRol: string }[] };
  assert.equal(body.tipo, "plan");
  assert.equal(body.expedienteId, id);
  assert.equal(body.pasos[0]?.empleadoRol, "INVESTIGADOR");
});

test("instruir (sin IA) sin expedienteId responde con UNA pregunta, nunca inventa", async () => {
  const res = await app.request("/socrates/instruir", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ texto: "hola, ¿cómo vas?" }),
  });
  assert.equal(res.status, 200);
  const body = (await res.json()) as { tipo: string; pregunta?: string };
  assert.equal(body.tipo, "pregunta");
  assert.ok((body.pregunta ?? "").length > 0);
});

// ── POST /socrates/confirmar ─────────────────────────────────────────────────

test("confirmar encadena dependeDeId entre los pasos del plan", async () => {
  const id = await crearExpediente();
  const res = await app.request("/socrates/confirmar", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({
      expedienteId: id,
      pasos: [
        { empleadoRol: "INVESTIGADOR", descripcion: "Investiga a la empresa" },
        { empleadoRol: "NEGOCIADOR", descripcion: "Prepara el pitch" },
      ],
    }),
  });
  assert.equal(res.status, 201);
  const body = (await res.json()) as { tareas: { id: string; empleadoRol: string }[] };
  assert.equal(body.tareas.length, 2);
  assert.equal(body.tareas[0]?.empleadoRol, "INVESTIGADOR");
  assert.equal(body.tareas[1]?.empleadoRol, "NEGOCIADOR");

  const segunda = await prisma.tarea.findUniqueOrThrow({ where: { id: body.tareas[1]?.id } });
  assert.equal(segunda.dependeDeId, body.tareas[0]?.id);
  await drenarCola();
});

test("confirmar es atómico: si un paso choca, NINGUNA tarea del plan se crea", async () => {
  const id = await crearExpediente();
  const previo = await encargar(id, "TRAMITADOR", "Ya en curso de antes");
  assert.equal(previo.status, 201);

  const res = await app.request("/socrates/confirmar", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({
      expedienteId: id,
      pasos: [
        { empleadoRol: "GESTOR", descripcion: "Da seguimiento" },
        { empleadoRol: "TRAMITADOR", descripcion: "Choca con el encargo ya vivo" },
      ],
    }),
  });
  assert.equal(res.status, 409);
  const body = (await res.json()) as { error: { codigo: string } };
  assert.equal(body.error.codigo, "CONFLICTO");

  const gestorCreado = await prisma.tarea.findFirst({ where: { expedienteId: id, empleadoRol: "GESTOR" } });
  assert.equal(gestorCreado, null, "el primer paso del plan no debe sobrevivir si el segundo choca (todo o nada)");
  await drenarCola();
});

test("confirmar en un expediente ajeno responde 403", async () => {
  const ajeno = await prisma.expediente.create({
    data: { asesorId: otroAsesorId, empresa: EMPRESA_PRUEBA, ciudad: "CDMX", industria: "Pruebas", etapa: "PROSPECTO" },
  });
  const res = await app.request("/socrates/confirmar", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ expedienteId: ajeno.id, pasos: [{ empleadoRol: "GESTOR", descripcion: "x" }] }),
  });
  assert.equal(res.status, 403);
  const body = (await res.json()) as { error: { codigo: string } };
  assert.equal(body.error.codigo, "AJENO");
  await prisma.expediente.delete({ where: { id: ajeno.id } });
});
