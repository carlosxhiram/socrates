/**
 * equipo.integracion.ts — renombrar al equipo por oficina contra la api REAL.
 *
 * Corre la app Hono en proceso (app.request, sin puerto) contra el Postgres
 * local, en modo asesor demo (sin claves de Clerk — NFR-11). Verifica:
 *   - GET /empleados sin override → nombres de fábrica (Diego…) y cargo presente;
 *   - PATCH /yo/equipo persiste y GET /empleados refleja el nombre nuevo;
 *   - PATCH parcial dos veces hace MERGE (no reemplaza todo);
 *   - renombrar al gerente (SOCRATES) se rechaza (fuera del panel);
 *   - nombre vacío/espacios se rechaza (zod);
 *   - tenencia: el override vive en la fila del asesor, no se filtra a otro.
 *
 * Requiere DATABASE_URL local migrada y sembrada. Corre con:
 *   pnpm --filter @socrates/api test:integracion
 */
import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { app } from "../src/app.js";
import { prisma, Prisma } from "@socrates/db";

const DEMO_CLERK_ID = "demo-asesor";
/** Segundo asesor de utilería para la prueba de tenencia. */
const OTRO_CLERK_ID = "prueba-otro-asesor-equipo";

interface EmpleadoDTO {
  rol: string;
  nombre: string;
  cargo: string;
}

async function getEmpleados(): Promise<EmpleadoDTO[]> {
  const res = await app.request("/empleados");
  assert.equal(res.status, 200);
  return (await res.json()) as EmpleadoDTO[];
}

async function patchEquipo(cuerpo: Record<string, unknown>) {
  return app.request("/yo/equipo", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cuerpo),
  });
}

async function resetOverrides() {
  await prisma.asesor.update({
    where: { clerkUserId: DEMO_CLERK_ID },
    data: { nombresEquipo: Prisma.DbNull },
  });
}

before(async () => {
  const url = new URL(process.env.DATABASE_URL ?? "");
  if (
    !["localhost", "127.0.0.1", "::1", "[::1]"].includes(url.hostname) &&
    process.env.PERMITIR_BASE_NO_LOCAL !== "1"
  ) {
    throw new Error(`test:integracion se niega a correr contra una base no local (${url.hostname}).`);
  }
  await prisma.$queryRaw`SELECT 1`;
  await prisma.asesor.deleteMany({ where: { clerkUserId: OTRO_CLERK_ID } });
});

beforeEach(async () => {
  await resetOverrides();
});

after(async () => {
  await resetOverrides();
  await prisma.asesor.deleteMany({ where: { clerkUserId: OTRO_CLERK_ID } });
  await prisma.$disconnect();
});

test("GET /empleados sin override devuelve nombres de fábrica y cargo", async () => {
  const empleados = await getEmpleados();
  const prospector = empleados.find((e) => e.rol === "PROSPECTOR");
  assert.ok(prospector, "debe venir el Prospector");
  assert.equal(prospector.nombre, "Diego");
  assert.equal(prospector.cargo, "Prospector");
  // Todos los del panel traen cargo no vacío.
  assert.ok(empleados.every((e) => e.cargo.length > 0), "cada empleado del panel trae cargo");
});

test("PATCH /yo/equipo renombra y GET /empleados lo refleja", async () => {
  const res = await patchEquipo({ PROSPECTOR: "Toño" });
  assert.equal(res.status, 200);

  const empleados = await getEmpleados();
  assert.equal(empleados.find((e) => e.rol === "PROSPECTOR")?.nombre, "Toño");
  // Los demás siguen de fábrica.
  assert.equal(empleados.find((e) => e.rol === "GESTOR")?.nombre, "Paula");
  // El cargo NO cambia con el renombre.
  assert.equal(empleados.find((e) => e.rol === "PROSPECTOR")?.cargo, "Prospector");
});

test("PATCH parcial dos veces hace merge (no reemplaza)", async () => {
  const r1 = await patchEquipo({ PROSPECTOR: "Toño" });
  assert.equal(r1.status, 200);
  const r2 = await patchEquipo({ GESTOR: "Ana" });
  assert.equal(r2.status, 200);

  const empleados = await getEmpleados();
  assert.equal(empleados.find((e) => e.rol === "PROSPECTOR")?.nombre, "Toño");
  assert.equal(empleados.find((e) => e.rol === "GESTOR")?.nombre, "Ana");
});

test("renombrar al gerente (SOCRATES) se rechaza", async () => {
  const res = await patchEquipo({ SOCRATES: "Otro" });
  assert.equal(res.status, 400);
  const body = (await res.json()) as { error: { codigo: string; mensaje: string } };
  assert.doesNotMatch(body.error.mensaje, /enum|record|invalid/i);
});

test("nombre vacío o de espacios se rechaza", async () => {
  const vacio = await patchEquipo({ PROSPECTOR: "   " });
  assert.equal(vacio.status, 400);
  // El override no se guardó: sigue de fábrica.
  const empleados = await getEmpleados();
  assert.equal(empleados.find((e) => e.rol === "PROSPECTOR")?.nombre, "Diego");
});

test("nombre de más de 40 caracteres se rechaza", async () => {
  const largo = await patchEquipo({ PROSPECTOR: "x".repeat(41) });
  assert.equal(largo.status, 400);
});

test("tenencia: el override de una oficina no aparece en otra fila", async () => {
  // El asesor demo renombra al Prospector.
  await patchEquipo({ PROSPECTOR: "Toño" });

  // Un segundo asesor (otra oficina) se crea sin overrides.
  const otro = await prisma.asesor.create({
    data: { clerkUserId: OTRO_CLERK_ID, estadoSuscripcion: "demo" },
  });
  const enBD = await prisma.asesor.findUniqueOrThrow({ where: { id: otro.id } });
  assert.equal(enBD.nombresEquipo, null, "la otra oficina no hereda el override");

  // Y el demo sí conserva el suyo (aislado por fila, derivado del token).
  const demo = await prisma.asesor.findUniqueOrThrow({ where: { clerkUserId: DEMO_CLERK_ID } });
  assert.deepEqual(demo.nombresEquipo, { PROSPECTOR: "Toño" });
});
