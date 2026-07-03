"use client";

/**
 * Frontera de error de ÚLTIMO recurso: solo se activa si el layout raíz mismo
 * falla. Reemplaza <html>/<body> por completo (regla de Next), así que trae
 * su propio import de estilos. Mismo tono de oficina que error.tsx — sin
 * detalle técnico visible (NFR-14).
 */
import { useEffect } from "react";
import "./globals.css";

export default function ErrorGlobal({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[oficina] error global:", error);
  }, [error]);

  return (
    <html lang="es-MX">
      <body>
        <main className="mx-auto flex min-h-screen max-w-[640px] flex-col items-center justify-center px-6 py-8 text-center">
          <span className="text-3xl" aria-hidden>
            🐢
          </span>
          <h1 className="mt-3 text-lg font-semibold text-oficina-texto">
            Tu oficina no pudo abrir
          </h1>
          <p className="mt-2 text-sm text-oficina-tenue">
            Algo salió mal al cargar. Intenta de nuevo en un momento.
          </p>
          <div className="mt-5 flex items-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-lg bg-marca px-4 py-2 text-sm font-medium text-white hover:bg-marca-fuerte focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca"
            >
              Reintentar
            </button>
            <a
              href="/oficina"
              className="rounded-lg border border-oficina-borde px-4 py-2 text-sm font-medium text-oficina-tenue hover:text-marca focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca"
            >
              Volver a La Oficina
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
