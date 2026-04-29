import { z } from "zod";

// ─── Auth ─────────────────────────────────────────────────────
export const loginFormSchema = z.object({
  email: z
    .string()
    .min(1, "El email es requerido")
    .email("Ingresá un email válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

// ─── Products ─────────────────────────────────────────────────
export const productFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(200),
  variants: z.array(z.string().min(1).max(100)).default([]),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

// ─── Stock ────────────────────────────────────────────────────
export const stockFormSchema = z.object({
  productId: z.string().min(1, "Seleccioná un producto"),
  variantName: z.string().optional().default(""),
  quantity: z.coerce.number({ invalid_type_error: "Cantidad inválida" }).min(0.01, "La cantidad debe ser mayor a 0"),
  price: z.coerce.number({ invalid_type_error: "Precio inválido" }).min(0, "El precio debe ser mayor o igual a 0"),
  discountType: z.enum(["percentage", "fixed"]).default("percentage"),
  discount: z.coerce.number().min(0).optional(),
});

export type StockFormValues = z.infer<typeof stockFormSchema>;

// ─── Clients ──────────────────────────────────────────────────
export const clientFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(200),
  email: z
    .string()
    .min(1, "El email es requerido")
    .email("Ingresá un email válido"),
  phone: z.string().max(50).optional().or(z.literal("")),
  address: z.string().max(300).optional().or(z.literal("")),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;

// ─── Payments ─────────────────────────────────────────────────
export const PAYMENT_METHODS = ["cash", "transfer", "check", "other"] as const;

export const paymentFormSchema = z.object({
  saleId: z.string().min(1, "Seleccioná una venta"),
  amount: z.coerce
    .number({ invalid_type_error: "Ingresá un monto válido" })
    .min(0.01, "El monto debe ser mayor a 0"),
  paymentMethod: z.enum(PAYMENT_METHODS).default("cash"),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export type PaymentFormValues = z.infer<typeof paymentFormSchema>;

// ─── Users ────────────────────────────────────────────────────
export const PLATFORM_ROLES = ["administrador", "vendedor"] as const;

export const userFormSchema = z
  .object({
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
    email: z
      .string()
      .min(1, "El email es requerido")
      .email("Ingresá un email válido"),
    role: z.enum(PLATFORM_ROLES, { required_error: "Seleccioná un rol" }),
    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres")
      .or(z.literal(""))
      .optional(),
    confirmPassword: z.string().optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      if (data.password && data.password.length > 0) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    { message: "Las contraseñas no coinciden", path: ["confirmPassword"] }
  );

export type UserFormValues = z.infer<typeof userFormSchema>;

// ─── Password / Profile ───────────────────────────────────────
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6, "Ingresá tu contraseña actual"),
    newPassword: z
      .string()
      .min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
    confirmNewPassword: z.string().min(6, "Confirmá la nueva contraseña"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmNewPassword"],
  });

export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "El email es requerido")
    .email("Ingresá un email válido"),
});

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
    confirmNewPassword: z.string().min(6, "Confirmá la nueva contraseña"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmNewPassword"],
  });

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
