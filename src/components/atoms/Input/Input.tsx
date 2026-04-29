import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
  label?: string;
  icon?: React.ReactNode;
}

const base =
  "w-full h-9 px-3 rounded-lg border bg-bg-secondary text-sm text-text-primary " +
  "placeholder:text-text-tertiary transition-colors " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/25 focus-visible:border-accent-primary " +
  "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-bg-tertiary";

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ hasError = false, label, icon, className = "", id: idProp, ...props }, ref) => {
    const inputId =
      idProp ??
      (label ? `input-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

    const errorStyles = hasError
      ? "border-accent-error focus-visible:ring-accent-error/25 focus-visible:border-accent-error"
      : "border-border-light";

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-xs font-medium text-text-secondary"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(base, errorStyles, icon && "pl-9", className)}
            aria-invalid={hasError}
            {...props}
          />
        </div>
      </div>
    );
  }
);

Input.displayName = "Input";
