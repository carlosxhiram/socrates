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
 *
 * ⚠️ No anides aquí un componente que ya se anime solo al entrar en pantalla
 * (otro whileInView, o useInView de motion): este envoltorio arranca al hijo
 * en opacity:0, el observador interno del hijo nunca lo ve "entrar" y se queda
 * MUDO en producción (nos pasó con ConversacionGerente el 2026-07-15). En esos
 * casos monta el hijo DIRECTO, sin envolverlo con esta isla.
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
      initial={{ opacity: 0, y: 28, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.75, delay: retraso, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
