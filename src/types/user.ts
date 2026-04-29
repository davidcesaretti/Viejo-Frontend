export type PlatformRole = "administrador" | "vendedor";

export interface PlatformUser {
  id: string;
  email: string;
  name: string;
  roles: PlatformRole[];
  banned: boolean;
  createdAt?: string;
}

export interface CreateUserBody {
  email: string;
  password: string;
  name: string;
  role?: PlatformRole;
}

export interface UpdateUserBody {
  name?: string;
  email?: string;
  roles?: PlatformRole[];
  banned?: boolean;
  password?: string;
}
