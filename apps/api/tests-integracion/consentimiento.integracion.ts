/**
 * consentimiento.integracion.ts — la constancia de consentimiento legal contra
 * la api REAL (app Hono en proceso, Postgres local).
 *
 * Regla server-side fail-closed en PATCH /yo/perfil (Paso 1 del recibimiento):
 *   a) sin banderas y sin constancia previa ⇒ 409, la etapa NO avanza y NO se
 *      escribe nada (ni perfil ni constancia);
 *   b) con una sola bandera ⇒ 409;
 *   c) con ambas banderas en true ⇒ 200 y la fila queda con los 4 campos de
 *      constancia y las versiones de LEGAL;
 *   d) una segunda llamada con banderas NO re-escribe la constancia (la fecha
 *      original es la firma);
 *   e) GET /yo refleja el siguientePaso correcto antes ("perfil") y después.
 *
 * Consentimiento a PROFUNDIDAD DE MURALLA (no solo en el Paso 1):
 *   f) POST /pago/checkout sin constancia ⇒ 409 y NO otorga acceso demo;
 *   g) rutas de negocio (GET /expedientes) con suscripción "demo" pero sin
 *      constancia ⇒ 409 (la muralla exige consentimiento además de suscripción);
 *   h) constancia de versión VIEJA (v0.9) ⇒ como si no hubiera: siguientePaso
 *      "perfil", negocio 409; re-aceptar actualiza la constancia a la versión
 *      vigente y restaura el acceso (subir la versión re-pide la firma);
 *   i) re-consentimiento sin fricción: un asesor en etapa "completo" que
 *      re-acepta NO ve corrompida su etapa — solo se registra la constancia.
 *
 * En modo demo (sin Clerk) el auth resuelve al asesor demo sembrado; por eso
 * cada test parte de una fila demo "limpia" (sin constancia) y el archivo la
 * restaura a su estado canónico al terminar, para no romper otras suites.
 */
import { test, before, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import { app } from "../src/app.js";
import { prisma } from "@socrates/db";
import { LEGAL } from "@socrates/shared";

const DEMO_CLERK_ID = "demo-asesor";

const PERFIL_VALIDO = {
  nombreOficina: "Despacho de Prueba",
  zona: "Zona Norte (Monterrey)",
  especialidad: "Crédito empresarial PYME",
};

/** Fuerza el modo demo (sin Clerk): el auth resuelve al asesor demo sembrado. */
async function conModoDemo(fn: () => Promise<void>) {
  const claves = ["CLERK_SECRET_KEY", "CLERK_JWT_KEY", "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"];
  const previas = new Map(claves.map((k) => [k, process.env[k]]));
  for (const k of claves) delete process.env[k];
  const prevNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "test";
  try {
    await fn();
  } finally {
    for (const [k, v] of previas) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
    if (prevNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = prevNodeEnv;
  }
}

/** Deja al asesor demo SIN constancia y con perfil vacío: el arranque de cada test. */
async function demoSinConstancia() {
  await prisma.asesor.update({
    where: { clerkUserId: DEMO_CLERK_ID },
    data: {
      nombreOficina: null,
      zona: null,
      especialidad: null,
      onboardingEtapa: "perfil",
      estadoSuscripcion: "demo",
      consentimientoTerminosEn: null,
      consentimientoTerminosVersion: null,
      consentimientoAvisoEn: null,
      consentimientoAvisoVersion: null,
    },
  });
}

/** Restaura al asesor demo a su estado canónico del seed (con constancia). */
async function restaurarDemoCanonico() {
  const ahora = new Date();
  await prisma.asesor.updateMany({
    where: { clerkUserId: DEMO_CLERK_ID },
    data: {
      nombreOficina: "SOC | TALENT",
      zona: "Zona Norte (Monterrey)",
      especialidad: "Crédito empresarial PYME",
      onboardingEtapa: "completo",
      estadoSuscripcion: "demo",
      consentimientoTerminosEn: ahora,
      consentimientoTerminosVersion: LEGAL.terminosVersion,
      consentimientoAvisoEn: ahora,
      consentimientoAvisoVersion: LEGAL.avisoVersion,
    },
  });
}

async function patchPerfil(body: Record<string, unknown>) {
  return app.request("/yo/perfil", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function leerDemo() {
  return prisma.asesor.findUnique({ where: { clerkUserId: DEMO_CLERK_ID } });
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
});

beforeEach(async () => {
  await demoSinConstancia();
});

after(async () => {
  await restaurarDemoCanonico();
  await prisma.$disconnect();
});

// ── a) sin banderas, sin constancia previa ⇒ 409, nada se escribe ────────────
test("PATCH /yo/perfil sin banderas ⇒ 409, la etapa NO avanza y NO se escribe nada", async () => {
  await conModoDemo(async () => {
    const res = await patchPerfil({ ...PERFIL_VALIDO });
    assert.equal(res.status, 409, "sin constancia y sin aceptar, debe ser 409");
    // Contrato de error de la casa: { error: { codigo, mensaje } } (el api-client
    // lee error.mensaje para mostrárselo al asesor).
    const body = (await res.json()) as { error: { codigo: string; mensaje: string } };
    assert.match(body.error.mensaje, /Términos y Condiciones/i, "el mensaje nombra los Términos");
    assert.match(body.error.mensaje, /Aviso de Privacidad/i, "y el Aviso de Privacidad");
    assert.doesNotMatch(body.error.mensaje, /token|api|servidor|base de datos/i, "mensaje de oficina");

    const demo = await leerDemo();
    assert.equal(demo?.onboardingEtapa, "perfil", "la etapa NO avanza");
    assert.equal(demo?.nombreOficina, null, "el perfil NO se escribe en un 409");
    assert.equal(demo?.consentimientoTerminosEn, null, "la constancia NO se escribe");
    assert.equal(demo?.consentimientoAvisoEn, null, "la constancia NO se escribe");
  });
});

// ── b) una sola bandera ⇒ 409 ────────────────────────────────────────────────
test("PATCH /yo/perfil con SOLO aceptaTerminos ⇒ 409 (faltan ambas)", async () => {
  await conModoDemo(async () => {
    const res = await patchPerfil({ ...PERFIL_VALIDO, aceptaTerminos: true });
    assert.equal(res.status, 409, "una sola bandera no basta");
    const demo = await leerDemo();
    assert.equal(demo?.consentimientoTerminosEn, null, "no se escribe constancia parcial");
    assert.equal(demo?.consentimientoAvisoEn, null, "no se escribe constancia parcial");
  });
});

test("PATCH /yo/perfil con SOLO aceptaAviso ⇒ 409 (faltan ambas)", async () => {
  await conModoDemo(async () => {
    const res = await patchPerfil({ ...PERFIL_VALIDO, aceptaAviso: true });
    assert.equal(res.status, 409, "una sola bandera no basta");
    const demo = await leerDemo();
    assert.equal(demo?.consentimientoAvisoEn, null, "no se escribe constancia parcial");
  });
});

// ── c) ambas banderas ⇒ 200 y la fila queda con los 4 campos y versiones LEGAL ─
test("PATCH /yo/perfil con ambas banderas ⇒ 200, constancia completa con versiones de LEGAL", async () => {
  await conModoDemo(async () => {
    const antes = Date.now();
    const res = await patchPerfil({ ...PERFIL_VALIDO, aceptaTerminos: true, aceptaAviso: true });
    assert.equal(res.status, 200, "con ambas banderas, el perfil se guarda");

    const demo = await leerDemo();
    assert.equal(demo?.nombreOficina, PERFIL_VALIDO.nombreOficina, "el perfil sí se escribe");
    assert.equal(demo?.onboardingEtapa, "pago", "la etapa avanza al siguiente paso");
    assert.ok(demo?.consentimientoTerminosEn, "queda fecha de Términos");
    assert.ok(demo?.consentimientoAvisoEn, "queda fecha de Aviso");
    assert.equal(demo?.consentimientoTerminosVersion, LEGAL.terminosVersion, "versión de Términos = LEGAL");
    assert.equal(demo?.consentimientoAvisoVersion, LEGAL.avisoVersion, "versión de Aviso = LEGAL");
    assert.ok(
      demo!.consentimientoTerminosEn!.getTime() >= antes - 1000,
      "la fecha de constancia es de ahora",
    );
  });
});

// ── d) segunda llamada con banderas ⇒ la constancia original NO se sobrescribe ─
test("PATCH /yo/perfil dos veces ⇒ la constancia original NO se re-escribe (la fecha es la firma)", async () => {
  await conModoDemo(async () => {
    const primera = await patchPerfil({ ...PERFIL_VALIDO, aceptaTerminos: true, aceptaAviso: true });
    assert.equal(primera.status, 200);
    const trasPrimera = await leerDemo();
    const fechaFirma = trasPrimera!.consentimientoTerminosEn!.getTime();
    const fechaAvisoFirma = trasPrimera!.consentimientoAvisoEn!.getTime();

    // Pequeña pausa para que un re-escrito (indeseado) tuviera una fecha distinta.
    await new Promise((r) => setTimeout(r, 20));

    const segunda = await patchPerfil({
      nombreOficina: "Otro Nombre",
      zona: "Otra Zona",
      especialidad: "Otra especialidad",
      aceptaTerminos: true,
      aceptaAviso: true,
    });
    assert.equal(segunda.status, 200, "una segunda edición del perfil sigue siendo válida");

    const trasSegunda = await leerDemo();
    assert.equal(
      trasSegunda!.consentimientoTerminosEn!.getTime(),
      fechaFirma,
      "la fecha de Términos NO cambia en la segunda llamada",
    );
    assert.equal(
      trasSegunda!.consentimientoAvisoEn!.getTime(),
      fechaAvisoFirma,
      "la fecha de Aviso NO cambia en la segunda llamada",
    );
    assert.equal(trasSegunda?.nombreOficina, "Otro Nombre", "el perfil sí se puede seguir editando");
  });
});

// ── f) el checkout NO se brinca el consentimiento ─────────────────────────────
test("POST /pago/checkout sin constancia ⇒ 409 y NO otorga acceso demo", async () => {
  await conModoDemo(async () => {
    // Partimos sin constancia (beforeEach) y SIN acceso, como un asesor nuevo
    // que intenta brincarse el Paso 1 llamando el cobro directo.
    await prisma.asesor.update({
      where: { clerkUserId: DEMO_CLERK_ID },
      data: { estadoSuscripcion: "ninguna" },
    });
    const res = await app.request("/pago/checkout", { method: "POST" });
    assert.equal(res.status, 409, "el checkout exige consentimiento ANTES de abrir acceso");
    const body = (await res.json()) as { error: { codigo: string } };
    assert.equal(body.error.codigo, "FALTA_CONSENTIMIENTO");

    const demo = await leerDemo();
    assert.equal(demo?.estadoSuscripcion, "ninguna", "NO se otorgó acceso demo sin consentir");
    assert.equal(demo?.consentimientoTerminosEn, null, "no se escribió constancia");
  });
});

// ── g) la muralla de negocio exige consentimiento además de suscripción ───────
test("GET /expedientes con suscripción 'demo' pero SIN constancia ⇒ 409", async () => {
  await conModoDemo(async () => {
    // beforeEach deja al demo con estadoSuscripcion "demo" y SIN constancia:
    // suscripción con acceso, consentimiento ausente. La muralla debe frenar.
    const res = await app.request("/expedientes");
    assert.equal(res.status, 409, "sin constancia, ni una suscripción con acceso abre negocio");
    const body = (await res.json()) as { error: { codigo: string; mensaje: string } };
    assert.equal(body.error.codigo, "FALTA_CONSENTIMIENTO");
    assert.match(body.error.mensaje, /Términos y Condiciones/i);
  });
});

// ── g bis) las SESIONES (chat que quema IA real) también están tras la muralla ─
test("sesiones con suscripción 'demo' pero SIN constancia ⇒ 409 (GET y POST)", async () => {
  await conModoDemo(async () => {
    // El chat con Socratia es ruta de negocio (consume IA/dinero): sin
    // constancia vigente no se alcanza ni para leer ni para escribir.
    const lectura = await app.request("/sesiones");
    assert.equal(lectura.status, 409, "GET /sesiones sin constancia ⇒ 409");
    const bodyLectura = (await lectura.json()) as { error: { codigo: string } };
    assert.equal(bodyLectura.error.codigo, "FALTA_CONSENTIMIENTO");

    const escritura = await app.request("/sesiones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    assert.equal(escritura.status, 409, "POST /sesiones sin constancia ⇒ 409");
    const bodyEscritura = (await escritura.json()) as { error: { codigo: string; mensaje: string } };
    assert.equal(bodyEscritura.error.codigo, "FALTA_CONSENTIMIENTO");
    assert.match(bodyEscritura.error.mensaje, /Términos y Condiciones/i);
  });
});

// ── h) la VERSIÓN de la constancia muerde ─────────────────────────────────────
test("constancia de versión vieja (v0.9) ⇒ 'perfil' + negocio 409; re-aceptar la actualiza y restaura acceso", async () => {
  await conModoDemo(async () => {
    // Asesor con perfil completo, acceso demo y una constancia REAL pero de una
    // versión anterior de los documentos (v0.9): debe tratarse como pendiente.
    const fechaVieja = new Date("2026-01-01T12:00:00Z");
    await prisma.asesor.update({
      where: { clerkUserId: DEMO_CLERK_ID },
      data: {
        ...PERFIL_VALIDO,
        onboardingEtapa: "completo",
        estadoSuscripcion: "demo",
        consentimientoTerminosEn: fechaVieja,
        consentimientoTerminosVersion: "0.9",
        consentimientoAvisoEn: fechaVieja,
        consentimientoAvisoVersion: "0.9",
      },
    });

    const yoRes = await app.request("/yo");
    const yo = (await yoRes.json()) as { siguientePaso: string };
    assert.equal(yo.siguientePaso, "perfil", "constancia vieja ⇒ re-pedir la firma (perfil)");

    const negocio = await app.request("/expedientes");
    assert.equal(negocio.status, 409, "constancia vieja ⇒ el negocio se frena con 409");

    // Re-aceptar: PATCH con banderas SÍ re-escribe la constancia (versión nueva).
    const patch = await patchPerfil({ ...PERFIL_VALIDO, aceptaTerminos: true, aceptaAviso: true });
    assert.equal(patch.status, 200);
    const demo = await leerDemo();
    assert.equal(demo?.consentimientoTerminosVersion, LEGAL.terminosVersion, "versión actualizada");
    assert.equal(demo?.consentimientoAvisoVersion, LEGAL.avisoVersion, "versión actualizada");
    assert.ok(
      demo!.consentimientoTerminosEn!.getTime() > fechaVieja.getTime(),
      "la fecha de la re-firma es nueva",
    );

    const negocioDespues = await app.request("/expedientes");
    assert.equal(negocioDespues.status, 200, "re-aceptar restaura el acceso al negocio");
  });
});

// ── i) re-consentimiento sin fricción para el asesor ya establecido ───────────
test("asesor en etapa 'completo' sin constancia: PATCH con banderas registra la constancia SIN corromper la etapa", async () => {
  await conModoDemo(async () => {
    // Un asesor de versión vieja: recibimiento completo, sin constancia (los
    // campos nuevos nacieron NULL para él). Al re-aceptar, solo se registra la
    // constancia; su etapa no se toca.
    await prisma.asesor.update({
      where: { clerkUserId: DEMO_CLERK_ID },
      data: { ...PERFIL_VALIDO, onboardingEtapa: "completo", estadoSuscripcion: "demo" },
    });

    const patch = await patchPerfil({ ...PERFIL_VALIDO, aceptaTerminos: true, aceptaAviso: true });
    assert.equal(patch.status, 200);

    const demo = await leerDemo();
    assert.equal(demo?.onboardingEtapa, "completo", "la etapa NO se corrompe ni retrocede");
    assert.ok(demo?.consentimientoTerminosEn, "la constancia quedó escrita");
    assert.equal(demo?.consentimientoTerminosVersion, LEGAL.terminosVersion);

    const yoRes = await app.request("/yo");
    const yo = (await yoRes.json()) as { siguientePaso: string };
    assert.equal(yo.siguientePaso, "completo", "GET /yo lo deja pasar de vuelta a su oficina");
  });
});

// ── e) GET /yo refleja el siguientePaso correcto antes y después ─────────────
test("GET /yo: siguientePaso es 'perfil' sin constancia y avanza cuando ya la hay", async () => {
  await conModoDemo(async () => {
    // Con perfil completo pero SIN constancia, el portero regresa a 'perfil'.
    await prisma.asesor.update({
      where: { clerkUserId: DEMO_CLERK_ID },
      data: { ...PERFIL_VALIDO, onboardingEtapa: "completo", estadoSuscripcion: "demo" },
    });
    const antes = await app.request("/yo");
    assert.equal(antes.status, 200);
    const yoAntes = (await antes.json()) as { siguientePaso: string };
    assert.equal(yoAntes.siguientePaso, "perfil", "sin constancia, siguientePaso = perfil");

    // Tras aceptar, la constancia queda y el portero ya no rebota a 'perfil'.
    const patch = await patchPerfil({ ...PERFIL_VALIDO, aceptaTerminos: true, aceptaAviso: true });
    assert.equal(patch.status, 200);
    // Con demo + bienvenida vista + constancia, ya no debe pedir 'perfil'.
    await prisma.asesor.update({
      where: { clerkUserId: DEMO_CLERK_ID },
      data: { onboardingEtapa: "completo" },
    });
    const despues = await app.request("/yo");
    const yoDespues = (await despues.json()) as { siguientePaso: string };
    assert.notEqual(yoDespues.siguientePaso, "perfil", "con constancia ya no rebota a perfil");
    assert.equal(yoDespues.siguientePaso, "completo", "demo + bienvenida + constancia ⇒ completo");
  });
});
