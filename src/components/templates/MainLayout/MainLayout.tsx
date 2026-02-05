import { type ReactNode, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../atoms/Button";
import { ThemeToggle } from "../../atoms/ThemeToggle";
import { NotificationsDropdown } from "../../molecules/NotificationsDropdown";
import { useAuth } from "@/contexts";
import { useNotifications } from "@/hooks/useNotifications";

export interface MainLayoutProps {
  children: ReactNode;
  title?: string;
}

export function MainLayout({ children, title }: MainLayoutProps) {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { notifications, unreadCount, loading, error, markAsRead } =
    useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showNotifications]);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-bg-primary min-h-[100dvh]">
      <header className="sticky top-0 z-10 border-b-2 border-border-light bg-bg-secondary shadow-[var(--shadow-md)] pt-safe">
        <div className="mx-auto flex min-h-14 max-w-7xl flex-wrap items-center justify-between gap-2 px-3 py-2 sm:flex-nowrap sm:px-6 sm:py-0 sm:h-14 lg:px-8">
          <h1 className="min-w-0 flex-1 truncate text-base font-bold text-text-primary sm:flex-none sm:max-w-none sm:text-xl tracking-tight">
            {title ?? "Gestión de Ventas"}
          </h1>
          <nav className="flex flex-shrink-0 items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="min-h-[44px] min-w-[44px] sm:min-w-0 sm:min-h-0"
            >
              Inicio
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/productos")}
              className="min-h-[44px] min-w-[44px] sm:min-w-0 sm:min-h-0"
            >
              Productos
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/stock")}
              className="min-h-[44px] min-w-[44px] sm:min-w-0 sm:min-h-0"
            >
              Stock
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/clientes")}
              className="min-h-[44px] min-w-[44px] sm:min-w-0 sm:min-h-0"
            >
              Clientes
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/ventas")}
              className="min-h-[44px] min-w-[44px] sm:min-w-0 sm:min-h-0"
            >
              Ventas
            </Button>
            <ThemeToggle />
            {isAuthenticated && (
              <div className="relative" ref={notificationsRef}>
                <button
                  type="button"
                  onClick={() => setShowNotifications((v) => !v)}
                  className="relative flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2 text-text-secondary transition-colors hover:text-text-primary hover:bg-bg-tertiary sm:min-h-0 sm:min-w-0"
                  aria-label={
                    showNotifications
                      ? "Cerrar notificaciones"
                      : "Ver notificaciones"
                  }
                  title="Notificaciones"
                >
                  {/* Icono campanita */}
                  <svg
                    className="h-5 w-5 sm:h-6 sm:w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent-error px-1 text-[10px] font-bold text-white sm:right-1 sm:top-1">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <NotificationsDropdown
                    notifications={notifications}
                    loading={loading}
                    error={error}
                    onMarkAsRead={markAsRead}
                    onClose={() => setShowNotifications(false)}
                  />
                )}
              </div>
            )}
            {isAuthenticated && user && (
              <>
                <span className="hidden max-w-[120px] truncate text-sm text-text-secondary sm:inline lg:max-w-none">
                  {user.name}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="min-h-[44px] min-w-[44px] sm:min-w-0 sm:min-h-0"
                >
                  Salir
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8 pb-safe">
        {children}
      </main>
    </div>
  );
}
