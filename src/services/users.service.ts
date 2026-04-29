import { apiRequest } from "./api/client";
import type { PlatformUser, CreateUserBody, UpdateUserBody } from "@/types/user";

const BASE = "/users";

export async function getUsers(): Promise<PlatformUser[]> {
  return apiRequest<PlatformUser[]>(BASE);
}

export async function getUserById(id: string): Promise<PlatformUser> {
  return apiRequest<PlatformUser>(`${BASE}/${id}`);
}

export async function createUser(body: CreateUserBody): Promise<PlatformUser> {
  return apiRequest<PlatformUser>(BASE, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateUser(
  id: string,
  body: UpdateUserBody
): Promise<PlatformUser> {
  return apiRequest<PlatformUser>(`${BASE}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function banUser(id: string): Promise<PlatformUser> {
  return apiRequest<PlatformUser>(`${BASE}/${id}/ban`, { method: "PATCH" });
}

export async function unbanUser(id: string): Promise<PlatformUser> {
  return apiRequest<PlatformUser>(`${BASE}/${id}/unban`, { method: "PATCH" });
}

export async function deleteUser(id: string): Promise<void> {
  await apiRequest<void>(`${BASE}/${id}`, { method: "DELETE" });
}
