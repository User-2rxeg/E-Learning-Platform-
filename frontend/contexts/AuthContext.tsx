// src/contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { sessionManager } from '../server/session-manager';

// ============================================
// Types
// ============================================

interface User {
    _id: string;
    id?: string;
    email: string;
    name: string;
    role: 'student' | 'instructor' | 'admin';
    isEmailVerified?: boolean;
    mfaEnabled?: boolean;
    profileComplete?: boolean;
    enrolledCourses?: string[];
    teachingCourses?: string[];
    status?: 'active' | 'inactive' | 'locked' | 'terminated';
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<LoginResult>;
    register: (data: RegisterData) => Promise<RegisterResult>;
    verifyOTP: (email: string, otp: string) => Promise<VerifyResult>;
    verifyMFA: (tempToken: string, code: string) => Promise<MFAResult>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    forgotPassword: (email: string) => Promise<void>;
    resetPassword: (email: string, otp: string, newPassword: string) => Promise<void>;
    resendOTP: (email: string) => Promise<void>;
}

interface LoginResult {
    success: boolean;
    mfaRequired?: boolean;
    tempToken?: string;
    user?: User;
    error?: string;
}

interface RegisterData {
    name: string;
    email: string;
    password: string;
    role?: 'student' | 'instructor';
}

interface RegisterResult {
    success: boolean;
    error?: string;
}

interface VerifyResult {
    success: boolean;
    error?: string;
}

interface MFAResult {
    success: boolean;
    user?: User;
    error?: string;
}

// ============================================
// Constants
// ============================================

const PUBLIC_ROUTES = [
    '/login',
    '/register',
    '/verify-otp',
    '/forgot-password',
    '/reset-password',
    '/mfa-verify',
    '/',
    '/courses',
    '/feedback',
    '/terms',
    '/privacy',
];

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

// ============================================
// Context
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// Provider Component
// ============================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const pathname = usePathname();
    const initialCheckDone = useRef(false);

    // Normalize user data
    const normalizeUser = useCallback((userData: any): User => {
        return {
            ...userData,
            id: userData.id || userData._id,
        };
    }, []);

    // Check if route is public
    const isPublicRoute = useCallback((path: string | null) => {
        if (!path) return true;
        return PUBLIC_ROUTES.some(route => path === route || path.startsWith(route + '/'));
    }, []);

    // Initialize auth state from cache and verify with server
    useEffect(() => {
        const initAuth = async () => {
            // First, try to restore from cache for instant UI
            const cachedUser = sessionManager.getUser();
            if (cachedUser) {
                setUser(normalizeUser(cachedUser));
            }

            // Then verify with server if we have a token
            const token = sessionManager.getAccessToken();
            if (token) {
                try {
                    const response = await fetch(`${API_BASE}/auth/me`, {
                        credentials: 'include',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    if (response.ok) {
                        const data = await response.json();
                        const normalizedUser = normalizeUser(data);
                        setUser(normalizedUser);
                        sessionManager.setUser(normalizedUser);
                    } else {
                        // Token invalid - clear but don't redirect yet
                        console.log('Token invalid, clearing session');
                        sessionManager.clearSession();
                        setUser(null);
                    }
                } catch (e) {
                    console.error('Auth check failed:', e);
                    // Keep cached user on network error
                }
            }

            setLoading(false);
            initialCheckDone.current = true;
        };

        initAuth();
    }, [normalizeUser]);

    // Handle protected route redirects
    useEffect(() => {
        if (!initialCheckDone.current || loading) return;

        if (!user && !isPublicRoute(pathname)) {
            router.replace('/login');
        }
    }, [user, pathname, loading, isPublicRoute, router]);

    // ============================================
    // Auth Methods
    // ============================================

    const login = async (email: string, password: string): Promise<LoginResult> => {
        try {
            setError(null);
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include',
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, error: data.message || data.error || 'Login failed' };
            }

            // Handle MFA requirement
            if (data.mfaRequired) {
                sessionManager.setTempToken(data.tempToken);
                return {
                    success: true,
                    mfaRequired: true,
                    tempToken: data.tempToken,
                };
            }

            // Store user and token
            const userData = normalizeUser(data.user);
            setUser(userData);
            sessionManager.setUser(userData);

            if (data.accessToken) {
                sessionManager.setAccessToken(data.accessToken);
            }

            return { success: true, user: userData };
        } catch (err) {
            console.error('Login error:', err);
            const errorMessage = 'Network error. Please try again.';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    const register = async (data: RegisterData): Promise<RegisterResult> => {
        try {
            setError(null);
            const response = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                return { success: false, error: result.message || result.error || 'Registration failed' };
            }

            sessionManager.setPendingEmail(data.email);
            return { success: true };
        } catch (err) {
            console.error('Registration error:', err);
            return { success: false, error: 'Network error. Please try again.' };
        }
    };

    const verifyOTP = async (email: string, otp: string): Promise<VerifyResult> => {
        try {
            setError(null);
            const response = await fetch(`${API_BASE}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otpCode: otp }),
            });

            const result = await response.json();

            if (!response.ok) {
                return { success: false, error: result.message || result.error || 'Verification failed' };
            }

            sessionManager.clearPendingEmail();
            return { success: true };
        } catch (err) {
            console.error('OTP verification error:', err);
            return { success: false, error: 'Network error. Please try again.' };
        }
    };

    const verifyMFA = async (tempToken: string, code: string): Promise<MFAResult> => {
        try {
            setError(null);
            const response = await fetch(`${API_BASE}/auth/verify-mfa`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tempToken, mfaCode: code }),
                credentials: 'include',
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, error: data.message || data.error || 'MFA verification failed' };
            }

            const userData = normalizeUser(data.user);
            setUser(userData);
            sessionManager.setUser(userData);
            sessionManager.clearTempToken();

            if (data.accessToken) {
                sessionManager.setAccessToken(data.accessToken);
            }

            return { success: true, user: userData };
        } catch (err) {
            console.error('MFA verification error:', err);
            return { success: false, error: 'Network error. Please try again.' };
        }
    };

    const logout = async (): Promise<void> => {
        try {
            const token = sessionManager.getAccessToken();
            if (token) {
                await fetch(`${API_BASE}/auth/logout`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
            }
        } catch (e) {
            console.error('Logout error:', e);
        } finally {
            sessionManager.clearSession();
            setUser(null);
            router.push('/');
        }
    };

    const refreshUser = async (): Promise<void> => {
        const token = sessionManager.getAccessToken();
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE}/auth/me`, {
                credentials: 'include',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                const userData = normalizeUser(data);
                setUser(userData);
                sessionManager.setUser(userData);
            }
        } catch (e) {
            console.error('Refresh user error:', e);
        }
    };

    const forgotPassword = async (email: string): Promise<void> => {
        const response = await fetch(`${API_BASE}/auth/request-password-reset`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || data.error || 'Failed to send reset code');
        }
    };

    const resetPassword = async (email: string, otp: string, newPassword: string): Promise<void> => {
        const response = await fetch(`${API_BASE}/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otpCode: otp, newPassword }),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || data.error || 'Failed to reset password');
        }
    };
    const resendOTP = async (email: string): Promise<void> => {
        const response = await fetch(`${API_BASE}/auth/resend-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || data.error || 'Failed to resend OTP');
        }
    };

    // ============================================
    // Context Value
    // ============================================

    const value: AuthContextType = {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        register,
        verifyOTP,
        verifyMFA,
        logout,
        refreshUser,
        forgotPassword,
        resetPassword,
        resendOTP,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================
// Custom Hook
// ============================================

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
