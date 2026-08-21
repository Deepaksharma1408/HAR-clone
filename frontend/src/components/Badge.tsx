import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "brass" | "sage" | "danger";
}

export const Badge: React.FC<BadgeProps> = ({
  className = "",
  variant = "default",
  children,
  ...props
}) => {
  const baseStyles = "inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border";
  
  let variantStyles = "";
  switch (variant) {
    case "brass":
      variantStyles = "bg-brass/10 text-brass border-brass/20";
      break;
    case "sage":
      variantStyles = "bg-sage-soft text-sage border-sage/20";
      break;
    case "danger":
      variantStyles = "bg-danger/10 text-danger border-danger/20";
      break;
    case "default":
    default:
      variantStyles = "bg-bg text-ink border-line";
      break;
  }

  return (
    <span className={`${baseStyles} ${variantStyles} ${className}`} {...props}>
      {children}
    </span>
  );
};

export default Badge;
