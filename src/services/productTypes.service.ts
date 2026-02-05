import type { ProductType } from "@/types/productType";

const BACKEND_NOT_READY =
  "Backend no disponible. Los endpoints de tipos de producto no están implementados aún.";

/**
 * Obtiene todos los tipos de producto.
 * TODO: reemplazar por apiRequest cuando el backend esté listo.
 */
export async function getProductTypes(): Promise<ProductType[]> {
  // await apiRequest<ProductType[]>("/product-types");
  throw new Error(BACKEND_NOT_READY);
}

/**
 * Crea un tipo de producto.
 * TODO: reemplazar por apiRequest cuando el backend esté listo.
 */
export async function createProductType(body: {
  name: string;
}): Promise<ProductType> {
  // await apiRequest<ProductType>("/product-types", { method: "POST", body: JSON.stringify(body) });
  throw new Error(BACKEND_NOT_READY);
}
