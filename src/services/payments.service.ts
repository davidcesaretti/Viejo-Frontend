import { apiRequest } from "./api/client";
import type { Payment, PaymentCreateBody } from "@/types/payment";
import type { PaginatedResponse } from "@/types/pagination";

const BASE = "/payments";

export async function getPaymentsByClient(
  clientId: string,
  page = 1,
  limit = 20
): Promise<PaginatedResponse<Payment>> {
  return apiRequest<PaginatedResponse<Payment>>(BASE, {
    params: { clientId, page: String(page), limit: String(limit) },
  });
}

export async function getPaymentsBySale(saleId: string): Promise<Payment[]> {
  const res = await apiRequest<PaginatedResponse<Payment> | Payment[]>(
    `${BASE}/sale/${saleId}`
  );
  return Array.isArray(res) ? res : res.items ?? [];
}

export async function getPayment(id: string): Promise<Payment> {
  return apiRequest<Payment>(`${BASE}/${id}`);
}

export async function createPayment(body: PaymentCreateBody): Promise<Payment> {
  return apiRequest<Payment>(BASE, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
