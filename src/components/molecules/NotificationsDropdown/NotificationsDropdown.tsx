import type { Notification, NotificationType } from "@/types/notifications";
import { cn } from "@/lib/utils";

export interface NotificationsDropdownProps {
  notifications: Notification[];
  loading: boolean;
  error?: string | null;
  onMarkAsRead: (id: string) => void;
  onClose: () => void;
}

function getNotificationIcon(type: NotificationType) {
  const base =
    "shrink-0 w-10 h-10 rounded-full flex items-center justify-center";
  switch (type) {
    case "Campana":
      return (
        <div className={cn(base, "bg-accent-warning/10")}>
          <svg
            className="w-5 h-5 text-accent-warning"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      );
    case "Alerta":
      return (
        <div className={cn(base, "bg-accent-error/10")}>
          <svg
            className="w-5 h-5 text-accent-error"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      );
    case "Exito":
      return (
        <div className={cn(base, "bg-accent-success/10")}>
          <svg
            className="w-5 h-5 text-accent-success"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      );
    case "Info":
    default:
      return (
        <div className={cn(base, "bg-accent-info/10")}>
          <svg
            className="w-5 h-5 text-accent-info"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      );
  }
}

function formatNotificationTime(dateString: string | undefined): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "—";
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1) return "Ahora";
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;
  return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
}

export function NotificationsDropdown({
  notifications = [],
  loading,
  error,
  onMarkAsRead,
  onClose,
}: NotificationsDropdownProps) {
  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const unreadNotifications = safeNotifications.filter((n) => !n.read);

  if (loading) {
    return (
      <div className="absolute right-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-lg border border-border-light bg-bg-secondary shadow-xl sm:w-96">
        <div className="border-b border-border-light p-4">
          <h3 className="text-sm font-semibold text-text-primary">
            Notificaciones
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-primary border-t-transparent" />
          <p className="mt-2 text-sm text-text-secondary">Cargando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute right-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-lg border border-border-light bg-bg-secondary shadow-xl sm:w-96">
        <div className="flex items-center justify-between border-b border-border-light p-4">
          <h3 className="text-sm font-semibold text-text-primary">
            Notificaciones
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Cerrar"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="p-8 text-center">
          <p className="text-sm text-text-secondary">
            Servicio de notificaciones no disponible
          </p>
          <p className="mt-2 text-xs text-text-tertiary">
            Esta funcionalidad estará disponible próximamente
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute right-0 top-full z-50 mt-2 flex max-h-[500px] w-80 max-w-[calc(100vw-2rem)] flex-col rounded-lg border border-border-light bg-bg-secondary shadow-xl sm:w-96">
      <div className="flex items-center justify-between border-b border-border-light p-4">
        <h3 className="text-sm font-semibold text-text-primary">
          Notificaciones
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Cerrar"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {unreadNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-text-secondary">
              No tenés notificaciones sin leer
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border-light">
            {unreadNotifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => onMarkAsRead(notification.id)}
                className="flex w-full gap-3 bg-accent-primary/5 p-4 text-left transition-colors hover:bg-bg-tertiary"
              >
                {getNotificationIcon(notification.type)}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-medium text-text-primary">
                      {notification.title}
                    </h4>
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent-primary" />
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-text-tertiary">
                    {notification.message}
                  </p>
                  <p className="mt-2 text-xs text-text-tertiary">
                    {formatNotificationTime(notification.createdAt)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
