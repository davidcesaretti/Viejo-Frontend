/**
 * Respuesta paginada del backend (items, total, page, limit, totalPages).
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}
