/**
 * endurecimiento.integracion.ts — el foso operativo de la api (auditoría E1→piloto).
 *
 * Cubre, contra la app real en proceso (app.request) y Postgres local:
 *   1. Modo demo con candado: en producción sin Clerk NO sirve datos (salvo
 *      MODO_ASESOR_DEMO=1 explícito) — cierra el fail-open de autenticación.
 *   2. Config parcial de Clerk (solo publishable, sin llaves de verificación):
 *      fail-closed con mensaje claro, no colapso de tenencia al asesor demo.
 *   3. En modo demo, un Bearer token presente NO se mapea en silencio al demo.
 *   4. Contrato de error uniforme: validación 400 en español de oficina,
 *      404 de ruta desconocida en JSON, PATCH vacío rechazado.
 *   5. C-3 reforzado: aprobar con versión desfasada responde 409.
 *
 * Los flags de entorno se evalúan POR REQUEST en auth.ts, así que aquí se
 * manipulan process.env por test y se restauran siempre.
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { app } from "../src/app.js";
import { prisma } from "@socrates/db";

const EMPRESA_PRUEBA = "Prueba Endurecimiento";

async function limpiarPruebas() {
  await prisma.entregableVersion.deleteMany({ where: { entregable: { expediente: { empresa: EMPRESA_PRUEBA } } } });
  await prisma.entregable.deleteMany({ where: { expediente: { empresa: EMPRESA_PRUEBA } } });
  await prisma.tarea.deleteMany({ where: { expediente: { empresa: EMPRESA_PRUEBA } } });
  await prisma.expediente.deleteMany({ where: { empresa: EMPRESA_PRUEBA } });
}

/** Corre `fn` con variables de entorno temporales y SIEMPRE las restaura. */
async function conEnv(vars: Record<string, string | undefined>, fn: () => Promise<void>) {
  const previas = new Map(Object.keys(vars).map((k) => [k, process.env[k]]));
  for (const [k, v] of Object.entries(vars)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  try {
    await fn();
  } finally {
    for (const [k, v] of previas) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
}

before(async () => {
  const url = new URL(process.env.DATABASE_URL ?? "");
  if (!["localhost", "127.0.0.1", "::1", "[::1]"].includes(url.hostname) && process.env.PERMITIR_BASE_NO_LOCAL !== "1") {
    throw new Error(`test:integracion se niega a correr contra una base no local (${url.hostname}).`);
  }
  await prisma.$queryRaw`SELECT 1`;
  await limpiarPruebas();
});

after(async () => {
  await limpiarPruebas();
  await prisma.$disconnect();
});

// ── 1. Candado de producción del modo demo ───────────────────────────────────
test("en producción sin Clerk, la api NO sirve datos del asesor demo (503 con mensaje claro)", async () => {
  await conEnv({ NODE_ENV: "production", MODO_ASESOR_DEMO: undefined, CLERK_SECRET_KEY: undefined, CLERK_JWT_KEY: undefined, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: undefined }, async () => {
    const res = await app.request("/expedientes");
    assert.equal(res.status, 503);
    const body = (await res.json()) as { error: { codigo: string; mensaje: string } };
    assert.equal(body.error.codigo, "SIN_CONFIGURAR");
    assert.doesNotMatch(body.error.mensaje, /clerk|env|NODE_ENV/i, "mensaje de oficina, sin jerga técnica");
  });
});

test("en producción con MODO_ASESOR_DEMO=1 explícito, el modo demo sí funciona", async () => {
  await conEnv({ NODE_ENV: "production", MODO_ASESOR_DEMO: "1", CLERK_SECRET_KEY: undefined, CLERK_JWT_KEY: undefined, NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: undefined }, async () => {
    const res = await app.request("/expedientes");
    assert.equal(res.status, 200);
  });
});

// ── 2. Config parcial de Clerk: fail-closed ──────────────────────────────────
test("con Clerk a medias (solo publishable), la api no cae al asesor demo: 503 claro", async () => {
  await conEnv({ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_x", CLERK_SECRET_KEY: undefined, CLERK_JWT_KEY: undefined }, async () => {
    const res = await app.request("/expedientes");
    assert.equal(res.status, 503);
    const body = (await res.json()) as { error: { codigo: string } };
    assert.equal(body.error.codigo, "SIN_CONFIGURAR");
  });
});

// ── 3. En modo demo, un token presente no se ignora en silencio ──────────────
test("modo demo + Bearer token presente → 401 (no se mapea al demo en silencio)", async () => {
  const res = await app.request("/expedientes", { headers: { Authorization: "Bearer token-de-alguien" } });
  assert.equal(res.status, 401);
});

// ── 4. Contrato de error uniforme ────────────────────────────────────────────
test("validación fallida responde 400 { error } en español de oficina, no ZodError crudo", async () => {
  const res = await app.request("/expedientes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ciudad: "MTY" }),
  });
  assert.equal(res.status, 400);
  const body = (await res.json()) as { error?: { codigo: string; mensaje: string }; success?: boolean };
  assert.equal(body.success, undefined, "no debe salir el shape crudo de zod");
  assert.equal(body.error?.codigo, "DATOS_INVALIDOS");
  assert.match(body.error?.mensaje ?? "", /empresa/i);
  assert.doesNotMatch(body.error?.mensaje ?? "", /required|invalid|string/i, "sin inglés de zod");
});

test("ruta desconocida responde 404 dentro del contrato { error }", async () => {
  const res = await app.request("/no-existe");
  assert.equal(res.status, 404);
  const body = (await res.json()) as { error: { codigo: string } };
  assert.equal(body.error.codigo, "NO_EXISTE");
});

test("PATCH sin ningún campo responde 400 (no un no-op con 200)", async () => {
  const creado = await app.request("/expedientes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ empresa: EMPRESA_PRUEBA, ciudad: "MTY", industria: "Pruebas" }),
  });
  const { id } = (await creado.json()) as { id: string };
  const res = await app.request(`/expedientes/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  assert.equal(res.status, 400);
});

test("PATCH acepta sitioWeb solo si es URL (paridad con el POST)", async () => {
  const creado = await app.request("/expedientes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ empresa: EMPRESA_PRUEBA, ciudad: "MTY", industria: "Pruebas" }),
  });
  const { id } = (await creado.json()) as { id: string };
  const res = await app.request(`/expedientes/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sitioWeb: "esto no es una url" }),
  });
  assert.equal(res.status, 400);
});

// ── 5. C-3 reforzado: aprobar exige la versión que el Asesor vio ─────────────
test("aprobar con versión desfasada responde 409; con la versión vigente aprueba", async () => {
  const exp = await prisma.expediente.create({
    data: {
      asesor: { connect: { clerkUserId: "demo-asesor" } },
      empresa: EMPRESA_PRUEBA,
      ciudad: "MTY",
      industria: "Pruebas",
    },
  });
  const ent = await prisma.entregable.create({
    data: { expedienteId: exp.id, tipo: "guion_acercamiento", estado: "BORRADOR", versionActual: 2 },
  });

  const desfasada = await app.request(`/entregables/${ent.id}/aprobar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ version: 1 }),
  });
  assert.equal(desfasada.status, 409);

  const vigente = await app.request(`/entregables/${ent.id}/aprobar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ version: 2 }),
  });
  assert.equal(vigente.status, 200);
  const body = (await vigente.json()) as { estado: string };
  assert.equal(body.estado, "APROBADO");
});
