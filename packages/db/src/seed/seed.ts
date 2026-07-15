/**
 * seed.ts — siembra realista de Socratia (FR-22, E1/E7).
 *
 * Crea:
 *   1. Los 6 empleados + Socratia (catálogo de roles, lenguaje de oficina).
 *   2. El Catálogo SOC desde catalogo-soc.json (17 instituciones, 22 productos).
 *   3. Un Asesor demo (clerkUserId = "demo-asesor") para el Modo sin claves.
 *   4. Dos Expedientes: Las Aliadas (RECOMENDADO) y Probemedic (INVESTIGADO),
 *      con etapas/progreso y tareas.
 *   5. El Reporte de Probemedic como Entregable APROBADO (reporte-probemedic-seed),
 *      validado con parsearReporteV1 antes de tocar la BD (D-9).
 *
 * Idempotente: usa upsert por ids estables. Correr de nuevo no duplica.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { PrismaClient } from "../generated/client/index.js";
import {
  EMPLEADOS,
  ROLES_EMPLEADO,
  LEGAL,
  derivarProgreso,
  parsearReporteV1,
} from "@socrates/shared";
import { reporteProbemedicSeed } from "./reporte-probemedic-seed.js";

/** Cliente propio del seed (exportado para que los tests puedan desconectarlo). */
export const prisma = new PrismaClient();
const __dirname = dirname(fileURLToPath(import.meta.url));

interface ProductoJSON {
  id: string;
  nombre: string;
  tipo: string;
  paraQueSirve: string;
  cuandoRecomendar: string[];
  condicionesTipicas: Record<string, unknown>;
  fuente?: string;
}
interface InstitucionJSON {
  id: string;
  nombre: string;
  tipo: string;
  cobertura?: string;
  notas?: string;
  fuente?: string;
  productos: ProductoJSON[];
}
interface CatalogoJSON {
  instituciones: InstitucionJSON[];
}

const DEMO_ASESOR_CLERK_ID = "demo-asesor";

async function sembrarEmpleados() {
  for (const rol of ROLES_EMPLEADO) {
    const perfil = EMPLEADOS[rol];
    await prisma.empleado.upsert({
      where: { rol },
      update: { nombre: perfil.nombre, descripcion: perfil.descripcion },
      create: { rol, nombre: perfil.nombre, descripcion: perfil.descripcion },
    });
  }
  console.log(`  ✓ ${ROLES_EMPLEADO.length} empleados (incl. Socratia)`);
}

async function sembrarCatalogo() {
  const ruta = join(__dirname, "catalogo-soc.json");
  const data = JSON.parse(readFileSync(ruta, "utf-8")) as CatalogoJSON;
  let nProd = 0;
  for (const inst of data.instituciones) {
    await prisma.institucion.upsert({
      where: { id: inst.id },
      update: {
        nombre: inst.nombre,
        tipo: inst.tipo,
        cobertura: inst.cobertura ?? null,
        notas: inst.notas ?? null,
        fuente: inst.fuente ?? null,
      },
      create: {
        id: inst.id,
        nombre: inst.nombre,
        tipo: inst.tipo,
        cobertura: inst.cobertura ?? null,
        notas: inst.notas ?? null,
        fuente: inst.fuente ?? null,
      },
    });
    for (const p of inst.productos) {
      await prisma.producto.upsert({
        where: { id: p.id },
        update: {
          nombre: p.nombre,
          tipo: p.tipo,
          paraQueSirve: p.paraQueSirve,
          cuandoRecomendar: JSON.stringify(p.cuandoRecomendar),
          condiciones: JSON.stringify(p.condicionesTipicas),
          fuente: p.fuente ?? null,
        },
        create: {
          id: p.id,
          institucionId: inst.id,
          nombre: p.nombre,
          tipo: p.tipo,
          paraQueSirve: p.paraQueSirve,
          cuandoRecomendar: JSON.stringify(p.cuandoRecomendar),
          condiciones: JSON.stringify(p.condicionesTipicas),
          fuente: p.fuente ?? null,
        },
      });
      nProd++;
    }
  }
  console.log(
    `  ✓ Catálogo SOC: ${data.instituciones.length} instituciones, ${nProd} productos`,
  );
}

async function sembrarAsesorDemo() {
  // El asesor demo entra directo a La Oficina: perfil lleno, onboarding completo
  // y suscripción en estado "demo" (acceso del modo demostración, SIN fingir un
  // pago real — se distingue de "activa" a propósito). Lleva también la
  // constancia de consentimiento sembrada (fecha de ahora + versiones de LEGAL)
  // para que el flujo dev no se bloquee en el Paso 1. Así Carlos sigue cayendo en
  // la oficina sin pasar por el recibimiento. Se fija también en `update` para
  // que resembrar lo repare.
  const ahora = new Date();
  const datosDemo = {
    nombre: "Carlos Hiram Chávez",
    email: "carloshiramchavez@icloud.com",
    nombreOficina: "SOC | TALENT",
    zona: "Zona Norte (Monterrey)",
    especialidad: "Crédito empresarial PYME",
    onboardingEtapa: "completo",
    estadoSuscripcion: "demo",
    consentimientoTerminosEn: ahora,
    consentimientoTerminosVersion: LEGAL.terminosVersion,
    consentimientoAvisoEn: ahora,
    consentimientoAvisoVersion: LEGAL.avisoVersion,
  };
  const asesor = await prisma.asesor.upsert({
    where: { clerkUserId: DEMO_ASESOR_CLERK_ID },
    update: datosDemo,
    create: { clerkUserId: DEMO_ASESOR_CLERK_ID, ...datosDemo },
  });
  console.log(`  ✓ Asesor demo: ${asesor.nombre} (${asesor.id})`);
  return asesor.id;
}

/** Borra los expedientes demo previos para resembrarlos limpios (idempotencia). */
async function limpiarExpedientesDemo(asesorId: string) {
  const previos = await prisma.expediente.findMany({
    where: { asesorId, empresa: { in: ["Las Aliadas", "Probemedic"] } },
    select: { id: true },
  });
  for (const e of previos) {
    const versiones = await prisma.entregableVersion.findMany({
      where: { entregable: { expedienteId: e.id } },
      select: { id: true },
    });
    await prisma.recomendacion.deleteMany({
      where: { versionId: { in: versiones.map((v) => v.id) } },
    });
    await prisma.entregableVersion.deleteMany({
      where: { entregable: { expedienteId: e.id } },
    });
    await prisma.entregable.deleteMany({ where: { expedienteId: e.id } });
    await prisma.tarea.deleteMany({ where: { expedienteId: e.id } });
    await prisma.expediente.delete({ where: { id: e.id } });
  }
}

async function sembrarExpedientes(asesorId: string) {
  await limpiarExpedientesDemo(asesorId);

  // ── Las Aliadas — con recomendación lista (RECOMENDADO) ───────────────────
  const aliadas = await prisma.expediente.create({
    data: {
      asesorId,
      empresa: "Las Aliadas",
      ciudad: "Monterrey",
      industria: "Restaurantero (Grill & Cantina)",
      sitioWeb: null,
      notas: "Plan estratégico de crecimiento financiero. Carta ejecutiva firmada.",
      etapa: "RECOMENDADO",
      progreso: derivarProgreso({ etapa: "RECOMENDADO", tareasTotales: 2, tareasEntregadas: 2 }),
    },
  });
  await prisma.tarea.create({
    data: {
      expedienteId: aliadas.id,
      empleadoRol: "INVESTIGADOR",
      descripcion: "Reporte de inteligencia de Las Aliadas",
      estado: "ENTREGADA",
    },
  });
  await prisma.tarea.create({
    data: {
      expedienteId: aliadas.id,
      empleadoRol: "ASESOR_PRODUCTO",
      descripcion: "Identificar el mejor financiamiento del catálogo",
      estado: "ENTREGADA",
    },
  });

  // ── Probemedic — Reporte aprobado (INVESTIGADO) ───────────────────────────
  const probemedic = await prisma.expediente.create({
    data: {
      asesorId,
      empresa: "Probemedic",
      ciudad: "Monterrey",
      industria: "Distribución farmacéutica / Oncología",
      notas: "Estructuración de financiamiento. Reporte de inteligencia financiera completo.",
      etapa: "INVESTIGADO",
      progreso: derivarProgreso({ etapa: "INVESTIGADO", tareasTotales: 1, tareasEntregadas: 1 }),
    },
  });
  const tareaInv = await prisma.tarea.create({
    data: {
      expedienteId: probemedic.id,
      empleadoRol: "INVESTIGADOR",
      descripcion: "Reporte de inteligencia de Probemedic",
      estado: "ENTREGADA",
    },
  });

  // El Reporte de Probemedic como Entregable APROBADO (validado, D-9).
  const reporte = parsearReporteV1(reporteProbemedicSeed);
  const entregable = await prisma.entregable.create({
    data: {
      expedienteId: probemedic.id,
      tareaId: tareaInv.id,
      empleadoRol: "INVESTIGADOR",
      tipo: "reporte_inteligencia",
      estado: "APROBADO",
      versionActual: 1,
    },
  });
  await prisma.entregableVersion.create({
    data: {
      entregableId: entregable.id,
      version: 1,
      contenido: JSON.stringify(reporte),
      aprobado: true,
    },
  });

  console.log(`  ✓ Expediente Las Aliadas (${aliadas.id}) — RECOMENDADO`);
  console.log(
    `  ✓ Expediente Probemedic (${probemedic.id}) — INVESTIGADO, con Reporte APROBADO`,
  );
}

/** Título estable de la conversación demo (para resembrar sin duplicar). */
const TITULO_SESION_DEMO = "Arranque con Probemedic";

/**
 * Siembra una conversación demo del Asesor con Socratia, en voz de oficina
 * (cero jerga técnica — NFR-14). Idempotente: borra la demo previa y la recrea.
 * Los mensajes caen por ON DELETE CASCADE al borrar la sesión.
 */
async function sembrarSesiones(asesorId: string) {
  await prisma.sesion.deleteMany({
    where: { asesorId, titulo: TITULO_SESION_DEMO },
  });

  const sesion = await prisma.sesion.create({
    data: { asesorId, titulo: TITULO_SESION_DEMO },
  });
  await prisma.mensaje.createMany({
    data: [
      {
        sesionId: sesion.id,
        rol: "USUARIO",
        contenido:
          "Socratia, quiero avanzar con Probemedic. ¿En qué vamos y cuál es el siguiente paso?",
      },
      {
        sesionId: sesion.id,
        rol: "ASISTENTE",
        contenido:
          "Ya tenemos listo y aprobado el reporte de inteligencia de Probemedic, así que el expediente está en Investigado. El siguiente paso natural es que el Asesor de producto identifique el mejor financiamiento del catálogo para su caso. ¿Le doy luz verde para que lo prepare?",
      },
    ],
  });

  console.log(`  ✓ Conversación demo con Socratia (${sesion.id})`);
}

/** Siembra completa. Exportada para poder probarla (idempotencia) sin efectos al importar. */
export async function sembrar() {
  console.log("🌱 Sembrando Socratia...");
  await sembrarEmpleados();
  await sembrarCatalogo();
  const asesorId = await sembrarAsesorDemo();
  await sembrarExpedientes(asesorId);
  await sembrarSesiones(asesorId);
  console.log("✅ Seed completo.");
}

// Solo corre automáticamente cuando se ejecuta como script (pnpm db:seed),
// no cuando un test lo importa.
const ejecutadoDirecto =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (ejecutadoDirecto) {
  sembrar()
    .catch((e) => {
      console.error("❌ Seed falló:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
