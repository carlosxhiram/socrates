-- CreateTable
CREATE TABLE "EventoStripe" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipo" TEXT NOT NULL,
    "procesadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Asesor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clerkUserId" TEXT NOT NULL,
    "nombre" TEXT,
    "email" TEXT,
    "nombreOficina" TEXT,
    "zona" TEXT,
    "especialidad" TEXT,
    "onboardingEtapa" TEXT NOT NULL DEFAULT 'perfil',
    "estadoSuscripcion" TEXT NOT NULL DEFAULT 'ninguna',
    "stripeCustomerId" TEXT,
    "pruebaTermina" DATETIME,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL
);
INSERT INTO "new_Asesor" ("actualizadoEn", "clerkUserId", "creadoEn", "email", "id", "nombre") SELECT "actualizadoEn", "clerkUserId", "creadoEn", "email", "id", "nombre" FROM "Asesor";
DROP TABLE "Asesor";
ALTER TABLE "new_Asesor" RENAME TO "Asesor";
CREATE UNIQUE INDEX "Asesor_clerkUserId_key" ON "Asesor"("clerkUserId");
CREATE UNIQUE INDEX "Asesor_stripeCustomerId_key" ON "Asesor"("stripeCustomerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
