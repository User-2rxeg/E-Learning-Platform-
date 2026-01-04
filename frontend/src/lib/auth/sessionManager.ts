// src/lib/auth/sessionManager.ts
import {APP_CONFIG} from "../../config/app.config";

class SessionManager {
// Temporary session data
    setTempToken(token: string): void {
        if (typeof window !== 'undefined') {
            sessionStorage.setItem(APP_CONFIG.STORAGE.TEMP_TOKEN, token);
        }
    }
    getTempToken(): string | null {
        if (typeof window === 'undefined') return null;
        return sessionStorage.getItem(APP_CONFIG.STORAGE.TEMP_TOKEN);
    }
    clearTempToken(): void {
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem(APP_CONFIG.STORAGE.TEMP_TOKEN);
        }
    }
    setPendingEmail(email: string): void {
        if (typeof window !== 'undefined') {
            sessionStorage.setItem(APP_CONFIG.STORAGE.PENDING_EMAIL, email);
        }
    }
    getPendingEmail(): string | null {
        if (typeof window === 'undefined') return null;
        return sessionStorage.getItem(APP_CONFIG.STORAGE.PENDING_EMAIL);
    }
    clearPendingEmail(): void {
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem(APP_CONFIG.STORAGE.PENDING_EMAIL);
        }
    }
    setResetEmail(email: string): void {
        if (typeof window !== 'undefined') {
            sessionStorage.setItem(APP_CONFIG.STORAGE.RESET_EMAIL, email);
        }
    }
    getResetEmail(): string | null {
        if (typeof window === 'undefined') return null;
        return sessionStorage.getItem(APP_CONFIG.STORAGE.RESET_EMAIL);
    }
    clearResetEmail(): void {
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem(APP_CONFIG.STORAGE.RESET_EMAIL);
        }
    }
// user cache (for quick hydration only)
    setUserCache(user: any): void {
        if (typeof window !== 'undefined') {
            localStorage.setItem(APP_CONFIG.STORAGE.USER_CACHE, JSON.stringify(user));
        }
    }
    getUserCache(): any | null {
        if (typeof window === 'undefined') return null;
        try {
            const cached = localStorage.getItem(APP_CONFIG.STORAGE.USER_CACHE);
            return cached ? JSON.parse(cached) : null;
        } catch {
            return null;
        }
    }
    clearUserCache(): void {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(APP_CONFIG.STORAGE.USER_CACHE);
        }
    }
    clearAll(): void {
        this.clearTempToken();
        this.clearPendingEmail();
        this.clearResetEmail();
        this.clearUserCache();
    }
}
export const sessionManager = new SessionManager();