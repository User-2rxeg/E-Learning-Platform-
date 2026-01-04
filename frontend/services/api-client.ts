// services/api-client.ts
// Unified API client for backend communication

import axios, { AxiosInstance, AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { sessionManager } from '../server/session-manager';

// ============================================
// Configuration
// ============================================

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
const API_TIMEOUT = 30000;

// ============================================
// Create Axios Instance
// ============================================

const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Always send HTTP-only cookies
});

// ============================================
// Request Interceptor
// ============================================

apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        // Add access token if available (client-side)
        if (typeof window !== 'undefined') {
            const token = sessionManager.getAccessToken();
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }

        // Log request in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
        }

        return config;
    },
    (error: AxiosError) => {
        console.error('[API Request Error]', error);
        return Promise.reject(error);
    }
);

// ============================================
// Response Interceptor
// ============================================

apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        // Log response in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.status);
        }
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle 401 Unauthorized - redirect to login
        // Note: Token refresh is handled via HTTP-only cookies by the backend
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Clear local session data and redirect to login
            sessionManager.clearSession();
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }

        // Handle other error codes
        const errorMessages: Record<number, string> = {
            400: 'Bad Request',
            403: 'Forbidden - Insufficient permissions',
            404: 'Resource not found',
            422: 'Validation error',
            429: 'Too many requests - Please try again later',
            500: 'Internal server error',
            502: 'Bad gateway',
            503: 'Service unavailable',
        };

        const status = error.response?.status || 0;
        if (errorMessages[status]) {
            console.error(`[API Error] ${errorMessages[status]}`);
        }

        // Log detailed error in development
        if (process.env.NODE_ENV === 'development') {
            console.error(
                `[API Error] ${error.config?.method?.toUpperCase() || 'UNKNOWN'} ${error.config?.url || 'UNKNOWN_URL'}`,
                error.response?.status,
                error.response?.data
            );
        }

        return Promise.reject(error);
    }
);

// ============================================
// Helper Functions
// ============================================

/**
 * Extract error message from API error response
 */
export function getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message?: string; error?: string }>;
        return (
            axiosError.response?.data?.message ||
            axiosError.response?.data?.error ||
            axiosError.message ||
            'An unexpected error occurred'
        );
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unexpected error occurred';
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
    if (axios.isAxiosError(error)) {
        return !error.response;
    }
    return false;
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
    if (axios.isAxiosError(error)) {
        return error.response?.status === 401;
    }
    return false;
}

// ============================================
// Export
// ============================================

export { apiClient };
export default apiClient;

