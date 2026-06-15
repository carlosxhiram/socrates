-- CreateTable
CREATE TABLE "Asesor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clerkUserId" TEXT NOT NULL,
    "nombre" TEXT,
    "email" TEXT,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Expediente" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL,
    CONSTRAINT "Expediente_asesorId_fkey" FOREIGN KEY ("asesorId") REFERENCES "Asesor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Empleado" (
    "rol" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Tarea" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "expedienteId" TEXT NOT NULL,
    "empleadoRol" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'ENCARGADA',
    "motivo" TEXT,
    "dependeDeId" TEXT,
    "idempotencyKey" TEXT,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL,
    CONSTRAINT "Tarea_expedienteId_fkey" FOREIGN KEY ("expedienteId") REFERENCES "Expediente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Tarea_empleadoRol_fkey" FOREIGN KEY ("empleadoRol") REFERENCES "Empleado" ("rol") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Entregable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "expedienteId" TEXT NOT NULL,
    "tareaId" TEXT,
    "empleadoRol" TEXT,
    "tipo" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'BORRADOR',
    "versionActual" INTEGER NOT NULL DEFAULT 1,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL,
    CONSTRAINT "Entregable_expedienteId_fkey" FOREIGN KEY ("expedienteId") REFERENCES "Expediente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Entregable_tareaId_fkey" FOREIGN KEY ("tareaId") REFERENCES "Tarea" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EntregableVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entregableId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "contenido" TEXT NOT NULL,
    "aprobado" BOOLEAN NOT NULL DEFAULT false,
    "pdfR2Key" TEXT,
    "verificacion" TEXT,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EntregableVersion_entregableId_fkey" FOREIGN KEY ("entregableId") REFERENCES "Entregable" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Institucion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "cobertura" TEXT,
    "notas" TEXT,
    "fuente" TEXT
);

-- CreateTable
CREATE TABLE "Producto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "institucionId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "paraQueSirve" TEXT NOT NULL,
    "cuandoRecomendar" TEXT NOT NULL,
    "condiciones" TEXT NOT NULL,
    "fuente" TEXT,
    CONSTRAINT "Producto_institucionId_fkey" FOREIGN KEY ("institucionId") REFERENCES "Institucion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Recomendacion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "versionId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "hallazgo" TEXT NOT NULL,
    "argumentoCierre" TEXT NOT NULL,
    CONSTRAINT "Recomendacion_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "EntregableVersion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Recomendacion_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
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
