import api from './api';
import type { AuthResponse, User, Store, Rating, DashboardStats, PaginationInfo } from '../types';

// Auth services
export const authService = {
    signup: async (data: { name: string; email: string; password: string; address: string }) => {
        const response = await api.post<AuthResponse>('/auth/signup', data);
        return response.data;
    },

    login: async (data: { email: string; password: string }) => {
        const response = await api.post<AuthResponse>('/auth/login', data);
        return response.data;
    },

    updatePassword: async (data: { currentPassword: string; newPassword: string }) => {
        const response = await api.put<{ message: string }>('/auth/password', data);
        return response.data;
    },

    getProfile: async () => {
        const response = await api.get<{ user: User }>('/auth/profile');
        return response.data;
    },
};

// User services (Admin only)
export const userService = {
    getUsers: async (params?: {
        search?: string;
        name?: string;
        email?: string;
        address?: string;
        role?: string;
        sortBy?: string;
        sortOrder?: string;
        page?: number;
        limit?: number;
    }) => {
        const response = await api.get<{ users: User[]; pagination: PaginationInfo }>('/users', { params });
        return response.data;
    },

    getUserById: async (id: number) => {
        const response = await api.get<{ user: User }>(`/users/${id}`);
        return response.data;
    },

    createUser: async (data: { name: string; email: string; password: string; address: string; role?: string }) => {
        const response = await api.post<{ message: string; user: User }>('/users', data);
        return response.data;
    },
};

// Store services
export const storeService = {
    getStores: async (params?: {
        search?: string;
        name?: string;
        address?: string;
        sortBy?: string;
        sortOrder?: string;
        page?: number;
        limit?: number;
    }) => {
        const response = await api.get<{ stores: Store[]; pagination: PaginationInfo }>('/stores', { params });
        return response.data;
    },

    getStoreById: async (id: number) => {
        const response = await api.get<{ store: Store & { ratings: Rating[] } }>(`/stores/${id}`);
        return response.data;
    },

    createStore: async (data: { name: string; email: string; address: string; ownerId?: number }) => {
        const response = await api.post<{ message: string; store: Store }>('/stores', data);
        return response.data;
    },

    getMyStore: async () => {
        const response = await api.get<{ store: Store & { ratings: Rating[] } }>('/stores/my-store');
        return response.data;
    },
};

// Rating services
export const ratingService = {
    submitRating: async (data: { storeId: number; rating: number }) => {
        const response = await api.post<{ message: string; rating: Rating }>('/ratings', data);
        return response.data;
    },

    updateRating: async (storeId: number, data: { rating: number }) => {
        const response = await api.put<{ message: string; rating: Rating }>(`/ratings/${storeId}`, data);
        return response.data;
    },

    getUserRatings: async () => {
        const response = await api.get<{ ratings: Rating[] }>('/ratings/my-ratings');
        return response.data;
    },
};

// Dashboard services
export const dashboardService = {
    getStats: async () => {
        const response = await api.get<{ stats: DashboardStats }>('/dashboard/stats');
        return response.data;
    },
};
