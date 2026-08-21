"use client";

import React from "react";
import { ScrollReveal } from "./motion/ScrollReveal";

export interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
}

export const Reveal: React.FC<RevealProps> = ({
  children,
  className = "",
  delayMs = 0,
}) => {
  return (
    <ScrollReveal
      delay={delayMs / 1000}
      duration={0.85}
      yOffset={24}
      className={className}
    >
      {children}
    </ScrollReveal>
  );
};

export default Reveal;

