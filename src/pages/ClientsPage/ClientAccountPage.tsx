import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MainLayout } from "@/components/templates/MainLayout";
import { Button } from "@/components/atoms/Button";
import { FormField } from "@/components/molecules/FormField";
import { useToast } from "@/hooks/useToast";
import { formatCurrency, formatDate } from "@/lib";
import {
  getClientAccount,
  getSalesByClient,
  addSalePayment,
} from "@/services";
import type { ClientAccount, AccountEntry } from "@/types/client";
import type { Sale } from "@/types/sale";
import { paymentFormSchema, type PaymentFormValues } from "@/lib/schemas";

const PAYMENT_METHOD_OPTIONS = [
  { value: "cash", label: "Efectivo" },
  { value: "transfer", label: "Transferencia" },
  { value: "check", label: "Cheque" },
  { value: "other", label: "Otro" },
];
import { ApiClientError } from "@/services/api/client";

const PAGE_SIZE = 50;

export function ClientAccountPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [account, setAccount] = useState<ClientAccount | null>(null);
  const [entries, setEntries] = useState<AccountEntry[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [payingLoading, setPayingLoading] = useState(false);
  const [salesWithBalance, setSalesWithBalance] = useState<Sale[]>([]);

  const methods = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: { amount: 0, saleId: "", paymentMethod: "cash" },
    mode: "onBlur",
  });

  const toastRef = useRef(toast);
  toastRef.current = toast;

  const loadAccount = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [acctData, salesData] = await Promise.all([
        getClientAccount(id, page, PAGE_SIZE),
        getSalesByClient(id, 1, 200),
      ]);
      setAccount(acctData.account ?? acctData);
      setEntries(acctData.entries ?? acctData.items ?? []);
      setTotal(acctData.total ?? 0);
      const withBalance = (salesData.items ?? []).filter(
        (s: Sale) => (s.balance ?? s.totalAmount) > 0
      );
      setSalesWithBalance(withBalance);
      if (withBalance.length === 1) {
        methods.setValue("saleId", withBalance[0].id);
      }
    } catch (err) {
      toastRef.current.error("Error al cargar cuenta", err instanceof Error ? err.message : undefined);
      navigate("/clientes", { replace: true });
    } finally {
      setLoading(false);
    }
  }, [id, page, navigate]);

  useEffect(() => { loadAccount(); }, [loadAccount]);

  const saleOptions = salesWithBalance.map((s) => ({
    value: s.id,
    label: `${formatDate(s.saleDate)} — Saldo: ${formatCurrency(s.balance ?? s.totalAmount)}`,
  }));

  const onPay = methods.handleSubmit(async (data) => {
    if (!data.saleId) { toast.error("Seleccioná una venta"); return; }
    const sale = salesWithBalance.find((s) => s.id === data.saleId);
    const max = sale ? (sale.balance ?? sale.totalAmount) : Infinity;
    if (Number(data.amount) > max) {
      toast.error("Monto mayor al saldo", `Saldo pendiente: ${formatCurrency(max)}`);
      return;
    }
    setPayingLoading(true);
    try {
      await addSalePayment(data.saleId, id!, {
        amount: Number(data.amount),
        paymentMethod: data.paymentMethod,
        notes: data.notes || undefined,
      });
      toast.success("Pago registrado", formatCurrency(Number(data.amount)));
      methods.reset({
        amount: 0,
        saleId: saleOptions.length === 1 ? saleOptions[0].value : "",
        paymentMethod: "cash",
      });
      await loadAccount();
    } catch (err) {
      toast.error("No se pudo registrar", err instanceof ApiClientError ? err.message : "Error al registrar");
    } finally {
      setPayingLoading(false);
    }
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  if (loading) {
    return (
      <MainLayout title="Cuenta del cliente">
        <div className="flex items-center justify-center py-24 text-sm text-text-tertiary">
          <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Cargando cuenta…
        </div>
      </MainLayout>
    );
  }

  if (!account) return null;

  const totalDebt = account.totalDebt ?? account.totalBalance ?? 0;
  const totalPaid = account.totalPaid ?? 0;
  const totalSales = account.totalSales ?? account.totalAmount ?? 0;

  return (
    <MainLayout title={`Cuenta — ${account.client?.name ?? ""}`}>
      <div className="ds-page">
        {/* Header */}
        <div>
          <button
            type="button"
            onClick={() => navigate("/clientes")}
            className="mb-3 flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Clientes
          </button>
          <div className="ds-section-header">
            <div>
              <h1 className="ds-section-title">
                {account.client?.name ?? "Cuenta del cliente"}
              </h1>
              {account.client?.email && (
                <p className="ds-section-subtitle">{account.client.email}</p>
              )}
            </div>
            <Button size="sm" onClick={() => navigate(`/ventas/nueva?clientId=${id}`)}>
              + Nueva venta
            </Button>
          </div>
        </div>

        {/* KPI */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border-light bg-bg-secondary p-5 shadow-sm">
            <p className="ds-kpi-label">Total compras</p>
            <p className="ds-kpi-value text-text-primary">{formatCurrency(totalSales)}</p>
          </div>
          <div className="rounded-xl border border-border-light bg-bg-secondary p-5 shadow-sm">
            <p className="ds-kpi-label">Total pagado</p>
            <p className="ds-kpi-value text-accent-success">{formatCurrency(totalPaid)}</p>
          </div>
          <div className={`rounded-xl border p-5 shadow-sm ${totalDebt > 0 ? "border-accent-error/25 bg-accent-error/5" : "border-accent-success/25 bg-accent-success/5"}`}>
            <p className="ds-kpi-label">Saldo pendiente</p>
            <p className={`ds-kpi-value ${totalDebt > 0 ? "text-accent-error" : "text-accent-success"}`}>
              {formatCurrency(totalDebt)}
            </p>
          </div>
        </div>

        {/* Pay form */}
        {salesWithBalance.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-border-light bg-bg-secondary shadow-sm">
            <div className="border-b border-border-light px-6 py-4">
              <h3 className="text-sm font-semibold text-text-primary">Registrar pago</h3>
            </div>
            <div className="p-6">
              <FormProvider {...methods}>
                <form onSubmit={onPay} className="ds-form">
                  {saleOptions.length > 1 && (
                    <FormField
                      name="saleId"
                      label="Aplicar a venta"
                      type="select"
                      options={saleOptions}
                      placeholder="Seleccionar venta"
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

        {/* History table */}
        <div className="overflow-hidden rounded-xl border border-border-light bg-bg-secondary shadow-sm">
          <div className="border-b border-border-light px-6 py-4">
            <h3 className="text-sm font-semibold text-text-primary">Historial de cuenta</h3>
          </div>
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-text-secondary">Sin movimientos</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="ds-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Tipo</th>
                      <th>Monto</th>
                      <th>Detalle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry, i) => (
                      <tr
                        key={entry.id ?? i}
                        className="cursor-pointer"
                        onClick={() => entry.saleId && navigate(`/ventas/${entry.saleId}`)}
                      >
                        <td>{formatDate(entry.date)}</td>
                        <td>
                          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                            entry.type === "sale"
                              ? "bg-accent-info/10 text-accent-info"
                              : "bg-accent-success/10 text-accent-success"
                          }`}>
                            {entry.type === "sale" ? "Venta" : "Pago"}
                          </span>
                        </td>
                        <td>
                          <span className={`font-semibold ${entry.type === "sale" ? "text-accent-error" : "text-accent-success"}`}>
                            {entry.type === "sale" ? "-" : "+"}
                            {formatCurrency(Math.abs(entry.amount))}
                          </span>
                        </td>
                        <td>
                          <span className="text-text-tertiary">{entry.description ?? "—"}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-border-light px-5 py-3.5">
                  <span className="text-xs text-text-tertiary">
                    Página {page} de {totalPages}
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
