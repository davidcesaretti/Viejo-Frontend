import { z } from "zod";

/** Formulario crear/editar cliente */
export const clientFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(200),
  email: z.string().min(1, "El email es requerido").email("Email inválido"),
  phone: z.string().max(50).optional().or(z.literal("")),
  address: z.string().max(500).optional().or(z.literal("")),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;
