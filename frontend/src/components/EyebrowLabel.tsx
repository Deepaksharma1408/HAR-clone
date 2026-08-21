import React from "react";

export interface EyebrowLabelProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

export const EyebrowLabel: React.FC<EyebrowLabelProps> = ({
  className = "",
  children,
  ...props
}) => {
  return (
    <span
      className={`inline-flex items-center text-[10px] font-mono uppercase tracking-[0.14em] text-brass font-semibold ${className}`}
      {...props}
    >
      <span className="mr-1.5 opacity-60">—</span>
      {children}
    </span>
  );
};

export default EyebrowLabel;
