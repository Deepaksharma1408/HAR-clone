import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "brass" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "brass", size = "md", children, ...props }, ref) => {
    let baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-[2px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed uppercase font-mono tracking-wider text-xs";
    
    let variantStyles = "";
    if (variant === "brass") {
      variantStyles = "bg-brass text-white hover:bg-brass-deep active:bg-brass-deep border border-transparent";
    } else if (variant === "outline") {
      variantStyles = "bg-transparent text-ink border border-line hover:border-ink hover:bg-surface active:bg-bg";
    } else if (variant === "ghost") {
      variantStyles = "bg-transparent text-ink hover:bg-sage-soft/30 hover:text-ink border border-transparent active:bg-sage-soft/50";
    }

    let sizeStyles = "";
    if (size === "sm") {
      sizeStyles = "px-3 py-1.5 text-[10px] gap-1.5";
    } else if (size === "md") {
      sizeStyles = "px-5 py-2.5 gap-2";
    } else if (size === "lg") {
      sizeStyles = "px-7 py-3 text-sm gap-2.5";
    }

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
