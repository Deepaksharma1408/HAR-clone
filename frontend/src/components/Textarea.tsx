import React from "react";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", label, error, rows = 4, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-[10px] font-mono uppercase tracking-wider text-ink-soft mb-1">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={`w-full bg-surface text-ink px-3 py-2.5 text-sm rounded-[2px] border border-line focus:border-brass focus:outline-none transition-all duration-200 placeholder:text-ink-soft/40 resize-y ${
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

Textarea.displayName = "Textarea";
export default Textarea;
