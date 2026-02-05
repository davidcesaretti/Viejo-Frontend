import { z } from "zod";

const discountTypeEnum = z.enum(["percentage", "fixed"]);

/** Formulario crear/editar cargamento de stock. */
export const stockFormSchema = z
  .object({
    productId: z.string().min(1, "Seleccioná un producto"),
    quantity: z.coerce
      .number()
      .int()
      .min(0, "La cantidad debe ser mayor o igual a 0"),
    price: z.coerce.number().min(0, "El precio debe ser mayor o igual a 0"),
    discountType: discountTypeEnum.optional(),
    discount: z.preprocess(
      (v) => (v === "" || v === undefined ? undefined : Number(v)),
      z.number().min(0, "El descuento no puede ser negativo").optional()
    ),
  })
  .refine(
    (data) =>
      data.discountType !== "percentage" ||
      data.discount == null ||
      data.discount <= 100,
    { message: "Máximo 100%", path: ["discount"] }
  );

export type StockFormValues = {
  productId: string;
  quantity: number;
  price: number;
  discountType?: "percentage" | "fixed";
  discount?: number;
};
