// src/contexts/AuthContext.tsx
'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    fullName: string;
    email: string;
    role: 'student' | 'instructor' | 'admin';
    isProfileComplete: boolean;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
    register: (data: RegisterData) => Promise<any>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    verifyOtp: (email: string, otp: string) => Promise<{ token: string; user: any }>;
    resendOtp: (email: string) => Promise<void>;
    isAuthenticated: boolean;
    setToken: (token: string | null) => void; // Add this
    setUser: (user: User | null) => void;
}

interface RegisterData {
    fullName: string;
    email: string;
    password: string;
    role: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Initialize auth state from localStorage on component mount
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));

            // Set authorization header for all future requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }

        setIsLoading(false);
    }, []);

    const register = async (data: RegisterData) => {
        try {
            // Map fullName to name for the backend
            const backendData = {
                name: data.fullName, // Map fullName to name
                email: data.email,
                password: data.password,
                role: data.role
            };

            const response = await axios.post('/api/auth/register', backendData);
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    const verifyOtp = async (email: string, otp: string) => {
        try {
            const response = await axios.post('/api/auth/verify-otp', { email, otp });
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    const resendOtp = async (email: string) => {
        try {
            const response = await axios.post('/api/auth/resend-otp', { email });
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.post('/api/auth/login', { email, password });
            const { token: authToken, user: userData } = response.data;

            // Store token and user data
            localStorage.setItem('token', authToken);
            localStorage.setItem('user', JSON.stringify(userData));

            // Update state
            setToken(authToken);
            setUser(userData);

            // Set authorization header for all future requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

            // Redirect based on role and profile completion
            // Check if isProfileComplete exists and is true
            if (userData.isProfileComplete === true) {
                router.push(`/dashboard/${userData.role}`);
            } else {
                // Default to profile setup if undefined or false
                router.push('/auth/profile-setup');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        // Remove token and user data from storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Reset state
        setToken(null);
        setUser(null);

        // Remove authorization header
        delete axios.defaults.headers.common['Authorization'];

        // Redirect to login page
        router.push('/auth/login');
    };

    const value = {
        user,
        token,
        isLoading,
        error,
        register,
        login,
        logout,
        verifyOtp,
        resendOtp,
        setToken,  // Add this
        setUser,
        isAuthenticated: !!token
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};