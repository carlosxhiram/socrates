import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { esMX } from "@clerk/localizations";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  // Base para volver absolutas las URLs de las tarjetas de enlace (WhatsApp
  // y compañía no aceptan rutas relativas). La imagen de la tarjeta la genera
  // app/opengraph-image.tsx y Next la engancha solo.
  metadataBase: new URL("https://socratia.mateinnovation.com"),
  title: {
    default: "Socratia — el equipo de tu oficina",
    template: "%s · Socratia",
  },
  description: "Tu equipo de asesoría financiera, en una sola oficina.",
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "Socratia",
    url: "/",
    title: "Socratia — el equipo de tu oficina",
    description: "Tu equipo de asesoría financiera, en una sola oficina.",
  },
  twitter: {
    card: "summary_large_image",
  },
};

const clerkConfigurado = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cuerpo = (
    <html lang="es-MX" className={`${GeistSans.variable} ${GeistMono.variable}`}>
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
