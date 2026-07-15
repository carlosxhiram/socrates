import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { esMX } from "@clerk/localizations";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Socratia — el equipo de tu oficina",
    template: "%s · Socratia",
  },
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

  // Localización en español de México (esMX): las pantallas de crear cuenta e
  // iniciar sesión salen en español, no en inglés (NFR-12).
  // Corregimos un error de dedo que trae el paquete (@clerk/localizations
  // 4.12.0 dice "Inicar sesión" en signUp.start.actionLink).
  const esMXCorregido = {
    ...esMX,
    signUp: {
      ...esMX.signUp,
      start: { ...esMX.signUp?.start, actionLink: "Iniciar sesión" },
    },
  };
  return <ClerkProvider localization={esMXCorregido}>{cuerpo}</ClerkProvider>;
}
