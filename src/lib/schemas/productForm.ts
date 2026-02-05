import { z } from "zod";

/** Formulario crear/editar producto (solo nombre). */
export const productFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(200),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;
