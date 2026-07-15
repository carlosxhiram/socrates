/**
 * index.ts — el servidor Hono de Socratia (api en Railway, long-running).
 *
 * La app vive en app.ts (testeable en proceso); aquí solo se levanta el puerto.
 * Lee process.env.PORT (Railway lo inyecta; en local default 8787).
 * Arranca SIN claves (Modo sin claves / asesor demo) — NFR-11.
 */
import { serve } from "@hono/node-server";
import { app } from "./app.js";
import { esModoSinClaves } from "./ia/proveedor-ia.js";
import { crearAlmacenR2 } from "./storage/r2-client.js";

const port = Number(process.env.PORT ?? 8787);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`🐢 Socratia api escuchando en http://localhost:${info.port}`);
  console.log(`   Modo sin claves IA: ${esModoSinClaves() ? "SÍ (fallback)" : "no"}`);
  console.log(`   Almacenamiento R2: ${crearAlmacenR2().disponible ? "configurado" : "modo-sin-claves"}`);
});

export { app };
