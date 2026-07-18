/**
 * prisma.config.ts — reemplaza el bloque `package.json#prisma` (deprecado;
 * Prisma avisa "will be removed in Prisma 7", ver https://pris.ly/prisma-config).
 * Mismo comando de seed que antes (`tsx src/seed/seed.ts`); solo cambia dónde
 * vive la configuración.
 *
 * OJO: en cuanto Prisma detecta este archivo, dice explícitamente "Prisma
 * config detected, skipping environment variable loading" — deja de cargar
 * packages/db/.env solo. Sin esto, `pnpm db:deploy`/`db:seed` sin la variable
 * DATABASE_URL puesta a mano truenan con "Environment variable not found"
 * (verificado). Replicamos esa carga a mano, sin agregar una dependencia
 * nueva (dotenv no viaja en la imagen de producción, que solo trae deps de
 * runtime): si el archivo no existe (producción/CI, donde la variable real
 * ya viene puesta por la plataforma) esto no hace nada y no truena.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "prisma/config";

const rutaEnv = join(dirname(fileURLToPath(import.meta.url)), ".env");

if (existsSync(rutaEnv)) {
  for (const linea of readFileSync(rutaEnv, "utf8").split("\n")) {
    const sinComentario = linea.trim();
    if (!sinComentario || sinComentario.startsWith("#")) continue;

    const separador = sinComentario.indexOf("=");
    if (separador === -1) continue;

    const clave = sinComentario.slice(0, separador).trim();
    let valor = sinComentario.slice(separador + 1).trim();
    if (
      (valor.startsWith('"') && valor.endsWith('"')) ||
      (valor.startsWith("'") && valor.endsWith("'"))
    ) {
      valor = valor.slice(1, -1);
    }

    // La variable de entorno real (producción/CI) siempre gana; nunca la pisamos.
    if (process.env[clave] === undefined) process.env[clave] = valor;
  }
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx src/seed/seed.ts",
  },
});
