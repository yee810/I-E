export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
  allowedSortColumns?: string[];
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

const SAFE_SORT_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

export function parsePagination(opts: PaginationOptions) {
  const page = Math.max(1, opts.page ?? DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, opts.limit ?? DEFAULT_LIMIT));
  const offset = (page - 1) * limit;
  const order = opts.order === "asc" ? "ASC" : "DESC";

  let sort = opts.sort || "created_at";
  if (opts.allowedSortColumns) {
    if (!opts.allowedSortColumns.includes(sort)) {
      sort = "created_at";
    }
  } else if (!SAFE_SORT_PATTERN.test(sort)) {
    sort = "created_at";
  }

  return { page, limit, offset, order, sort };
}
