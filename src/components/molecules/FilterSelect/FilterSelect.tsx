import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export interface FilterSelectOption {
  value: string;
  label: string;
}

export interface FilterSelectProps {
  options: FilterSelectOption[];
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  searchPlaceholder?: string;
  icon?: React.ReactNode;
}

const defaultIcon = (
  <svg className="h-3.5 w-3.5 shrink-0 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

export function FilterSelect({
  options,
  value,
  onChange,
  onClear,
  placeholder = "Seleccionar",
  searchPlaceholder = "Buscar…",
  icon = defaultIcon,
}: FilterSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number; minWidth: number } | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);
  const isActive = !!value;

  const filtered = search.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  function openDropdown() {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    setDropdownPos({ top: r.bottom + 6, left: r.left, minWidth: Math.max(r.width, 200) });
    setOpen(true);
    setSearch("");
    requestAnimationFrame(() => searchRef.current?.focus());
  }

  function closeDropdown() {
    setOpen(false);
    setSearch("");
  }

  function select(val: string) {
    onChange(val);
    closeDropdown();
  }

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const isInTrigger = containerRef.current?.contains(t);
      const isInDropdown = t.closest("[data-filter-select-dropdown]");
      if (!isInTrigger && !isInDropdown) closeDropdown();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") closeDropdown(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? closeDropdown() : openDropdown())}
        className={cn(
          "flex h-8 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-all",
          open
            ? "border-accent-primary bg-bg-secondary text-text-primary ring-2 ring-accent-primary/20"
            : isActive
            ? "border-accent-primary/50 bg-accent-primary/5 text-text-primary"
            : "border-border-light bg-bg-page text-text-tertiary hover:border-accent-primary/40 hover:text-text-secondary"
        )}
      >
        {icon}
        <span>{selected?.label ?? placeholder}</span>
        <span
          className={cn(
            "ml-0.5 text-text-tertiary transition-transform duration-150",
            open && "rotate-180"
          )}
          aria-hidden
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
        {isActive && (
          <span
            role="button"
            tabIndex={0}
            className="ml-0.5 flex h-4 w-4 items-center justify-center rounded text-text-tertiary transition-colors hover:text-accent-error"
            onClick={(e) => { e.stopPropagation(); onClear?.(); onChange(""); closeDropdown(); }}
            onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); onClear?.(); onChange(""); closeDropdown(); } }}
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </span>
        )}
      </button>

      {open && dropdownPos && createPortal(
        <div
          data-filter-select-dropdown
          className="fixed z-9999 overflow-hidden rounded-xl border border-border-light bg-bg-secondary shadow-xl"
          style={{ top: dropdownPos.top, left: dropdownPos.left, minWidth: dropdownPos.minWidth }}
        >
          {/* Search */}
          <div className="border-b border-border-light p-2">
            <div className="flex items-center gap-2 rounded-lg border border-border-light bg-bg-page px-3 py-1.5 focus-within:border-accent-primary/50 focus-within:ring-2 focus-within:ring-accent-primary/15">
              <svg className="h-3.5 w-3.5 shrink-0 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none"
              />
              {search && (
                <button type="button" onClick={() => setSearch("")} className="text-text-tertiary hover:text-text-primary">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Options list */}
          <ul role="listbox" className="max-h-56 overflow-y-auto py-1.5">
            {/* "All" option */}
            <li
              role="option"
              aria-selected={!value}
              onClick={() => select("")}
              className={cn(
                "flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm transition-colors",
                !value
                  ? "bg-accent-primary/8 font-semibold text-accent-primary"
                  : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
              )}
            >
              <span className={cn(
                "flex h-4 w-4 items-center justify-center rounded-full border text-[10px] shrink-0",
                !value ? "border-accent-primary bg-accent-primary text-white" : "border-border-medium"
              )}>
                {!value && (
                  <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              Todos los clientes
            </li>

            {filtered.length === 0 ? (
              <li className="px-3 py-4 text-center text-xs text-text-tertiary">Sin resultados</li>
            ) : (
              filtered.map((opt) => {
                const isSelected = value === opt.value;
                return (
                  <li
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => select(opt.value)}
                    className={cn(
                      "flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm transition-colors",
                      isSelected
                        ? "bg-accent-primary/8 font-semibold text-accent-primary"
                        : "text-text-primary hover:bg-bg-tertiary"
                    )}
                  >
                    <span className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px]",
                      isSelected ? "border-accent-primary bg-accent-primary text-white" : "border-border-medium"
                    )}>
                      {isSelected && (
                        <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                    {opt.label}
                  </li>
                );
              })
            )}
          </ul>
        </div>,
        document.body
      )}
    </div>
  );
}
