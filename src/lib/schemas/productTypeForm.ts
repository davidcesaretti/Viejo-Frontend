import { z } from "zod";

export const productTypeFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100),
});

export type ProductTypeFormValues = z.infer<typeof productTypeFormSchema>;
