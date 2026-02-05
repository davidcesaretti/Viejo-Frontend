import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/templates/MainLayout";
import { PageTransition } from "@/components/templates/PageTransition";
import { Card } from "@/components/molecules/Card";
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
          toast.error(
            "Error al cargar productos",
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
      const msg =
        err instanceof ApiClientError ? err.message : "Error al eliminar";
      toast.error("No se pudo eliminar", msg);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <MainLayout title="Productos">
      <PageTransition>
        <div className="space-y-6 animate-fade-in pb-6 sm:pb-8">
          <section className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-2 sm:text-3xl tracking-tight">
                Listado de productos
              </h2>
              <p className="text-sm text-text-secondary sm:text-base">
                Productos con los que trabajás (ej. Papa, Cebolla). Agregá o
                editá desde acá.
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate("/productos/nuevo")}
            >
              Agregar producto
            </Button>
          </section>

          <Card variant="elevated" padding="lg">
            {loading ? (
              <p className="text-sm text-text-tertiary">Cargando productos…</p>
            ) : items.length === 0 ? (
              <p className="text-sm text-text-tertiary">
                No hay productos cargados. Usá "Agregar producto" para crear
                uno.
              </p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-text-primary">
                    <thead>
                      <tr className="border-b-2 border-border-medium bg-bg-tertiary/50">
                        <th className="py-3 pr-4 font-bold text-text-primary">
                          Nombre
                        </th>
                        <th className="py-3 w-32 text-right font-bold text-text-primary">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((p) => (
                        <tr key={p.id} className="border-b border-border-light">
                          <td className="py-2 pr-4">{p.name}</td>
                          <td className="py-2 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  navigate(`/productos/${p.id}/editar`)
                                }
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
                                Borrar
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-between gap-2 mt-4 pt-4 border-t border-border-light">
                    <span className="text-sm text-text-secondary">
                      Página {page} de {totalPages} ({total} en total)
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={!hasPrev}
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPage((p) => p + 1)}
                        disabled={!hasNext}
                      >
                        Siguiente
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </Card>
        </div>
      </PageTransition>
    </MainLayout>
  );
}
