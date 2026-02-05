/**
 * Producto (ej. Papa, Cebolla).
 * Base URL: /products
 */
export interface Product {
  id: string;
  name: string;
}

export interface ProductCreateBody {
  name: string;
}

export interface ProductUpdateBody {
  name?: string;
}
