/**
 * P-2/P-3: página de "no encontrado" en lenguaje de oficina. Se muestra
 * cuando la ruta no existe o cuando una página llama a `notFound()`.
 */
import Link from "next/link";

export default function NoEncontrado() {
  return (
    <main className="mx-auto flex min-h-screen max-w-[640px] flex-col items-center justify-center px-6 py-8 text-center">
      <span className="text-3xl" aria-hidden>
        🐢
      </span>
      <h1 className="mt-3 text-lg font-semibold text-oficina-texto">No encontré esta página</h1>
      <p className="mt-2 text-sm text-oficina-tenue">
        Puede que el enlace esté vencido o que la dirección ya no exista.
      </p>
      <Link
        href="/oficina"
        className="mt-5 inline-flex rounded-lg bg-marca px-4 py-2 text-sm font-medium text-white hover:bg-marca-fuerte focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca"
      >
        Volver a La Oficina
      </Link>
    </main>
  );
}
