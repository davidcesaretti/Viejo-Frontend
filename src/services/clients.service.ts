import { apiRequest } from "./api/client";
import type {
  Client,
  ClientCreateBody,
  ClientUpdateBody,
  ClientAccountResponse,
} from "@/types/client";
import type { PaginatedResponse } from "@/types/pagination";

const BASE = "/clients";

export async function getClients(
  page = 1,
  limit = 20
): Promise<PaginatedResponse<Client>> {
  return apiRequest<PaginatedResponse<Client>>(BASE, {
    params: { page: String(page), limit: String(limit) },
  });
}

export async function getClient(id: string): Promise<Client> {
  return apiRequest<Client>(`${BASE}/${id}`);
}

export async function getClientAccount(
  id: string,
  page = 1,
  limit = 50
): Promise<ClientAccountResponse> {
  return apiRequest<ClientAccountResponse>(`${BASE}/${id}/account`, {
    params: { page: String(page), limit: String(limit) },
  });
}

export async function createClient(body: ClientCreateBody): Promise<Client> {
  return apiRequest<Client>(BASE, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateClient(
  id: string,
  body: ClientUpdateBody
): Promise<Client> {
  return apiRequest<Client>(`${BASE}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function deleteClient(id: string): Promise<void> {
  return apiRequest<void>(`${BASE}/${id}`, { method: "DELETE" });
}
