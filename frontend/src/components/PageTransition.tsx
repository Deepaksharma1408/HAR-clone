"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
        animate={{
          opacity: 1,
          y: 0,
          transitionEnd: { transform: "none" },
        }}
        exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
        transition={{
          duration: 0.35,
          ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
        }}
        className="flex-1 flex flex-col w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
