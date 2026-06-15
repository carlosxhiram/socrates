import { SignIn } from "@clerk/nextjs";

export default function Page() {
  const clerkConfigurado = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  if (!clerkConfigurado) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-md rounded-xl border border-oficina-borde bg-oficina-panel p-8 text-center">
          <p className="text-2xl" aria-hidden>
            🐢
          </p>
          <h1 className="mt-2 text-lg font-semibold text-oficina-texto">
            Sócrates está en modo demostración
          </h1>
          <p className="mt-2 text-sm text-oficina-tenue">
            Todavía no hay cuentas configuradas. Entra directo a tu oficina.
          </p>
          <a
            href="/oficina"
            className="mt-4 inline-block rounded-lg bg-marca px-4 py-2 text-sm font-medium text-white hover:bg-marca-fuerte"
          >
            Ir a La Oficina
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <SignIn />
    </main>
  );
}
