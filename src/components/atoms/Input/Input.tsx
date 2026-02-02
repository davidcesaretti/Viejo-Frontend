import { type InputHTMLAttributes, forwardRef } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ hasError = false, className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`
          w-full px-3 py-2 rounded-lg border bg-input-bg text-text
          placeholder:text-input-placeholder
          focus:outline-none focus:ring-2 focus:ring-offset-0
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
          ${
            hasError
              ? "border-danger focus:ring-danger"
              : "border-input-border focus:ring-border-focus"
          }
          ${className}
        `}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
