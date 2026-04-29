import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MainLayout } from "@/components/templates/MainLayout";
import { FormField } from "@/components/molecules/FormField";
import { Button } from "@/components/atoms/Button";
import { useToast } from "@/hooks/useToast";
import { getUserById, createUser, updateUser } from "@/services";
import { ApiClientError } from "@/services/api/client";
import { userFormSchema, type UserFormValues } from "@/lib/schemas";

const ROLE_OPTIONS = [
  { value: "vendedor", label: "Vendedor" },
  { value: "administrador", label: "Administrador" },
];

export function UserFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loadingData, setLoadingData] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const methods = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "vendedor",
      password: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    if (!isEdit || !id) return;
    setLoadingData(true);
    getUserById(id)
      .then((user) => {
        methods.reset({
          name: user.name,
          email: user.email,
          role: user.roles?.[0] ?? "vendedor",
          password: "",
          confirmPassword: "",
        });
      })
      .catch(() => {
        showToast("No se pudo cargar el usuario", "error");
        navigate("/usuarios");
      })
      .finally(() => setLoadingData(false));
  }, [id, isEdit]);

  const onSubmit = methods.handleSubmit(async (values) => {
    setSaving(true);
    try {
      if (isEdit && id) {
        const body: Record<string, unknown> = {
          name: values.name,
          email: values.email,
          roles: [values.role],
        };
        if (values.password && values.password.length > 0) {
          body.password = values.password;
        }
        await updateUser(id, body);
        showToast("Usuario actualizado correctamente", "success");
      } else {
        await createUser({
          name: values.name,
          email: values.email,
          password: values.password ?? "",
          role: values.role,
        });
        showToast("Usuario creado correctamente", "success");
      }
      navigate("/usuarios");
    } catch (err) {
      const body =
        err instanceof ApiClientError
          ? (err.body as { message?: string | string[] } | null)
          : null;
      const raw = body?.message;
      const msg = Array.isArray(raw) ? raw.join(", ") : raw;
      showToast(msg ?? "Error al guardar el usuario", "error");
    } finally {
      setSaving(false);
    }
  });

  const pageTitle = isEdit ? "Editar usuario" : "Nuevo usuario";

  return (
    <MainLayout title={pageTitle}>
      <div className="ds-page">
        <div>
          <button
            type="button"
            onClick={() => navigate("/usuarios")}
            className="mb-3 flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Usuarios
          </button>
        </div>

        <div className="mx-auto w-full max-w-lg">
          <h1 className="ds-section-title">{pageTitle}</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {isEdit
              ? "Modificá los datos del usuario. Dejá la contraseña vacía para no cambiarla."
              : "Completá los datos para crear una nueva cuenta de acceso."}
          </p>

          <div className="mt-4 rounded-xl border border-border-light bg-bg-secondary p-6 shadow-sm">
          {loadingData ? (
            <div className="flex items-center justify-center py-8 text-sm text-text-tertiary">
              Cargando…
            </div>
          ) : (
            <FormProvider {...methods}>
              <form onSubmit={onSubmit} className="ds-form">
                <FormField
                  name="name"
                  label="Nombre completo"
                  required
                  placeholder="Ej: Juan Pérez"
                />
                <FormField
                  name="email"
                  label="Email"
                  required
                  inputType="email"
                  placeholder="correo@ejemplo.com"
                />
                <FormField
                  name="role"
                  label="Rol"
                  type="select"
                  options={ROLE_OPTIONS}
                  required
                />

                {/* Sección contraseña */}
                <div className="border-t border-border-light pt-4">
                  <p className="mb-4 text-xs font-medium uppercase tracking-wide text-text-tertiary">
                    {isEdit ? "Cambiar contraseña (opcional)" : "Contraseña"}
                  </p>
                  <div className="space-y-4">
                    <FormField
                      name="password"
                      label={isEdit ? "Nueva contraseña" : "Contraseña"}
                      inputType="password"
                      showPasswordToggle
                      placeholder={
                        isEdit ? "Dejar vacío para no cambiar" : "Mínimo 6 caracteres"
                      }
                      autoComplete="new-password"
                    />
                    <FormField
                      name="confirmPassword"
                      label="Confirmar contraseña"
                      inputType="password"
                      showPasswordToggle
                      placeholder="Repetí la contraseña"
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <div className="ds-form-actions">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate("/usuarios")}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" size="sm" isLoading={saving}>
                    {isEdit ? "Guardar cambios" : "Crear usuario"}
                  </Button>
                </div>
              </form>
            </FormProvider>
          )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
