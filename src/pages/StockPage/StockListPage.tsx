import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/templates/MainLayout";
import { Button } from "@/components/atoms/Button";
import { formatCurrency } from "@/lib";
import { useToast } from "@/hooks/useToast";
import { getStock, deleteStock } from "@/services";
import type { Stock } from "@/types/stock";
import { ApiClientError } from "@/services/api/client";

const PAGE_SIZE = 20;

export function StockListPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [items, setItems] = useState<Stock[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getStock(page, PAGE_SIZE)
      .then((res) => {
        if (!cancelled) {
          setItems(res.items ?? []);
          setTotal(res.total ?? 0);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error("Error al cargar cargamentos", err instanceof Error ? err.message : undefined);
          setItems([]);
          setTotal(0);
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page]);

  const handleDelete = async (s: Stock) => {
    const label = s.product?.name ? `cargamento de ${s.product.name}` : "cargamento";
    if (!window.confirm(`¿Eliminar este ${label}?`)) return;
    setDeletingId(s.id);
    try {
      await deleteStock(s.id);
      setItems((prev) => prev.filter((x) => x.id !== s.id));
      setTotal((t) => Math.max(0, t - 1));
      toast.success("Cargamento eliminado");
    } catch (err) {
      toast.error("No se pudo eliminar", err instanceof ApiClientError ? err.message : "Error al eliminar");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <MainLayout title="Stock">
      <div className="ds-page">
        <div className="ds-section-header">
          <div>
            <h1 className="ds-section-title">Cargamentos de stock</h1>
            <p className="ds-section-subtitle">
              Ingreso de mercadería por producto: cantidad, precio y descuento aplicado.
            </p>
          </div>
          <Button size="sm" onClick={() => navigate("/stock/nuevo")}>
            + Agregar cargamento
          </Button>
        </div>

        <div className="overflow-hidden rounded-xl border border-border-light bg-bg-secondary shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-sm text-text-tertiary">
              <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Cargando cargamentos…
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-bg-tertiary text-text-tertiary">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <p className="text-sm font-medium text-text-primary">Sin cargamentos</p>
              <p className="mt-1 text-xs text-text-tertiary">
                Registrá el primer ingreso de stock.
              </p>
              <Button size="sm" className="mt-4" onClick={() => navigate("/stock/nuevo")}>
                + Agregar cargamento
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="ds-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Variante</th>
                      <th>Cantidad</th>
                      <th>Precio</th>
                      <th>Descuento</th>
                      <th className="text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((s) => (
                      <tr key={s.id}>
                        <td>{s.product?.name ?? s.productId}</td>
                        <td>
                          {s.variantName
                            ? <span className="rounded-md bg-accent-primary/8 px-2 py-0.5 text-xs font-medium text-accent-primary">{s.variantName}</span>
                            : <span className="text-text-tertiary">—</span>}
                        </td>
                        <td>{s.quantity}</td>
                        <td>{formatCurrency(s.price)}</td>
                        <td>
                          {s.discount != null
                            ? s.discountType === "fixed"
                              ? formatCurrency(s.discount)
                              : `${s.discount}%`
                            : <span className="text-text-tertiary">—</span>}
                        </td>
                        <td className="text-right">
                          <div className="ds-table-actions">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => navigate(`/stock/${s.id}/editar`)}
                            >
                              Editar
                            </Button>
                            <Button
                              variant="error"
                              size="sm"
                              onClick={() => handleDelete(s)}
                              disabled={deletingId === s.id}
                              isLoading={deletingId === s.id}
                            >
                              Eliminar
                            </Button>
                          </div>
                        </td>
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
                    <Button variant="secondary" size="sm" onClick={() => setPage((p) => p - 1)} disabled={!hasPrev}>
                      Anterior
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => setPage((p) => p + 1)} disabled={!hasNext}>
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
