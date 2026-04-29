export type CashboxEntryType = "income" | "expense";

export interface CashboxEntry {
  id: string;
  type: CashboxEntryType;
  category: string;
  description: string;
  amount: number;
  entryDate: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  } | null;
  createdAt: string;
}

export interface CashboxSummary {
  income: number;
  expense: number;
  balance: number;
}

export interface CreateCashboxEntryBody {
  type: CashboxEntryType;
  category: string;
  description?: string;
  amount: number;
  entryDate?: string;
}
