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

const base =
  "w-full h-9 px-3 rounded-lg border bg-bg-secondary text-sm text-text-primary " +
  "transition-colors cursor-pointer " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/25 focus-visible:border-accent-primary " +
  "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-bg-tertiary";

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, placeholder, hasError = false, className = "", ...props }, ref) => {
    const errorStyles = hasError
      ? "border-accent-error focus-visible:ring-accent-error/25 focus-visible:border-accent-error"
      : "border-border-light";

    return (
      <select
        ref={ref}
        className={cn(base, errorStyles, className)}
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
