/**
 * Métodos de pago disponibles
 */
export type PaymentMethod = "cash" | "transfer" | "check" | "other";

export interface PaymentItem {
  productId: string;
  stockId: string;
  productName: string;
  amount: number;
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Efectivo",
  transfer: "Transferencia",
  check: "Cheque",
  other: "Otro",
};

/**
 * Pago. Base URL: /payments
 */
export interface Payment {
  id: string;
  saleId: string;
  clientId: string;
  amount: number;
  paymentDate?: string;
  paymentMethod?: PaymentMethod;
  items?: PaymentItem[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentCreateBody {
  saleId: string;
  clientId: string;
  amount: number;
  paymentDate?: string;
  paymentMethod?: PaymentMethod;
  items?: PaymentItem[];
  notes?: string;
}
