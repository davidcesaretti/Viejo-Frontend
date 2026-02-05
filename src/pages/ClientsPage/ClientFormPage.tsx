import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MainLayout } from "@/components/templates/MainLayout";
import { PageTransition } from "@/components/templates/PageTransition";
import { Card } from "@/components/molecules/Card";
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
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      notes: "",
    },
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
        toast.error(
          "Error al cargar cliente",
          err instanceof Error ? err.message : undefined
        );
        navigate("/clientes", { replace: true });
      })
      .finally(() => setLoadingData(false));
  }, [id, methods, navigate, toast]);

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
      const msg =
        err instanceof ApiClientError ? err.message : "Error al guardar";
      toast.error("No se pudo guardar", msg);
    } finally {
      setLoading(false);
    }
  });

  if (loadingData) {
    return (
      <MainLayout title={isEdit ? "Editar cliente" : "Nuevo cliente"}>
        <PageTransition>
          <p className="text-sm text-text-tertiary">Cargando…</p>
        </PageTransition>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={isEdit ? "Editar cliente" : "Nuevo cliente"}>
      <PageTransition>
        <div className="space-y-6 animate-fade-in pb-6 sm:pb-8 max-w-xl">
          <Card variant="elevated" padding="lg">
            <FormProvider {...methods}>
              <form onSubmit={onSubmit} className="space-y-4">
                <FormField
                  name="name"
                  label="Nombre"
                  required
                  placeholder="Nombre completo"
                />
                <FormField
                  name="email"
                  label="Email"
                  required
                  inputType="email"
                  placeholder="email@ejemplo.com"
                />
                <FormField
                  name="phone"
                  label="Teléfono"
                  inputType="tel"
                  placeholder="Opcional"
                />
                <FormField
                  name="address"
                  label="Dirección"
                  placeholder="Opcional"
                />
                <FormField name="notes" label="Notas" placeholder="Opcional" />
                <div className="flex gap-2 w-full">
                  <Button
                    type="submit"
                    size="md"
                    isLoading={loading}
                    className="w-1/2 min-w-0"
                  >
                    {isEdit ? "Guardar cambios" : "Crear cliente"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="md"
                    onClick={() => navigate("/clientes")}
                    className="w-1/2 min-w-0"
                  >
                    Volver
                  </Button>
                </div>
              </form>
            </FormProvider>
          </Card>
        </div>
      </PageTransition>
    </MainLayout>
  );
}
