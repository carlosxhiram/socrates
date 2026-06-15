import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sócrates — SOC | TALENT",
  description: "Tu equipo de asesoría financiera, en una sola oficina.",
};

const clerkConfigurado = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // suppressHydrationWarning: next-themes ajusta la clase de <html> en cliente
  // antes de la hidratación; sin esto React advierte por el desajuste esperado.
  const cuerpo = (
    <html lang="es-MX" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );

  // En Modo asesor demo (sin Clerk) no envolvemos con ClerkProvider para que la
  // app cargue sin claves (E1-S6).
  if (!clerkConfigurado) return cuerpo;

  return <ClerkProvider>{cuerpo}</ClerkProvider>;
}
