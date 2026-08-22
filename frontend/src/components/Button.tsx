"use client";

import React from "react";
import { motion, HTMLMotionProps, useReducedMotion } from "framer-motion";

export interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: "brass" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "brass",
      size = "md",
      children,
      whileTap,
      ...props
    },
    ref
  ) => {
    const shouldReduceMotion = useReducedMotion();

    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors duration-200 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm select-none";

    let variantStyles = "";
    if (variant === "brass") {
      variantStyles =
        "bg-brass text-white hover:bg-brass-deep active:bg-brass-deep border border-transparent shadow-xs";
    } else if (variant === "outline") {
      variantStyles =
        "bg-transparent text-ink border border-line hover:border-ink hover:bg-surface active:bg-bg";
    } else if (variant === "ghost") {
      variantStyles =
        "bg-transparent text-ink hover:bg-sage-soft/30 hover:text-ink border border-transparent active:bg-sage-soft/50";
    }

    let sizeStyles = "";
    if (size === "sm") {
      sizeStyles = "px-3.5 py-1.5 text-xs gap-1.5";
    } else if (size === "md") {
      sizeStyles = "px-5 py-2.5 text-sm gap-2";
    } else if (size === "lg") {
      sizeStyles = "px-6 py-3 text-base gap-2.5";
    }

    return (
      <motion.button
        ref={ref}
        whileTap={
          shouldReduceMotion ? undefined : whileTap || { scale: 0.96 }
        }
        className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
