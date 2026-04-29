import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MainLayout } from "@/components/templates/MainLayout";
import { FormField } from "@/components/molecules/FormField";
import { Button } from "@/components/atoms/Button";
import { useToast } from "@/hooks/useToast";
import { changePassword } from "@/services";
import {
  changePasswordSchema,
  type ChangePasswordValues,
} from "@/lib/schemas";
import { ApiClientError } from "@/services/api/client";

export function ProfilePage() {
  const toast = useToast();
  const methods = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
    mode: "onBlur",
  });

  const onSubmit = methods.handleSubmit(async (data) => {
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success("Contraseña actualizada correctamente");
      methods.reset();
    } catch (err) {
      toast.error(
        "No se pudo cambiar la contraseña",
        err instanceof ApiClientError ? err.message : "Error de validación"
      );
    }
  });

  return (
    <MainLayout title="Perfil">
      <div className="ds-page">
        <div className="mx-auto w-full max-w-lg">
          <h1 className="ds-section-title">Perfil</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Desde acá podés cambiar tu contraseña de acceso.
          </p>
          <div className="mt-4 rounded-xl border border-border-light bg-bg-secondary p-6 shadow-sm">
            <FormProvider {...methods}>
              <form onSubmit={onSubmit} className="ds-form">
                <FormField
                  name="currentPassword"
                  label="Contraseña actual"
                  inputType="password"
                  showPasswordToggle
                  required
                />
                <FormField
                  name="newPassword"
                  label="Nueva contraseña"
                  inputType="password"
                  showPasswordToggle
                  required
                />
                <FormField
                  name="confirmNewPassword"
                  label="Confirmar nueva contraseña"
                  inputType="password"
                  showPasswordToggle
                  required
                />
                <div className="ds-form-actions">
                  <Button type="submit" size="sm" isLoading={methods.formState.isSubmitting}>
                    Guardar contraseña
                  </Button>
                </div>
              </form>
            </FormProvider>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
