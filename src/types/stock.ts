import type { Product } from "./product";

/** Tipo de descuento: porcentaje (0-100) o monto fijo. */
export type StockDiscountType = "percentage" | "fixed";

/**
 * Cargamento de stock. Base URL: /stock
 */
export interface Stock {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  /** Tipo de descuento. Si no viene, se asume porcentaje. */
  discountType?: StockDiscountType;
  /** Valor: % (0-100) o monto según discountType. */
  discount?: number;
  /** Producto poblado por el backend (populate). */
  product?: Product;
}

export interface StockCreateBody {
  productId: string;
  quantity: number;
  price: number;
  discountType?: StockDiscountType;
  discount?: number;
}

export interface StockUpdateBody {
  quantity?: number;
  price?: number;
  discountType?: StockDiscountType;
  discount?: number;
}
