-- AlterTable
ALTER TABLE "Asesor" ADD COLUMN     "consentimientoAvisoEn" TIMESTAMP(3),
ADD COLUMN     "consentimientoAvisoVersion" TEXT,
ADD COLUMN     "consentimientoTerminosEn" TIMESTAMP(3),
ADD COLUMN     "consentimientoTerminosVersion" TEXT;
