/**
 * encargos-y-worker.integracion.ts — el motor de encargos contra la api y el
 * worker REALES (misión de lanzamiento §2.1/2.2/2.6/2.9).
 *
 * Corre la app Hono en proceso (app.request) contra Postgres local, en modo
 * asesor demo. Verifica:
 *   - encargar crea una Tarea ENCARGADA (feliz, duplicado, ajeno, terminal);
 *   - el worker (procesarUnaTarea) reclama y ejecuta con un Empleado inyectado;
 *   - la fidelidad C-1 descarta recomendaciones fuera del catálogo real;
 *   - un rol sin implementación queda BLOQUEADA con motivo digno;
 *   - una Tarea que excede su tiempo queda BLOQUEADA por tiempo de espera;
 *   - recuperarHuerfanas retoma una Tarea EN_CURSO abandonada;
 *   - aprobar sin `version` responde 400 (A1).
 *
 * Requiere DATABASE_URL local migrada y sembrada. Corre con:
 *   pnpm --filter @socrates/api test:integracion
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { app } from "../src/app.js";
import { prisma } from "@socrates/db";
import { procesarUnaTarea, recuperarHuerfanas } from "../src/worker/index.js";
import type { Empleado } from "@socrates/shared";

const EMPRESA_PRUEBA = "Prueba Encargos Worker";
const CLERK_ID_OTRO = "otro-asesor-prueba-encargos-worker";

const creadosExpediente: string[] = [];
let otroAsesorId: string;

const JSON_HEADERS = { "Content-Type": "application/json" };

async function limpiarPruebas() {
  await prisma.recomendacion.deleteMany({
    where: { version: { entregable: { expediente: { empresa: EMPRESA_PRUEBA } } } },
  });
  await prisma.entregableVersion.deleteMany({ where: { entregable: { expediente: { empresa: EMPRESA_PRUEBA } } } });
  await prisma.entregable.deleteMany({ where: { expediente: { empresa: EMPRESA_PRUEBA } } });
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

async function encargar(expedienteId: string, empleadoRol: string, descripcion?: string) {
  return app.request(`/expedientes/${expedienteId}/tareas`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(descripcion ? { empleadoRol, descripcion } : { empleadoRol }),
  });
}

/**
 * Vacía cualquier Tarea ENCARGADA que haya quedado de una prueba anterior que
 * solo ejercita el endpoint de encargar (sin invocar al worker) — el reclamo
 * del worker es FIFO GLOBAL por diseño (correcto en producción), así que una
 * Tarea huérfana de otra prueba se colaría antes que la de la prueba actual.
 * Con registro vacío, cualquier rol queda BLOQUEADA "no disponible": no nos
 * interesa el resultado, solo drenar la cola para no contaminar el orden.
 */
async function drenarCola(): Promise<void> {
  while (await procesarUnaTarea({ registro: {} })) {
    // sigue drenando
  }
}

before(async () => {
  // Guardia anti-producción (el test crea y borra expedientes/tareas/entregables).
  const url = new URL(process.env.DATABASE_URL ?? "");
  if (!["localhost", "127.0.0.1", "::1", "[::1]"].includes(url.hostname) && process.env.PERMITIR_BASE_NO_LOCAL !== "1") {
    throw new Error(`test:integracion se niega a correr contra una base no local (${url.hostname}).`);
  }
  await prisma.$queryRaw`SELECT 1`;
  await limpiarPruebas(); // barre huérfanos de corridas anteriores matadas a medias

  const otro = await prisma.asesor.create({
    data: {
      clerkUserId: CLERK_ID_OTRO,
      nombre: "Otro Asesor",
      email: "otro-worker@example.com",
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

// ── Encargar (POST /expedientes/:id/tareas) ─────────────────────────────────

test("encargar crea una Tarea ENCARGADA con la descripción por defecto del rol", async () => {
  const id = await crearExpediente();
  const res = await encargar(id, "INVESTIGADOR");
  assert.equal(res.status, 201);
  const body = (await res.json()) as { empleadoRol: string; estado: string; descripcion: string };
  assert.equal(body.empleadoRol, "INVESTIGADOR");
  assert.equal(body.estado, "ENCARGADA");
  assert.ok(body.descripcion.length > 0);
  await drenarCola(); // no dejar esta Tarea ENCARGADA contaminando el FIFO de pruebas siguientes
});

test("encargar el mismo rol dos veces mientras hay uno vivo responde 409 CONFLICTO", async () => {
  const id = await crearExpediente();
  const primero = await encargar(id, "PROSPECTOR", "Califica este prospecto");
  assert.equal(primero.status, 201);
  const segundo = await encargar(id, "PROSPECTOR", "Otra vez");
  assert.equal(segundo.status, 409);
  const body = (await segundo.json()) as { error: { codigo: string } };
  assert.equal(body.error.codigo, "CONFLICTO");
  await drenarCola();
});

test("encargar en un expediente ajeno responde 403", async () => {
  const ajeno = await prisma.expediente.create({
    data: { asesorId: otroAsesorId, empresa: EMPRESA_PRUEBA, ciudad: "CDMX", industria: "Pruebas", etapa: "PROSPECTO" },
  });
  const res = await encargar(ajeno.id, "GESTOR");
  assert.equal(res.status, 403);
  const body = (await res.json()) as { error: { codigo: string } };
  assert.equal(body.error.codigo, "AJENO");
  await prisma.expediente.delete({ where: { id: ajeno.id } });
});

test("encargar en un expediente cerrado (GANADO) responde 409 TRANSICION_INVALIDA", async () => {
  const id = await crearExpediente();
  await prisma.expediente.update({ where: { id }, data: { etapa: "GANADO" } });
  const res = await encargar(id, "NEGOCIADOR");
  assert.equal(res.status, 409);
  const body = (await res.json()) as { error: { codigo: string } };
  assert.equal(body.error.codigo, "TRANSICION_INVALIDA");
});

// ── El worker (procesarUnaTarea) ────────────────────────────────────────────

test("el worker entrega un Entregable BORRADOR y aplica fidelidad C-1", async () => {
  const id = await crearExpediente();
  const encargo = await encargar(id, "ASESOR_PRODUCTO", "Recomienda un producto");
  const tarea = (await encargo.json()) as { id: string };

  const empleadoFalso: Empleado = {
    rol: "ASESOR_PRODUCTO",
    async ejecutar() {
      return {
        entregables: [
          {
            tipo: "recomendaciones_producto",
            contenido: {
              esquema: "entregable-generico",
              version: 1,
              tipo: "recomendaciones_producto",
              titulo: "Recomendación de producto",
              resumen: ["Se identificó una opción viable en el catálogo."],
              secciones: [
                {
                  titulo: "Opción sugerida",
                  bloques: [{ tipo: "parrafo", texto: "Detalle de la sugerencia.", afirmaciones: [] }],
                },
              ],
              recomendacionesFinanciamiento: [
                {
                  necesidad: "Capital de trabajo",
                  productoId: "banorte-credito-revolvente",
                  institucionId: "banorte", // real: coincide con el producto real
                  // Nombre/institución DELIBERADAMENTE inventados (la IA podría
                  // alucinar la etiqueta aunque el id sea real) — deben quedar
                  // sobrescritos con los valores reales del catálogo (C-1).
                  productoNombre: "Crédito PyME Preferente 8.9% (nombre inventado)",
                  institucionNombre: "Banco Inventado S.A.",
                  usoEspecifico: "Cubrir nómina en picos de demanda",
                },
                {
                  necesidad: "Expansión",
                  productoId: "banorte-credito-revolvente",
                  institucionId: "mifel", // inconsistente a propósito: debe descartarse
                  productoNombre: "Línea de Crédito Revolvente Empresarial",
                  institucionNombre: "Mifel",
                  usoEspecifico: "Apertura de sucursal",
                },
              ],
              brechas: [],
              fuentes: [],
            },
          },
        ],
      };
    },
  };

  const procesado = await procesarUnaTarea({ registro: { ASESOR_PRODUCTO: empleadoFalso } });
  assert.equal(procesado, true);

  const tareaFinal = await prisma.tarea.findUniqueOrThrow({ where: { id: tarea.id } });
  assert.equal(tareaFinal.estado, "ENTREGADA");
  assert.equal(tareaFinal.progresoPct, 100);

  const entregable = await prisma.entregable.findUniqueOrThrow({
    where: { tareaId: tarea.id },
    include: { versiones: true },
  });
  assert.equal(entregable.estado, "BORRADOR");
  assert.equal(entregable.tipo, "recomendaciones_producto");
  assert.equal(entregable.versiones.length, 1);
  const version = entregable.versiones[0];
  assert.ok(version, "debe existir la versión 1 del entregable");

  const contenido = JSON.parse(version.contenido) as {
    recomendacionesFinanciamiento: { institucionId: string; productoNombre: string; institucionNombre: string }[];
    brechas: unknown[];
  };
  assert.equal(contenido.recomendacionesFinanciamiento.length, 1, "solo debe sobrevivir la recomendación real");
  assert.equal(contenido.recomendacionesFinanciamiento[0]?.institucionId, "banorte");
  // C-1 no solo valida el id: el NOMBRE que ve el asesor se sobrescribe con el
  // real del catálogo — la IA no puede colar una etiqueta inventada aunque el
  // id sea válido (hallazgo de la revisión adversarial, corregido en el acto).
  assert.equal(
    contenido.recomendacionesFinanciamiento[0]?.productoNombre,
    "Línea de Crédito Revolvente Empresarial",
    "el nombre inventado por la IA debe quedar reemplazado por el nombre real del catálogo",
  );
  assert.equal(
    contenido.recomendacionesFinanciamiento[0]?.institucionNombre,
    "Banorte",
    "la institución inventada debe quedar reemplazada por la real",
  );
  assert.equal(contenido.brechas.length, 1, "la descartada debe registrarse como brecha honesta");

  const recomendaciones = await prisma.recomendacion.findMany({ where: { versionId: version.id } });
  assert.equal(recomendaciones.length, 1);
  assert.equal(recomendaciones[0]?.productoId, "banorte-credito-revolvente");
});

test("un rol sin implementación queda BLOQUEADA con motivo digno (NFR-11/14)", async () => {
  const id = await crearExpediente();
  const encargo = await encargar(id, "TRAMITADOR");
  const tarea = (await encargo.json()) as { id: string };

  const procesado = await procesarUnaTarea({ registro: {} }); // registro vacío a propósito
  assert.equal(procesado, true);

  const tareaFinal = await prisma.tarea.findUniqueOrThrow({ where: { id: tarea.id } });
  assert.equal(tareaFinal.estado, "BLOQUEADA");
  assert.equal(tareaFinal.motivo, "Este especialista aún no está disponible.");
  assert.doesNotMatch(tareaFinal.motivo ?? "", /agente|prompt|IA\b|modelo/i);
});

test("una Tarea que excede su tiempo queda BLOQUEADA por tiempo de espera", async () => {
  const id = await crearExpediente();
  const encargo = await encargar(id, "GESTOR");
  const tarea = (await encargo.json()) as { id: string };

  const empleadoLento: Empleado = {
    rol: "GESTOR",
    async ejecutar() {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return { entregables: [] };
    },
  };

  const procesado = await procesarUnaTarea({ registro: { GESTOR: empleadoLento }, timeoutMs: 20 });
  assert.equal(procesado, true);

  const tareaFinal = await prisma.tarea.findUniqueOrThrow({ where: { id: tarea.id } });
  assert.equal(tareaFinal.estado, "BLOQUEADA");
  assert.equal(tareaFinal.motivo, "Tiempo de espera excedido.");
});

test("recuperarHuerfanas retoma una Tarea EN_CURSO abandonada de vuelta a ENCARGADA", async () => {
  const id = await crearExpediente();
  const tarea = await prisma.tarea.create({
    data: { expedienteId: id, empleadoRol: "TRAMITADOR", descripcion: "Encargo huérfano", estado: "EN_CURSO" },
  });
  // Bypass de @updatedAt: solo el SQL crudo garantiza la fecha vieja que necesita el umbral.
  await prisma.$executeRaw`UPDATE "Tarea" SET "actualizadoEn" = now() - interval '1 hour' WHERE id = ${tarea.id}`;

  const recuperadas = await recuperarHuerfanas(500); // umbral de 500 ms para la prueba
  assert.ok(recuperadas >= 1);

  const fresca = await prisma.tarea.findUniqueOrThrow({ where: { id: tarea.id } });
  assert.equal(fresca.estado, "ENCARGADA");
  assert.equal(fresca.progresoPct, null);
  await drenarCola(); // la recién retomada queda ENCARGADA: no contaminar la siguiente prueba
});

// ── Aprobar (A1: version obligatoria) ───────────────────────────────────────

test("aprobar sin `version` responde 400 DATOS_INVALIDOS (A1)", async () => {
  const id = await crearExpediente();
  const encargo = await encargar(id, "GESTOR");
  const tarea = (await encargo.json()) as { id: string };

  const empleado: Empleado = {
    rol: "GESTOR",
    async ejecutar() {
      return {
        entregables: [
          {
            tipo: "seguimiento",
            contenido: {
              esquema: "entregable-generico",
              version: 1,
              tipo: "seguimiento",
              titulo: "Plan de seguimiento",
              resumen: ["Próximos pasos con el prospecto."],
              secciones: [
                {
                  titulo: "Siguientes pasos",
                  bloques: [{ tipo: "lista", estilo: "pasos", items: [{ texto: "Llamar en 3 días", afirmaciones: [] }] }],
                },
              ],
              recomendacionesFinanciamiento: [],
              brechas: [],
              fuentes: [],
            },
          },
        ],
      };
    },
  };
  await procesarUnaTarea({ registro: { GESTOR: empleado } });

  const entregable = await prisma.entregable.findUniqueOrThrow({ where: { tareaId: tarea.id } });
  const res = await app.request(`/entregables/${entregable.id}/aprobar`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({}),
  });
  assert.equal(res.status, 400);
  const body = (await res.json()) as { error: { codigo: string } };
  assert.equal(body.error.codigo, "DATOS_INVALIDOS");

  // Con la version correcta, sí aprueba (paridad con el comportamiento previo).
  const conVersion = await app.request(`/entregables/${entregable.id}/aprobar`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ version: 1 }),
  });
  assert.equal(conVersion.status, 200);
});
