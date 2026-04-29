import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/templates/MainLayout";
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
            err instanceof Error ? err.message : undefined,
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
      toast.error(
        "No se pudo eliminar",
        err instanceof ApiClientError ? err.message : "Error al eliminar",
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <MainLayout title="Clientes">
      <div className="ds-page">
        <div className="ds-section-header">
          <div>
            <h1 className="ds-section-title">Clientes</h1>
            <p className="ds-section-subtitle">
              Personas que compran en el negocio. Podés ver su cuenta corriente
              y historial de pagos.
            </p>
          </div>
          <Button size="sm" onClick={() => navigate("/clientes/nuevo")}>
            + Agregar cliente
          </Button>
        </div>

        <div className="overflow-hidden rounded-xl border border-border-light bg-bg-secondary shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-sm text-text-tertiary">
              <svg
                className="mr-2 h-4 w-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Cargando clientes…
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-bg-tertiary text-text-tertiary">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-text-primary">
                Sin clientes
              </p>
              <p className="mt-1 text-xs text-text-tertiary">
                Registrá tu primer cliente.
              </p>
              <Button
                size="sm"
                className="mt-4"
                onClick={() => navigate("/clientes/nuevo")}
              >
                + Agregar cliente
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="ds-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Teléfono</th>
                      <th className="text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((c) => (
                      <tr key={c.id}>
                        {/* Nombre con avatar inicial */}
                        <td>
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-primary/10 text-sm font-semibold text-accent-primary">
                              {c.name.charAt(0).toUpperCase()}
                            </span>
                            <span className="font-medium text-text-primary">
                              {c.name}
                            </span>
                          </div>
                        </td>

                        {/* Email */}
                        <td>
                          <span className="text-text-secondary">
                            {c.email || "—"}
                          </span>
                        </td>

                        {/* Teléfono — guión si vacío */}
                        <td>
                          {c.phone ? (
                            <span className="text-text-secondary">
                              {c.phone}
                            </span>
                          ) : (
                            <span className="text-text-tertiary">—</span>
                          )}
                        </td>

                        {/* Acciones */}
                        <td>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                navigate(`/clientes/${c.id}/cuenta`)
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-accent-primary/30 bg-accent-primary/5 px-3 py-1.5 text-xs font-semibold text-accent-primary transition-colors hover:border-accent-primary/60 hover:bg-accent-primary/10 cursor-pointer!"
                            >
                              <svg
                                className="h-3.5 w-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                              Ver cuenta
                            </button>
                            <Button
                              variant="secondary"
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
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPage((p) => p - 1)}
                      disabled={!hasPrev}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="secondary"
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
        </div>
      </div>
    </MainLayout>
  );
}
