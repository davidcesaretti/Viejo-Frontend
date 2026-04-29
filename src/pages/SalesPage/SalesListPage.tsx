import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MainLayout } from "@/components/templates/MainLayout";
import { Button } from "@/components/atoms/Button";
import { DateRangePicker } from "@/components/molecules/DateRangePicker";
import { FilterSelect } from "@/components/molecules/FilterSelect";
import { useToast } from "@/hooks/useToast";
import { getSales, getSalesForExport, getClients } from "@/services";
import { exportSalesToExcel } from "@/services/salesExport.service";
import { formatCurrency, formatDate } from "@/lib";
import type { Sale } from "@/types/sale";
import type { Client } from "@/types/client";

const PAGE_SIZE = 30;

export function SalesListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();

  const [items, setItems] = useState<Sale[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);

  const [selectedClientId, setSelectedClientId] = useState(searchParams.get("clientId") ?? "");
  const [dateFrom, setDateFrom] = useState(searchParams.get("from") ?? "");
  const [dateTo, setDateTo] = useState(searchParams.get("to") ?? "");
  const [exporting, setExporting] = useState(false);

  const toastRef = useRef(toast);
  toastRef.current = toast;

  useEffect(() => {
    getClients(1, 500).then((res) => setClients(res.items ?? [])).catch(() => {});
  }, []);

  useEffect(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (selectedClientId) next.set("clientId", selectedClientId); else next.delete("clientId");
      if (dateFrom) next.set("from", dateFrom); else next.delete("from");
      if (dateTo) next.set("to", dateTo); else next.delete("to");
      return next;
    }, { replace: true });
    setPage(1);
  }, [selectedClientId, dateFrom, dateTo]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getSales(page, PAGE_SIZE, selectedClientId || undefined, dateFrom || undefined, dateTo || undefined)
      .then((res) => {
        if (!cancelled) { setItems(res.items ?? []); setTotal(res.total ?? 0); }
      })
      .catch((err) => {
        if (!cancelled) {
          toastRef.current.error("Error al cargar ventas", err instanceof Error ? err.message : undefined);
          setItems([]); setTotal(0);
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, selectedClientId, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasFilters = !!(selectedClientId || dateFrom || dateTo);

  async function handleExport() {
    setExporting(true);
    try {
      const result = await getSalesForExport(
        selectedClientId || undefined,
        dateFrom || undefined,
        dateTo || undefined,
      );
      const clientName = selectedClientId
        ? clients.find((c) => c.id === selectedClientId)?.name
        : undefined;
      await exportSalesToExcel(result.items, {
        clientId: selectedClientId || undefined,
        clientName,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
    } catch (err) {
      toast.error("Error al exportar", err instanceof Error ? err.message : "No se pudo generar el Excel");
    } finally {
      setExporting(false);
    }
  }

  function clearAllFilters() {
    setSelectedClientId("");
    setDateFrom("");
    setDateTo("");
  }

  return (
    <MainLayout title="Ventas">
      <div className="ds-page">
        <div className="ds-section-header">
          <div>
            <h1 className="ds-section-title">Ventas</h1>
            <p className="ds-section-subtitle">
              Historial de todas las ventas, de más nueva a más antigua.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleExport}
              isLoading={exporting}
              disabled={exporting}
            >
              <svg className="mr-1.5 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar Excel
            </Button>
            <Button size="sm" onClick={() => navigate("/ventas/nueva")}>
              + Nueva venta
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-end gap-3 rounded-xl border border-border-light bg-bg-secondary px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-text-secondary">Período</span>
            <DateRangePicker
              from={dateFrom}
              to={dateTo}
              onChange={(f, t) => { setDateFrom(f); setDateTo(t); }}
              onClear={() => { setDateFrom(""); setDateTo(""); }}
              placeholder="Todas las fechas"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-text-secondary">Cliente</label>
            <FilterSelect
              options={clients.map((c) => ({ value: c.id, label: c.name }))}
              value={selectedClientId}
              onChange={setSelectedClientId}
              onClear={() => setSelectedClientId("")}
              placeholder="Todos los clientes"
              searchPlaceholder="Buscar cliente…"
            />
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="h-8 rounded-lg px-3 text-xs font-medium text-text-tertiary transition-colors hover:text-accent-error"
            >
              Limpiar filtros
            </button>
          )}

          <span className="ml-auto self-end text-xs text-text-tertiary">
            {loading ? "Cargando…" : `${total} venta${total !== 1 ? "s" : ""}`}
          </span>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-border-light bg-bg-secondary shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-sm text-text-tertiary">
              <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Cargando ventas…
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-bg-tertiary text-text-tertiary">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-sm font-medium text-text-primary">Sin ventas</p>
              <p className="mt-1 text-xs text-text-tertiary">
                {hasFilters ? "No hay ventas para los filtros seleccionados." : "No hay ventas registradas todavía."}
              </p>
              {hasFilters ? (
                <button type="button" onClick={clearAllFilters} className="mt-3 text-xs font-medium text-accent-primary hover:underline">
                  Limpiar filtros
                </button>
              ) : (
                <Button size="sm" className="mt-4" onClick={() => navigate("/ventas/nueva")}>+ Nueva venta</Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="ds-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Cliente</th>
                      <th>Productos</th>
                      <th>Total</th>
                      <th>Estado</th>
                      <th>Saldo</th>
                      <th className="text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((s) => {
                      const balance = s.balance ?? (s.totalAmount - (s.amountPaid ?? 0));
                      const isPaid = balance <= 0;
                      const hasPartial = !isPaid && (s.amountPaid ?? 0) > 0;
                      return (
                        <tr key={s.id}>
                          <td className="whitespace-nowrap text-text-secondary">{formatDate(s.saleDate)}</td>
                          <td className="whitespace-nowrap font-medium text-text-primary">{s.client?.name ?? "—"}</td>
                          <td>
                            <div className="flex flex-col gap-0.5">
                              {(s.items ?? []).map((item, i) => (
                                <div key={i} className="flex items-baseline gap-1.5 text-sm">
                                  <span className="text-text-primary">{item.productName}</span>
                                  {item.variantName && (
                                    <span className="rounded bg-accent-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-accent-primary">
                                      {item.variantName}
                                    </span>
                                  )}
                                  <span className="text-text-tertiary">×{item.quantity}</span>
                                  <span className="text-text-secondary">{formatCurrency(item.unitPrice)}</span>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="whitespace-nowrap font-semibold text-text-primary">{formatCurrency(s.totalAmount)}</td>
                          <td className="whitespace-nowrap">
                            {isPaid ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-accent-success/10 px-2.5 py-0.5 text-xs font-semibold text-accent-success">✓ Pagado</span>
                            ) : hasPartial ? (
                              <span className="inline-flex items-center rounded-full bg-accent-warning/10 px-2.5 py-0.5 text-xs font-semibold text-accent-warning">Parcial</span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-accent-error/8 px-2.5 py-0.5 text-xs font-semibold text-accent-error">Fiado</span>
                            )}
                          </td>
                          <td className="whitespace-nowrap">
                            {isPaid
                              ? <span className="text-text-tertiary">—</span>
                              : <span className="font-semibold text-accent-error">{formatCurrency(balance)}</span>}
                          </td>
                          <td className="text-right">
                            <div className="ds-table-actions">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => navigate(`/ventas/${s.id}`)}
                              >
                                Ver detalle
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between border-t border-border-light px-5 py-3.5">
                <span className="text-xs text-text-tertiary">
                  Página {page} de {totalPages} · {total} en total
                </span>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setPage((p) => p - 1)} disabled={page <= 1}>Anterior</Button>
                  <Button variant="secondary" size="sm" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages}>Siguiente</Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
