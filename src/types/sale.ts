import type { Client } from "./client";
import type { Payment, PaymentMethod } from "./payment";

/**
 * Ítem de una venta.
 */
export interface SaleItem {
  productId: string;
  stockId: string;
  productName: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  subtotal: number;
}

/**
 * Venta. Base URL: /sales
 */
export interface Sale {
  id: string;
  clientId: string;
  saleDate: string;
  items: SaleItem[];
  totalAmount: number;
  amountPaid?: number;
  balance?: number;
  notes?: string;
  client?: Client;
  payments?: Payment[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SaleCreateItemBody {
  productId: string;
  stockId: string;
  productName: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  subtotal: number;
}

export interface SaleInitialPaymentItem {
  productId: string;
  stockId: string;
  productName: string;
  amount: number;
}

export interface SaleInitialPayment {
  amount: number;
  paymentMethod?: PaymentMethod;
  items?: SaleInitialPaymentItem[];
  notes?: string;
}

export interface SaleCreateBody {
  clientId: string;
  saleDate: string;
  items: SaleCreateItemBody[];
  totalAmount: number;
  notes?: string;
  initialPayment?: SaleInitialPayment;
}
