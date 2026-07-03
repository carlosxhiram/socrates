"use client";

/**
 * Frontera de error de la app (Next App Router). Atrapa cualquier falla no
 * prevista al renderizar una página y muestra un aviso de oficina en vez de
 * la pantalla blanca/técnica de React. Nunca se muestra el detalle técnico
 * del error (NFR-14): solo se registra para diagnóstico de servidor.
 */
import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPagina({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[oficina] error de página:", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-screen max-w-[640px] flex-col items-center justify-center px-6 py-8 text-center">
      <span className="text-3xl" aria-hidden>
        🐢
      </span>
      <h1 className="mt-3 text-lg font-semibold text-oficina-texto">Algo se atoró por aquí</h1>
      <p className="mt-2 text-sm text-oficina-tenue">
        No pude terminar de mostrar esta página. Puedes intentarlo de nuevo o volver a La
        Oficina.
      </p>
      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-lg bg-marca px-4 py-2 text-sm font-medium text-white hover:bg-marca-fuerte focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca"
        >
          Reintentar
        </button>
        <Link
          href="/oficina"
          className="rounded-lg border border-oficina-borde px-4 py-2 text-sm font-medium text-oficina-tenue hover:text-marca focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca"
        >
          Volver a La Oficina
        </Link>
      </div>
    </main>
  );
}
