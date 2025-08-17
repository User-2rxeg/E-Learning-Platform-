// src/services/authApi.ts
import axios from 'axios';

const API_URL = '/api'; // Base URL for your API

const authApi = {
    register: async (userData: {
        fullName: string;
        email: string;
        password: string;
    }) => {
        const response = await axios.post(`${API_URL}/auth/register`, userData);
        return response.data;
    },

    login: async (email: string, password: string) => {
        const response = await axios.post(`${API_URL}/auth/login`, { email, password });
        return response.data;
    },

    verifyOtp: async (email: string, otpCode: string) => {
        const response = await axios.post(`${API_URL}/auth/verify-otp`, { email, otpCode });
        return response.data;
    },

    resendOtp: async (email: string) => {
        const response = await axios.post(`${API_URL}/auth/resend-otp`, { email });
        return response.data;
    },

    forgotPassword: async (email: string) => {
        const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
        return response.data;
    },

    resetPassword: async (email: string, otpCode: string, newPassword: string) => {
        const response = await axios.post(`${API_URL}/auth/reset-password`, {
            email, otpCode, newPassword
        });
        return response.data;
    },

    refreshToken: async (refreshToken: string) => {
        const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        return response.data;
    },

    logout: async (token: string) => {
        const response = await axios.post(`${API_URL}/auth/logout`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    getProfile: async (token: string) => {
        const response = await axios.get(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
};

export default authApi;