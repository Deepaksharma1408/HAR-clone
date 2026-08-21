import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, type = "text", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-[13px] font-medium text-ink-soft mb-1.5">
            {label}
          </label>
        )}
        <input
          type={type}
          ref={ref}
          className={`w-full bg-surface text-ink px-3.5 py-2.5 text-sm rounded-lg border border-line focus:border-brass focus:ring-2 focus:ring-brass/15 focus:outline-none transition-all duration-200 placeholder:text-ink-soft/40 ${
            error ? "border-danger focus:border-danger focus:ring-danger/15" : ""
          } ${className}`}
          {...props}
        />
        {error && (
          <span className="block mt-1.5 text-[12px] text-danger">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
