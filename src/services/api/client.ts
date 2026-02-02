/**
 * Cliente HTTP base para llamadas a la API.
 * Usa credentials: "include" para que el navegador envíe la cookie httpOnly
 * que setea el backend en el login.
 */

const getBaseUrl = (): string => {
  const env = import.meta.env.VITE_API_URL;
  if (typeof env === "string" && env.length > 0) return env.replace(/\/$/, "");
  return "";
};

export const apiBaseUrl = getBaseUrl();

export interface ApiRequestConfig extends RequestInit {
  params?: Record<string, string>;
}

async function buildUrl(
  path: string,
  params?: Record<string, string>
): Promise<string> {
  const base = apiBaseUrl;
  const url = path.startsWith("http")
    ? path
    : `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const searchParams = params ? new URLSearchParams(params) : null;
  const query = searchParams ? `?${searchParams.toString()}` : "";
  return `${url}${query}`;
}

export interface ApiError {
  status: number;
  message: string;
  body?: unknown;
}

export class ApiClientError extends Error {
  readonly status: number;
  readonly body: unknown | undefined;
  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.body = body;
  }
}

/**
 * Petición a la API con credentials: "include" para enviar la cookie httpOnly.
 * Para login no hace falta cookie; para el resto de endpoints el backend la usa para validar.
 */
export async function apiRequest<T>(
  path: string,
  config: ApiRequestConfig = {}
): Promise<T> {
  const { params, ...init } = config;
  const url = await buildUrl(path, params);
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...init.headers,
  };
  const response = await fetch(url, {
    ...init,
    headers,
    credentials: "include",
  });
  const text = await response.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }
  if (!response.ok) {
    const message =
      body &&
      typeof body === "object" &&
      "message" in body &&
      typeof (body as { message: unknown }).message === "string"
        ? (body as { message: string }).message
        : response.statusText || `Error ${response.status}`;
    throw new ApiClientError(response.status, message, body);
  }
  return body as T;
}
