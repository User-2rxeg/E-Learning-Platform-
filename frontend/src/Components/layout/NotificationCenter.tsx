// src/components/dashboard/NotificationCenter.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const BellIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);

interface Notification {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    read: boolean;
    timestamp: Date;
}

function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'just now';
}

export default function NotificationCenter() {
    const { user, token } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user && token) {
            fetchNotifications();
            // Set up WebSocket for real-time notifications
            // setupWebSocket();
        }
    }, [user, token]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            // const response = await notificationApi.getNotifications();
            // setNotifications(response.data);

            // Mock data
            const mockNotifications: Notification[] = [
                {
                    id: '1',
                    type: 'info',
                    title: 'New Course Available',
                    message: 'Check out the new React Advanced course',
                    read: false,
                    timestamp: new Date(Date.now() - 1000 * 60 * 5)
                },
                {
                    id: '2',
                    type: 'success',
                    title: 'Assignment Graded',
                    message: 'Your assignment has been graded: 95/100',
                    read: false,
                    timestamp: new Date(Date.now() - 1000 * 60 * 30)
                },
                {
                    id: '3',
                    type: 'warning',
                    title: 'Deadline Approaching',
                    message: 'Quiz due in 2 days',
                    read: true,
                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2)
                }
            ];

            setNotifications(mockNotifications);
            setUnreadCount(mockNotifications.filter(n => !n.read).length);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId: string) => {
        try {
            // await notificationApi.markAsRead(notificationId);
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            // await notificationApi.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const typeStyles = {
        info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        success: 'bg-green-500/10 text-green-400 border-green-500/20',
        warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        error: 'bg-red-500/10 text-red-400 border-red-500/20'
    };

    return (
        <div className="relative">
            {/* Notification Bell */}
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative p-2 rounded-lg hover:bg-primary transition-colors"
            >
                <BellIcon />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full
            flex items-center justify-center text-xs text-white animate-pulse">
            {unreadCount}
          </span>
                )}
            </button>

            {/* Dropdown */}
            {showDropdown && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowDropdown(false)}
                    />

                    {/* Notification Panel */}
                    <div className="absolute right-0 mt-2 w-96 bg-primary-light rounded-xl
            shadow-2xl border border-gray-800 z-50 max-h-[500px] overflow-hidden">

                        {/* Header */}
                        <div className="p-4 border-b border-gray-800">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-white">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-xs text-accent hover:text-accent-hover"
                                    >
                                        Mark all as read
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Notifications List */}
                        <div className="overflow-y-auto max-h-[400px] custom-scrollbar">
                            {loading ? (
                                <div className="p-4">
                                    <div className="space-y-3">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="animate-pulse">
                                                <div className="h-4 bg-primary w-3/4 rounded mb-2"></div>
                                                <div className="h-3 bg-primary w-1/2 rounded"></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="p-8 text-center">
                                    <p className="text-text-secondary">No notifications</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-800">
                                    {notifications.map(notification => (
                                        <div
                                            key={notification.id}
                                            className={`p-4 hover:bg-primary/50 transition-colors cursor-pointer
                        ${!notification.read ? 'bg-primary/30' : ''}`}
                                            onClick={() => markAsRead(notification.id)}
                                        >
                                            <div className="flex items-start space-x-3">
                                                <div className={`p-2 rounded-lg ${typeStyles[notification.type]}`}>
                                                    <div className="w-2 h-2 rounded-full bg-current"></div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white font-medium text-sm">
                                                        {notification.title}
                                                    </p>
                                                    <p className="text-text-secondary text-sm mt-1">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-text-secondary text-xs mt-2">
                                                        {formatTimeAgo(notification.timestamp)}
                                                    </p>
                                                </div>
                                                {!notification.read && (
                                                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-3 border-t border-gray-800">
                            <button
                                onClick={() => {
                                    setShowDropdown(false);
                                    // Navigate to all notifications page
                                }}
                                className="w-full text-center text-accent hover:text-accent-hover text-sm"
                            >
                                View all notifications →
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
