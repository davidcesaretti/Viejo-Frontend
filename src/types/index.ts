/**
 * Tipos compartidos del proyecto.
 * Añadir aquí interfaces y types globales (ventas, clientes, productos, etc.)
 */
export type { User, Role, AuthLoginBody, AuthLoginResponse } from "./auth";
export type {
  Notification,
  NotificationBackend,
  NotificationType,
  NotificationsResponse,
} from "./notifications";
export type { ProductType, ProductTypeCreateBody } from "./productType";
export type { Product, ProductCreateBody, ProductUpdateBody } from "./product";
export type {
  Stock,
  StockCreateBody,
  StockUpdateBody,
  StockDiscountType,
} from "./stock";
export type { PaginatedResponse } from "./pagination";
export type {
  Client,
  ClientCreateBody,
  ClientUpdateBody,
  ClientAccountResponse,
  ClientAccountSaleSummary,
} from "./client";
export type {
  Sale,
  SaleItem,
  SaleCreateBody,
  SaleCreateItemBody,
} from "./sale";
export type { Payment, PaymentCreateBody } from "./payment";
export type {
  PlatformUser,
  PlatformRole,
  CreateUserBody,
  UpdateUserBody,
} from "./user";
export type {
  CashboxEntry,
  CashboxEntryType,
  CashboxSummary,
  CreateCashboxEntryBody,
} from "./cashbox";
