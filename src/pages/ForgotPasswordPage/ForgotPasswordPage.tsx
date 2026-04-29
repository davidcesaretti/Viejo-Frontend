import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { FormField } from "@/components/molecules/FormField";
import { Button } from "@/components/atoms/Button";
import { forgotPassword } from "@/services";
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from "@/lib/schemas";
import { ApiClientError } from "@/services/api/client";
import { useState } from "react";

export function ForgotPasswordPage() {
  const [message, setMessage] = useState<string | null>(null);
  const methods = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
    mode: "onBlur",
  });

  const onSubmit = methods.handleSubmit(async (data) => {
    try {
      await forgotPassword({ email: data.email });
      setMessage(
        "Si el email existe, te enviamos un enlace para restablecer tu contraseña."
      );
    } catch (err) {
      setMessage(
        err instanceof ApiClientError
          ? err.message
          : "No se pudo procesar la solicitud."
      );
    }
  });

  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg-primary px-4 py-8 pb-safe">
      <div className="w-full max-w-sm animate-scale-in rounded-xl border border-border-light bg-bg-secondary p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-text-primary">
          Recuperar contraseña
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Ingresá tu email para recibir un enlace de recuperación.
        </p>
        <FormProvider {...methods}>
          <form onSubmit={onSubmit} className="mt-5 ds-form">
            <FormField
              name="email"
              label="Email"
              inputType="email"
              required
              placeholder="tu@email.com"
            />
            {message && (
              <p className="rounded-lg bg-bg-tertiary px-3 py-2 text-xs text-text-secondary">
                {message}
              </p>
            )}
            <Button type="submit" size="lg" className="w-full" isLoading={methods.formState.isSubmitting}>
              Enviar enlace
            </Button>
            <Link to="/login" className="text-center text-xs text-accent-primary hover:underline">
              Volver al login
            </Link>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
