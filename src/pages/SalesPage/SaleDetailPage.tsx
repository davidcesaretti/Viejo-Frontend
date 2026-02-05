import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MainLayout } from "@/components/templates/MainLayout";
import { PageTransition } from "@/components/templates/PageTransition";
import { Card } from "@/components/molecules/Card";
import { Button } from "@/components/atoms/Button";
import { FormField } from "@/components/molecules/FormField";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/useToast";
import { getSale, createPayment } from "@/services";
import type { Sale } from "@/types/sale";
import { ApiClientError } from "@/services/api/client";
import { z } from "zod";

const paymentFormSchema = z.object({
  amount: z.coerce.number().min(0.01, "El monto debe ser mayor a 0"),
  paymentDate: z.string().optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
});
type PaymentFormValues = z.infer<typeof paymentFormSchema>;

export function SaleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const methods = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amount: 0,
      paymentDate: "",
      notes: "",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    getSale(id)
      .then((res) => {
        if (!cancelled) setSale(res);
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error(
            "Error al cargar la venta",
            err instanceof Error ? err.message : undefined
          );
          navigate("/ventas", { replace: true });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, navigate, toast]);

  const balance = sale
    ? sale.balance ?? sale.totalAmount - (sale.amountPaid ?? 0)
    : 0;
  const canPay = balance > 0;

  const onPaymentSubmit = methods.handleSubmit(async (data) => {
    if (!id || !sale) return;
    if (data.amount > balance) {
      toast.error(
        "Monto mayor al saldo",
        `Saldo pendiente: $${balance.toFixed(2)}`
      );
      return;
    }
    setSubmittingPayment(true);
    try {
      await createPayment({
        saleId: id,
        clientId: sale.clientId,
        amount: data.amount,
        ...(data.paymentDate
          ? { paymentDate: new Date(data.paymentDate).toISOString() }
          : {}),
        ...(data.notes ? { notes: data.notes } : {}),
      });
      toast.success("Pago registrado");
      setShowPaymentForm(false);
      methods.reset();
      getSale(id).then(setSale);
    } catch (err) {
      const msg =
        err instanceof ApiClientError ? err.message : "Error al registrar pago";
      toast.error("No se pudo registrar", msg);
    } finally {
      setSubmittingPayment(false);
    }
  });

  if (loading || !sale) {
    return (
      <MainLayout title="Detalle de venta">
        <PageTransition>
          <p className="text-sm text-text-tertiary">Cargando…</p>
        </PageTransition>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={`Venta ${new Date(sale.saleDate).toLocaleDateString()}`}>
      <PageTransition>
        <div className="space-y-6 animate-fade-in pb-6 sm:pb-8 max-w-4xl">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              navigate(
                sale.clientId ? `/clientes/${sale.clientId}/cuenta` : "/ventas"
              )
            }
            className="mb-2"
          >
            ← Volver
          </Button>

          <Card variant="elevated" padding="lg">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-text-secondary">Cliente</p>
                <p className="font-medium text-text-primary">
                  {sale.client?.name ?? sale.clientId}
                </p>
              </div>
              <div>
                <p className="text-sm text-text-secondary">Fecha</p>
                <p className="font-medium text-text-primary">
                  {new Date(sale.saleDate).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-text-secondary">Total</p>
                <p className="font-bold text-text-primary">
                  ${sale.totalAmount.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-text-secondary">Pagado</p>
                <p className="font-medium text-accent-success">
                  ${(sale.amountPaid ?? 0).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-text-secondary">Saldo</p>
                <p className="font-bold text-accent-error">
                  ${balance.toFixed(2)}
                </p>
              </div>
              {canPay && (
                <div className="sm:col-span-2">
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => setShowPaymentForm((v) => !v)}
                  >
                    {showPaymentForm ? "Cancelar" : "Registrar pago"}
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {showPaymentForm && canPay && (
            <Card title="Registrar pago" variant="elevated" padding="lg">
              <FormProvider {...methods}>
                <form onSubmit={onPaymentSubmit} className="space-y-4 max-w-md">
                  <p className="text-sm text-text-secondary">
                    Saldo pendiente: ${balance.toFixed(2)}
                  </p>
                  <FormField
                    name="amount"
                    label="Monto"
                    required
                    inputType="number"
                    placeholder="0.00"
                  />
                  <FormField
                    name="paymentDate"
                    label="Fecha de pago"
                    inputType="date"
                  />
                  <FormField
                    name="notes"
                    label="Notas"
                    placeholder="Opcional"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      size="md"
                      isLoading={submittingPayment}
                    >
                      Registrar pago
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="md"
                      onClick={() => setShowPaymentForm(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </FormProvider>
            </Card>
          )}

          <Card title="Ítems" variant="elevated" padding="lg">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-text-primary">
                <thead>
                  <tr className="border-b-2 border-border-medium bg-bg-tertiary/50">
                    <th className="py-3 pr-4 font-bold">Producto</th>
                    <th className="py-3 pr-4 font-bold">Cantidad</th>
                    <th className="py-3 pr-4 font-bold">Precio unit.</th>
                    <th className="py-3 pr-4 font-bold">Desc. %</th>
                    <th className="py-3 font-bold">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {sale.items?.map((it, idx) => (
                    <tr key={idx} className="border-b border-border-light">
                      <td className="py-2 pr-4">{it.productName}</td>
                      <td className="py-2 pr-4">{it.quantity}</td>
                      <td className="py-2 pr-4">${it.unitPrice.toFixed(2)}</td>
                      <td className="py-2 pr-4">{it.discountPercent}%</td>
                      <td className="py-2">${it.subtotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {sale.notes && (
              <p className="mt-4 text-sm text-text-secondary border-t border-border-light pt-4">
                Notas: {sale.notes}
              </p>
            )}
          </Card>
        </div>
      </PageTransition>
    </MainLayout>
  );
}
