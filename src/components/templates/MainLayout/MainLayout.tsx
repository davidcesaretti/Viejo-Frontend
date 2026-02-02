import { type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../atoms/Button";
import { ThemeToggle } from "../../atoms/ThemeToggle";
import { useAuth } from "@/contexts";

export interface MainLayoutProps {
  children: ReactNode;
  title?: string;
}

export function MainLayout({ children, title }: MainLayoutProps) {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="sticky top-0 z-10 border-b border-border-light bg-bg-secondary shadow-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold text-text-primary">
            {title ?? "Gestión de Ventas"}
          </h1>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              Inicio
            </Button>
            <Button variant="ghost" size="sm">
              Ventas
            </Button>
            <ThemeToggle />
            {isAuthenticated && user && (
              <>
                <span className="text-sm text-text-secondary hidden sm:inline">
                  {user.name}
                </span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Salir
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
