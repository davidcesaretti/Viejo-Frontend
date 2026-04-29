import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts";
import { FormField } from "@/components/molecules/FormField";
import { Button } from "@/components/atoms/Button";
import { loginFormSchema, type LoginFormValues } from "@/lib/schemas";
import { ApiClientError } from "@/services/api/client";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const from =
    (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? "/";

  const methods = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: "", password: "" },
    mode: "onBlur",
  });

  const onSubmit = methods.handleSubmit(async (data) => {
    setSubmitError(null);
    try {
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (err) {
      setSubmitError(
        err instanceof ApiClientError
          ? err.message || "Error al iniciar sesión"
          : "Error de conexión. Intentá de nuevo."
      );
    }
  });

  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg-primary px-4 py-8 pb-safe">
      <div className="w-full max-w-sm animate-scale-in">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-primary shadow-sm">
            <svg
              className="h-6 w-6 text-white"
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
          <h1 className="text-xl font-semibold text-text-primary">
            Gestión de Ventas
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Ingresá con tu cuenta para continuar
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-border-light bg-bg-secondary p-6 shadow-sm">
          <FormProvider {...methods}>
            <form onSubmit={onSubmit} className="ds-form">
              <FormField
                name="email"
                label="Email"
                required
                inputType="email"
                placeholder="tu@email.com"
                autoComplete="email"
              />
              <FormField
                name="password"
                label="Contraseña"
                required
                inputType="password"
                placeholder="Mínimo 6 caracteres"
                autoComplete="current-password"
                showPasswordToggle
              />

              {submitError && (
                <div className="flex items-start gap-2.5 rounded-lg border border-accent-error/20 bg-accent-error/8 px-3.5 py-3">
                  <svg
                    className="mt-0.5 h-4 w-4 shrink-0 text-accent-error"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-sm text-accent-error" role="alert">
                    {submitError}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full"
                isLoading={methods.formState.isSubmitting}
              >
                Entrar
              </Button>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
}
