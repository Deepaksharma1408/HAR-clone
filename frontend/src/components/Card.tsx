import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", hoverable = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-surface border border-line rounded-[2px] p-6 ${
          hoverable ? "card-hover" : ""
        } ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
export default Card;
