import { apiRequest } from "./api/client";
import type { AuthLoginBody, AuthLoginResponse, User } from "@/types/auth";

const AUTH_PREFIX = "/auth";

/**
 * Login. Body: email, password.
 * El backend responde con user + access_token y setea una cookie httpOnly
 * que se usará en el resto de peticiones (credentials: "include").
 */
export async function login(body: AuthLoginBody): Promise<AuthLoginResponse> {
  return apiRequest<AuthLoginResponse>(`${AUTH_PREFIX}/login`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * Obtiene el usuario actual si la cookie de sesión es válida.
 * Útil al cargar la app para restaurar sesión.
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const user = await apiRequest<User>(`${AUTH_PREFIX}/me`, { method: "GET" });
    return user ?? null;
  } catch {
    return null;
  }
}

/**
 * Cierra sesión en el backend (opcional).
 * Si el backend invalida la cookie, llamar esto antes de limpiar el estado.
 */
export async function logout(): Promise<void> {
  try {
    await apiRequest(`${AUTH_PREFIX}/logout`, { method: "POST" });
  } catch {
    // Si no existe el endpoint o falla, igual limpiamos el estado en el cliente
  }
}

/**
 * Obtiene un token de corta duración solo para el handshake de Socket.IO.
 * Usar con credentials: 'include' (apiRequest ya lo envía).
 * No guardar este token; es de un solo uso / vida muy corta.
 * En cada conexión o reconexión del socket, volver a llamar a este endpoint.
 */
export async function getSocketToken(): Promise<{ token: string }> {
  return apiRequest<{ token: string }>(`${AUTH_PREFIX}/socket-token`, {
    method: "GET",
  });
}
