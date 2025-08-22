// src/lib/services/dashboardApi.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3334';

const dashboardApiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests automatically
dashboardApiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle errors globally
dashboardApiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/auth/login';
        }
        return Promise.reject(error);
    }
);

export const dashboardService = {
    // Student Dashboard
    getStudentDashboard: async (studentId: string) => {
        const response = await dashboardApiClient.get(`/analytics/student/${studentId}/summary`);
        return response.data;
    },

    getStudentCourses: async (studentId: string) => {
        const response = await dashboardApiClient.get(`/courses/enrolled`);
        return response.data;
    },

    getStudentQuizHistory: async (studentId: string) => {
        const response = await dashboardApiClient.get(`/quiz-attempts/my-attempts`);
        return response.data;
    },

    getStudentPerformance: async (studentId: string) => {
        const response = await dashboardApiClient.get(`/performance/student/${studentId}`);
        return response.data;
    },

    // Instructor Dashboard
    getInstructorDashboard: async (instructorId: string) => {
        const response = await dashboardApiClient.get(`/analytics/instructor/${instructorId}/dashboard`);
        return response.data;
    },

    getInstructorCourses: async () => {
        const response = await dashboardApiClient.get('/courses/instructor');
        return response.data;
    },

    getInstructorStudents: async (instructorId: string, courseId?: string) => {
        const params = courseId ? { courseId } : {};
        const response = await dashboardApiClient.get(`/analytics/instructor/${instructorId}/students`, { params });
        return response.data;
    },

    getCourseAnalytics: async (instructorId: string, courseId: string) => {
        const response = await dashboardApiClient.get(`/analytics/instructor/${instructorId}/course/${courseId}/report`);
        return response.data;
    },

    // Admin Dashboard
    getAdminStats: async () => {
        const [users, courses, audit] = await Promise.all([
            dashboardApiClient.get('/admin/users?limit=1'),
            dashboardApiClient.get('/admin/courses?limit=1'),
            dashboardApiClient.get('/audit?limit=1')
        ]);

        return {
            totalUsers: users.data.total || 0,
            totalCourses: courses.data.total || 0,
            recentActivity: audit.data.total || 0
        };
    },

    getSystemHealth: async () => {
        // This would typically come from a monitoring service
        return {
            cpuUsage: Math.round(Math.random() * 100),
            memoryUsage: Math.round(Math.random() * 100),
            diskUsage: Math.round(Math.random() * 100),
            activeConnections: Math.round(Math.random() * 500),
            apiResponseTime: Math.round(Math.random() * 500),
            errorRate: Math.random() * 10
        };
    },

    getUserGrowth: async (period: 'week' | 'month' | 'year' = 'month') => {
        const response = await dashboardApiClient.get('/admin/users', {
            params: { groupBy: period }
        });
        return response.data;
    },

    getPendingApprovals: async () => {
        const response = await dashboardApiClient.get('/admin/courses', {
            params: { status: 'draft' }
        });
        return response.data;
    }
};