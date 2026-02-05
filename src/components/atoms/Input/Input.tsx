import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
  label?: string;
  icon?: React.ReactNode;
}

const baseStyles =
  "w-full min-h-[44px] px-4 py-2.5 rounded-xl border-2 border-border-light transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed bg-bg-secondary text-text-primary placeholder:text-text-tertiary text-base";

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { hasError = false, label, icon, className = "", id: idProp, ...props },
    ref
  ) => {
    const inputId =
      idProp ??
      (label ? `input-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);
    const errorStyles = hasError
      ? "border-accent-error focus:border-accent-error focus:ring-accent-error/30"
      : "focus:border-accent-primary focus:ring-accent-primary/40 focus:shadow-[0_0_0_3px_rgba(79,70,229,0.15)]";

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-text-secondary mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(baseStyles, errorStyles, icon && "pl-10", className)}
            aria-invalid={hasError}
            {...props}
          />
        </div>
      </div>
    );
  }
);

Input.displayName = "Input";
