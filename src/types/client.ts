/**
 * Cliente. Base URL: /clients
 */
export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClientCreateBody {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export interface ClientUpdateBody {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

/** Resumen de venta en la cuenta del cliente */
export interface ClientAccountSaleSummary {
  id: string;
  saleDate: string;
  totalAmount: number;
  amountPaid: number;
  balance: number;
  itemsCount?: number;
}

/** Respuesta GET /clients/:id/account (sales puede venir paginado como { items, total, ... }) */
export interface ClientAccountResponse {
  client: Client;
  sales:
    | ClientAccountSaleSummary[]
    | {
        items: ClientAccountSaleSummary[];
        total?: number;
        page?: number;
        limit?: number;
      };
  totalDebt: number;
  totalSalesAmount: number;
  totalPaid: number;
}
