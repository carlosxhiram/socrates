import { BarraSuperior } from "@/components/landing/BarraSuperior";
import { SeccionHero } from "@/components/landing/SeccionHero";
import { SeccionEquipo } from "@/components/landing/SeccionEquipo";
import { SeccionComoFunciona } from "@/components/landing/SeccionComoFunciona";
import { SeccionConfianza } from "@/components/landing/SeccionConfianza";
import { SeccionPrecio } from "@/components/landing/SeccionPrecio";
import { FooterLanding } from "@/components/landing/FooterLanding";

/**
 * Landing pública de Socratia.
 * Server Component estático — sin hooks de cliente, sin "use client".
 * "Empieza tu prueba gratis" lleva a /crear-cuenta (registro) y "Entrar" a
 * /entrar (inicio de sesión): ambas pantallas viven dentro de la app y en
 * español. Tras registrarse, el asesor va a /bienvenida; tras iniciar sesión, a
 * /oficina (donde el portero decide si aún le falta el recibimiento). En modo
 * demo (sin Clerk) esas pantallas invitan a entrar directo a La Oficina.
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
