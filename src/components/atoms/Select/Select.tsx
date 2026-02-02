import { type SelectHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  placeholder?: string;
  hasError?: boolean;
}

const baseStyles =
  "w-full px-4 py-2.5 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed bg-bg-secondary text-text-primary";

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { options, placeholder, hasError = false, className = "", ...props },
    ref
  ) => {
    const errorStyles = hasError
      ? "border-accent-error focus:border-accent-error focus:ring-accent-error/20"
      : "border-border-light focus:border-accent-primary focus:ring-accent-primary/20";

    return (
      <select
        ref={ref}
        className={cn(baseStyles, errorStyles, className)}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }
);

Select.displayName = "Select";
