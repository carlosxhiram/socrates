/**
 * La curva de movimiento ÚNICA de Socratia — "swift-out": arranque veloz y cola
 * larga y suave (cubic-bezier(.16, 1, .3, 1), la de Tavily). Vive AQUÍ para que
 * los seis componentes de animación compartan EXACTAMENTE la misma sensación en
 * vez de repetir el valor a mano en cada archivo.
 *
 * El mismo valor tiene dos gemelos para las otras capas:
 *  - CSS/Tailwind: la utilidad `ease-suave` (tailwind.config.ts) y las
 *    animaciones `entrada-hero`.
 *  - CSS crudo: la variable `--ease` (globals.css).
 * Si algún día cambia la curva, se cambia en estos tres lugares a la vez.
 */
export const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
