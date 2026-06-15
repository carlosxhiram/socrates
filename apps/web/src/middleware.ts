/**
 * middleware.ts — protección de rutas con Clerk.
 *
 * NOTA DE STACK: en Next.js 16 este archivo se RENOMBRA a `proxy.ts` y se exporta
 * como `export const proxy = clerkMiddleware(...)`. Aquí (Next 15) usamos el nombre
 * `middleware`. El cuerpo es idéntico; el cambio para Stage 3 es solo el nombre.
 *
 * MODO ASESOR DEMO (E1-S6): sin claves de Clerk, el middleware NO corre (deja
 * pasar todo) para que La Oficina cargue en desarrollo sin login.
 */
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const clerkConfigurado = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

// Rutas públicas: solo el sign-in. Todo lo demás requiere sesión (cuando hay Clerk).
const esRutaPublica = createRouteMatcher(["/sign-in(.*)"]);

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
