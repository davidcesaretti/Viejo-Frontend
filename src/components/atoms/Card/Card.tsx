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
  default: "bg-bg-secondary border border-border-light",
  elevated: "bg-bg-elevated shadow-lg",
  bordered: "bg-bg-secondary border-2 border-border-medium",
};

const paddings: Record<CardPadding, string> = {
  none: "",
  sm: "p-3",
  md: "p-4",
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
          "rounded-lg transition-all duration-200",
          variants[variant],
          className
        )}
        {...props}
      >
        {title && (
          <div className="px-4 py-3 border-b border-border-light bg-bg-tertiary rounded-t-lg">
            <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
          </div>
        )}
        <div className={paddings[padding]}>{children}</div>
      </div>
    );
  }
);

Card.displayName = "Card";
