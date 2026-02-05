import { useState, useRef, useEffect } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption
    ? selectedOption.label
    : placeholder ?? "";

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        onBlur?.();
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open, onBlur]);

  const errorStyles = hasError
    ? "border-accent-error focus:ring-accent-error/30"
    : "border-border-light focus:border-accent-primary focus:ring-accent-primary/40 focus:shadow-[0_0_0_3px_rgba(79,70,229,0.15)]";

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        onBlur={onBlur}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-invalid={ariaInvalid}
        aria-label={selectedOption ? selectedOption.label : placeholder}
        className={cn(
          "w-full min-h-[44px] pl-4 pr-10 py-2.5 rounded-xl border-2 transition-all duration-200 text-left",
          "focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed",
          "bg-bg-secondary text-text-primary",
          !selectedOption && "text-text-tertiary",
          errorStyles,
          className
        )}
      >
        <span className="block truncate">{displayLabel}</span>
        <span
          className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-tertiary transition-transform",
            open && "rotate-180"
          )}
          aria-hidden
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-20 w-full mt-2 py-1 rounded-xl border-2 border-border-light bg-bg-elevated shadow-[var(--shadow-xl)] max-h-60 overflow-auto"
          aria-activedescendant={value ? `option-${value}` : undefined}
        >
          {placeholder && (
            <li
              role="option"
              aria-selected={!value}
              id={!value ? "option-placeholder" : undefined}
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className={cn(
                "px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors rounded-t-[10px]",
                !value
                  ? "bg-accent-primary/15 text-accent-primary"
                  : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
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
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={cn(
                "px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors text-text-primary",
                value === opt.value
                  ? "bg-accent-primary/20 text-accent-primary"
                  : "hover:bg-bg-tertiary"
              )}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
