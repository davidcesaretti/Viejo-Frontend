import { apiRequest } from "./api/client";
import type { Sale, SaleCreateBody } from "@/types/sale";
import type { PaginatedResponse } from "@/types/pagination";

export interface SalesExportResult {
  items: Sale[];
}

const BASE = "/sales";

export async function getSales(
  page = 1,
  limit = 30,
  clientId?: string,
  dateFrom?: string,
  dateTo?: string,
): Promise<PaginatedResponse<Sale>> {
  const params: Record<string, string> = { page: String(page), limit: String(limit) };
  if (clientId) params.clientId = clientId;
  if (dateFrom) params.dateFrom = dateFrom;
  if (dateTo) params.dateTo = dateTo;
  return apiRequest<PaginatedResponse<Sale>>(BASE, { params });
}

export async function getSalesForExport(
  clientId?: string,
  dateFrom?: string,
  dateTo?: string,
): Promise<SalesExportResult> {
  const params: Record<string, string> = {};
  if (clientId) params.clientId = clientId;
  if (dateFrom) params.dateFrom = dateFrom;
  if (dateTo) params.dateTo = dateTo;
  return apiRequest<SalesExportResult>("/sales/export", { params });
}

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
