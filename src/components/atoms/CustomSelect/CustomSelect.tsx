import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

export interface CustomSelectProps {
  options: SelectOption[];
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  id?: string;
  hasError?: boolean;
  disabled?: boolean;
  className?: string;
  "aria-invalid"?: boolean;
}

export function CustomSelect({
  options,
  placeholder,
  value,
  onChange,
  onBlur,
  id,
  hasError = false,
  disabled = false,
  className = "",
  "aria-invalid": ariaInvalid,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [dropdownRect, setDropdownRect] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption?.label ?? placeholder ?? "";

  useEffect(() => {
    if (open && buttonRef.current) {
      const r = buttonRef.current.getBoundingClientRect();
      setDropdownRect({ top: r.bottom + 4, left: r.left, width: r.width });
    } else {
      setDropdownRect(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (
        containerRef.current &&
        !containerRef.current.contains(t) &&
        !t.closest("[data-custom-select-dropdown]")
      ) {
        setOpen(false);
        onBlur?.();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onBlur]);

  const triggerClass = cn(
    "w-full h-9 pl-3 pr-9 rounded-lg border text-sm text-left transition-colors cursor-pointer",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0",
    "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-bg-tertiary",
    "bg-bg-secondary",
    !selectedOption && "text-text-tertiary",
    selectedOption && "text-text-primary",
    hasError
      ? "border-accent-error focus-visible:ring-accent-error/25 focus-visible:border-accent-error"
      : "border-border-light focus-visible:ring-accent-primary/25 focus-visible:border-accent-primary",
    className
  );

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        ref={buttonRef}
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        onBlur={onBlur}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-invalid={ariaInvalid}
        aria-label={selectedOption?.label ?? placeholder}
        className={triggerClass}
      >
        <span className="block truncate">{displayLabel}</span>
        <span
          className={cn(
            "pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary transition-transform duration-150",
            open && "rotate-180"
          )}
          aria-hidden
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {open &&
        dropdownRect &&
        createPortal(
          <ul
            data-custom-select-dropdown
            role="listbox"
            className="fixed z-[9999] overflow-auto rounded-lg border border-border-light bg-bg-secondary py-1 shadow-xl"
            style={{
              top: dropdownRect.top,
              left: dropdownRect.left,
              width: dropdownRect.width,
              maxHeight: "14rem",
            }}
            aria-activedescendant={value ? `option-${value}` : undefined}
          >
            {placeholder && (
              <li
                role="option"
                aria-selected={!value}
                onClick={() => { onChange(""); setOpen(false); }}
                className={cn(
                  "cursor-pointer px-3 py-2 text-sm transition-colors",
                  !value
                    ? "bg-accent-primary/8 text-accent-primary font-medium"
                    : "text-text-tertiary hover:bg-bg-tertiary"
                )}
              >
                {placeholder}
              </li>
            )}
            {options.map((opt) => (
              <li
                key={opt.value}
                role="option"
                aria-selected={value === opt.value}
                id={`option-${opt.value}`}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={cn(
                  "cursor-pointer px-3 py-2 text-sm transition-colors",
                  value === opt.value
                    ? "bg-accent-primary/8 text-accent-primary font-medium"
                    : "text-text-primary hover:bg-bg-tertiary"
                )}
              >
                {opt.label}
              </li>
            ))}
          </ul>,
          document.body
        )}
    </div>
  );
}
