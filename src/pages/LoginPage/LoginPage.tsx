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
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-text mb-1">Iniciar sesión</h1>
        <p className="text-text-muted text-sm mb-6">
          Gestión de Ventas — ingresá con tu cuenta
        </p>
        <FormProvider {...methods}>
          <form onSubmit={onSubmit} className="space-y-4">
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
            />
            {submitError && (
              <p className="text-sm text-danger" role="alert">
                {submitError}
              </p>
            )}
            <Button type="submit" className="w-full" size="lg">
              Entrar
            </Button>
          </form>
        </FormProvider>
      </Card>
    </div>
  );
}
