// auth/session-manager.ts
// Client-side session management for authentication state
// Note: Authentication tokens are stored in HTTP-only cookies by the backend
// This manager only handles client-side state like user cache and temp tokens

import { APP_CONFIG } from '../config/app.config';

// ============================================
// Types
// ============================================

interface StoredUser {
    _id: string;
    id?: string;
    email: string;
    name: string;
    role: 'student' | 'instructor' | 'admin';
    [key: string]: any;
}

// ============================================
// Session Manager Class
// ============================================

class SessionManager {
    // Storage keys
    private readonly ACCESS_TOKEN_KEY = 'accessToken';
    private readonly TEMP_TOKEN_KEY = APP_CONFIG?.STORAGE?.TEMP_TOKEN || 'tempToken';
    private readonly PENDING_EMAIL_KEY = APP_CONFIG?.STORAGE?.PENDING_EMAIL || 'pendingEmail';
    private readonly RESET_EMAIL_KEY = APP_CONFIG?.STORAGE?.RESET_EMAIL || 'resetEmail';
    private readonly USER_KEY = APP_CONFIG?.STORAGE?.USER_CACHE || 'userCache';

    // ============================================
    // Helper Methods
    // ============================================

    private isClient(): boolean {
        return typeof window !== 'undefined';
    }

    private getLocalStorage(key: string): string | null {
        if (!this.isClient()) return null;
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.warn('LocalStorage access failed:', e);
            return null;
        }
    }

    private setLocalStorage(key: string, value: string): void {
        if (!this.isClient()) return;
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            console.warn('LocalStorage write failed:', e);
        }
    }

    private removeLocalStorage(key: string): void {
        if (!this.isClient()) return;
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.warn('LocalStorage remove failed:', e);
        }
    }

    private getSessionStorage(key: string): string | null {
        if (!this.isClient()) return null;
        try {
            return sessionStorage.getItem(key);
        } catch (e) {
            console.warn('SessionStorage access failed:', e);
            return null;
        }
    }

    private setSessionStorage(key: string, value: string): void {
        if (!this.isClient()) return;
        try {
            sessionStorage.setItem(key, value);
        } catch (e) {
            console.warn('SessionStorage write failed:', e);
        }
    }

    private removeSessionStorage(key: string): void {
        if (!this.isClient()) return;
        try {
            sessionStorage.removeItem(key);
        } catch (e) {
            console.warn('SessionStorage remove failed:', e);
        }
    }

    // ============================================
    // Access Token Methods (backup for client-side checks)
    // Main auth is via HTTP-only cookies
    // ============================================

    setAccessToken(token: string): void {
        this.setLocalStorage(this.ACCESS_TOKEN_KEY, token);
    }

    getAccessToken(): string | null {
        return this.getLocalStorage(this.ACCESS_TOKEN_KEY);
    }

    clearAccessToken(): void {
        this.removeLocalStorage(this.ACCESS_TOKEN_KEY);
    }

    // ============================================
    // Temp Token Methods (for MFA)
    // ============================================

    setTempToken(token: string): void {
        this.setSessionStorage(this.TEMP_TOKEN_KEY, token);
    }

    getTempToken(): string | null {
        return this.getSessionStorage(this.TEMP_TOKEN_KEY);
    }

    clearTempToken(): void {
        this.removeSessionStorage(this.TEMP_TOKEN_KEY);
    }

    // ============================================
    // Pending Email Methods (for OTP verification)
    // ============================================

    setPendingEmail(email: string): void {
        this.setSessionStorage(this.PENDING_EMAIL_KEY, email);
    }

    getPendingEmail(): string | null {
        return this.getSessionStorage(this.PENDING_EMAIL_KEY);
    }

    clearPendingEmail(): void {
        this.removeSessionStorage(this.PENDING_EMAIL_KEY);
    }

    // ============================================
    // Reset Email Methods (for password reset)
    // ============================================

    setResetEmail(email: string): void {
        this.setSessionStorage(this.RESET_EMAIL_KEY, email);
    }

    getResetEmail(): string | null {
        return this.getSessionStorage(this.RESET_EMAIL_KEY);
    }

    clearResetEmail(): void {
        this.removeSessionStorage(this.RESET_EMAIL_KEY);
    }

    // ============================================
    // User Cache Methods
    // ============================================

    setUser(user: StoredUser): void {
        this.setLocalStorage(this.USER_KEY, JSON.stringify(user));
    }

    getUser(): StoredUser | null {
        const userStr = this.getLocalStorage(this.USER_KEY);
        if (!userStr) return null;

        try {
            return JSON.parse(userStr);
        } catch {
            this.clearUser();
            return null;
        }
    }

    clearUser(): void {
        this.removeLocalStorage(this.USER_KEY);
    }

    // ============================================
    // Session Management
    // ============================================

    clearSession(): void {
        this.clearAccessToken();
        this.clearTempToken();
        this.clearPendingEmail();
        this.clearResetEmail();
        this.clearUser();
    }

    isAuthenticated(): boolean {
        // Check if we have a cached user (HTTP-only cookie auth is primary)
        return !!this.getUser();
    }

    // ============================================
    // Debug Methods (for development)
    // ============================================

    getSessionInfo(): object {
        return {
            hasAccessToken: !!this.getAccessToken(),
            hasTempToken: !!this.getTempToken(),
            hasPendingEmail: !!this.getPendingEmail(),
            hasResetEmail: !!this.getResetEmail(),
            hasUser: !!this.getUser(),
            user: this.getUser(),
        };
    }
}

// ============================================
// Export Singleton Instance
// ============================================

export const sessionManager = new SessionManager();
export default sessionManager;

