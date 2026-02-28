interface PaginationParams {
    page: number;
}

interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
}

export type { PaginationParams, PaginatedResponse };