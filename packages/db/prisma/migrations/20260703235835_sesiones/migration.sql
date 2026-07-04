-- CreateTable
CREATE TABLE "Sesion" (
    "id" TEXT NOT NULL,
    "asesorId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL DEFAULT 'Nueva conversación',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sesion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mensaje" (
    "id" TEXT NOT NULL,
    "sesionId" TEXT NOT NULL,
    "rol" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mensaje_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Sesion_asesorId_idx" ON "Sesion"("asesorId");

-- CreateIndex
CREATE INDEX "Mensaje_sesionId_idx" ON "Mensaje"("sesionId");

-- AddForeignKey
ALTER TABLE "Sesion" ADD CONSTRAINT "Sesion_asesorId_fkey" FOREIGN KEY ("asesorId") REFERENCES "Asesor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensaje" ADD CONSTRAINT "Mensaje_sesionId_fkey" FOREIGN KEY ("sesionId") REFERENCES "Sesion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
