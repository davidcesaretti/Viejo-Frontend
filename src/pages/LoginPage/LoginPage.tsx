import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts";
import { FormField } from "@/components/molecules/FormField";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/molecules/Card";
import { loginFormSchema, type LoginFormValues } from "@/lib/schemas";
import { ApiClientError } from "@/services/api/client";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const from =
    (location.state as { from?: { pathname: string } } | null)?.from
      ?.pathname ?? "/";

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
      if (err instanceof ApiClientError) {
        setSubmitError(err.message || "Error al iniciar sesión");
      } else {
        setSubmitError("Error de conexión. Intentá de nuevo.");
      }
    }
  });

  return (
    <div className="min-h-screen min-h-[100dvh] bg-bg-primary flex items-center justify-center px-3 py-6 sm:px-4 sm:py-8 pb-safe">
      <Card
        variant="elevated"
        padding="lg"
        className="w-full max-w-md animate-scale-in mx-auto"
      >
        <div className="mb-4 text-center sm:mb-6">
          <h1 className="text-xl font-bold text-text-primary mb-1 sm:text-2xl sm:mb-2">
            Iniciar sesión
          </h1>
          <p className="text-text-secondary text-sm">
            Gestión de Ventas — ingresá con tu cuenta
          </p>
        </div>
        <FormProvider {...methods}>
          <form onSubmit={onSubmit} className="space-y-5">
            <FormField
              name="email"
              label="Email"
              required
              inputType="email"
              placeholder="ejemplo@mail.com"
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
              <div className="p-3 rounded-lg bg-accent-error/10 border border-accent-error/20">
                <p
                  className="text-sm text-accent-error flex items-center gap-2"
                  role="alert"
                >
                  <svg
                    className="w-5 h-5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {submitError}
                </p>
              </div>
            )}
            <Button
              type="submit"
              className="w-full min-h-[48px] sm:min-h-0"
              size="lg"
            >
              Entrar
            </Button>
          </form>
        </FormProvider>
      </Card>
    </div>
  );
}
