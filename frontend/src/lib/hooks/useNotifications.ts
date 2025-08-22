// src/lib/hooks/useNotifications.ts
import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/notificationApi';
import { useRealtime } from './useRealtime';

interface Notification {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    read: boolean;
    timestamp: Date;
}

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const { on, off } = useRealtime({ namespace: '/ws' });

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await notificationService.getNotifications();
            setNotifications(response.data || []);
            setUnreadCount(response.unreadCount || 0);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, []);

    const markAsRead = useCallback(async (notificationId: string) => {
        try {
            await notificationService.markAsRead(notificationId);
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    }, []);

    const deleteNotification = useCallback(async (notificationId: string) => {
        try {
            await notificationService.deleteNotification(notificationId);
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            const notification = notifications.find(n => n.id === notificationId);
            if (notification && !notification.read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error('Failed to delete notification:', err);
        }
    }, [notifications]);

    // Listen for real-time notifications
    useEffect(() => {
        const handleNewNotification = (notification: Notification) => {
            setNotifications(prev => [notification, ...prev]);
            if (!notification.read) {
                setUnreadCount(prev => prev + 1);
            }
        };

        on('notification', handleNewNotification);

        return () => {
            off('notification', handleNewNotification);
        };
    }, [on, off]);

    // Fetch notifications on mount
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    return {
        notifications,
        unreadCount,
        loading,
        error,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refresh: fetchNotifications
    };
}
