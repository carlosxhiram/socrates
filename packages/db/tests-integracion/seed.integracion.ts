/**
 * seed.integracion.ts — el seed contra la base REAL (Postgres local).
 *
 * Verifica, corriendo de verdad (no asumido):
 *   1. El seed es idempotente: correrlo dos veces deja exactamente los mismos datos.
 *   2. La fidelidad del catálogo sembrado contra catalogo-soc.json (ni más ni menos).
 *   3. C-1 en el seed: CERO filas Recomendacion con FK inventada (el reporte
 *      sembrado usa ids soc_* que no existen aún en el catálogo; por diseño no
 *      se crean Recomendacion para ellos).
 *   4. El Reporte de Probemedic sembrado valida contra ReporteV1 al leerlo de la BD.
 *
 * Requiere DATABASE_URL apuntando a una base migrada (pnpm db:deploy). Corre con:
 *   pnpm --filter @socrates/db test:integracion
 * (Vive fuera de src/ para que `pnpm test` — node --test — no lo descubra:
 *  los unitarios corren sin base; la integración se pide explícita.)
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { parsearReporteV1 } from "@socrates/shared";
import { sembrar, prisma } from "../src/seed/seed.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const RUTA_CATALOGO = join(__dirname, "..", "src", "seed", "catalogo-soc.json");

interface CatalogoJSON {
  instituciones: { id: string; productos: { id: string }[] }[];
}

async function contarTodo() {
  const [empleados, instituciones, productos, asesores, expedientes, tareas, entregables, versiones, recomendaciones] =
    await Promise.all([
      prisma.empleado.count(),
      prisma.institucion.count(),
      prisma.producto.count(),
      prisma.asesor.count({ where: { clerkUserId: "demo-asesor" } }),
      prisma.expediente.count({ where: { empresa: { in: ["Las Aliadas", "Probemedic"] } } }),
      prisma.tarea.count(),
      prisma.entregable.count(),
      prisma.entregableVersion.count(),
      prisma.recomendacion.count(),
    ]);
  return { empleados, instituciones, productos, asesores, expedientes, tareas, entregables, versiones, recomendaciones };
}

before(async () => {
  // Falla honesto y temprano si la base no está disponible/migrada.
  await prisma.$queryRaw`SELECT 1`;
});

after(async () => {
  await prisma.$disconnect();
});

test("el seed corre dos veces y deja exactamente los mismos datos (idempotencia)", async () => {
  await sembrar();
  const primera = await contarTodo();

  await sembrar();
  const segunda = await contarTodo();

  assert.deepEqual(segunda, primera, "resembrar cambió los conteos: el seed no es idempotente");
  assert.equal(primera.asesores, 1, "debe existir exactamente un asesor demo");
  assert.equal(primera.expedientes, 2, "deben existir Las Aliadas y Probemedic");
});

test("el catálogo sembrado es fiel a catalogo-soc.json — ni una institución/producto de más o de menos", async () => {
  const catalogo = JSON.parse(readFileSync(RUTA_CATALOGO, "utf-8")) as CatalogoJSON;
  const idsInstEsperados = new Set(catalogo.instituciones.map((i) => i.id));
  const idsProdEsperados = new Set(catalogo.instituciones.flatMap((i) => i.productos.map((p) => p.id)));

  const instBD = await prisma.institucion.findMany({ select: { id: true } });
  const prodBD = await prisma.producto.findMany({ select: { id: true } });

  assert.deepEqual(new Set(instBD.map((i) => i.id)), idsInstEsperados);
  assert.deepEqual(new Set(prodBD.map((p) => p.id)), idsProdEsperados);
});

test("C-1 en el seed: cero Recomendacion con FK inventada", async () => {
  // El reporte sembrado de Probemedic referencia ids soc_* que aún no existen en
  // el catálogo; la regla C-1 manda NO crear filas Recomendacion para ellos.
  const recomendaciones = await prisma.recomendacion.count();
  assert.equal(recomendaciones, 0, "el seed no debe fabricar Recomendacion sin FK real al catálogo");
});

test("el Reporte de Probemedic leído de la BD valida contra ReporteV1 y quedó APROBADO", async () => {
  const entregable = await prisma.entregable.findFirst({
    where: { tipo: "reporte_inteligencia", expediente: { empresa: "Probemedic" } },
    include: { versiones: true },
  });
  assert.ok(entregable, "debe existir el Entregable del reporte de Probemedic");
  assert.equal(entregable.estado, "APROBADO");
  assert.equal(entregable.versiones.length, 1);
  const version = entregable.versiones[0];
  assert.ok(version, "el reporte debe tener su versión 1");

  const contenido: unknown = JSON.parse(version.contenido);
  const reporte = parsearReporteV1(contenido); // truena si no valida
  assert.ok(reporte.resumenEjecutivo, "el reporte validado conserva su resumen ejecutivo");
});
