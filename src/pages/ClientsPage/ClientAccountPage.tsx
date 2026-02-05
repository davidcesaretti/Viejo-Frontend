import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MainLayout } from "@/components/templates/MainLayout";
import { PageTransition } from "@/components/templates/PageTransition";
import { Card } from "@/components/molecules/Card";
import { Button } from "@/components/atoms/Button";
import { FormField } from "@/components/molecules/FormField";
import { useToast } from "@/hooks/useToast";
import { getClientAccount, createPayment } from "@/services";
import type {
  ClientAccountResponse,
  ClientAccountSaleSummary,
} from "@/types/client";
import { ApiClientError } from "@/services/api/client";
import { z } from "zod";

const paymentFormSchema = z.object({
  saleId: z.string().min(1, "Seleccioná una venta"),
  amount: z.coerce.number().min(0.01, "El monto debe ser mayor a 0"),
  paymentDate: z.string().optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
});
type PaymentFormValues = z.infer<typeof paymentFormSchema>;

function getSalesList(
  sales: ClientAccountResponse["sales"]
): ClientAccountSaleSummary[] {
  if (Array.isArray(sales)) return sales;
  return sales.items ?? [];
}

export function ClientAccountPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [account, setAccount] = useState<ClientAccountResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const methods = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      saleId: "",
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
    getClientAccount(id, 1, 50)
      .then((res) => {
        if (!cancelled) setAccount(res);
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error(
            "Error al cargar la cuenta",
            err instanceof Error ? err.message : undefined
          );
          navigate("/clientes", { replace: true });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, navigate, toast]);

  const salesList = account ? getSalesList(account.sales) : [];
  const salesWithBalance = salesList.filter((s) => s.balance > 0);
  const maxAmountForSale = (saleId: string) => {
    const s = salesWithBalance.find((x) => x.id === saleId);
    return s?.balance ?? 0;
  };

  const onPaymentSubmit = methods.handleSubmit(async (data) => {
    if (!id) return;
    const max = maxAmountForSale(data.saleId);
    if (data.amount > max) {
      toast.error("Monto mayor al saldo", `Saldo pendiente: $${max}`);
      return;
    }
    setSubmittingPayment(true);
    try {
      await createPayment({
        saleId: data.saleId,
        clientId: id,
        amount: data.amount,
        ...(data.paymentDate
          ? { paymentDate: new Date(data.paymentDate).toISOString() }
          : {}),
        ...(data.notes ? { notes: data.notes } : {}),
      });
      toast.success("Pago registrado");
      setShowPaymentForm(false);
      methods.reset();
      getClientAccount(id, 1, 50).then(setAccount);
    } catch (err) {
      const msg =
        err instanceof ApiClientError ? err.message : "Error al registrar pago";
      toast.error("No se pudo registrar", msg);
    } finally {
      setSubmittingPayment(false);
    }
  });

  if (loading || !account) {
    return (
      <MainLayout title="Cuenta del cliente">
        <PageTransition>
          <p className="text-sm text-text-tertiary">Cargando…</p>
        </PageTransition>
      </MainLayout>
    );
  }

  const { client, totalDebt, totalSalesAmount, totalPaid } = account;

  return (
    <MainLayout title={`Cuenta - ${client.name}`}>
      <PageTransition>
        <div className="space-y-6 animate-fade-in pb-6 sm:pb-8">
          <section className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/clientes")}
                className="mb-2"
              >
                ← Volver a clientes
              </Button>
              <h2 className="text-2xl font-bold text-text-primary mb-2 sm:text-3xl tracking-tight">
                {client.name}
              </h2>
              <p className="text-sm text-text-secondary">
                {client.email}
                {client.phone ? ` · ${client.phone}` : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate(`/ventas/nueva?clientId=${id}`)}
              >
                Nueva venta
              </Button>
              {salesWithBalance.length > 0 && (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setShowPaymentForm((v) => !v)}
                >
                  {showPaymentForm ? "Cancelar" : "Registrar pago"}
                </Button>
              )}
            </div>
          </section>

          <div className="grid gap-4 sm:grid-cols-3">
            <Card variant="elevated" padding="md">
              <p className="text-sm text-text-secondary mb-1">Total vendido</p>
              <p className="text-xl font-bold text-text-primary">
                ${totalSalesAmount.toFixed(2)}
              </p>
            </Card>
            <Card variant="elevated" padding="md">
              <p className="text-sm text-text-secondary mb-1">Total pagado</p>
              <p className="text-xl font-bold text-accent-success">
                ${totalPaid.toFixed(2)}
              </p>
            </Card>
            <Card variant="elevated" padding="md">
              <p className="text-sm text-text-secondary mb-1">Deuda actual</p>
              <p className="text-xl font-bold text-accent-error">
                ${totalDebt.toFixed(2)}
              </p>
            </Card>
          </div>

          {showPaymentForm && salesWithBalance.length > 0 && (
            <Card title="Registrar pago" variant="elevated" padding="lg">
              <FormProvider {...methods}>
                <form onSubmit={onPaymentSubmit} className="space-y-4 max-w-md">
                  <FormField
                    name="saleId"
                    label="Venta a abonar"
                    type="select"
                    options={salesWithBalance.map((s) => ({
                      value: s.id,
                      label: `${new Date(
                        s.saleDate
                      ).toLocaleDateString()} - $${s.totalAmount.toFixed(
                        2
                      )} (saldo: $${s.balance.toFixed(2)})`,
                    }))}
                    placeholder="Seleccionar venta"
                    required
                  />
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

          <Card title="Ventas" variant="elevated" padding="lg">
            {salesList.length === 0 ? (
              <p className="text-sm text-text-tertiary">
                Aún no hay ventas para este cliente.
              </p>
            ) : (
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
                    {salesList.map((s) => (
                      <tr key={s.id} className="border-b border-border-light">
                        <td className="py-2 pr-4">
                          {new Date(s.saleDate).toLocaleDateString()}
                        </td>
                        <td className="py-2 pr-4">
                          ${s.totalAmount.toFixed(2)}
                        </td>
                        <td className="py-2 pr-4">
                          ${s.amountPaid.toFixed(2)}
                        </td>
                        <td className="py-2 pr-4">${s.balance.toFixed(2)}</td>
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
            )}
          </Card>
        </div>
      </PageTransition>
    </MainLayout>
  );
}
