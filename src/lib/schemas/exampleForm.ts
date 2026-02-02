import { z } from "zod";

/**
 * Ejemplo de schema Zod para formularios.
 * Reemplazar o extender según las entidades del negocio (ventas, clientes, productos, etc.)
 */
export const exampleFormSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido").max(100),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  categoria: z.string().min(1, "Seleccione una categoría").optional(),
});

export type ExampleFormValues = z.infer<typeof exampleFormSchema>;
