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
          <label className="block text-[13px] font-medium text-ink-soft mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          rows={rows}
          className={`w-full bg-surface text-ink px-3.5 py-2.5 text-sm rounded-lg border border-line focus:border-brass focus:ring-2 focus:ring-brass/15 focus:outline-none transition-all duration-200 placeholder:text-ink-soft/40 resize-y ${
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

Textarea.displayName = "Textarea";
export default Textarea;
