import { type ButtonHTMLAttributes, forwardRef } from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-accent-foreground hover:bg-accent-hover focus:ring-border-focus",
  secondary:
    "bg-secondary text-accent-foreground hover:bg-secondary-hover focus:ring-border",
  outline:
    "border-2 border-border bg-transparent hover:bg-surface-hover focus:ring-border",
  ghost: "bg-transparent hover:bg-surface-hover focus:ring-border",
  danger:
    "bg-danger text-accent-foreground hover:bg-danger-hover focus:ring-danger",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled || isLoading}
        className={`
          inline-flex items-center justify-center font-medium rounded-lg
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
