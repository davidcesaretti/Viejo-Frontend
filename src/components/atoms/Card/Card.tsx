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
  default:  "bg-bg-secondary border border-border-light rounded-xl",
  elevated: "bg-bg-secondary border border-border-light rounded-xl shadow-sm",
  bordered: "bg-bg-secondary border-2 border-border-medium rounded-xl",
};

const paddings: Record<CardPadding, string> = {
  none: "",
  sm:   "p-4",
  md:   "p-5",
  lg:   "p-6",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      title,
      variant = "elevated",
      padding = "md",
      children,
      className = "",
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      className={cn("overflow-hidden", variants[variant], className)}
      {...props}
    >
      {title && (
        <div className="border-b border-border-light px-6 py-4">
          <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
        </div>
      )}
      <div className={paddings[padding]}>{children}</div>
    </div>
  )
);

Card.displayName = "Card";
