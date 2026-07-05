/**
 * proxy.ts — protección de rutas con Clerk (Next 16; antes `middleware.ts`).
 *
 * En Next 16 el archivo se llama `proxy.ts`, corre en runtime Node (edge ya no
 * aplica aquí) y acepta el default export tal cual — patrón oficial de Clerk
 * (@clerk/nextjs ≥ 6.34 detecta proxy.ts).
 *
 * MODO ASESOR DEMO (E1-S6): sin claves de Clerk, el proxy NO corre (deja
 * pasar todo) para que La Oficina cargue en desarrollo sin login.
 */
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const clerkConfigurado = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

// Rutas públicas: la landing (/), la página institucional (/nosotros) y las
// pantallas de acceso (crear cuenta / entrar). Todo lo demás requiere sesión
// (cuando hay Clerk). /bienvenida queda protegida: exige sesión, pero el pago y
// la bienvenida los gestiona el propio recibimiento (portero server-side).
// /sign-in queda como alias público por si algún enlace viejo lo usa.
const esRutaPublica = createRouteMatcher([
  "/",
  "/nosotros",
  "/crear-cuenta(.*)",
  "/entrar(.*)",
  "/sign-in(.*)",
]);

export default clerkConfigurado
  ? clerkMiddleware(async (auth, req) => {
      if (!esRutaPublica(req)) {
        await auth.protect();
      }
    })
  : () => NextResponse.next();

export const config = {
  matcher: [
    // Salta internals de Next y archivos estáticos; corre en el resto + API.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
