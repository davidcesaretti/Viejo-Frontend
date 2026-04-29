import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, FormProvider, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MainLayout } from "@/components/templates/MainLayout";
import { Button } from "@/components/atoms/Button";
import { FormField } from "@/components/molecules/FormField";
import { useToast } from "@/hooks/useToast";
import { stockFormSchema, type StockFormValues } from "@/lib/schemas";
import { getProducts, getStockItem, createStock, updateStock } from "@/services";
import { ApiClientError } from "@/services/api/client";
import type { Product } from "@/types/product";

export function StockFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);

  const methods = useForm<StockFormValues>({
    resolver: zodResolver(stockFormSchema) as Resolver<StockFormValues>,
    defaultValues: {
      productId: "",
      variantName: "",
      quantity: 0,
      price: 0,
      discountType: "percentage",
      discount: undefined,
    },
    mode: "onBlur",
  });

  const selectedProductId = methods.watch("productId");

  const productOptions = products.map((p) => ({ value: p.id, label: p.name }));

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const variantOptions = selectedProduct?.variants?.length
    ? [
        { value: "", label: "Sin variante" },
        ...selectedProduct.variants.map((v) => ({ value: v, label: v })),
      ]
    : [];

  useEffect(() => {
    getProducts(1, 500)
      .then((res) => setProducts(res.items ?? []))
      .catch(() => setProducts([]))
      .finally(() => { if (!id) setLoadingData(false); });
  }, [id]);

  // Reset variantName when product changes (only in create mode)
  useEffect(() => {
    if (!isEdit) {
      methods.setValue("variantName", "");
    }
  }, [selectedProductId, isEdit]);

  useEffect(() => {
    if (!id) return;
    getStockItem(id)
      .then((s) => {
        methods.reset({
          productId: s.productId,
          variantName: s.variantName ?? "",
          quantity: s.quantity,
          price: s.price,
          discountType: s.discountType ?? "percentage",
          discount: s.discount ?? undefined,
        });
      })
      .catch((err) => {
        toast.error("Error al cargar cargamento", err instanceof Error ? err.message : undefined);
        navigate("/stock", { replace: true });
      })
      .finally(() => setLoadingData(false));
  }, [id]);

  const onSubmit = methods.handleSubmit(async (data) => {
    setLoading(true);
    try {
      const variantPart = data.variantName ? { variantName: data.variantName } : {};

      if (isEdit && id) {
        await updateStock(id, { quantity: data.quantity, price: data.price, ...variantPart });
        toast.success("Cargamento actualizado");
      } else {
        await createStock({ productId: data.productId, quantity: data.quantity, price: data.price, ...variantPart });
        toast.success("Cargamento creado");
      }
      navigate("/stock", { replace: true });
    } catch (err) {
      toast.error("No se pudo guardar", err instanceof ApiClientError ? err.message : "Error al guardar");
    } finally {
      setLoading(false);
    }
  });

  const pageTitle = isEdit ? "Editar cargamento" : "Nuevo cargamento";

  return (
    <MainLayout title={pageTitle}>
      <div className="ds-page">
        <div>
          <button
            type="button"
            onClick={() => navigate("/stock")}
            className="mb-3 flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Stock
          </button>
        </div>

        <div className="mx-auto w-full max-w-lg">
          <h1 className="ds-section-title">{pageTitle}</h1>

          <div className="mt-4 rounded-xl border border-border-light bg-bg-secondary p-6 shadow-sm">
          {loadingData ? (
            <div className="flex items-center justify-center py-8 text-sm text-text-tertiary">Cargando…</div>
          ) : (
            <FormProvider {...methods}>
              <form onSubmit={onSubmit} className="ds-form">
                <FormField
                  name="productId"
                  label="Producto"
                  type="select"
                  options={productOptions}
                  placeholder="Seleccionar producto"
                  required
                  disabled={isEdit}
                />

                {/* Variant selector — only visible when product has variants */}
                {variantOptions.length > 0 && (
                  <FormField
                    name="variantName"
                    label="Variante"
                    type="select"
                    options={variantOptions}
                  />
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField name="quantity" label="Cantidad" required inputType="number" placeholder="0" />
                  <FormField name="price" label="Costo" required inputType="number" placeholder="0.00" />
                </div>
                <div className="ds-form-actions">
                  <Button type="button" variant="secondary" size="sm" onClick={() => navigate("/stock")}>
                    Cancelar
                  </Button>
                  <Button type="submit" size="sm" isLoading={loading}>
                    {isEdit ? "Guardar cambios" : "Crear cargamento"}
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
