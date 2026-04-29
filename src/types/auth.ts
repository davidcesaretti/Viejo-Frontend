/**
 * Roles de la plataforma. Ajustar según lo que defina el backend.
 * Se usan para guards y permisos por pantalla/funcionalidad.
 */
export type Role = "administrador" | "vendedor";

export interface User {
  id: string;
  email: string;
  name: string;
  roles: Role[];
}

export interface AuthLoginBody {
  email: string;
  password: string;
}

export interface AuthLoginResponse {
  user: User;
  access_token: string;
}

export interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordBody {
  email: string;
}

export interface ResetPasswordBody {
  token: string;
  newPassword: string;
}
