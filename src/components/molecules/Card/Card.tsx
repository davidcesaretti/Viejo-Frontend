import { type HTMLAttributes, type ReactNode } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  children: ReactNode;
}

export function Card({ title, children, className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-border bg-surface shadow-sm overflow-hidden ${className}`}
      {...props}
    >
      {title && (
        <div className="px-4 py-3 border-b border-border bg-surface-muted">
          <h3 className="text-lg font-semibold text-text">{title}</h3>
        </div>
      )}
      <div className="p-4 text-text">{children}</div>
    </div>
  );
}
