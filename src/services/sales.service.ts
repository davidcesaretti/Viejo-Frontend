import { apiRequest } from "./api/client";
import type { Sale, SaleCreateBody } from "@/types/sale";
import type { PaginatedResponse } from "@/types/pagination";

const BASE = "/sales";

export async function getSalesByClient(
  clientId: string,
  page = 1,
  limit = 20
): Promise<PaginatedResponse<Sale>> {
  return apiRequest<PaginatedResponse<Sale>>(BASE, {
    params: { clientId, page: String(page), limit: String(limit) },
  });
}

export async function getSale(id: string): Promise<Sale> {
  return apiRequest<Sale>(`${BASE}/${id}`);
}

export async function createSale(body: SaleCreateBody): Promise<Sale> {
  return apiRequest<Sale>(BASE, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
