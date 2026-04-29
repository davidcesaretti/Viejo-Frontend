/**
 * Producto (ej. Papa, Cebolla).
 * Base URL: /products
 */
export interface Product {
  id: string;
  name: string;
  /** Variantes del producto (ej. "Chica", "Grande", "1L", "500ml"). */
  variants: string[];
}

export interface ProductCreateBody {
  name: string;
  variants?: string[];
}

export interface ProductUpdateBody {
  name?: string;
  variants?: string[];
}
