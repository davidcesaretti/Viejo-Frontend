import { useState, useEffect, useCallback, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { getSocketToken } from "@/services/auth.service";
import {
  getNotifications,
  markNotificationAsRead,
  getNotificationsSocketUrl,
  notificationToDisplay,
} from "@/services/notifications.service";
import type { Notification, NotificationBackend } from "@/types/notifications";
import { useAuth } from "@/contexts";

export function useNotifications() {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const isSocketAvailable = useRef(true);
  const isConnecting = useRef(false);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const response = await getNotifications();
      setNotifications(response.data);
      setUnreadCount(response.unreadCount);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
      setError("Notificaciones no disponibles");
      isSocketAvailable.current = false;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  }, []);

  const connectSocket = useCallback(async () => {
    if (!isAuthenticated) return;
    if (!isSocketAvailable.current) return;
    if (isConnecting.current || socketRef.current?.connected) return;

    try {
      isConnecting.current = true;

      const { token } = await getSocketToken();
      if (!token) {
        isSocketAvailable.current = false;
        isConnecting.current = false;
        return;
      }

      const socketUrl = getNotificationsSocketUrl();
      const socket = io(socketUrl, {
        auth: { token },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
      });

      socket.on("connect", () => {
        isSocketAvailable.current = true;
        isConnecting.current = false;
      });

      socket.on("notification", (data: NotificationBackend | Notification) => {
        const backend = data as NotificationBackend;
        const notification =
          backend._id != null &&
          (backend.description != null || backend.title != null)
            ? notificationToDisplay(backend)
            : (data as Notification);
        setNotifications((prev) => [notification, ...prev]);
        if (!notification.read) {
          setUnreadCount((prev) => prev + 1);
        }
      });

      socket.on("disconnect", () => {
        isConnecting.current = false;
      });

      socket.on("connect_error", () => {
        isSocketAvailable.current = false;
        isConnecting.current = false;
      });

      socketRef.current = socket;
    } catch {
      isSocketAvailable.current = false;
      isConnecting.current = false;
    }
  }, [isAuthenticated]);

  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    isConnecting.current = false;
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      setError(null);
      disconnectSocket();
      return;
    }
    let cancelled = false;
    (async () => {
      await fetchNotifications();
      if (!cancelled) await connectSocket();
    })();
    return () => {
      cancelled = true;
      disconnectSocket();
    };
  }, [isAuthenticated, fetchNotifications, connectSocket, disconnectSocket]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    refetch: fetchNotifications,
  };
}
