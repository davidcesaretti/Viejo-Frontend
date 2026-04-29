import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MainLayout } from "@/components/templates/MainLayout";
import { Button } from "@/components/atoms/Button";
import { FormField } from "@/components/molecules/FormField";
import { useToast } from "@/hooks/useToast";
import { formatCurrency, formatDate, formatDateTime } from "@/lib";
import { paymentFormSchema, type PaymentFormValues } from "@/lib/schemas";
import {
  getSale,
  getSalesByClient,
  getPaymentsBySale,
  addSalePayment,
  deleteSalePayment,
} from "@/services";
import type { Sale } from "@/types/sale";
import type { Payment } from "@/types/payment";
import { PAYMENT_METHOD_LABELS } from "@/types/payment";
import { ApiClientError } from "@/services/api/client";

const PAYMENT_METHOD_OPTIONS = [
  { value: "cash", label: "Efectivo" },
  { value: "transfer", label: "Transferencia" },
  { value: "check", label: "Cheque" },
  { value: "other", label: "Otro" },
];

export function SaleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [sale, setSale] = useState<Sale | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingLoading, setPayingLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [salesWithBalance, setSalesWithBalance] = useState<Sale[]>([]);

  const methods = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: { amount: 0, saleId: id ?? "", paymentMethod: "cash" },
    mode: "onBlur",
  });

  const toastRef = useRef(toast);
  toastRef.current = toast;

  const loadSale = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [data, pmts] = await Promise.all([getSale(id), getPaymentsBySale(id)]);
      setSale(data);
      setPayments(pmts);
      methods.reset({ amount: 0, saleId: id, paymentMethod: "cash" });
      if (data.clientId) {
        const allSales = await getSalesByClient(data.clientId, 1, 200);
        setSalesWithBalance(
          (allSales.items ?? []).filter((s: Sale) => (s.balance ?? s.totalAmount) > 0)
        );
      }
    } catch (err) {
      toastRef.current.error(
        "Error al cargar venta",
        err instanceof Error ? err.message : undefined
      );
      navigate("/ventas", { replace: true });
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadSale();
  }, [loadSale]);

  const saleOptions = salesWithBalance.map((s) => ({
    value: s.id,
    label: `${formatDate(s.saleDate)} — Saldo: ${formatCurrency(s.balance ?? s.totalAmount)}`,
  }));

  const onPay = methods.handleSubmit(async (data) => {
    if (!sale) return;
    const targetSale = salesWithBalance.find((s) => s.id === data.saleId);
    const max = targetSale
      ? (targetSale.balance ?? targetSale.totalAmount)
      : sale.balance ?? sale.totalAmount;
    if (Number(data.amount) > max) {
      toast.error("Monto mayor al saldo", `Saldo pendiente: ${formatCurrency(max)}`);
      return;
    }
    setPayingLoading(true);
    try {
      await addSalePayment(data.saleId, sale.clientId, {
        amount: Number(data.amount),
        paymentMethod: data.paymentMethod,
        notes: data.notes || undefined,
      });
      toast.success("Pago registrado", formatCurrency(Number(data.amount)));
      await loadSale();
    } catch (err) {
      toast.error(
        "No se pudo registrar",
        err instanceof ApiClientError ? err.message : "Error al registrar pago"
      );
    } finally {
      setPayingLoading(false);
    }
  });

  const handleDeletePayment = async (paymentId: string) => {
    if (!window.confirm("¿Eliminar este pago? El saldo de la venta se actualizará.")) return;
    setDeletingId(paymentId);
    try {
      await deleteSalePayment(paymentId);
      toast.success("Pago eliminado");
      await loadSale();
    } catch (err) {
      toast.error(
        "No se pudo eliminar",
        err instanceof ApiClientError ? err.message : "Error al eliminar pago"
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <MainLayout title="Venta">
        <div className="flex items-center justify-center py-24 text-sm text-text-tertiary">
          <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Cargando venta…
        </div>
      </MainLayout>
    );
  }

  if (!sale) return null;

  const balance = sale.balance ?? sale.totalAmount;
  const paid = sale.amountPaid ?? 0;
  const isPaidOff = balance <= 0;

  return (
    <MainLayout title={`Venta — ${formatDate(sale.saleDate)}`}>
      <div className="ds-page">
        {/* Back */}
        <div>
          <button
            type="button"
            onClick={() =>
              navigate(
                sale.clientId ? `/clientes/${sale.clientId}/cuenta` : "/ventas"
              )
            }
            className="mb-3 flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Cuenta del cliente
          </button>
          <h1 className="ds-section-title">Venta del {formatDate(sale.saleDate)}</h1>
        </div>

        {/* KPI row */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border-light bg-bg-secondary p-5 shadow-sm">
            <p className="ds-kpi-label">Total</p>
            <p className="ds-kpi-value text-text-primary">{formatCurrency(sale.totalAmount)}</p>
          </div>
          <div className="rounded-xl border border-border-light bg-bg-secondary p-5 shadow-sm">
            <p className="ds-kpi-label">Pagado</p>
            <p className="ds-kpi-value text-accent-success">{formatCurrency(paid)}</p>
          </div>
          <div
            className={`rounded-xl border p-5 shadow-sm ${
              isPaidOff
                ? "border-accent-success/25 bg-accent-success/5"
                : "border-accent-error/25 bg-accent-error/5"
            }`}
          >
            <p className="ds-kpi-label">Saldo</p>
            <p className={`ds-kpi-value ${isPaidOff ? "text-accent-success" : "text-accent-error"}`}>
              {formatCurrency(balance)}
            </p>
          </div>
        </div>

        {/* Items table */}
        <div className="overflow-hidden rounded-xl border border-border-light bg-bg-secondary shadow-sm">
          <div className="border-b border-border-light px-6 py-4">
            <h3 className="text-sm font-semibold text-text-primary">Ítems de la venta</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="ds-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Variante</th>
                  <th>Cantidad</th>
                  <th>Precio unit.</th>
                  <th>Desc. %</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {(sale.items ?? []).map((item) => (
                  <tr key={item.stockId}>
                    <td>{item.productName}</td>
                    <td>
                      {item.variantName
                        ? <span className="rounded-md bg-accent-primary/8 px-2 py-0.5 text-xs font-medium text-accent-primary">{item.variantName}</span>
                        : <span className="text-text-tertiary">—</span>}
                    </td>
                    <td>{item.quantity}</td>
                    <td>{formatCurrency(item.unitPrice)}</td>
                    <td>{item.discountPercent ?? 0}%</td>
                    <td className="font-semibold">{formatCurrency(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end border-t border-border-light bg-bg-tertiary/50 px-6 py-3.5">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-text-secondary">Total</span>
              <span className="font-bold text-text-primary">{formatCurrency(sale.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Register payment */}
        {!isPaidOff && (
          <div className="overflow-hidden rounded-xl border border-border-light bg-bg-secondary shadow-sm">
            <div className="border-b border-border-light px-6 py-4">
              <h3 className="text-sm font-semibold text-text-primary">Registrar pago</h3>
              <p className="mt-0.5 text-xs text-text-secondary">
                Saldo pendiente:{" "}
                <span className="font-semibold text-accent-error">{formatCurrency(balance)}</span>
              </p>
            </div>
            <div className="p-6">
              <FormProvider {...methods}>
                <form onSubmit={onPay} className="ds-form">
                  {saleOptions.length > 1 && (
                    <FormField
                      name="saleId"
                      label="Aplicar pago a"
                      type="select"
                      options={saleOptions}
                      required
                    />
                  )}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      name="amount"
                      label="Monto"
                      required
                      inputType="number"
                      placeholder="0.00"
                    />
                    <FormField
                      name="paymentMethod"
                      label="Forma de pago"
                      type="select"
                      options={PAYMENT_METHOD_OPTIONS}
                      required
                    />
                  </div>
                  <FormField
                    name="notes"
                    label="Notas (opcional)"
                    placeholder="ej. Cheque #1234"
                  />
                  <div className="flex justify-end">
                    <Button type="submit" size="sm" isLoading={payingLoading}>
                      Registrar pago
                    </Button>
                  </div>
                </form>
              </FormProvider>
            </div>
          </div>
        )}

        {/* Payment history */}
        {payments.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-border-light bg-bg-secondary shadow-sm">
            <div className="border-b border-border-light px-6 py-4">
              <h3 className="text-sm font-semibold text-text-primary">Historial de pagos</h3>
            </div>
            <div className="divide-y divide-border-light">
              {payments.map((payment) => (
                <div key={payment.id} className="px-6 py-4">
                  {/* Payment header */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-sm font-semibold text-accent-success">
                        {formatCurrency(payment.amount)}
                      </span>
                      <span className="inline-flex items-center rounded-md bg-bg-tertiary px-2 py-0.5 text-xs font-medium text-text-secondary">
                        {PAYMENT_METHOD_LABELS[payment.paymentMethod ?? "cash"] ?? payment.paymentMethod}
                      </span>
                      <span className="text-xs text-text-tertiary">
                        {formatDateTime(payment.paymentDate ?? payment.createdAt ?? "")}
                      </span>
                      {payment.notes && (
                        <span className="text-xs text-text-tertiary italic">{payment.notes}</span>
                      )}
                    </div>
                    <Button
                      variant="error"
                      size="sm"
                      onClick={() => handleDeletePayment(payment.id)}
                      disabled={deletingId === payment.id}
                      isLoading={deletingId === payment.id}
                    >
                      Eliminar
                    </Button>
                  </div>

                  {/* Per-product breakdown */}
                  {(payment.items ?? []).length > 0 && (
                    <div className="mt-3 overflow-hidden rounded-lg border border-border-light">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-border-light bg-bg-muted">
                            <th className="px-3 py-2 text-left font-semibold uppercase tracking-wider text-text-tertiary">
                              Producto
                            </th>
                            <th className="px-3 py-2 text-right font-semibold uppercase tracking-wider text-text-tertiary">
                              Cobrado
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {(payment.items ?? []).map((item, i) => (
                            <tr key={i} className="border-b border-border-light last:border-0">
                              <td className="px-3 py-2 text-text-primary">{item.productName}</td>
                              <td className="px-3 py-2 text-right font-medium text-accent-success">
                                {formatCurrency(item.amount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {sale.notes && (
          <div className="rounded-xl border border-border-light bg-bg-secondary p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
              Notas
            </p>
            <p className="mt-2 text-sm text-text-secondary">{sale.notes}</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
