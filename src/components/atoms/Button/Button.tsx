import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const baseStyles =
  "inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-primary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-accent-primary text-white hover:brightness-110 focus:ring-accent-primary shadow-lg hover:shadow-xl hover:-translate-y-0.5",
  secondary:
    "bg-accent-secondary-bg text-accent-secondary border-2 border-accent-secondary/40 hover:bg-accent-secondary hover:text-white focus:ring-accent-secondary shadow-md hover:shadow-lg hover:-translate-y-0.5",
  success:
    "bg-accent-success text-white hover:brightness-110 focus:ring-accent-success shadow-md hover:shadow-lg",
  warning:
    "bg-accent-warning text-white hover:brightness-110 focus:ring-accent-warning shadow-md hover:shadow-lg",
  error:
    "bg-accent-error text-white hover:brightness-110 focus:ring-accent-error shadow-md hover:shadow-lg",
  ghost:
    "bg-bg-tertiary/60 text-text-primary border-2 border-border-medium hover:bg-bg-tertiary hover:border-accent-primary/50 focus:ring-accent-primary/30",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-3 py-2 text-sm rounded-lg min-h-[44px] sm:min-h-0",
  md: "px-5 py-2.5 text-base rounded-xl min-h-[44px] sm:min-h-0",
  lg: "px-6 py-3 text-lg rounded-xl min-h-[48px] sm:min-h-0",
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
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          isLoading && "cursor-wait",
          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Cargando...
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
