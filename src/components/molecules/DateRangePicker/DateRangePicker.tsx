import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTHS_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const DAYS_SHORT = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function toStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDisplay(s: string): string {
  if (!s) return "";
  const [y, m, d] = s.split("-").map(Number);
  return `${d}/${m}/${y}`;
}

function addMonths(year: number, month: number, delta: number): [number, number] {
  const d = new Date(year, month + delta, 1);
  return [d.getFullYear(), d.getMonth()];
}

function buildMonthCells(year: number, month: number): (string | null)[] {
  const firstDow = new Date(year, month, 1).getDay(); // 0=Sun
  const pad = (firstDow + 6) % 7; // shift to Mon-first
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = Array(pad).fill(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(
      `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    );
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

// ─── Quick shortcuts ──────────────────────────────────────────────────────────

const QUICK_OPTIONS: { label: string; get: () => [string, string] }[] = [
  { label: "Hoy", get: () => { const t = todayStr(); return [t, t]; } },
  {
    label: "Esta semana",
    get: () => {
      const now = new Date();
      const mon = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7));
      return [toStr(mon), todayStr()];
    },
  },
  {
    label: "Este mes",
    get: () => {
      const now = new Date();
      return [toStr(new Date(now.getFullYear(), now.getMonth(), 1)), todayStr()];
    },
  },
  {
    label: "Mes anterior",
    get: () => {
      const now = new Date();
      return [
        toStr(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
        toStr(new Date(now.getFullYear(), now.getMonth(), 0)),
      ];
    },
  },
  {
    label: "Últimos 3 meses",
    get: () => {
      const now = new Date();
      return [toStr(new Date(now.getFullYear(), now.getMonth() - 2, 1)), todayStr()];
    },
  },
  {
    label: "Este año",
    get: () => {
      const now = new Date();
      return [toStr(new Date(now.getFullYear(), 0, 1)), todayStr()];
    },
  },
];

// ─── MonthGrid ────────────────────────────────────────────────────────────────

interface MonthGridProps {
  year: number;
  month: number;
  today: string;
  maxDate: string;
  rangeFrom: string;
  rangeTo: string;
  hover: string | null;
  stage: "from" | "to";
  showPrev: boolean;
  showNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onDayClick: (d: string) => void;
  onDayEnter: (d: string) => void;
  onDayLeave: () => void;
}

function MonthGrid({
  year, month, today, maxDate,
  rangeFrom, rangeTo, hover, stage,
  showPrev, showNext, onPrev, onNext,
  onDayClick, onDayEnter, onDayLeave,
}: MonthGridProps) {
  const cells = buildMonthCells(year, month);

  // Effective display range (may include hover preview)
  let lo = rangeFrom;
  let hi = rangeTo || (stage === "to" && hover ? hover : "");
  if (lo && hi && lo > hi) [lo, hi] = [hi, lo];

  return (
    <div className="w-56">
      {/* Month nav */}
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={onPrev}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-bg-tertiary",
            !showPrev && "invisible pointer-events-none"
          )}
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm font-semibold text-text-primary">
          {MONTHS_ES[month]} {year}
        </span>
        <button
          type="button"
          onClick={onNext}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-bg-tertiary",
            !showNext && "invisible pointer-events-none"
          )}
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7">
        {DAYS_SHORT.map((d) => (
          <div key={d} className="flex h-8 items-center justify-center text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {cells.map((d, i) => {
          if (!d) return <div key={`e${i}`} className="h-9" />;

          const isDisabled = d > maxDate;
          const isToday = d === today;
          const isRangeStart = !!lo && d === lo;
          const isRangeEnd = !!hi && d === hi;
          const isInRange = !!lo && !!hi && d > lo && d < hi;
          const isSingleDay = lo === hi && !!lo;
          const isEndpoint = isRangeStart || isRangeEnd;
          const dayNum = d.split("-")[2].replace(/^0/, "");

          return (
            <div key={d} className="relative flex h-9 items-center justify-center">
              {/* Range stripe — only when range has 2 different dates */}
              {!isSingleDay && (isInRange || isEndpoint) && (
                <div
                  className="absolute inset-y-[4px] bg-accent-primary/10"
                  style={{
                    left: isRangeStart ? "50%" : 0,
                    right: isRangeEnd ? "50%" : 0,
                  }}
                />
              )}

              <button
                type="button"
                disabled={isDisabled}
                onClick={() => !isDisabled && onDayClick(d)}
                onMouseEnter={() => !isDisabled && onDayEnter(d)}
                onMouseLeave={onDayLeave}
                className={cn(
                  "relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors select-none",
                  isDisabled && "cursor-not-allowed opacity-25",
                  !isDisabled && !isEndpoint && "hover:bg-bg-tertiary cursor-pointer",
                  isEndpoint
                    ? "bg-accent-primary font-semibold text-white shadow-md"
                    : isToday
                    ? "font-semibold text-accent-primary ring-1 ring-inset ring-accent-primary/50"
                    : "text-text-primary"
                )}
              >
                {dayNum}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── DateRangePicker ──────────────────────────────────────────────────────────

export interface DateRangePickerProps {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
  onClear: () => void;
  placeholder?: string;
}

export function DateRangePicker({
  from, to, onChange, onClear, placeholder = "Seleccionar período",
}: DateRangePickerProps) {
  const today = todayStr();
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<"from" | "to">("from");
  const [draft, setDraft] = useState({ from, to });
  const [hover, setHover] = useState<string | null>(null);

  const now = new Date();
  const [leftYear, setLeftYear] = useState(now.getFullYear());
  const [leftMonth, setLeftMonth] = useState(now.getMonth() > 0 ? now.getMonth() - 1 : 0);
  const [rightYear, rightMonth] = addMonths(leftYear, leftMonth, 1);

  const ref = useRef<HTMLDivElement>(null);

  // Keep draft in sync when controlled values change
  useEffect(() => { setDraft({ from, to }); }, [from, to]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        closeAndReset();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, from, to]);

  function closeAndReset() {
    setOpen(false);
    setDraft({ from, to });
    setStage("from");
    setHover(null);
  }

  function handleDayClick(d: string) {
    if (stage === "from") {
      setDraft({ from: d, to: "" });
      setStage("to");
    } else {
      const [lo, hi] = d >= draft.from ? [draft.from, d] : [d, draft.from];
      setDraft({ from: lo, to: hi });
      setStage("from");
      setHover(null);
      onChange(lo, hi);
      setOpen(false);
    }
  }

  function handleQuick(f: string, t: string) {
    onChange(f, t);
    setDraft({ from: f, to: t });
    setStage("from");
    setHover(null);
    setOpen(false);
  }

  function prevMonth() {
    const [y, m] = addMonths(leftYear, leftMonth, -1);
    setLeftYear(y); setLeftMonth(m);
  }

  function nextMonth() {
    const [y, m] = addMonths(leftYear, leftMonth, 1);
    setLeftYear(y); setLeftMonth(m);
  }

  const displayLabel = (() => {
    if (!from && !to) return null;
    if (from === to && from) return formatDisplay(from);
    if (from && to) return `${formatDisplay(from)} – ${formatDisplay(to)}`;
    if (from) return `Desde ${formatDisplay(from)}`;
    return null;
  })();

  const hasRange = !!from || !!to;

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => { setOpen((v) => !v); }}
        className={cn(
          "flex h-8 items-center gap-2 rounded-lg border px-3 text-sm transition-all",
          open
            ? "border-accent-primary bg-bg-secondary text-text-primary ring-2 ring-accent-primary/20"
            : hasRange
            ? "border-accent-primary/50 bg-accent-primary/5 text-text-primary"
            : "border-border-light bg-bg-page text-text-tertiary hover:border-accent-primary/40 hover:text-text-secondary"
        )}
      >
        <svg className="h-3.5 w-3.5 shrink-0 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="font-medium">{displayLabel ?? placeholder}</span>
        {hasRange && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            onKeyDown={(e) => e.key === "Enter" && (e.stopPropagation(), onClear())}
            className="ml-1 flex h-4 w-4 items-center justify-center rounded text-text-tertiary transition-colors hover:text-accent-error"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 flex overflow-hidden rounded-xl border border-border-light bg-bg-secondary shadow-xl">
          {/* Quick options sidebar */}
          <div className="flex w-36 shrink-0 flex-col gap-0.5 border-r border-border-light bg-bg-page p-3">
            <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
              Accesos rápidos
            </p>
            {QUICK_OPTIONS.map(({ label, get }) => {
              const [f, t] = get();
              const isActive = from === f && to === t;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleQuick(f, t)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-left text-xs font-medium transition-colors",
                    isActive
                      ? "bg-accent-primary text-white"
                      : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Calendar */}
          <div className="p-5">
            {/* Step indicator */}
            <div className="mb-5 flex items-center justify-center">
              <div className="flex items-center gap-3 rounded-full border border-border-light bg-bg-page px-4 py-2 text-xs">
                <span className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold",
                  stage === "from" ? "bg-accent-primary text-white" : "bg-bg-tertiary text-text-tertiary"
                )}>1</span>
                <span className={stage === "from" ? "font-semibold text-text-primary" : "text-text-tertiary"}>
                  {draft.from ? formatDisplay(draft.from) : "Inicio"}
                </span>
                <svg className="h-3 w-3 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
                <span className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold",
                  stage === "to" ? "bg-accent-primary text-white" : "bg-bg-tertiary text-text-tertiary"
                )}>2</span>
                <span className={stage === "to" ? "font-semibold text-text-primary" : "text-text-tertiary"}>
                  {draft.to ? formatDisplay(draft.to) : stage === "to" ? "Elegí el fin" : "Fin"}
                </span>
              </div>
            </div>

            {/* Two-month view */}
            <div className="flex items-start gap-6">
              <MonthGrid
                year={leftYear} month={leftMonth}
                today={today} maxDate={today}
                rangeFrom={draft.from} rangeTo={draft.to}
                hover={hover} stage={stage}
                showPrev showNext={false}
                onPrev={prevMonth} onNext={nextMonth}
                onDayClick={handleDayClick}
                onDayEnter={(d) => stage === "to" && setHover(d)}
                onDayLeave={() => setHover(null)}
              />
              <div className="mt-8 w-px self-stretch bg-border-light" />
              <MonthGrid
                year={rightYear} month={rightMonth}
                today={today} maxDate={today}
                rangeFrom={draft.from} rangeTo={draft.to}
                hover={hover} stage={stage}
                showPrev={false} showNext
                onPrev={prevMonth} onNext={nextMonth}
                onDayClick={handleDayClick}
                onDayEnter={(d) => stage === "to" && setHover(d)}
                onDayLeave={() => setHover(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
