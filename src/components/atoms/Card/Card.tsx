import { type HTMLAttributes, type ReactNode, forwardRef } from "react";
import { cn } from "@/lib/utils";

export type CardVariant = "default" | "elevated" | "bordered";
export type CardPadding = "none" | "sm" | "md" | "lg";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  variant?: CardVariant;
  padding?: CardPadding;
  children: ReactNode;
}

const variants: Record<CardVariant, string> = {
  default: "bg-bg-secondary border border-border-light rounded-xl",
  elevated:
    "bg-bg-elevated rounded-xl shadow-[var(--shadow-lg)] border border-border-light/50 hover:shadow-[var(--shadow-xl)] transition-shadow duration-200",
  bordered: "bg-bg-secondary border-2 border-border-medium rounded-xl",
};

const paddings: Record<CardPadding, string> = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      title,
      variant = "default",
      padding = "md",
      children,
      className = "",
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "transition-all duration-200 overflow-hidden",
          variants[variant],
          className
        )}
        {...props}
      >
        {title && (
          <div className="px-5 py-3.5 border-b border-border-light bg-bg-tertiary/80 flex items-center gap-3">
            <span
              className="w-1 h-8 rounded-full bg-accent-primary shrink-0"
              aria-hidden
            />
            <h3 className="text-lg font-bold text-text-primary">{title}</h3>
          </div>
        )}
        <div className={paddings[padding]}>{children}</div>
      </div>
    );
  }
);

Card.displayName = "Card";
