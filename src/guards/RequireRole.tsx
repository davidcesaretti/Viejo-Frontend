import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts";
import type { Role } from "@/types/auth";

export interface RequireRoleProps {
  children: ReactNode;
  /** Al menos uno de estos roles debe tener el usuario */
  allowedRoles: Role[];
  /** Ruta a la que redirigir si no tiene permiso (por defecto /) */
  fallbackTo?: string;
}

/**
 * Guard: solo permite acceso si el usuario está autenticado y tiene al menos uno de los roles indicados.
 * Si no está logueado, ProtectedRoute ya lo manda a login.
 * Si está logueado pero no tiene rol, redirige a fallbackTo.
 */
export function RequireRole({
  children,
  allowedRoles,
  fallbackTo = "/",
}: RequireRoleProps) {
  const { isAuthenticated, hasAnyRole, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-border-focus border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasAnyRole(allowedRoles)) {
    return <Navigate to={fallbackTo} replace />;
  }

  return <>{children}</>;
}
