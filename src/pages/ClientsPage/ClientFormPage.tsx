import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MainLayout } from "@/components/templates/MainLayout";
import { Button } from "@/components/atoms/Button";
import { FormField } from "@/components/molecules/FormField";
import { useToast } from "@/hooks/useToast";
import { clientFormSchema, type ClientFormValues } from "@/lib/schemas";
import { getClient, createClient, updateClient } from "@/services";
import { ApiClientError } from "@/services/api/client";

export function ClientFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);

  const methods = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: { name: "", email: "", phone: "", address: "", notes: "" },
    mode: "onBlur",
  });

  useEffect(() => {
    if (!id) return;
    setLoadingData(true);
    getClient(id)
      .then((c) =>
        methods.reset({
          name: c.name,
          email: c.email,
          phone: c.phone ?? "",
          address: c.address ?? "",
          notes: c.notes ?? "",
        })
      )
      .catch((err) => {
        toast.error("Error al cargar cliente", err instanceof Error ? err.message : undefined);
        navigate("/clientes", { replace: true });
      })
      .finally(() => setLoadingData(false));
  }, [id]);

  const onSubmit = methods.handleSubmit(async (data) => {
    setLoading(true);
    try {
      const body = {
        name: data.name,
        email: data.email,
        ...(data.phone ? { phone: data.phone } : {}),
        ...(data.address ? { address: data.address } : {}),
        ...(data.notes ? { notes: data.notes } : {}),
      };
      if (isEdit && id) {
        await updateClient(id, body);
        toast.success("Cliente actualizado", data.name);
      } else {
        await createClient(body);
        toast.success("Cliente creado", data.name);
      }
      navigate("/clientes", { replace: true });
    } catch (err) {
      toast.error("No se pudo guardar", err instanceof ApiClientError ? err.message : "Error al guardar");
    } finally {
      setLoading(false);
    }
  });

  const pageTitle = isEdit ? "Editar cliente" : "Nuevo cliente";

  return (
    <MainLayout title={pageTitle}>
      <div className="ds-page max-w-lg">
        <div>
          <button
            type="button"
            onClick={() => navigate("/clientes")}
            className="mb-3 flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Clientes
          </button>
          <h1 className="ds-section-title">{pageTitle}</h1>
        </div>

        <div className="rounded-xl border border-border-light bg-bg-secondary p-6 shadow-sm">
          {loadingData ? (
            <div className="flex items-center justify-center py-8 text-sm text-text-tertiary">Cargando…</div>
          ) : (
            <FormProvider {...methods}>
              <form onSubmit={onSubmit} className="ds-form">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField name="name" label="Nombre" required placeholder="Nombre completo" />
                  <FormField name="email" label="Email" required inputType="email" placeholder="email@ejemplo.com" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField name="phone" label="Teléfono" inputType="tel" placeholder="Opcional" />
                  <FormField name="address" label="Dirección" placeholder="Opcional" />
                </div>
                <FormField name="notes" label="Notas" placeholder="Información adicional (opcional)" />
                <div className="ds-form-actions">
                  <Button type="button" variant="secondary" size="sm" onClick={() => navigate("/clientes")}>
                    Cancelar
                  </Button>
                  <Button type="submit" size="sm" isLoading={loading}>
                    {isEdit ? "Guardar cambios" : "Crear cliente"}
                  </Button>
                </div>
              </form>
            </FormProvider>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
