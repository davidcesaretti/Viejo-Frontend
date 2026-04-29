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

const base =
  "inline-flex items-center justify-center gap-1.5 font-medium whitespace-nowrap select-none cursor-pointer transition-colors " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-secondary " +
  "disabled:pointer-events-none disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-accent-primary text-white hover:bg-accent-primary-hover shadow-sm rounded-lg",
  secondary:
    "bg-bg-secondary text-text-primary border border-border-medium hover:bg-bg-tertiary shadow-sm rounded-lg",
  success:
    "bg-accent-success text-white hover:brightness-110 shadow-sm rounded-lg",
  warning:
    "bg-accent-warning text-white hover:brightness-110 shadow-sm rounded-lg",
  error:
    "bg-accent-error/8 text-accent-error border border-accent-error/25 hover:bg-accent-error/15 rounded-lg",
  ghost:
    "text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded-lg",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-9 px-4 text-sm",
  lg: "h-10 px-5 text-sm",
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
  ) => (
    <button
      ref={ref}
      type="button"
      disabled={disabled || isLoading}
      className={cn(base, variants[variant], sizes[size], isLoading && "cursor-wait", className)}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="-ml-0.5 h-3.5 w-3.5 animate-spin"
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
          Cargando…
        </>
      ) : (
        children
      )}
    </button>
  )
);

Button.displayName = "Button";
