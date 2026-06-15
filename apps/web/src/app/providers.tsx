"use client";

/**
 * Providers de cliente de la app. Por ahora: el proveedor de tema claro/oscuro
 * (next-themes), que conmuta la clase `.dark` en <html> y la persiste.
 */
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
