
import apiClient from './api-client';

export type NotificationType =
    | 'announcement'
    | 'courseUpdate'
    | 'assignmentDue'
    | 'newMessage'
    | 'enrollment'
    | 'systemAlert'
    | 'quizResult';

export interface Notification {
    _id: string;
    recipientId: string;
    type: NotificationType;
    message: string;
    courseId?: string;
    read: boolean;
    sentBy?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface NotificationListResponse {
    notifications: Notification[];
    total: number;
    page: number;
    pages: number;
    unreadCount: number;
}

class NotificationService {
    // Get current user's notifications
    async getMyNotifications(
        page: number = 1,
        limit: number = 20,
        unreadOnly: boolean = false
    ): Promise<NotificationListResponse> {
        const queryParams = new URLSearchParams();
        queryParams.append('page', page.toString());
        queryParams.append('limit', limit.toString());
        if (unreadOnly) queryParams.append('unreadOnly', 'true');

        const response = await apiClient.get(`/notifications?${queryParams.toString()}`);
        return response.data;
    }

    // Mark a notification as read
    async markAsRead(notificationId: string): Promise<void> {
        await apiClient.patch(`/notifications/${notificationId}/read`);
    }

    // Mark all notifications as read
    async markAllAsRead(): Promise<void> {
        await apiClient.patch('/notifications/read-all');
    }

    // Delete a notification
    async deleteNotification(notificationId: string): Promise<void> {
        await apiClient.delete(`/notifications/${notificationId}`);
    }

    // Admin: Send platform-wide announcement
    async announceToAll(message: string): Promise<void> {
        await apiClient.post('/notifications/announce/all', { message });
    }

    // Admin: Send announcement to a specific role
    async announceToRole(role: string, message: string): Promise<void> {
        await apiClient.post(`/notifications/announce/role/${role}`, { message });
    }

    // Instructor: Send notification to course students
    async notifyCourseStudents(courseId: string, message: string): Promise<void> {
        await apiClient.post(`/notifications/course/${courseId}`, { message });
    }
}

export const notificationService = new NotificationService();

