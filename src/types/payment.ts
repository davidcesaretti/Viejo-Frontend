/**
 * Pago. Base URL: /payments
 */
export interface Payment {
  id: string;
  saleId: string;
  clientId: string;
  amount: number;
  paymentDate?: string;
  notes?: string;
  createdAt?: string;
}

export interface PaymentCreateBody {
  saleId: string;
  clientId: string;
  amount: number;
  paymentDate?: string;
  notes?: string;
}
