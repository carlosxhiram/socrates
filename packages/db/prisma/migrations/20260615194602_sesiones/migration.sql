-- CreateTable
CREATE TABLE "Sesion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "asesorId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL DEFAULT 'Nueva conversación',
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL,
    CONSTRAINT "Sesion_asesorId_fkey" FOREIGN KEY ("asesorId") REFERENCES "Asesor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Mensaje" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sesionId" TEXT NOT NULL,
    "rol" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Mensaje_sesionId_fkey" FOREIGN KEY ("sesionId") REFERENCES "Sesion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Sesion_asesorId_idx" ON "Sesion"("asesorId");

-- CreateIndex
CREATE INDEX "Mensaje_sesionId_idx" ON "Mensaje"("sesionId");
