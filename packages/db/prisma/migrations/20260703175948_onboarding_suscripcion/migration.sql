-- AlterTable
ALTER TABLE "Asesor" ADD COLUMN     "especialidad" TEXT,
ADD COLUMN     "estadoSuscripcion" TEXT NOT NULL DEFAULT 'ninguna',
ADD COLUMN     "nombreOficina" TEXT,
ADD COLUMN     "onboardingEtapa" TEXT NOT NULL DEFAULT 'perfil',
ADD COLUMN     "pruebaTermina" TIMESTAMP(3),
ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "zona" TEXT;

-- CreateTable
CREATE TABLE "EventoStripe" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "procesadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventoStripe_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Asesor_stripeCustomerId_key" ON "Asesor"("stripeCustomerId");

