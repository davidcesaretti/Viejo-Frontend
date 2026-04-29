import { type ReactNode, useState, useEffect, useRef } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { NotificationsDropdown } from "../../molecules/NotificationsDropdown";
import { useAuth } from "@/contexts";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

const baseNavLinks = [
  { to: "/caja", label: "Caja", end: false },
  { to: "/productos", label: "Productos", end: false },
  { to: "/stock", label: "Stock", end: false },
  { to: "/clientes", label: "Clientes", end: false },
  { to: "/ventas", label: "Ventas", end: false },
];

const adminNavLinks = [{ to: "/usuarios", label: "Usuarios", end: false }];

export interface MainLayoutProps {
  children: ReactNode;
  title?: string;
}

export function MainLayout({ children, title }: MainLayoutProps) {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, hasRole } = useAuth();
  const navLinks = [
    ...baseNavLinks,
    ...(hasRole("administrador") ? adminNavLinks : []),
  ];
  const { notifications, unreadCount, loading, error, markAsRead } =
    useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = title ? `${title} — Imphorticola` : "Imphorticola";
  }, [title]);

  useEffect(() => {
    if (!showNotifications && !showProfileMenu) return;
    const handler = (e: MouseEvent) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(e.target as Node)
      ) {
        setShowNotifications(false);
      }
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(e.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showNotifications, showProfileMenu]);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-dvh bg-bg-primary">
      {/* ── Top bar ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 h-14 border-b border-border-light bg-bg-secondary pt-safe">
        <div className="mx-auto flex h-full max-w-7xl items-center gap-3 px-4 sm:gap-4 sm:px-6">
          {/* Brand */}
          <div className="flex shrink-0 items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-primary">
              <svg
                className="h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <span className="text-sm font-bold tracking-tight text-text-primary">
              Imphorticola
            </span>
          </div>

          <div className="h-5 w-px shrink-0 bg-border-light" />

          {/* Nav links */}
          <nav className="flex flex-1 items-center justify-center gap-0.5 overflow-x-auto">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  cn(
                    "whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent-primary/10 text-accent-primary"
                      : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary",
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex shrink-0 items-center gap-1">
            {isAuthenticated && (
              <div className="relative" ref={notificationsRef}>
                <button
                  type="button"
                  onClick={() => setShowNotifications((v) => !v)}
                  className="relative flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
                  aria-label={
                    showNotifications
                      ? "Cerrar notificaciones"
                      : "Ver notificaciones"
                  }
                >
                  <svg
                    className="h-[18px] w-[18px]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.75}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute right-1.5 top-1.5 flex h-[14px] min-w-[14px] items-center justify-center rounded-full bg-accent-error px-0.5 text-[9px] font-bold text-white">
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
                <div className="mx-1 h-5 w-px bg-border-light" />
                <div className="relative" ref={profileMenuRef}>
                  <button
                    type="button"
                    onClick={() => setShowProfileMenu((v) => !v)}
                    className="hidden h-9 items-center gap-1 rounded-lg px-3 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary sm:inline-flex"
                  >
                    <span className="max-w-[110px] truncate">{user.name}</span>
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {showProfileMenu && (
                    <div className="absolute right-0 top-11 z-30 w-44 overflow-hidden rounded-xl border border-border-light bg-bg-secondary shadow-lg">
                      <button
                        type="button"
                        onClick={() => {
                          setShowProfileMenu(false);
                          navigate("/perfil");
                        }}
                        className="flex w-full items-center gap-2 px-3.5 py-2.5 text-sm text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5.121 17.804A8.96 8.96 0 0112 15a8.96 8.96 0 016.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        Mi perfil
                      </button>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 border-t border-border-light px-3.5 py-2.5 text-sm text-text-secondary transition-colors hover:bg-bg-tertiary hover:text-text-primary"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
                          />
                        </svg>
                        Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Page content ────────────────────────────────────────── */}
      <main className="mx-auto max-w-7xl px-4 py-6 pb-safe sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
