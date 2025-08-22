import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3334';

const notificationApiClient = axios.create({
    baseURL: `${API_URL}/notifications`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
notificationApiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const notificationService = {
    // Get notifications
    getNotifications: async (page = 1, limit = 20) => {
        const response = await notificationApiClient.get('/', {
            params: { page, limit }
        });
        return response.data;
    },

    // Mark as read
    markAsRead: async (notificationId: string) => {
        const response = await notificationApiClient.patch(`/${notificationId}/read`);
        return response.data;
    },

    // Mark all as read
    markAllAsRead: async () => {
        const response = await notificationApiClient.patch('/mark-all-read');
        return response.data;
    },

    // Delete notification
    deleteNotification: async (notificationId: string) => {
        const response = await notificationApiClient.delete(`/${notificationId}`);
        return response.data;
    },

    // Create notification (admin/instructor only)
    createNotification: async (data: {
        recipientId?: string;
        type: string;
        message: string;
        courseId?: string;
    }) => {
        const response = await notificationApiClient.post('/', data);
        return response.data;
    },

    // Get unread count
    getUnreadCount: async () => {
        const response = await notificationApiClient.get('/unread-count');
        return response.data;
    },

    // Get notification preferences
    getPreferences: async () => {
        const response = await notificationApiClient.get('/preferences');
        return response.data;
    },

    // Update notification preferences
    updatePreferences: async (preferences: {
        email?: boolean;
        push?: boolean;
        sms?: boolean;
        types?: string[];
    }) => {
        const response = await notificationApiClient.put('/preferences', preferences);
        return response.data;
    }
};
