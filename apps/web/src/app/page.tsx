import { BarraSuperior } from "@/components/landing/BarraSuperior";
import { SeccionHero } from "@/components/landing/SeccionHero";
import { SeccionEquipo } from "@/components/landing/SeccionEquipo";
import { SeccionComoFunciona } from "@/components/landing/SeccionComoFunciona";
import { SeccionConfianza } from "@/components/landing/SeccionConfianza";
import { SeccionPrecio } from "@/components/landing/SeccionPrecio";
import { FooterLanding } from "@/components/landing/FooterLanding";

/**
 * Landing pública de Sócrates.
 * Server Component estático — sin hooks de cliente, sin "use client".
 * Todos los CTA apuntan a /oficina (embudo de sesión/onboarding).
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-oficina-fondo">
      <BarraSuperior />
      <main>
        <SeccionHero />
        <SeccionEquipo />
        <SeccionComoFunciona />
        <SeccionConfianza />
        <SeccionPrecio />
      </main>
      <FooterLanding />
    </div>
  );
}
