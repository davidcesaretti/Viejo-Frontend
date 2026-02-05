import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/templates/MainLayout";
import { PageTransition } from "@/components/templates/PageTransition";
import { Card } from "@/components/molecules/Card";
import { Button } from "@/components/atoms/Button";
import { useToast } from "@/hooks/useToast";
import { getClients, deleteClient } from "@/services";
import type { Client } from "@/types/client";
import { ApiClientError } from "@/services/api/client";

const PAGE_SIZE = 20;

export function ClientsListPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [items, setItems] = useState<Client[]>([]);
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
    getClients(page, PAGE_SIZE)
      .then((res) => {
        if (!cancelled) {
          setItems(res.items ?? []);
          setTotal(res.total ?? 0);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error(
            "Error al cargar clientes",
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

  const handleDelete = async (c: Client) => {
    if (!window.confirm(`¿Eliminar al cliente "${c.name}"?`)) return;
    setDeletingId(c.id);
    try {
      await deleteClient(c.id);
      setItems((prev) => prev.filter((x) => x.id !== c.id));
      setTotal((t) => Math.max(0, t - 1));
      toast.success("Cliente eliminado", c.name);
    } catch (err) {
      const msg =
        err instanceof ApiClientError ? err.message : "Error al eliminar";
      toast.error("No se pudo eliminar", msg);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <MainLayout title="Clientes">
      <PageTransition>
        <div className="space-y-6 animate-fade-in pb-6 sm:pb-8">
          <section className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-2 sm:text-3xl tracking-tight">
                Listado de clientes
              </h2>
              <p className="text-sm text-text-secondary sm:text-base">
                Personas que compran en el negocio. Agregá o editá desde acá.
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate("/clientes/nuevo")}
            >
              Agregar cliente
            </Button>
          </section>

          <Card variant="elevated" padding="lg">
            {loading ? (
              <p className="text-sm text-text-tertiary">Cargando clientes…</p>
            ) : items.length === 0 ? (
              <p className="text-sm text-text-tertiary">
                No hay clientes cargados. Usá "Agregar cliente" para crear uno.
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
                        <th className="py-3 pr-4 font-bold text-text-primary">
                          Email
                        </th>
                        <th className="py-3 pr-4 font-bold text-text-primary">
                          Teléfono
                        </th>
                        <th className="py-3 w-40 text-right font-bold text-text-primary">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((c) => (
                        <tr key={c.id} className="border-b border-border-light">
                          <td className="py-2 pr-4">{c.name}</td>
                          <td className="py-2 pr-4">{c.email}</td>
                          <td className="py-2 pr-4">{c.phone ?? "-"}</td>
                          <td className="py-2 text-right">
                            <div className="flex items-center justify-end gap-1 flex-wrap">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  navigate(`/clientes/${c.id}/cuenta`)
                                }
                              >
                                Cuenta
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  navigate(`/clientes/${c.id}/editar`)
                                }
                              >
                                Editar
                              </Button>
                              <Button
                                variant="error"
                                size="sm"
                                onClick={() => handleDelete(c)}
                                disabled={deletingId === c.id}
                                isLoading={deletingId === c.id}
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
