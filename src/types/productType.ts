/**
 * Tipo de producto (ej. Papas, Cebollas).
 * Se usa para categorizar los productos/cargamentos.
 */
export interface ProductType {
  id: string;
  name: string;
}

export interface ProductTypeCreateBody {
  name: string;
}
