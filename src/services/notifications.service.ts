import { apiRequest } from "./api/client";
import { apiBaseUrl } from "./api/client";
import type {
  Notification,
  NotificationBackend,
  NotificationsResponse,
} from "@/types/notifications";

/**
 * Convierte una notificación del backend al formato del frontend.
 */
export function notificationToDisplay(
  notification: NotificationBackend | Notification
): Notification {
  const backend = notification as NotificationBackend;
  if (
    backend._id != null &&
    (backend.description != null || backend.title != null)
  ) {
    const dateField =
      backend.createdAt ?? backend.updatedAt ?? new Date().toISOString();
    return {
      id: backend._id,
      title: backend.title,
      message: backend.description ?? "",
      type: backend.type,
      read: backend.read ?? false,
      createdAt: dateField,
      incidentId: backend.metadata?.incidentId,
      event: backend.metadata?.event,
    };
  }
  const front = notification as Notification;
  return {
    id: front.id,
    title: front.title,
    message: front.message ?? "",
    type: front.type,
    read: front.read ?? false,
    createdAt: front.createdAt,
    incidentId: front.incidentId,
    event: front.event,
  };
}

const NOTIFICATIONS_PREFIX = "/notifications";

/**
 * Obtener todas las notificaciones del usuario autenticado.
 */
export async function getNotifications(): Promise<{
  data: Notification[];
  unreadCount: number;
}> {
  try {
    const response = await apiRequest<
      NotificationsResponse | NotificationBackend[]
    >(NOTIFICATIONS_PREFIX, { method: "GET" });

    if (response == null) {
      return { data: [], unreadCount: 0 };
    }

    if (Array.isArray(response)) {
      const data = response.map(notificationToDisplay);
      const unreadCount = data.filter((n) => !n.read).length;
      return { data, unreadCount };
    }

    if (response.data != null && Array.isArray(response.data)) {
      const data = response.data.map(notificationToDisplay);
      return {
        data,
        unreadCount: response.unreadCount ?? data.filter((n) => !n.read).length,
      };
    }

    return { data: [], unreadCount: 0 };
  } catch {
    return { data: [], unreadCount: 0 };
  }
}

/**
 * Marcar una notificación como leída.
 */
export async function markNotificationAsRead(id: string): Promise<void> {
  await apiRequest<void>(`${NOTIFICATIONS_PREFIX}/${id}/read`, {
    method: "PATCH",
  });
}

/**
 * URL base del WebSocket de notificaciones (mismo host que la API).
 */
export function getNotificationsSocketUrl(): string {
  const base = apiBaseUrl.replace(/^http/, "ws");
  return `${base}/notifications`;
}
