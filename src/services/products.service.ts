import { apiRequest } from "./api/client";
import type {
  Product,
  ProductCreateBody,
  ProductUpdateBody,
} from "@/types/product";
import type { PaginatedResponse } from "@/types/pagination";

const BASE = "/products";

export async function getProducts(
  page = 1,
  limit = 20
): Promise<PaginatedResponse<Product>> {
  return apiRequest<PaginatedResponse<Product>>(BASE, {
    params: { page: String(page), limit: String(limit) },
  });
}

export async function getProduct(id: string): Promise<Product> {
  return apiRequest<Product>(`${BASE}/${id}`);
}

export async function createProduct(body: ProductCreateBody): Promise<Product> {
  return apiRequest<Product>(BASE, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateProduct(
  id: string,
  body: ProductUpdateBody
): Promise<Product> {
  return apiRequest<Product>(`${BASE}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteProduct(id: string): Promise<void> {
  await apiRequest<void>(`${BASE}/${id}`, { method: "DELETE" });
}
