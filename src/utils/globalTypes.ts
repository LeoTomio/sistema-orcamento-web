interface PaginationParams {
    page: number;
    limit: number;
}

interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}

export type { PaginationParams, PaginatedResponse };