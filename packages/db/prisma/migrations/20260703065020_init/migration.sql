-- CreateTable
CREATE TABLE "Asesor" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "nombre" TEXT,
    "email" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asesor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expediente" (
    "id" TEXT NOT NULL,
    "asesorId" TEXT NOT NULL,
    "empresa" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL,
    "industria" TEXT NOT NULL,
    "sitioWeb" TEXT,
    "rfc" TEXT,
    "sucursales" INTEGER,
    "notas" TEXT,
    "etapa" TEXT NOT NULL DEFAULT 'PROSPECTO',
    "progreso" INTEGER NOT NULL DEFAULT 0,
    "motivoCierre" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expediente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Empleado" (
    "rol" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "Empleado_pkey" PRIMARY KEY ("rol")
);

-- CreateTable
CREATE TABLE "Tarea" (
    "id" TEXT NOT NULL,
    "expedienteId" TEXT NOT NULL,
    "empleadoRol" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'ENCARGADA',
    "motivo" TEXT,
    "dependeDeId" TEXT,
    "idempotencyKey" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tarea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entregable" (
    "id" TEXT NOT NULL,
    "expedienteId" TEXT NOT NULL,
    "tareaId" TEXT,
    "empleadoRol" TEXT,
    "tipo" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'BORRADOR',
    "versionActual" INTEGER NOT NULL DEFAULT 1,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Entregable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntregableVersion" (
    "id" TEXT NOT NULL,
    "entregableId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "contenido" TEXT NOT NULL,
    "aprobado" BOOLEAN NOT NULL DEFAULT false,
    "pdfR2Key" TEXT,
    "verificacion" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EntregableVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Institucion" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "cobertura" TEXT,
    "notas" TEXT,
    "fuente" TEXT,

    CONSTRAINT "Institucion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Producto" (
    "id" TEXT NOT NULL,
    "institucionId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "paraQueSirve" TEXT NOT NULL,
    "cuandoRecomendar" TEXT NOT NULL,
    "condiciones" TEXT NOT NULL,
    "fuente" TEXT,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recomendacion" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "hallazgo" TEXT NOT NULL,
    "argumentoCierre" TEXT NOT NULL,

    CONSTRAINT "Recomendacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Asesor_clerkUserId_key" ON "Asesor"("clerkUserId");

-- CreateIndex
CREATE INDEX "Expediente_asesorId_etapa_idx" ON "Expediente"("asesorId", "etapa");

-- CreateIndex
CREATE UNIQUE INDEX "Tarea_idempotencyKey_key" ON "Tarea"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Tarea_expedienteId_estado_idx" ON "Tarea"("expedienteId", "estado");

-- CreateIndex
CREATE UNIQUE INDEX "Entregable_tareaId_key" ON "Entregable"("tareaId");

-- CreateIndex
CREATE INDEX "Entregable_expedienteId_idx" ON "Entregable"("expedienteId");

-- CreateIndex
CREATE UNIQUE INDEX "EntregableVersion_entregableId_version_key" ON "EntregableVersion"("entregableId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "Institucion_nombre_key" ON "Institucion"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Producto_institucionId_nombre_key" ON "Producto"("institucionId", "nombre");

-- AddForeignKey
ALTER TABLE "Expediente" ADD CONSTRAINT "Expediente_asesorId_fkey" FOREIGN KEY ("asesorId") REFERENCES "Asesor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tarea" ADD CONSTRAINT "Tarea_expedienteId_fkey" FOREIGN KEY ("expedienteId") REFERENCES "Expediente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tarea" ADD CONSTRAINT "Tarea_empleadoRol_fkey" FOREIGN KEY ("empleadoRol") REFERENCES "Empleado"("rol") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entregable" ADD CONSTRAINT "Entregable_expedienteId_fkey" FOREIGN KEY ("expedienteId") REFERENCES "Expediente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entregable" ADD CONSTRAINT "Entregable_tareaId_fkey" FOREIGN KEY ("tareaId") REFERENCES "Tarea"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EntregableVersion" ADD CONSTRAINT "EntregableVersion_entregableId_fkey" FOREIGN KEY ("entregableId") REFERENCES "Entregable"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_institucionId_fkey" FOREIGN KEY ("institucionId") REFERENCES "Institucion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recomendacion" ADD CONSTRAINT "Recomendacion_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "EntregableVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recomendacion" ADD CONSTRAINT "Recomendacion_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
