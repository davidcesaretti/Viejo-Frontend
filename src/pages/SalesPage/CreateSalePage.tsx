import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MainLayout } from "@/components/templates/MainLayout";
import { PageTransition } from "@/components/templates/PageTransition";
import { Card } from "@/components/molecules/Card";
import { Button } from "@/components/atoms/Button";
import { FormField } from "@/components/molecules/FormField";
import { useToast } from "@/hooks/useToast";
import { getClients, getStock, createSale } from "@/services";
import type { Stock } from "@/types/stock";
import type { SaleCreateItemBody } from "@/types/sale";
import { ApiClientError } from "@/services/api/client";
import { z } from "zod";

function calcSubtotal(
  quantity: number,
  unitPrice: number,
  discountPercent: number
): number {
  return (
    Math.round(quantity * unitPrice * (1 - discountPercent / 100) * 100) / 100
  );
}

const saleItemSchema = z.object({
  stockId: z.string().min(1, "Seleccioná un cargamento"),
  quantity: z.coerce.number().min(0.01, "Cantidad mayor a 0"),
  unitPrice: z.coerce.number().min(0, "Precio mayor o igual a 0"),
  discountPercent: z.coerce.number().min(0).max(100),
});

const createSaleFormSchema = z.object({
  clientId: z.string().min(1, "Seleccioná un cliente"),
  saleDate: z.string().min(1, "Fecha requerida"),
  items: z.array(saleItemSchema).min(1, "Agregá al menos un ítem"),
  notes: z.string().max(1000).optional().or(z.literal("")),
});
type CreateSaleFormValues = z.infer<typeof createSaleFormSchema>;

export function CreateSalePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clientIdFromQuery = searchParams.get("clientId") ?? "";
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [clientOptions, setClientOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [stockList, setStockList] = useState<Stock[]>([]);

  const today = new Date().toISOString().slice(0, 10);

  const methods = useForm<CreateSaleFormValues>({
    resolver: zodResolver(createSaleFormSchema),
    defaultValues: {
      clientId: clientIdFromQuery,
      saleDate: today,
      items: [{ stockId: "", quantity: 1, unitPrice: 0, discountPercent: 0 }],
      notes: "",
    },
    mode: "onBlur",
  });

  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: "items",
  });

  const items = methods.watch("items");
  const totalAmount =
    items?.reduce(
      (sum, it) =>
        sum + calcSubtotal(it.quantity, it.unitPrice, it.discountPercent),
      0
    ) ?? 0;

  useEffect(() => {
    getClients(1, 500).then((res) => {
      const list = res.items ?? [];
      setClientOptions(list.map((c) => ({ value: c.id, label: c.name })));
    });
    getStock(1, 500).then((res) => {
      setStockList(res.items ?? []);
    });
  }, []);

  useEffect(() => {
    if (clientIdFromQuery && !methods.getValues("clientId")) {
      methods.setValue("clientId", clientIdFromQuery);
    }
  }, [clientIdFromQuery, methods]);

  const stockOptions = stockList.map((s) => ({
    value: s.id,
    label: `${s.product?.name ?? "Producto"} - $${s.price} (stock: ${
      s.quantity
    })`,
  }));

  const stockIds = items?.map((i) => i.stockId).join(",") ?? "";
  useEffect(() => {
    if (!stockList.length) return;
    items?.forEach((it, index) => {
      if (it.stockId) {
        const stock = stockList.find((s) => s.id === it.stockId);
        if (stock && Number(it.unitPrice) === 0) {
          methods.setValue(`items.${index}.unitPrice`, stock.price);
        }
      }
    });
  }, [stockIds, stockList.length]);

  const onSubmit = methods.handleSubmit(async (data) => {
    const stockMap = new Map(stockList.map((s) => [s.id, s]));
    const saleItems: SaleCreateItemBody[] = data.items.map((it) => {
      const stock = stockMap.get(it.stockId);
      const subtotal = calcSubtotal(
        it.quantity,
        it.unitPrice,
        it.discountPercent
      );
      return {
        productId: stock?.productId ?? "",
        stockId: it.stockId,
        productName: stock?.product?.name ?? "",
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        discountPercent: it.discountPercent,
        subtotal,
      };
    });
    const total = saleItems.reduce((s, i) => s + i.subtotal, 0);

    setLoading(true);
    try {
      await createSale({
        clientId: data.clientId,
        saleDate: new Date(data.saleDate).toISOString(),
        items: saleItems,
        totalAmount: Math.round(total * 100) / 100,
        ...(data.notes ? { notes: data.notes } : {}),
      });
      toast.success("Venta creada");
      navigate(`/clientes/${data.clientId}/cuenta`, { replace: true });
    } catch (err) {
      const msg =
        err instanceof ApiClientError ? err.message : "Error al crear venta";
      toast.error("No se pudo crear", msg);
    } finally {
      setLoading(false);
    }
  });

  return (
    <MainLayout title="Nueva venta">
      <PageTransition>
        <div className="space-y-6 animate-fade-in pb-6 sm:pb-8 max-w-4xl">
          <Card variant="elevated" padding="lg">
            <FormProvider {...methods}>
              <form onSubmit={onSubmit} className="space-y-4">
                <FormField
                  name="clientId"
                  label="Cliente"
                  type="select"
                  options={clientOptions}
                  placeholder="Seleccionar cliente"
                  required
                />
                <FormField
                  name="saleDate"
                  label="Fecha de venta"
                  required
                  inputType="date"
                />

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-text-secondary">
                      Ítems
                    </label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        append({
                          stockId: "",
                          quantity: 1,
                          unitPrice: 0,
                          discountPercent: 0,
                        })
                      }
                    >
                      + Agregar ítem
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <Card
                        key={field.id}
                        variant="default"
                        padding="md"
                        className="border border-border-light"
                      >
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                          <div className="sm:col-span-2">
                            <FormField
                              name={`items.${index}.stockId`}
                              label="Cargamento"
                              type="select"
                              options={stockOptions}
                              placeholder="Seleccionar"
                              required
                            />
                          </div>
                          <FormField
                            name={`items.${index}.quantity`}
                            label="Cantidad"
                            required
                            inputType="number"
                            placeholder="0"
                          />
                          <FormField
                            name={`items.${index}.unitPrice`}
                            label="Precio unit."
                            required
                            inputType="number"
                            placeholder="0"
                          />
                          <FormField
                            name={`items.${index}.discountPercent`}
                            label="Desc. %"
                            required
                            inputType="number"
                            placeholder="0"
                          />
                          <div className="flex items-end gap-2">
                            <div className="flex-1">
                              <p className="text-xs text-text-tertiary mb-1">
                                Subtotal
                              </p>
                              <p className="font-medium text-text-primary">
                                $
                                {calcSubtotal(
                                  Number(items?.[index]?.quantity ?? 0),
                                  Number(items?.[index]?.unitPrice ?? 0),
                                  Number(items?.[index]?.discountPercent ?? 0)
                                ).toFixed(2)}
                              </p>
                            </div>
                            {fields.length > 1 && (
                              <Button
                                type="button"
                                variant="error"
                                size="sm"
                                onClick={() => remove(index)}
                              >
                                Quitar
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end text-lg font-bold text-text-primary border-t border-border-light pt-4">
                  Total: ${totalAmount.toFixed(2)}
                </div>

                <FormField name="notes" label="Notas" placeholder="Opcional" />

                <div className="flex gap-2 w-full">
                  <Button
                    type="submit"
                    size="md"
                    isLoading={loading}
                    className="w-1/2 min-w-0"
                  >
                    Crear venta
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="md"
                    onClick={() => navigate("/ventas")}
                    className="w-1/2 min-w-0"
                  >
                    Volver
                  </Button>
                </div>
              </form>
            </FormProvider>
          </Card>
        </div>
      </PageTransition>
    </MainLayout>
  );
}
