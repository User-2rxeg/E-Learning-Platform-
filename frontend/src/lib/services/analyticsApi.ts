// src/lib/services/analyticsApi.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3334';

const analyticsApiClient = axios.create({
    baseURL: `${API_URL}/analytics`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
analyticsApiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const analyticsService = {
    // Student Analytics
    getStudentSummary: async (studentId: string) => {
        const response = await analyticsApiClient.get(`/student/${studentId}/summary`);
        return response.data;
    },

    exportStudentSummary: async (studentId: string, format: 'json' | 'csv' = 'json') => {
        const response = await analyticsApiClient.get(`/student/${studentId}/summary/export`, {
            params: { format }
        });
        return response.data;
    },

    // Instructor Analytics
    getInstructorDashboard: async (instructorId: string) => {
        const response = await analyticsApiClient.get(`/instructor/${instructorId}/dashboard`);
        return response.data;
    },

    getCourseReport: async (instructorId: string, courseId: string) => {
        const response = await analyticsApiClient.get(`/instructor/${instructorId}/course/${courseId}/report`);
        return response.data;
    },

    exportCourseReport: async (instructorId: string, courseId: string, format: 'json' | 'csv' = 'json') => {
        const response = await analyticsApiClient.get(`/instructor/${instructorId}/course/${courseId}/report/export`, {
            params: { format }
        });
        return response.data;
    },

    // Performance Metrics
    getPerformanceMetrics: async (userId: string, period: 'day' | 'week' | 'month' | 'year' = 'month') => {
        const response = await analyticsApiClient.get(`/performance/${userId}`, {
            params: { period }
        });
        return response.data;
    },

    // Engagement Analytics
    getEngagementMetrics: async (courseId: string) => {
        const response = await analyticsApiClient.get(`/engagement/course/${courseId}`);
        return response.data;
    },

    // Real-time Analytics
    getRealtimeStats: async () => {
        const response = await analyticsApiClient.get('/realtime');
        return response.data;
    }
};