export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export function parsePagination(opts: PaginationOptions) {
  const page = Math.max(1, opts.page ?? DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, opts.limit ?? DEFAULT_LIMIT));
  const offset = (page - 1) * limit;
  const order = opts.order === "asc" ? "ASC" : "DESC";
  return { page, limit, offset, order };
}
