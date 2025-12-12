export type Role = 'ADMIN' | 'USER' | 'STORE_OWNER';

export interface User {
    id: number;
    name: string;
    email: string;
    address: string;
    role: Role;
    createdAt?: string;
    store?: {
        id: number;
        name: string;
        averageRating?: string | null;
    } | null;
}

export interface Store {
    id: number;
    name: string;
    email: string;
    address: string;
    createdAt?: string;
    averageRating: string | null;
    totalRatings: number;
    userRating?: number | null;
    userRatingId?: number | null;
}

export interface Rating {
    id: number;
    rating: number;
    storeId?: number;
    user?: {
        id: number;
        name: string;
        email: string;
    };
    store?: {
        id: number;
        name: string;
        address: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    message: string;
    token: string;
    user: User;
}

export interface DashboardStats {
    totalUsers: number;
    totalStores: number;
    totalRatings: number;
}

export interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ApiError {
    message: string;
    errors?: Record<string, string>;
}
