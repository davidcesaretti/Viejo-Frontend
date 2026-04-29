import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm, FormProvider, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MainLayout } from "@/components/templates/MainLayout";
import { Button } from "@/components/atoms/Button";
import { FormField } from "@/components/molecules/FormField";
import { Input } from "@/components/atoms/Input";
import { useToast } from "@/hooks/useToast";
import { formatCurrency } from "@/lib";
import { getClients, getStock, createSale } from "@/services";
import type { Stock } from "@/types/stock";
import type { SaleCreateItemBody } from "@/types/sale";
import { ApiClientError } from "@/services/api/client";
import { cn } from "@/lib/utils";
import { z } from "zod";

const PAYMENT_METHOD_OPTIONS = [
  { value: "cash", label: "Efectivo" },
  { value: "transfer", label: "Transferencia" },
  { value: "check", label: "Cheque" },
  { value: "other", label: "Otro" },
];

function calcSubtotal(quantity: number, unitPrice: number, discountPercent: number): number {
  return Math.round(quantity * unitPrice * (1 - discountPercent / 100) * 100) / 100;
}

const saleItemSchema = z.object({
  stockId: z.string().min(1, "Seleccioná un cargamento"),
  quantity: z.coerce.number().min(0.01, "Cantidad mayor a 0"),
  unitPrice: z.coerce.number().min(0, "Precio mayor o igual a 0"),
  discountPercent: z.coerce.number().min(0).max(100),
  amountPaid: z.coerce.number().min(0).default(0),
});

const createSaleFormSchema = z.object({
  clientId: z.string().min(1, "Seleccioná un cliente"),
  saleDate: z.string().min(1, "Fecha requerida"),
  items: z.array(saleItemSchema).min(1, "Agregá al menos un ítem"),
  notes: z.string().max(1000).optional().or(z.literal("")),
  addInitialPayment: z.boolean().default(false),
  initialPaymentMethod: z.enum(["cash", "transfer", "check", "other"]).default("cash"),
  initialPaymentNotes: z.string().max(500).optional().or(z.literal("")),
});

type CreateSaleFormValues = z.infer<typeof createSaleFormSchema>;

export function CreateSalePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clientIdFromQuery = searchParams.get("clientId") ?? "";
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [clientOptions, setClientOptions] = useState<{ value: string; label: string }[]>([]);
  const [stockList, setStockList] = useState<Stock[]>([]);

  const today = new Date().toISOString().slice(0, 10);

  const methods = useForm<CreateSaleFormValues>({
    resolver: zodResolver(createSaleFormSchema),
    defaultValues: {
      clientId: clientIdFromQuery,
      saleDate: today,
      items: [{ stockId: "", quantity: 1, unitPrice: 0, discountPercent: 0, amountPaid: 0 }],
      notes: "",
      addInitialPayment: false,
      initialPaymentMethod: "cash",
      initialPaymentNotes: "",
    },
    mode: "onBlur",
  });

  const { fields, append, remove } = useFieldArray({ control: methods.control, name: "items" });
  const items = methods.watch("items");
  const addInitialPayment = methods.watch("addInitialPayment");

  const totalAmount = items?.reduce(
    (sum, it) => sum + calcSubtotal(it.quantity, it.unitPrice, it.discountPercent),
    0
  ) ?? 0;

  const totalCobrado = addInitialPayment
    ? (items?.reduce((sum, it) => sum + Number(it.amountPaid ?? 0), 0) ?? 0)
    : 0;

  useEffect(() => {
    getClients(1, 500).then((res) => {
      setClientOptions((res.items ?? []).map((c) => ({ value: c.id, label: c.name })));
    });
    getStock(1, 500).then((res) => {
      setStockList(res.items ?? []);
    });
  }, []);

  useEffect(() => {
    if (clientIdFromQuery && !methods.getValues("clientId")) {
      methods.setValue("clientId", clientIdFromQuery);
    }
  }, [clientIdFromQuery]);

  const stockOptions = stockList.map((s) => {
    const productLabel = s.product?.name ?? "Producto";
    const variantLabel = s.variantName ? ` · ${s.variantName}` : "";
    return {
      value: s.id,
      label: `${productLabel}${variantLabel} — ${formatCurrency(s.price)} (stock: ${s.quantity})`,
    };
  });

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
      const subtotal = calcSubtotal(it.quantity, it.unitPrice, it.discountPercent);
      return {
        productId: stock?.productId ?? "",
        stockId: it.stockId,
        productName: stock?.product?.name ?? "",
        variantName: stock?.variantName ?? undefined,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        discountPercent: it.discountPercent,
        subtotal,
      };
    });
    const total = saleItems.reduce((s, i) => s + i.subtotal, 0);

    const paymentItems = data.addInitialPayment
      ? data.items
          .map((it, idx) => {
            const stock = stockMap.get(it.stockId);
            const paid = Number(it.amountPaid ?? 0);
            if (paid <= 0) return null;
            return {
              productId: stock?.productId ?? "",
              stockId: it.stockId,
              productName: saleItems[idx]?.productName ?? "",
              amount: paid,
            };
          })
          .filter((x): x is NonNullable<typeof x> => x !== null)
      : [];

    const totalPaid = paymentItems.reduce((s, x) => s + x.amount, 0);

    setLoading(true);
    try {
      await createSale({
        clientId: data.clientId,
        saleDate: new Date(data.saleDate).toISOString(),
        items: saleItems,
        totalAmount: Math.round(total * 100) / 100,
        ...(data.notes ? { notes: data.notes } : {}),
        ...(data.addInitialPayment && totalPaid > 0
          ? {
              initialPayment: {
                amount: Math.round(totalPaid * 100) / 100,
                paymentMethod: data.initialPaymentMethod,
                items: paymentItems,
                ...(data.initialPaymentNotes ? { notes: data.initialPaymentNotes } : {}),
              },
            }
          : {}),
      });
      toast.success("Venta creada");
      navigate(`/clientes/${data.clientId}/cuenta`, { replace: true });
    } catch (err) {
      toast.error("No se pudo crear", err instanceof ApiClientError ? err.message : "Error al crear venta");
    } finally {
      setLoading(false);
    }
  });

  return (
    <MainLayout title="Nueva venta">
      <div className="ds-page max-w-4xl">
        <div>
          <button
            type="button"
            onClick={() => navigate("/ventas")}
            className="mb-3 flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Ventas
          </button>
          <h1 className="ds-section-title">Nueva venta</h1>
        </div>

        <FormProvider {...methods}>
          <form onSubmit={onSubmit} className="space-y-5">
            {/* Info general */}
            <div className="rounded-xl border border-border-light bg-bg-secondary p-6 shadow-sm">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                Información general
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
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
              </div>
            </div>

            {/* Ítems */}
            <div className="overflow-hidden rounded-xl border border-border-light bg-bg-secondary shadow-sm">
              <div className="flex items-center justify-between border-b border-border-light px-6 py-4">
                <div className="flex items-center gap-3">
                  <p className="text-sm font-semibold text-text-primary">
                    Ítems{" "}
                    <span className="ml-1 rounded-md bg-bg-tertiary px-1.5 py-0.5 text-xs font-medium text-text-secondary">
                      {fields.length}
                    </span>
                  </p>
                  {/* Pago toggle inline */}
                  <div className="flex items-center gap-2 rounded-lg border border-border-light px-3 py-1.5">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={addInitialPayment}
                      onClick={() => methods.setValue("addInitialPayment", !addInitialPayment)}
                      className={cn(
                        "relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                        addInitialPayment ? "bg-accent-primary" : "bg-border-medium"
                      )}
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block h-3 w-3 rounded-full bg-white shadow-sm transition-transform",
                          addInitialPayment ? "translate-x-3" : "translate-x-0"
                        )}
                      />
                    </button>
                    <span className="text-xs font-medium text-text-secondary">
                      Cobrar al contado
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    append({ stockId: "", quantity: 1, unitPrice: 0, discountPercent: 0, amountPaid: 0 })
                  }
                >
                  + Agregar ítem
                </Button>
              </div>

              {/* Column headers */}
              <div
                className={cn(
                  "hidden border-b border-border-light bg-bg-muted px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary lg:grid",
                  addInitialPayment
                    ? "grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto]"
                    : "grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]"
                )}
              >
                <span>Cargamento</span>
                <span>Cantidad</span>
                <span>Precio unit.</span>
                <span>Desc. %</span>
                {addInitialPayment && <span className="text-accent-primary">Cobrado</span>}
                <span>Subtotal</span>
                <span />
              </div>

              <div className="divide-y divide-border-light">
                {fields.map((field, index) => {
                  const subtotal = calcSubtotal(
                    Number(items?.[index]?.quantity ?? 0),
                    Number(items?.[index]?.unitPrice ?? 0),
                    Number(items?.[index]?.discountPercent ?? 0)
                  );
                  const cobrado = Number(items?.[index]?.amountPaid ?? 0);
                  const saldo = subtotal - cobrado;

                  return (
                    <div key={field.id} className="p-5">
                      <div
                        className={cn(
                          "grid gap-3",
                          addInitialPayment
                            ? "sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto]"
                            : "sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]"
                        )}
                      >
                        {/* Cargamento */}
                        <div className="sm:col-span-2 lg:col-span-1">
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

                        {/* Campo cobrado — solo visible si el toggle está activo */}
                        {addInitialPayment && (
                          <div className="space-y-1.5">
                            <label className="mb-1.5 block text-xs font-medium text-accent-primary">
                              Cobrado
                            </label>
                            <Controller
                              control={methods.control}
                              name={`items.${index}.amountPaid`}
                              render={({ field: f }) => (
                                <Input
                                  type="number"
                                  placeholder="0.00"
                                  value={f.value ?? 0}
                                  onChange={f.onChange}
                                  onBlur={f.onBlur}
                                  className="border-accent-primary/40 focus-visible:border-accent-primary focus-visible:ring-accent-primary/20"
                                />
                              )}
                            />
                            {saldo > 0.01 && (
                              <p className="text-[11px] text-accent-warning">
                                Saldo: {formatCurrency(saldo)}
                              </p>
                            )}
                            {saldo <= 0 && cobrado > 0 && (
                              <p className="text-[11px] text-accent-success">
                                ✓ Saldado
                              </p>
                            )}
                          </div>
                        )}

                        {/* Subtotal + remove */}
                        <div className="flex items-end gap-3">
                          <div className="min-w-20">
                            <p className="mb-1.5 text-xs font-medium text-text-secondary">Subtotal</p>
                            <p className="text-sm font-semibold text-text-primary">
                              {formatCurrency(subtotal)}
                            </p>
                          </div>
                          {fields.length > 1 && (
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-accent-error/10 hover:text-accent-error"
                              aria-label="Quitar ítem"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer totales */}
              <div className="border-t border-border-light bg-bg-tertiary/40 px-6 py-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-6 text-sm">
                    <div>
                      <span className="text-text-tertiary">Total venta: </span>
                      <span className="font-bold text-text-primary">{formatCurrency(totalAmount)}</span>
                    </div>
                    {addInitialPayment && (
                      <>
                        <div>
                          <span className="text-text-tertiary">Cobrado: </span>
                          <span className="font-bold text-accent-success">{formatCurrency(totalCobrado)}</span>
                        </div>
                        {totalAmount - totalCobrado > 0.01 && (
                          <div>
                            <span className="text-text-tertiary">Saldo pendiente: </span>
                            <span className="font-bold text-accent-error">
                              {formatCurrency(totalAmount - totalCobrado)}
                            </span>
                          </div>
                        )}
                        {totalCobrado >= totalAmount && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-accent-success/10 px-2 py-0.5 text-xs font-semibold text-accent-success">
                            ✓ Saldado
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Forma de pago — solo cuando el toggle está activo */}
            {addInitialPayment && (
              <div className="rounded-xl border border-accent-primary/25 bg-accent-primary/5 p-6 shadow-sm">
                <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-accent-primary">
                  Detalle del cobro
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    name="initialPaymentMethod"
                    label="Forma de pago"
                    type="select"
                    options={PAYMENT_METHOD_OPTIONS}
                    required
                  />
                  <FormField
                    name="initialPaymentNotes"
                    label="Referencia / Notas"
                    placeholder="ej. Cheque #1234, transferencia banco X"
                  />
                </div>
              </div>
            )}

            {/* Notas */}
            <div className="rounded-xl border border-border-light bg-bg-secondary p-6 shadow-sm">
              <FormField
                name="notes"
                label="Notas de la venta (opcional)"
                placeholder="Información adicional sobre la venta"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => navigate("/ventas")}>
                Cancelar
              </Button>
              <Button type="submit" size="sm" isLoading={loading}>
                Crear venta
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </MainLayout>
  );
}
