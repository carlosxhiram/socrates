"use client";

import { motion, useReducedMotion } from "motion/react";
import type { Variants } from "motion/react";
import type { ReactNode } from "react";
import { EASE } from "@/lib/motion";

const contenedor: Variants = {
  oculto: {},
  visible: { transition: { staggerChildren: 0.18 } },
};

const elemento: Variants = {
  oculto: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.65, ease: EASE },
  },
};

interface Props {
  children: ReactNode;
  className?: string;
}

/**
 * Contenedor que revela a sus hijos en cascada (uno tras otro) la primera vez
 * que entra en pantalla. Cada hijo directo debe envolverse en
 * <ElementoEscalonado>. Con reduced-motion activo se renderiza estático.
 *
 * ⚠️ Misma trampa que RevelarAlScroll: no metas dentro de <ElementoEscalonado>
 * un componente que se anime solo al entrar en pantalla (whileInView/useInView).
 * Arranca en opacity:0 y su observador interno nunca dispara ⇒ queda mudo en
 * producción. Móntalo directo, fuera de esta cascada.
 */
export function ListaEscalonada({ children, className }: Props) {
  const sinMovimiento = useReducedMotion();

  if (sinMovimiento) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      data-revelar
      className={className}
      initial="oculto"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={contenedor}
    >
      {children}
    </motion.div>
  );
}

export function ElementoEscalonado({ children, className }: Props) {
  return (
    <motion.div data-revelar className={className} variants={elemento}>
      {children}
    </motion.div>
  );
}
