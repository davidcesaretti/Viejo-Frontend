import { type LabelHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ required = false, className = "", children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          "block text-sm font-medium text-text-secondary mb-1.5",
          className
        )}
        {...props}
      >
        {children}
        {required && (
          <span className="text-accent-error ml-1" aria-label="requerido">
            *
          </span>
        )}
      </label>
    );
  }
);

Label.displayName = "Label";
