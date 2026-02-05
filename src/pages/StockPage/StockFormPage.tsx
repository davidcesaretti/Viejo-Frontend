import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, FormProvider, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MainLayout } from "@/components/templates/MainLayout";
import { PageTransition } from "@/components/templates/PageTransition";
import { Card } from "@/components/molecules/Card";
import { Button } from "@/components/atoms/Button";
import { FormField } from "@/components/molecules/FormField";
import { useToast } from "@/hooks/useToast";
import { stockFormSchema, type StockFormValues } from "@/lib/schemas";
import {
  getProducts,
  getStockItem,
  createStock,
  updateStock,
} from "@/services";
import { ApiClientError } from "@/services/api/client";

export function StockFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [productOptions, setProductOptions] = useState<
    { value: string; label: string }[]
  >([]);

  const methods = useForm<StockFormValues>({
    resolver: zodResolver(stockFormSchema) as Resolver<StockFormValues>,
    defaultValues: {
      productId: "",
      quantity: 0,
      price: 0,
      discountType: "percentage",
      discount: undefined,
    },
    mode: "onBlur",
  });

  const discountType = methods.watch("discountType");

  useEffect(() => {
    getProducts(1, 500)
      .then((res) => {
        const list = res.items ?? [];
        setProductOptions(list.map((p) => ({ value: p.id, label: p.name })));
      })
      .catch(() => setProductOptions([]))
      .finally(() => {
        if (!id) setLoadingData(false);
      });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    getStockItem(id)
      .then((s) => {
        methods.reset({
          productId: s.productId,
          quantity: s.quantity,
          price: s.price,
          discountType: s.discountType ?? "percentage",
          discount: s.discount ?? undefined,
        });
      })
      .catch((err) => {
        toast.error(
          "Error al cargar cargamento",
          err instanceof Error ? err.message : undefined
        );
        navigate("/stock", { replace: true });
      })
      .finally(() => setLoadingData(false));
  }, [id, methods, navigate, toast]);

  const onSubmit = methods.handleSubmit(async (data) => {
    setLoading(true);
    try {
      const body = {
        productId: data.productId,
        quantity: data.quantity,
        price: data.price,
        ...(data.discount != null
          ? {
              discountType: data.discountType ?? "percentage",
              discount: data.discount,
            }
          : {}),
      };
      if (isEdit && id) {
        await updateStock(id, {
          quantity: data.quantity,
          price: data.price,
          ...(data.discount != null
            ? {
                discountType: data.discountType ?? "percentage",
                discount: data.discount,
              }
            : {}),
        });
        toast.success("Cargamento actualizado");
      } else {
        await createStock(body);
        toast.success("Cargamento creado");
      }
      navigate("/stock", { replace: true });
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
      <MainLayout title={isEdit ? "Editar cargamento" : "Nuevo cargamento"}>
        <PageTransition>
          <p className="text-sm text-text-tertiary">Cargando…</p>
        </PageTransition>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={isEdit ? "Editar cargamento" : "Nuevo cargamento"}>
      <PageTransition>
        <div className="space-y-6 animate-fade-in pb-6 sm:pb-8 max-w-xl">
          <Card variant="elevated" padding="lg">
            <FormProvider {...methods}>
              <form onSubmit={onSubmit} className="space-y-4">
                <FormField
                  name="productId"
                  label="Producto"
                  type="select"
                  options={productOptions}
                  placeholder="Seleccionar producto"
                  required
                  disabled={isEdit}
                />
                <FormField
                  name="quantity"
                  label="Cantidad"
                  required
                  inputType="number"
                  placeholder="0"
                />
                <FormField
                  name="price"
                  label="Precio"
                  required
                  inputType="number"
                  placeholder="0"
                />
                <FormField
                  name="discountType"
                  label="Tipo de descuento"
                  type="select"
                  options={[
                    { value: "percentage", label: "Porcentaje (%)" },
                    { value: "fixed", label: "Monto fijo" },
                  ]}
                />
                <FormField
                  name="discount"
                  label={
                    discountType === "percentage"
                      ? "Descuento (%)"
                      : "Descuento (monto fijo)"
                  }
                  inputType="number"
                  placeholder={
                    discountType === "percentage"
                      ? "Opcional, 0-100"
                      : "Opcional"
                  }
                />
                <div className="flex gap-2 w-full">
                  <Button
                    type="submit"
                    size="md"
                    isLoading={loading}
                    className="w-1/2 min-w-0"
                  >
                    {isEdit ? "Guardar cambios" : "Crear cargamento"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="md"
                    onClick={() => navigate("/stock")}
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
