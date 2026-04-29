import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/templates/MainLayout";
import { Button } from "@/components/atoms/Button";
import { useToast } from "@/hooks/useToast";
import { getProducts, deleteProduct } from "@/services";
import type { Product } from "@/types/product";
import { ApiClientError } from "@/services/api/client";

const PAGE_SIZE = 20;

export function ProductsListPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [items, setItems] = useState<Product[]>([]);
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
    getProducts(page, PAGE_SIZE)
      .then((res) => {
        if (!cancelled) {
          setItems(res.items ?? []);
          setTotal(res.total ?? 0);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error("Error al cargar productos", err instanceof Error ? err.message : undefined);
          setItems([]);
          setTotal(0);
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page]);

  const handleDelete = async (p: Product) => {
    if (!window.confirm(`¿Eliminar el producto "${p.name}"?`)) return;
    setDeletingId(p.id);
    try {
      await deleteProduct(p.id);
      setItems((prev) => prev.filter((x) => x.id !== p.id));
      setTotal((t) => Math.max(0, t - 1));
      toast.success("Producto eliminado", p.name);
    } catch (err) {
      toast.error("No se pudo eliminar", err instanceof ApiClientError ? err.message : "Error al eliminar");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <MainLayout title="Productos">
      <div className="ds-page">
        {/* Header */}
        <div className="ds-section-header">
          <div>
            <h1 className="ds-section-title">Productos</h1>
            <p className="ds-section-subtitle">
              Productos disponibles para ventas. Cada uno puede tener múltiples cargamentos de stock.
            </p>
          </div>
          <Button size="sm" onClick={() => navigate("/productos/nuevo")}>
            + Agregar producto
          </Button>
        </div>

        {/* Table card */}
        <div className="overflow-hidden rounded-xl border border-border-light bg-bg-secondary shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-sm text-text-tertiary">
              <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Cargando productos…
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-bg-tertiary text-text-tertiary">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <p className="text-sm font-medium text-text-primary">Sin productos</p>
              <p className="mt-1 text-xs text-text-tertiary">
                Todavía no hay productos. Creá el primero.
              </p>
              <Button size="sm" className="mt-4" onClick={() => navigate("/productos/nuevo")}>
                + Agregar producto
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="ds-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th className="text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((p) => (
                      <tr key={p.id}>
                        <td>{p.name}</td>
                        <td className="text-right">
                          <div className="ds-table-actions">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => navigate(`/productos/${p.id}/editar`)}
                            >
                              Editar
                            </Button>
                            <Button
                              variant="error"
                              size="sm"
                              onClick={() => handleDelete(p)}
                              disabled={deletingId === p.id}
                              isLoading={deletingId === p.id}
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
