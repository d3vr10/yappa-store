export interface PaginatedResult <T> {
    page: number;
    perPage: number;
    totalPages: number;
    items: T[];
    itemCount: number;
}

export type PaginationParams = {
    perPage: number;
    page: number;
}

export type OptionalPaginationParams = Partial<PaginationParams>