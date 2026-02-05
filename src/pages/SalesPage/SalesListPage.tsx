import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MainLayout } from "@/components/templates/MainLayout";
import { PageTransition } from "@/components/templates/PageTransition";
import { Card } from "@/components/molecules/Card";
import { Button } from "@/components/atoms/Button";
import { FormField } from "@/components/molecules/FormField";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { useToast } from "@/hooks/useToast";
import { getSalesByClient } from "@/services";
import { getClients } from "@/services";
import type { Sale } from "@/types/sale";
import { CustomSelect } from "@/components/atoms/CustomSelect";
import type { SelectOption } from "@/components/atoms/CustomSelect";

const PAGE_SIZE = 20;

type FilterForm = { clientId: string };

export function SalesListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const clientIdParam = searchParams.get("clientId") ?? "";
  const toast = useToast();
  const [items, setItems] = useState<Sale[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [clientOptions, setClientOptions] = useState<SelectOption[]>([]);

  const methods = useForm<FilterForm>({
    defaultValues: { clientId: clientIdParam },
  });
  const selectedClientId = methods.watch("clientId");

  useEffect(() => {
    getClients(1, 500)
      .then((res) => {
        const list = res.items ?? [];
        setClientOptions([
          { value: "", label: "Todos los clientes" },
          ...list.map((c) => ({ value: c.id, label: c.name })),
        ]);
      })
      .catch(() =>
        setClientOptions([{ value: "", label: "Todos los clientes" }])
      );
  }, []);

  useEffect(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (selectedClientId) next.set("clientId", selectedClientId);
      else next.delete("clientId");
      return next;
    });
  }, [selectedClientId, setSearchParams]);

  useEffect(() => {
    if (!selectedClientId) {
      setItems([]);
      setTotal(0);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getSalesByClient(selectedClientId, page, PAGE_SIZE)
      .then((res) => {
        if (!cancelled) {
          setItems(res.items ?? []);
          setTotal(res.total ?? 0);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error(
            "Error al cargar ventas",
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
  }, [selectedClientId, page, toast]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return (
    <MainLayout title="Ventas">
      <PageTransition>
        <div className="space-y-6 animate-fade-in pb-6 sm:pb-8">
          <section className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-2 sm:text-3xl tracking-tight">
                Listado de ventas
              </h2>
              <p className="text-sm text-text-secondary sm:text-base">
                Elegí un cliente para ver sus ventas o creá una nueva.
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate("/ventas/nueva")}
            >
              Nueva venta
            </Button>
          </section>

          <Card variant="elevated" padding="lg">
            <FormProvider {...methods}>
              <form className="mb-4 max-w-sm">
                <label
                  htmlFor="clientId"
                  className="block text-sm font-medium text-text-secondary mb-1.5"
                >
                  Cliente
                </label>
                <Controller
                  name="clientId"
                  control={methods.control}
                  render={({ field }) => (
                    <CustomSelect
                      options={clientOptions}
                      placeholder="Seleccionar cliente"
                      value={field.value}
                      onChange={(v) => field.onChange(v)}
                      onBlur={field.onBlur}
                      id="clientId"
                      className="bg-bg-secondary"
                    />
                  )}
                />
                <p className="text-xs text-text-tertiary mt-1">
                  Filtrar por cliente para listar ventas
                </p>
              </form>
            </FormProvider>

            {!selectedClientId ? (
              <p className="text-sm text-text-tertiary">
                Seleccioná un cliente para ver sus ventas.
              </p>
            ) : loading ? (
              <p className="text-sm text-text-tertiary">Cargando ventas…</p>
            ) : items.length === 0 ? (
              <p className="text-sm text-text-tertiary">
                No hay ventas para este cliente.
              </p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-text-primary">
                    <thead>
                      <tr className="border-b-2 border-border-medium bg-bg-tertiary/50">
                        <th className="py-3 pr-4 font-bold">Fecha</th>
                        <th className="py-3 pr-4 font-bold">Total</th>
                        <th className="py-3 pr-4 font-bold">Pagado</th>
                        <th className="py-3 pr-4 font-bold">Saldo</th>
                        <th className="py-3 text-right font-bold">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((s) => (
                        <tr key={s.id} className="border-b border-border-light">
                          <td className="py-2 pr-4">
                            {new Date(s.saleDate).toLocaleDateString()}
                          </td>
                          <td className="py-2 pr-4">
                            ${s.totalAmount.toFixed(2)}
                          </td>
                          <td className="py-2 pr-4">
                            ${(s.amountPaid ?? 0).toFixed(2)}
                          </td>
                          <td className="py-2 pr-4">
                            ${(s.balance ?? s.totalAmount).toFixed(2)}
                          </td>
                          <td className="py-2 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/ventas/${s.id}`)}
                            >
                              Ver
                            </Button>
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
