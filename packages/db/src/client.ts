/**
 * client.ts — instancia singleton de Prisma (arquitectura §8).
 *
 * Un único cliente reutilizado en todo apps/api. En desarrollo evita crear
 * múltiples conexiones al recargar (patrón global).
 */
import { PrismaClient } from "./generated/client/index.js";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
