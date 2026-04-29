import { apiRequest } from "./api/client";
import type {
  CashboxEntry,
  CashboxSummary,
  CreateCashboxEntryBody,
  CashboxEntryType,
} from "@/types/cashbox";
import type { PaginatedResponse } from "@/types/pagination";

const BASE = "/cashbox";

export async function getCashboxEntries(
  page = 1,
  limit = 30,
  filters?: {
    type?: CashboxEntryType;
    category?: string;
    dateFrom?: string;
    dateTo?: string;
  }
): Promise<PaginatedResponse<CashboxEntry>> {
  const params: Record<string, string> = {
    page: String(page),
    limit: String(limit),
  };
  if (filters?.type) params.type = filters.type;
  if (filters?.category) params.category = filters.category;
  if (filters?.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters?.dateTo) params.dateTo = filters.dateTo;
  return apiRequest<PaginatedResponse<CashboxEntry>>(BASE, { params });
}

export async function getCashboxSummary(filters?: {
  dateFrom?: string;
  dateTo?: string;
}): Promise<CashboxSummary> {
  const params: Record<string, string> = {};
  if (filters?.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters?.dateTo) params.dateTo = filters.dateTo;
  return apiRequest<CashboxSummary>(`${BASE}/summary`, { params });
}

export async function createCashboxEntry(
  body: CreateCashboxEntryBody
): Promise<CashboxEntry> {
  return apiRequest<CashboxEntry>(BASE, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function deleteCashboxEntry(id: string): Promise<void> {
  await apiRequest<void>(`${BASE}/${id}`, { method: "DELETE" });
}
