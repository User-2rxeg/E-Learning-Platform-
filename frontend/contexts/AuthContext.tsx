// src/contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { sessionManager } from '../server/session-manager';

// ============================================
// Types & Interfaces
// ============================================

export interface User {
    _id: string;
    id?: string;
    email: string;
    name: string;
    role: 'student' | 'instructor' | 'admin';
    profileImage?: string;
    isEmailVerified: boolean;
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
    // Auth methods
    login: (email: string, password: string) => Promise<LoginResult>;
    register: (data: RegisterData) => Promise<RegisterResult>;
    verifyOTP: (email: string, otp: string) => Promise<VerifyResult>;
    verifyMFA: (tempToken: string, code: string) => Promise<MFAResult>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    // Password reset
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
    role: string;
}

interface RegisterResult {
    success: boolean;
    message?: string;
    userId?: string;
    error?: string;
}

interface VerifyResult {
    success: boolean;
    user?: User;
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
    const mountedRef = useRef(true);
    const initRef = useRef(false);

    // Normalize user data to ensure consistent id field
    const normalizeUser = useCallback((userData: any): User => {
        return {
            ...userData,
            id: userData.id || userData._id,
        };
    }, []);

    // Check if current path is public
    const isPublicRoute = useCallback((path: string | null) => {
        if (!path) return false;
        return PUBLIC_ROUTES.some(route => path === route || path.startsWith(route + '/'));
    }, []);

    // Check authentication status
    const checkAuth = useCallback(async () => {
        try {
            // Skip server check for public routes
            if (isPublicRoute(pathname)) {
                if (mountedRef.current) setLoading(false);
                return;
            }

            const token = sessionManager.getAccessToken();

            // If no token and on protected route
            if (!token) {
                if (mountedRef.current) {
                    setUser(null);
                    setLoading(false);
                }
                router.replace('/login');
                return;
            }

            const response = await fetch('/api/auth/me', {
                credentials: 'include',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                const normalizedUser = normalizeUser(data);
                if (mountedRef.current) {
                    setUser(normalizedUser);
                    setError(null);
                    sessionManager.setUser(normalizedUser);
                }
            } else {
                // Token invalid or expired
                sessionManager.clearSession();
                if (mountedRef.current) {
                    setUser(null);
                }
                if (!isPublicRoute(pathname)) {
                    router.replace('/login');
                }
            }
        } catch (e) {
            console.error('Auth check failed:', e);
            if (mountedRef.current) {
                setUser(null);
                setError('Failed to verify authentication');
            }
        } finally {
            if (mountedRef.current) {
                setLoading(false);
            }
        }
    }, [pathname, router, isPublicRoute, normalizeUser]);

    // Initialize on mount
    useEffect(() => {
        mountedRef.current = true;

        // Fast client hydration from local storage
        if (!initRef.current) {
            initRef.current = true;
            const cachedUser = sessionManager.getUser();
            if (cachedUser) {
                setUser(normalizeUser(cachedUser));
            }
        }

        return () => {
            mountedRef.current = false;
        };
    }, [normalizeUser]);

    // Run server check on mount and path changes
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    // ============================================
    // Auth Methods
    // ============================================

    const login = async (email: string, password: string): Promise<LoginResult> => {
        try {
            setError(null);
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include',
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, error: data.error || 'Login failed' };
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

            const userData = normalizeUser(data.user);
            setUser(userData);
            sessionManager.setUser(userData);

            // Store access token if provided (main auth is via HTTP-only cookies)
            if (data.accessToken) {
                sessionManager.setAccessToken(data.accessToken);
            }

            return { success: true, user: userData };
        } catch (err) {
            const errorMessage = 'Network error. Please try again.';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    const register = async (data: RegisterData): Promise<RegisterResult> => {
        try {
            setError(null);
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                return { success: false, error: result.error || 'Registration failed' };
            }

            // Store email for OTP verification
            sessionManager.setPendingEmail(data.email);

            return {
                success: true,
                message: result.message,
                userId: result.userId,
            };
        } catch (err) {
            const errorMessage = 'Network error. Please try again.';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    const verifyOTP = async (email: string, otp: string): Promise<VerifyResult> => {
        try {
            setError(null);
            const response = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
                credentials: 'include',
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, error: data.error || 'Verification failed' };
            }

            sessionManager.clearPendingEmail();

            const userData = normalizeUser(data.user);
            setUser(userData);
            sessionManager.setUser(userData);

            // Store tokens if provided
            if (data.accessToken) {
                sessionManager.setAccessToken(data.accessToken);
            }


            return { success: true, user: userData };
        } catch (err) {
            const errorMessage = 'Network error. Please try again.';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    const verifyMFA = async (tempToken: string, code: string): Promise<MFAResult> => {
        try {
            setError(null);
            const response = await fetch('/api/auth/mfa/verify-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tempToken, token: code }),
                credentials: 'include',
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, error: data.error || 'MFA verification failed' };
            }

            sessionManager.clearTempToken();

            const userData = normalizeUser(data.user);
            setUser(userData);
            sessionManager.setUser(userData);

            // Store tokens if provided
            if (data.accessToken) {
                sessionManager.setAccessToken(data.accessToken);
            }


            return { success: true, user: userData };
        } catch (err) {
            const errorMessage = 'Network error. Please try again.';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            setUser(null);
            sessionManager.clearSession();
            router.push('/login');
        }
    };

    const refreshUser = async () => {
        await checkAuth();
    };

    const forgotPassword = async (email: string) => {
        const response = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to send reset code');
        }

        sessionManager.setResetEmail(email);
    };

    const resetPassword = async (email: string, otp: string, newPassword: string) => {
        const response = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otpCode: otp, newPassword }),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to reset password');
        }

        sessionManager.clearResetEmail();
    };

    const resendOTP = async (email: string) => {
        const response = await fetch('/api/auth/resend-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to resend OTP');
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

// ============================================
// HOC for Protected Routes
// ============================================

export function withAuth<P extends object>(
    Component: React.ComponentType<P>,
    allowedRoles?: string[]
) {
    return function ProtectedComponent(props: P) {
        const { user, loading, isAuthenticated } = useAuth();
        const router = useRouter();

        useEffect(() => {
            if (!loading) {
                if (!isAuthenticated) {
                    router.push('/login');
                } else if (allowedRoles && user && !allowedRoles.includes(user.role)) {
                    router.push('/unauthorized');
                }
            }
        }, [loading, isAuthenticated, user, router]);

        if (loading) {
            return (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            );
        }

        if (!isAuthenticated) {
            return null;
        }

        if (allowedRoles && user && !allowedRoles.includes(user.role)) {
            return null;
        }

        return <Component {...props} />;
    };
}


