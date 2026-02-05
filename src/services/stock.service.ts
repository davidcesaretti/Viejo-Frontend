import { apiRequest } from "./api/client";
import type { Stock, StockCreateBody, StockUpdateBody } from "@/types/stock";
import type { PaginatedResponse } from "@/types/pagination";

const BASE = "/stock";

export async function getStock(
  page = 1,
  limit = 20
): Promise<PaginatedResponse<Stock>> {
  return apiRequest<PaginatedResponse<Stock>>(BASE, {
    params: { page: String(page), limit: String(limit) },
  });
}

export async function getStockByProduct(
  productId: string,
  page = 1,
  limit = 20
): Promise<PaginatedResponse<Stock>> {
  return apiRequest<PaginatedResponse<Stock>>(`${BASE}/product/${productId}`, {
    params: { page: String(page), limit: String(limit) },
  });
}

export async function getStockItem(id: string): Promise<Stock> {
  return apiRequest<Stock>(`${BASE}/${id}`);
}

export async function createStock(body: StockCreateBody): Promise<Stock> {
  return apiRequest<Stock>(BASE, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateStock(
  id: string,
  body: StockUpdateBody
): Promise<Stock> {
  return apiRequest<Stock>(`${BASE}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteStock(id: string): Promise<void> {
  await apiRequest<void>(`${BASE}/${id}`, { method: "DELETE" });
}
