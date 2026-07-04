/**
 * sesiones.integracion.ts — el chat con Sócrates contra la api REAL (Sesiones).
 *
 * Corre la app Hono en proceso (app.request, sin puerto) contra el Postgres
 * local, en modo asesor demo (sin claves de Clerk ni de IA — NFR-11). Verifica:
 *   - crear una conversación (201) y que aparezca en la lista del asesor;
 *   - enviar un mensaje persiste el turno del usuario Y el de Sócrates, y sin
 *     claves de IA la respuesta es un acuse honesto de oficina (sin jerga
 *     técnica — NFR-14) en lugar de tronar (NFR-11);
 *   - la conversación se bautiza con el primer mensaje si tenía título default;
 *   - TENENCIA (NFR-8): un asesor NO ve, ni toca, ni borra la sesión de otro
 *     (404, indistinguible de inexistente), y la sesión ajena jamás aparece en su lista;
 *   - borrar una conversación arrastra sus mensajes (ON DELETE CASCADE).
 *
 * Requiere DATABASE_URL local migrada y sembrada. Corre con:
 *   pnpm --filter @socrates/api test:integracion
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { app } from "../src/app.js";
import { prisma } from "@socrates/db";

const DEMO_CLERK_ID = "demo-asesor";
/** Marcador estable para barrer lo que crean estas pruebas (título y ajeno). */
const TITULO_PRUEBA = "PRUEBA_INTEGRACION_SESIONES";
const OTRO_CLERK_ID = "prueba-asesor-ajeno-sesiones";

const sesionesCreadas: string[] = [];

async function limpiarPruebas() {
  // Sesiones creadas por las pruebas del asesor demo (por marcador de título)…
  await prisma.sesion.deleteMany({ where: { titulo: { contains: TITULO_PRUEBA } } });
  // …y todo lo del asesor ajeno de prueba (sus sesiones y él mismo).
  const ajeno = await prisma.asesor.findUnique({ where: { clerkUserId: OTRO_CLERK_ID } });
  if (ajeno) {
    await prisma.sesion.deleteMany({ where: { asesorId: ajeno.id } });
    await prisma.asesor.delete({ where: { id: ajeno.id } });
  }
}

async function crearSesion(titulo?: string): Promise<string> {
  const res = await app.request("/sesiones", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(titulo ? { titulo } : {}),
  });
  assert.equal(res.status, 201);
  const body = (await res.json()) as { id: string; titulo: string };
  sesionesCreadas.push(body.id);
  return body.id;
}

before(async () => {
  // Guardia anti-producción (estas pruebas crean y borran filas).
  const url = new URL(process.env.DATABASE_URL ?? "");
  if (
    !["localhost", "127.0.0.1", "::1", "[::1]"].includes(url.hostname) &&
    process.env.PERMITIR_BASE_NO_LOCAL !== "1"
  ) {
    throw new Error(
      `test:integracion se niega a correr contra una base no local (${url.hostname}).`,
    );
  }
  await prisma.$queryRaw`SELECT 1`;
  await limpiarPruebas();
});

after(async () => {
  await limpiarPruebas();
  await prisma.$disconnect();
});

test("crear una conversación la deja lista y aparece en la lista del asesor", async () => {
  const id = await crearSesion(`${TITULO_PRUEBA} lista`);

  const res = await app.request("/sesiones");
  assert.equal(res.status, 200);
  const lista = (await res.json()) as Array<{ id: string; cantidadMensajes: number }>;
  const encontrada = lista.find((s) => s.id === id);
  assert.ok(encontrada, "la conversación recién creada debe aparecer en la lista");
  assert.equal(encontrada.cantidadMensajes, 0);
});

test("enviar un mensaje persiste ambos turnos y sin claves de IA degrada honesto (NFR-11/NFR-14)", async () => {
  const id = await crearSesion(); // nace con el título por defecto

  const res = await app.request(`/sesiones/${id}/mensajes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ texto: `${TITULO_PRUEBA} ¿en qué vamos con Probemedic?` }),
  });
  assert.equal(res.status, 200);
  const body = (await res.json()) as {
    usuario: { rol: string; contenido: string };
    asistente: { rol: string; contenido: string };
  };

  assert.equal(body.usuario.rol, "USUARIO");
  assert.equal(body.asistente.rol, "ASISTENTE");
  assert.ok(body.asistente.contenido.trim().length > 0, "Sócrates responde algo");

  // Sin claves de IA: NUNCA un string-centinela ni jerga técnica (NFR-14).
  const respuesta = body.asistente.contenido;
  assert.doesNotMatch(
    respuesta,
    /\[|IA|inteligencia artificial|modelo|prompt|token|API|servidor|base de datos/i,
    "la respuesta degradada no debe filtrar jerga técnica ni un centinela entre corchetes",
  );

  // Ambos turnos quedaron persistidos (los leemos por el detalle).
  const detalle = (await (await app.request(`/sesiones/${id}`)).json()) as {
    titulo: string;
    mensajes: Array<{ rol: string; contenido: string }>;
  };
  assert.equal(detalle.mensajes.length, 2);
  // La conversación se bautizó con el primer mensaje (ya no es el default).
  assert.notEqual(detalle.titulo, "Nueva conversación");
  assert.match(detalle.titulo, /Probemedic|PRUEBA/i);
});

test("TENENCIA (NFR-8): el asesor demo no ve, ni toca, ni borra la sesión de otro asesor", async () => {
  // Fabricamos un asesor ajeno con una sesión suya, directo en la BD.
  const ajeno = await prisma.asesor.create({
    data: { clerkUserId: OTRO_CLERK_ID, nombre: "Asesor Ajeno" },
  });
  const sesionAjena = await prisma.sesion.create({
    data: { asesorId: ajeno.id, titulo: `${TITULO_PRUEBA} ajena` },
  });

  // 1) No aparece en la lista del asesor demo.
  const lista = (await (await app.request("/sesiones")).json()) as Array<{ id: string }>;
  assert.ok(
    !lista.some((s) => s.id === sesionAjena.id),
    "la sesión de otro asesor jamás debe aparecer en mi lista",
  );

  // 2) No la puedo abrir: 404 (inexistente y ajena son indistinguibles — no se
  //    filtra que la sesión exista), con mensaje de oficina y sin jerga.
  const verAjena = await app.request(`/sesiones/${sesionAjena.id}`);
  assert.equal(verAjena.status, 404);
  const errVer = (await verAjena.json()) as { error: { codigo: string; mensaje: string } };
  assert.equal(errVer.error.codigo, "NO_EXISTE");
  assert.doesNotMatch(errVer.error.mensaje, /tenant|asesorId|forbidden|token/i);

  // 3) No le puedo escribir (404) y NO se crea ningún mensaje en ella.
  const escribirAjena = await app.request(`/sesiones/${sesionAjena.id}/mensajes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ texto: "intruso" }),
  });
  assert.equal(escribirAjena.status, 404);
  const nMensajes = await prisma.mensaje.count({ where: { sesionId: sesionAjena.id } });
  assert.equal(nMensajes, 0, "no debe haber dejado escribir en la sesión ajena");

  // 4) No la puedo borrar (404) y sigue existiendo.
  const borrarAjena = await app.request(`/sesiones/${sesionAjena.id}`, { method: "DELETE" });
  assert.equal(borrarAjena.status, 404);
  const sigue = await prisma.sesion.findUnique({ where: { id: sesionAjena.id } });
  assert.ok(sigue, "no debe borrar la sesión ajena");
});

test("borrar una conversación arrastra sus mensajes (ON DELETE CASCADE)", async () => {
  const id = await crearSesion(`${TITULO_PRUEBA} borrar`);
  await app.request(`/sesiones/${id}/mensajes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ texto: `${TITULO_PRUEBA} para borrar` }),
  });
  assert.ok((await prisma.mensaje.count({ where: { sesionId: id } })) > 0);

  const res = await app.request(`/sesiones/${id}`, { method: "DELETE" });
  assert.equal(res.status, 200);

  assert.equal(await prisma.sesion.count({ where: { id } }), 0);
  assert.equal(
    await prisma.mensaje.count({ where: { sesionId: id } }),
    0,
    "al borrar la sesión sus mensajes deben caer con ella",
  );
});

test("una conversación inexistente responde 404 con mensaje de oficina", async () => {
  const res = await app.request("/sesiones/no-existe-id-xyz");
  assert.equal(res.status, 404);
  const body = (await res.json()) as { error: { codigo: string; mensaje: string } };
  assert.equal(body.error.codigo, "NO_EXISTE");
  assert.doesNotMatch(body.error.mensaje, /null|undefined|prisma|sql/i);
});

test("enviar un mensaje vacío responde 400 dentro del contrato de oficina (no ZodError crudo)", async () => {
  const id = await crearSesion(`${TITULO_PRUEBA} vacío`);
  const res = await app.request(`/sesiones/${id}/mensajes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ texto: "   " }),
  });
  assert.equal(res.status, 400);
  const body = (await res.json()) as {
    error?: { codigo?: string; mensaje?: string };
    name?: string;
  };
  // Contrato de la casa { error: { codigo, mensaje } }, NUNCA el ZodError crudo.
  assert.ok(body.error, "el 400 debe venir dentro del contrato { error }");
  assert.equal(body.error.codigo, "DATOS_INVALIDOS");
  assert.notEqual(body.name, "ZodError");
  assert.doesNotMatch(String(body.error.mensaje), /ZodError|issues|too_small/i);
});
