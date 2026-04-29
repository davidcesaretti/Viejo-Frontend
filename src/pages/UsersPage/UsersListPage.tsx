import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/templates/MainLayout";
import { useToast } from "@/hooks/useToast";
import { getUsers, banUser, unbanUser, deleteUser } from "@/services";
import type { PlatformUser } from "@/types";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/utils";

const ROLE_LABEL: Record<string, string> = {
  administrador: "Administrador",
  vendedor: "Vendedor",
};

function RoleBadge({ role }: { role: string }) {
  const isAdmin = role === "administrador";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        isAdmin
          ? "bg-accent-primary/10 text-accent-primary"
          : "bg-bg-tertiary text-text-secondary"
      )}
    >
      {ROLE_LABEL[role] ?? role}
    </span>
  );
}

function UserAvatar({ name }: { name: string }) {
  const initial = name?.trim()?.[0]?.toUpperCase() ?? "?";
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-primary/15 text-sm font-semibold text-accent-primary">
      {initial}
    </div>
  );
}

export function UsersListPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getUsers()
      .then(setUsers)
      .catch(() => showToast("Error al cargar los usuarios", "error"))
      .finally(() => setLoading(false));
  }, [showToast]);

  const handleBanToggle = async (user: PlatformUser) => {
    setActionId(user.id);
    try {
      const updated = user.banned ? await unbanUser(user.id) : await banUser(user.id);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      showToast(
        user.banned ? "Usuario desbaneado correctamente" : "Usuario baneado correctamente",
        "success"
      );
    } catch {
      showToast("Error al cambiar el estado del usuario", "error");
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (user: PlatformUser) => {
    if (
      !window.confirm(
        `¿Estás seguro de eliminar la cuenta de ${user.name}? Esta acción no se puede deshacer.`
      )
    )
      return;
    setActionId(user.id);
    try {
      await deleteUser(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      showToast("Usuario eliminado correctamente", "success");
    } catch {
      showToast("Error al eliminar el usuario", "error");
    } finally {
      setActionId(null);
    }
  };

  return (
    <MainLayout title="Gestión de usuarios">
      <div className="ds-page">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="ds-page-title">Gestión de usuarios</h1>
            <p className="mt-1 text-sm text-text-secondary">
              Administrá los usuarios que tienen acceso a la plataforma.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => navigate("/usuarios/nuevo")}
            size="md"
            className="shrink-0"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo usuario
          </Button>
        </div>

        {/* Tabla */}
        <div className="ds-card overflow-hidden p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-accent-primary border-t-transparent" />
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-text-tertiary">
              <svg className="h-10 w-10 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm font-medium">No hay usuarios registrados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="ds-table">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Alta</th>
                    <th className="text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className={user.banned ? "opacity-60" : ""}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <UserAvatar name={user.name} />
                          <span className="font-medium text-text-primary">{user.name}</span>
                        </div>
                      </td>
                      <td className="text-text-secondary">{user.email}</td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((r) => (
                            <RoleBadge key={r} role={r} />
                          ))}
                        </div>
                      </td>
                      <td>
                        {user.banned ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                            Baneado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                            Activo
                          </span>
                        )}
                      </td>
                      <td className="text-text-secondary text-sm">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString("es-AR")
                          : "—"}
                      </td>
                      <td className="text-right">
                        <div className="ds-table-actions">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => navigate(`/usuarios/${user.id}/editar`)}
                            disabled={actionId === user.id}
                          >
                            Editar
                          </Button>
                          <Button
                            type="button"
                            variant={user.banned ? "success" : "warning"}
                            size="sm"
                            onClick={() => handleBanToggle(user)}
                            disabled={actionId === user.id}
                            isLoading={actionId === user.id}
                          >
                            {user.banned ? "Desbanear" : "Banear"}
                          </Button>
                          <Button
                            type="button"
                            variant="error"
                            size="sm"
                            onClick={() => handleDelete(user)}
                            disabled={actionId === user.id}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
