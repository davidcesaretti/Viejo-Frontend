import { type LabelHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ required = false, className = "", children, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "mb-1.5 block text-xs font-medium text-text-secondary",
        className
      )}
      {...props}
    >
      {children}
      {required && (
        <span className="ml-1 text-accent-error" aria-label="requerido">
          *
        </span>
      )}
    </label>
  )
);

Label.displayName = "Label";
