"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Retraso en segundos antes de aparecer (para escalonar secciones). */
  retraso?: number;
  className?: string;
}

/**
 * Isla mínima de cliente: el contenido aparece suave (subida + fundido) la
 * PRIMERA vez que entra en pantalla, y nunca se repite (doctrina Resend:
 * una animación, un propósito, una sola vez). Con reduced-motion activo se
 * renderiza estático.
 */
export function RevelarAlScroll({ children, retraso = 0, className }: Props) {
  const sinMovimiento = useReducedMotion();

  if (sinMovimiento) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      data-revelar
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay: retraso, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
