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
          <label className="block text-[10px] font-mono uppercase tracking-wider text-ink-soft mb-1">
            {label}
          </label>
        )}
        <input
          type={type}
          ref={ref}
          className={`w-full bg-surface text-ink px-3 py-2.5 text-sm rounded-[2px] border border-line focus:border-brass focus:outline-none transition-all duration-200 placeholder:text-ink-soft/40 ${
            error ? "border-danger focus:border-danger" : ""
          } ${className}`}
          {...props}
        />
        {error && (
          <span className="block mt-1 text-[10px] font-mono uppercase tracking-wider text-danger">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
