import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MainLayout } from "@/components/templates/MainLayout";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { FormField } from "@/components/molecules/FormField";
import { useToast } from "@/hooks/useToast";
import { productFormSchema, type ProductFormValues } from "@/lib/schemas";
import { getProduct, createProduct, updateProduct } from "@/services";
import { ApiClientError } from "@/services/api/client";

export function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [newVariant, setNewVariant] = useState("");

  const methods = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: { name: "", variants: [] },
    mode: "onBlur",
  });

  const variants = methods.watch("variants") ?? [];

  useEffect(() => {
    if (!id) return;
    setLoadingData(true);
    getProduct(id)
      .then((p) => methods.reset({ name: p.name, variants: p.variants ?? [] }))
      .catch((err) => {
        toast.error("Error al cargar producto", err instanceof Error ? err.message : undefined);
        navigate("/productos", { replace: true });
      })
      .finally(() => setLoadingData(false));
  }, [id]);

  const addVariant = () => {
    const v = newVariant.trim();
    if (!v) return;
    if (variants.includes(v)) {
      toast.error("Variante duplicada", `"${v}" ya existe en la lista`);
      return;
    }
    methods.setValue("variants", [...variants, v]);
    setNewVariant("");
  };

  const removeVariant = (index: number) => {
    methods.setValue("variants", variants.filter((_, i) => i !== index));
  };

  const onSubmit = methods.handleSubmit(async (data) => {
    setLoading(true);
    try {
      if (isEdit && id) {
        await updateProduct(id, { name: data.name, variants: data.variants });
        toast.success("Producto actualizado", data.name);
      } else {
        await createProduct({ name: data.name, variants: data.variants });
        toast.success("Producto creado", data.name);
      }
      navigate("/productos", { replace: true });
    } catch (err) {
      toast.error("No se pudo guardar", err instanceof ApiClientError ? err.message : "Error al guardar");
    } finally {
      setLoading(false);
    }
  });

  const pageTitle = isEdit ? "Editar producto" : "Nuevo producto";

  return (
    <MainLayout title={pageTitle}>
      <div className="ds-page">
        <div>
          <button
            type="button"
            onClick={() => navigate("/productos")}
            className="mb-3 flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Productos
          </button>
        </div>

        <div className="mx-auto w-full max-w-lg">
          <h1 className="ds-section-title">{pageTitle}</h1>

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
                  label="Nombre del producto"
                  required
                  placeholder="ej. Cebolla"
                />

                {/* Variants section */}
                <div className="space-y-3">
                  <div>
                    <p className="mb-0.5 block text-xs font-medium text-text-secondary">
                      Variantes <span className="text-text-tertiary font-normal">(opcional)</span>
                    </p>
                    <p className="text-xs text-text-tertiary">
                      Usá variantes para diferenciar tamaños o presentaciones del mismo producto (ej. Chica, Grande, 1L, 500ml).
                    </p>
                  </div>

                  {variants.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {variants.map((v, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1.5 rounded-lg border border-border-light bg-bg-page px-2.5 py-1.5"
                        >
                          <span className="text-sm font-medium text-text-primary">{v}</span>
                          <button
                            type="button"
                            onClick={() => removeVariant(i)}
                            className="flex h-4 w-4 items-center justify-center rounded text-text-tertiary transition-colors hover:text-accent-error"
                            aria-label={`Eliminar variante ${v}`}
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Input
                      value={newVariant}
                      onChange={(e) => setNewVariant(e.target.value)}
                      placeholder="ej. Chica, Grande, 1L…"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addVariant();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={addVariant}
                      className="shrink-0"
                    >
                      Agregar
                    </Button>
                  </div>
                </div>

                <div className="ds-form-actions">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate("/productos")}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" size="sm" isLoading={loading}>
                    {isEdit ? "Guardar cambios" : "Crear producto"}
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
