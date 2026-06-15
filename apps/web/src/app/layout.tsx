import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { GeistSans } from "geist/font/sans";
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
  const cuerpo = (
    <html lang="es-MX" className={GeistSans.variable}>
      <body>{children}</body>
    </html>
  );

  // En Modo asesor demo (sin Clerk) no envolvemos con ClerkProvider para que la
  // app cargue sin claves (E1-S6).
  if (!clerkConfigurado) return cuerpo;

  return <ClerkProvider>{cuerpo}</ClerkProvider>;
}
