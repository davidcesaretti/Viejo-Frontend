import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MainLayout } from "@/components/templates/MainLayout";
import { Button } from "@/components/atoms/Button";
import { FormField } from "@/components/molecules/FormField";
import { DateRangePicker } from "@/components/molecules/DateRangePicker";
import { FilterSelect } from "@/components/molecules/FilterSelect";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/contexts";
import { formatCurrency, formatDate } from "@/lib";
import {
  getCashboxEntries,
  getCashboxSummary,
  createCashboxEntry,
  deleteCashboxEntry,
} from "@/services";
import type { CashboxEntry, CashboxEntryType } from "@/types";
import { ApiClientError } from "@/services/api/client";

const PAGE_SIZE = 30;

const CATEGORY_OPTIONS = [
  { value: "venta", label: "Venta" },
  { value: "cobro", label: "Cobro" },
  { value: "aporte", label: "Aporte de capital" },
  { value: "sueldo", label: "Sueldo" },
  { value: "flete", label: "Flete" },
  { value: "proveedores", label: "Pago a proveedores" },
  { value: "servicios", label: "Servicios (luz/agua/internet)" },
  { value: "mantenimiento", label: "Mantenimiento" },
  { value: "impuestos", label: "Impuestos" },
  { value: "otros", label: "Otros" },
];

const entrySchema = z.object({
  type: z.enum(["income", "expense"]),
  category: z.string().min(1, "Seleccioná una categoría"),
  amount: z.coerce.number().min(0.01, "El monto debe ser mayor a 0"),
  entryDate: z.string().min(1, "Ingresá la fecha"),
  description: z.string().max(500).optional().or(z.literal("")),
});

type EntryFormValues = z.infer<typeof entrySchema>;

export function CashboxPage() {
  const toast = useToast();
  const { hasRole } = useAuth();
  const toastRef = useRef(toast);
  toastRef.current = toast;

  const [items, setItems] = useState<CashboxEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [typeFilter, setTypeFilter] = useState<"" | CashboxEntryType>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const methods = useForm<EntryFormValues>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      type: "expense",
      category: "otros",
      amount: 0,
      entryDate: new Date().toISOString().slice(0, 10),
      description: "",
    },
    mode: "onBlur",
  });

  const hasFilters = !!(typeFilter || dateFrom || dateTo);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const categoryOptions = useMemo(() => CATEGORY_OPTIONS, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getCashboxEntries(page, PAGE_SIZE, {
      type: typeFilter || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    })
      .then((res) => {
        if (!cancelled) {
          setItems(res.items ?? []);
          setTotal(res.total ?? 0);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          toastRef.current.error(
            "Error al cargar movimientos de caja",
            err instanceof Error ? err.message : undefined
          );
          setItems([]);
          setTotal(0);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, typeFilter, dateFrom, dateTo]);

  useEffect(() => {
    let cancelled = false;
    setSummaryLoading(true);
    getCashboxSummary({
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    })
      .then((res) => {
        if (!cancelled) setSummary(res);
      })
      .catch(() => {
        if (!cancelled) setSummary({ income: 0, expense: 0, balance: 0 });
      })
      .finally(() => {
        if (!cancelled) setSummaryLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [dateFrom, dateTo]);

  useEffect(() => {
    setPage(1);
  }, [typeFilter, dateFrom, dateTo]);

  const onSubmit = methods.handleSubmit(async (values) => {
    try {
      await createCashboxEntry({
        type: values.type,
        category: values.category,
        amount: values.amount,
        entryDate: new Date(values.entryDate).toISOString(),
        description: values.description || undefined,
      });
      toast.success("Movimiento registrado correctamente");
      methods.reset({
        ...values,
        amount: 0,
        description: "",
      });

      const [entriesRes, summaryRes] = await Promise.all([
        getCashboxEntries(page, PAGE_SIZE, {
          type: typeFilter || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        }),
        getCashboxSummary({
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        }),
      ]);
      setItems(entriesRes.items ?? []);
      setTotal(entriesRes.total ?? 0);
      setSummary(summaryRes);
    } catch (err) {
      toast.error(
        "No se pudo registrar el movimiento",
        err instanceof ApiClientError ? err.message : "Error al guardar"
      );
    }
  });

  const handleDelete = async (entry: CashboxEntry) => {
    if (!window.confirm("¿Eliminar este movimiento de caja?")) return;
    setDeletingId(entry.id);
    try {
      await deleteCashboxEntry(entry.id);
      toast.success("Movimiento eliminado");
      setItems((prev) => prev.filter((i) => i.id !== entry.id));
      setTotal((prev) => Math.max(0, prev - 1));
      setSummary((prev) => {
        if (entry.type === "income") {
          const income = Math.max(0, prev.income - entry.amount);
          return { ...prev, income, balance: income - prev.expense };
        }
        const expense = Math.max(0, prev.expense - entry.amount);
        return { ...prev, expense, balance: prev.income - expense };
      });
    } catch (err) {
      toast.error(
        "No se pudo eliminar",
        err instanceof ApiClientError ? err.message : "Error al eliminar"
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <MainLayout title="Control de caja">
      <div className="ds-page">
        <div className="ds-section-header">
          <div>
            <h1 className="ds-section-title">Control de caja</h1>
            <p className="ds-section-subtitle">
              Registrá ingresos y gastos para tener el balance real del negocio.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border-light bg-bg-secondary p-5 shadow-sm">
            <p className="ds-kpi-label">Ingresos</p>
            <p className="ds-kpi-value text-accent-success">
              {summaryLoading ? "..." : formatCurrency(summary.income)}
            </p>
          </div>
          <div className="rounded-xl border border-border-light bg-bg-secondary p-5 shadow-sm">
            <p className="ds-kpi-label">Gastos</p>
            <p className="ds-kpi-value text-accent-error">
              {summaryLoading ? "..." : formatCurrency(summary.expense)}
            </p>
          </div>
          <div className="rounded-xl border border-border-light bg-bg-secondary p-5 shadow-sm">
            <p className="ds-kpi-label">Balance</p>
            <p
              className={`ds-kpi-value ${
                summary.balance >= 0 ? "text-accent-primary" : "text-accent-error"
              }`}
            >
              {summaryLoading ? "..." : formatCurrency(summary.balance)}
            </p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
          <div className="rounded-xl border border-border-light bg-bg-secondary p-5 shadow-sm">
            <p className="mb-4 text-sm font-semibold text-text-primary">Nuevo movimiento</p>
            <FormProvider {...methods}>
              <form onSubmit={onSubmit} className="ds-form">
                <FormField
                  name="type"
                  label="Tipo"
                  type="select"
                  options={[
                    { value: "income", label: "Ingreso" },
                    { value: "expense", label: "Gasto" },
                  ]}
                  required
                />
                <FormField
                  name="category"
                  label="Categoría"
                  type="select"
                  options={categoryOptions}
                  required
                />
                <FormField
                  name="amount"
                  label="Monto"
                  inputType="number"
                  placeholder="0.00"
                  required
                />
                <div className="space-y-1">
                  <label className="text-xs font-medium text-text-secondary">
                    Fecha <span className="text-accent-error">*</span>
                  </label>
                  <DateRangePicker
                    from={methods.watch("entryDate")}
                    to={methods.watch("entryDate")}
                    onChange={(from) => {
                      methods.setValue("entryDate", from, { shouldValidate: true });
                    }}
                    onClear={() =>
                      methods.setValue("entryDate", "", { shouldValidate: true })
                    }
                    placeholder="Seleccionar fecha"
                  />
                  {methods.formState.errors.entryDate?.message && (
                    <p className="text-xs text-accent-error">
                      {methods.formState.errors.entryDate.message}
                    </p>
                  )}
                </div>
                <FormField
                  name="description"
                  label="Descripción"
                  placeholder="Opcional (ej. pago flete mercado central)"
                />
                <div className="ds-form-actions">
                  <Button type="submit" size="sm">
                    Registrar movimiento
                  </Button>
                </div>
              </form>
            </FormProvider>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border-light bg-bg-secondary p-4 shadow-sm">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-text-secondary">Tipo</label>
                <FilterSelect
                  value={typeFilter}
                  onChange={(value) =>
                    setTypeFilter((value as CashboxEntryType | "") ?? "")
                  }
                  onClear={() => setTypeFilter("")}
                  options={[
                    { value: "income", label: "Ingresos" },
                    { value: "expense", label: "Gastos" },
                  ]}
                  placeholder="Todos"
                  searchPlaceholder="Buscar tipo…"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-text-secondary">Período</label>
                <DateRangePicker
                  from={dateFrom}
                  to={dateTo}
                  onChange={(from, to) => {
                    setDateFrom(from);
                    setDateTo(to);
                  }}
                  onClear={() => {
                    setDateFrom("");
                    setDateTo("");
                  }}
                  placeholder="Todas las fechas"
                />
              </div>
              {hasFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setTypeFilter("");
                    setDateFrom("");
                    setDateTo("");
                  }}
                >
                  Limpiar filtros
                </Button>
              )}
            </div>

            <div className="overflow-hidden rounded-xl border border-border-light bg-bg-secondary shadow-sm">
              {loading ? (
                <div className="flex items-center justify-center py-16 text-sm text-text-tertiary">
                  Cargando movimientos…
                </div>
              ) : items.length === 0 ? (
                <div className="flex items-center justify-center py-16 text-sm text-text-tertiary">
                  No hay movimientos en este período.
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="ds-table">
                      <thead>
                        <tr>
                          <th>Fecha</th>
                          <th>Tipo</th>
                          <th>Categoría</th>
                          <th>Descripción</th>
                          <th>Monto</th>
                          <th>Usuario</th>
                          {hasRole("administrador") && (
                            <th className="text-right">Acciones</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((entry) => (
                          <tr key={entry.id}>
                            <td>{formatDate(entry.entryDate)}</td>
                            <td>
                              <span
                                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                                  entry.type === "income"
                                    ? "bg-accent-success/10 text-accent-success"
                                    : "bg-accent-error/10 text-accent-error"
                                }`}
                              >
                                {entry.type === "income" ? "Ingreso" : "Gasto"}
                              </span>
                            </td>
                            <td>{entry.category}</td>
                            <td className="max-w-[320px] truncate text-text-secondary">
                              {entry.description || "—"}
                            </td>
                            <td
                              className={
                                entry.type === "income"
                                  ? "font-semibold text-accent-success"
                                  : "font-semibold text-accent-error"
                              }
                            >
                              {entry.type === "income" ? "+" : "-"}
                              {formatCurrency(entry.amount)}
                            </td>
                            <td>{entry.createdBy?.name ?? "—"}</td>
                            {hasRole("administrador") && (
                              <td className="text-right">
                                <div className="ds-table-actions">
                                  <Button
                                    variant="error"
                                    size="sm"
                                    disabled={deletingId === entry.id}
                                    isLoading={deletingId === entry.id}
                                    onClick={() => handleDelete(entry)}
                                  >
                                    Eliminar
                                  </Button>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-border-light px-5 py-3.5">
                      <span className="text-xs text-text-tertiary">
                        Página {page} de {totalPages} · {total} en total
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setPage((p) => p - 1)}
                          disabled={page <= 1}
                        >
                          Anterior
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setPage((p) => p + 1)}
                          disabled={page >= totalPages}
                        >
                          Siguiente
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
