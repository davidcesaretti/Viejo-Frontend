import { type SelectHTMLAttributes, forwardRef } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  placeholder?: string;
  hasError?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { options, placeholder, hasError = false, className = "", ...props },
    ref
  ) => {
    return (
      <select
        ref={ref}
        className={`
          w-full px-3 py-2 rounded-lg border bg-input-bg text-text
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
