import type { Config } from "tailwindcss";

/**
 * Paleta de Sócrates con tema claro/oscuro.
 *
 * Los colores se resuelven vía variables CSS (definidas en globals.css) con el
 * patrón rgb(var(--token) / <alpha-value>) para CONSERVAR el soporte de opacidad
 * de Tailwind (p. ej. bg-marca/5, border-oficina-borde/30, bg-estado-alerta/5).
 * El modo oscuro se activa con la clase `.dark` en <html> (next-themes), así que
 * TODAS las utilidades de color heredan el tema sin tocar cada componente.
 */
const conAlpha = (token: string) => `rgb(var(${token}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        marca: {
          DEFAULT: conAlpha("--marca"),
          fuerte: conAlpha("--marca-fuerte"),
          suave: conAlpha("--marca-suave"),
        },
        oficina: {
          fondo: conAlpha("--oficina-fondo"),
          panel: conAlpha("--oficina-panel"),
          borde: conAlpha("--oficina-borde"),
          texto: conAlpha("--oficina-texto"),
          tenue: conAlpha("--oficina-tenue"),
        },
        estado: {
          libre: conAlpha("--estado-libre"),
          trabajando: conAlpha("--estado-trabajando"),
          entrego: conAlpha("--estado-entrego"),
          alerta: conAlpha("--estado-alerta"),
          bloqueo: conAlpha("--estado-bloqueo"),
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
