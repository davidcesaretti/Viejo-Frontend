/**
 * Tipos de notificación (ajustar según backend).
 */
export type NotificationType = "Campana" | "Alerta" | "Info" | "Exito";

/**
 * Estructura que puede enviar el backend (con _id y description).
 */
export interface NotificationBackend {
  _id: string;
  title: string;
  description: string;
  type: NotificationType;
  read: boolean;
  userId?: string;
  metadata?: {
    incidentId?: string;
    event?: string;
    [key: string]: unknown;
  };
  createdAt: string;
  updatedAt?: string;
}

/**
 * Notificación normalizada para el frontend.
 */
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  incidentId?: string;
  event?: string;
}

/**
 * Respuesta del endpoint GET /notifications (si el backend devuelve objeto).
 */
export interface NotificationsResponse {
  data: NotificationBackend[];
  unreadCount: number;
}
