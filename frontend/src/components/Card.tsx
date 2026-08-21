"use client";

import React from "react";
import { motion, HTMLMotionProps, useReducedMotion } from "framer-motion";

export interface CardProps
  extends Omit<HTMLMotionProps<"div">, "ref"> {
  hoverable?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", hoverable = true, children, whileHover, whileTap, ...props }, ref) => {
    const shouldReduceMotion = useReducedMotion();

    return (
      <motion.div
        ref={ref}
        whileHover={
          hoverable && !shouldReduceMotion
            ? whileHover || { y: -6, transition: { duration: 0.25 } }
            : undefined
        }
        whileTap={
          hoverable && !shouldReduceMotion
            ? whileTap || { scale: 0.98 }
            : undefined
        }
        className={`bg-surface border border-line rounded-2xl p-6 ${
          hoverable ? "card-hover" : ""
        } ${className}`}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = "Card";
export default Card;
