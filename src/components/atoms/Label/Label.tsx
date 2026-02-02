import { type LabelHTMLAttributes, forwardRef } from "react";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ required = false, className = "", children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={`block text-sm font-medium text-text ${className}`}
        {...props}
      >
        {children}
        {required && <span className="text-required ml-0.5">*</span>}
      </label>
    );
  }
);

Label.displayName = "Label";
