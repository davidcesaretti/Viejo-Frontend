import type { Client } from "./client";

/**
 * Ítem de una venta.
 */
export interface SaleItem {
  productId: string;
  stockId: string;
  productName: string;
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
  createdAt?: string;
  updatedAt?: string;
}

export interface SaleCreateItemBody {
  productId: string;
  stockId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  subtotal: number;
}

export interface SaleCreateBody {
  clientId: string;
  saleDate: string;
  items: SaleCreateItemBody[];
  totalAmount: number;
  notes?: string;
}
