import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MainLayout } from "@/components/templates/MainLayout";
import { PageTransition } from "@/components/templates/PageTransition";
import { Card } from "@/components/molecules/Card";
import { Button } from "@/components/atoms/Button";
import { FormField } from "@/components/molecules/FormField";
import { useToast } from "@/hooks/useToast";
import { productFormSchema, type ProductFormValues } from "@/lib/schemas";
import { getProduct, createProduct, updateProduct } from "@/services";
import { ApiClientError } from "@/services/api/client";
import { useState } from "react";

export function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);

  const methods = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: { name: "" },
    mode: "onBlur",
  });

  useEffect(() => {
    if (!id) return;
    setLoadingData(true);
    getProduct(id)
      .then((p) => methods.reset({ name: p.name }))
      .catch((err) => {
        toast.error(
          "Error al cargar producto",
          err instanceof Error ? err.message : undefined
        );
        navigate("/productos", { replace: true });
      })
      .finally(() => setLoadingData(false));
  }, [id, methods, navigate, toast]);

  const onSubmit = methods.handleSubmit(async (data) => {
    setLoading(true);
    try {
      if (isEdit && id) {
        await updateProduct(id, { name: data.name });
        toast.success("Producto actualizado", data.name);
      } else {
        await createProduct({ name: data.name });
        toast.success("Producto creado", data.name);
      }
      navigate("/productos", { replace: true });
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
      <MainLayout title={isEdit ? "Editar producto" : "Nuevo producto"}>
        <PageTransition>
          <p className="text-sm text-text-tertiary">Cargando…</p>
        </PageTransition>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={isEdit ? "Editar producto" : "Nuevo producto"}>
      <PageTransition>
        <div className="space-y-6 animate-fade-in pb-6 sm:pb-8 max-w-xl">
          <Card variant="elevated" padding="lg">
            <FormProvider {...methods}>
              <form onSubmit={onSubmit} className="space-y-4">
                <FormField
                  name="name"
                  label="Nombre del producto"
                  required
                  placeholder="ej. Papa"
                />
                <div className="flex gap-2 w-full">
                  <Button
                    type="submit"
                    size="md"
                    isLoading={loading}
                    className="w-1/2 min-w-0"
                  >
                    {isEdit ? "Guardar cambios" : "Crear producto"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="md"
                    onClick={() => navigate("/productos")}
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
