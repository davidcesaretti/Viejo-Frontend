import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FormField } from "@/components/molecules/FormField";
import { Button } from "@/components/atoms/Button";
import { resetPassword } from "@/services";
import { resetPasswordSchema, type ResetPasswordValues } from "@/lib/schemas";
import { useState } from "react";
import { ApiClientError } from "@/services/api/client";

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") ?? "";
  const [message, setMessage] = useState<string | null>(null);
  const methods = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmNewPassword: "" },
    mode: "onBlur",
  });

  const onSubmit = methods.handleSubmit(async (data) => {
    try {
      await resetPassword({ token, newPassword: data.newPassword });
      setMessage("Contraseña actualizada. Ya podés iniciar sesión.");
      setTimeout(() => navigate("/login", { replace: true }), 1200);
    } catch (err) {
      setMessage(
        err instanceof ApiClientError
          ? err.message
          : "No se pudo actualizar la contraseña."
      );
    }
  });

  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg-primary px-4 py-8 pb-safe">
      <div className="w-full max-w-sm animate-scale-in rounded-xl border border-border-light bg-bg-secondary p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-text-primary">
          Nueva contraseña
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Elegí una nueva contraseña para tu cuenta.
        </p>
        {!token ? (
          <p className="mt-4 rounded-lg bg-accent-error/10 px-3 py-2 text-xs text-accent-error">
            El enlace es inválido o incompleto.
          </p>
        ) : (
          <FormProvider {...methods}>
            <form onSubmit={onSubmit} className="mt-5 ds-form">
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
              {message && (
                <p className="rounded-lg bg-bg-tertiary px-3 py-2 text-xs text-text-secondary">
                  {message}
                </p>
              )}
              <Button type="submit" size="lg" className="w-full" isLoading={methods.formState.isSubmitting}>
                Guardar contraseña
              </Button>
            </form>
          </FormProvider>
        )}
        <div className="mt-4 text-center">
          <Link to="/login" className="text-xs text-accent-primary hover:underline">
            Ir al login
          </Link>
        </div>
      </div>
    </div>
  );
}
