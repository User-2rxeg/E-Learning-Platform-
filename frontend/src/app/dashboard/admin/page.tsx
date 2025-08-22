// src/app/dashboard/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { StatsCard } from '../../../components/dashboard/common/StatsCard';
import { SystemHealth } from '../../../components/dashboard/admin/SystemHealth';

import { BackupStatus } from '../../../components/dashboard/admin/BackupStatus';
import { CourseOversight } from '../../../components/dashboard/admin/CourseOversight';
import {AuditLogTable} from "../../../Components/dashboard/admin/AuditTable";
import {UserGrowthChart} from "../../../Components/dashboard/admin/UserGrowth";

// Icons
const UsersIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const ServerIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
    </svg>
);

const ShieldIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);

const DatabaseIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
    </svg>
);

export default function AdminDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState<any>({
        stats: {
            totalUsers: 0,
            activeUsers: 0,
            totalCourses: 0,
            serverUptime: 0,
            storageUsed: 0,
            securityAlerts: 0
        },
        systemHealth: {
            cpuUsage: 0,
            memoryUsage: 0,
            diskUsage: 0,
            activeConnections: 0,
            apiResponseTime: 0,
            errorRate: 0
        },
        userGrowth: [],
        recentAuditLogs: [],
        backupInfo: {
            lastBackup: null,
            nextScheduled: null,
            backupSize: 0,
            status: 'success'
        },
        pendingApprovals: []
    });

    useEffect(() => {
        fetchDashboardData();
        // Set up real-time monitoring
        const interval = setInterval(fetchSystemHealth, 30000); // Update every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            // Fetch admin dashboard data from multiple endpoints
            // const [stats, audit, backup] = await Promise.all([...]);

            // Mock data for now
            setTimeout(() => {
                setDashboardData({
                    stats: {
                        totalUsers: 1234,
                        activeUsers: 856,
                        totalCourses: 47,
                        serverUptime: 99.9,
                        storageUsed: 67,
                        securityAlerts: 2
                    },
                    systemHealth: {
                        cpuUsage: 45,
                        memoryUsage: 62,
                        diskUsage: 67,
                        activeConnections: 234,
                        apiResponseTime: 125,
                        errorRate: 0.2
                    },
                    userGrowth: [
                        { month: 'Jan', students: 450, instructors: 25, total: 475 },
                        { month: 'Feb', students: 520, instructors: 28, total: 548 },
                        { month: 'Mar', students: 610, instructors: 32, total: 642 },
                        { month: 'Apr', students: 750, instructors: 38, total: 788 },
                        { month: 'May', students: 890, instructors: 42, total: 932 },
                        { month: 'Jun', students: 1050, instructors: 48, total: 1098 }
                    ],
                    recentAuditLogs: [
                        {
                            id: 1,
                            user: 'john.doe@example.com',
                            action: 'LOGIN',
                            details: 'Successful login from IP 192.168.1.1',
                            timestamp: new Date(),
                            severity: 'info'
                        },
                        {
                            id: 2,
                            user: 'admin@platform.com',
                            action: 'USER_ROLE_CHANGE',
                            details: 'Changed user role from student to instructor',
                            timestamp: new Date(Date.now() - 1000 * 60 * 15),
                            severity: 'warning'
                        },
                        {
                            id: 3,
                            user: 'system',
                            action: 'BACKUP_COMPLETED',
                            details: 'Daily backup completed successfully',
                            timestamp: new Date(Date.now() - 1000 * 60 * 60),
                            severity: 'success'
                        },
                        {
                            id: 4,
                            user: 'unknown',
                            action: 'LOGIN_FAILED',
                            details: 'Multiple failed login attempts from IP 10.0.0.1',
                            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
                            severity: 'error'
                        }
                    ],
                    backupInfo: {
                        lastBackup: new Date(Date.now() - 1000 * 60 * 60 * 3),
                        nextScheduled: new Date(Date.now() + 1000 * 60 * 60 * 21),
                        backupSize: 2.4,
                        status: 'success'
                    },
                    pendingApprovals: [
                        { id: 1, type: 'course', title: 'New Course: AI Fundamentals', instructor: 'Dr. Smith', date: new Date() },
                        { id: 2, type: 'instructor', title: 'Instructor Application', name: 'Jane Wilson', date: new Date() }
                    ]
                });
                setLoading(false);
            }, 1000);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            setLoading(false);
        }
    };

    const fetchSystemHealth = async () => {
        // Fetch real-time system health metrics
        console.log('Updating system health...');
    };

    return (
        <div className="space-y-6">
            {/* Admin Header with Critical Alerts */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-8 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">System Administration</h1>
                        <p className="text-gray-300">
                            Platform Overview • {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    {dashboardData.stats.securityAlerts > 0 && (
                        <div className="px-4 py-2 bg-red-500/20 border border-red-500 rounded-lg animate-pulse">
                            <p className="text-red-400 font-medium">⚠️ {dashboardData.stats.securityAlerts} Security Alerts</p>
                        </div>
                    )}
                </div>

                {/* Quick Actions Bar */}
                <div className="mt-6 flex space-x-3">
                    <button
                        onClick={() => router.push('/dashboard/admin/users')}
                        className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20
              rounded-lg hover:bg-white/20 transition-all duration-200"
                    >
                        Manage Users
                    </button>
                    <button
                        onClick={() => router.push('/dashboard/admin/audit')}
                        className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20
              rounded-lg hover:bg-white/20 transition-all duration-200"
                    >
                        View Audit Logs
                    </button>
                    <button
                        onClick={() => router.push('/dashboard/admin/backup')}
                        className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20
              rounded-lg hover:bg-white/20 transition-all duration-200"
                    >
                        Backup Settings
                    </button>
                    <button
                        onClick={() => router.push('/dashboard/admin/settings')}
                        className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20
              rounded-lg hover:bg-white/20 transition-all duration-200"
                    >
                        System Settings
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Users"
                    value={dashboardData.stats.totalUsers}
                    change={8}
                    icon={<UsersIcon />}
                    color="blue"
                    loading={loading}
                />
                <StatsCard
                    title="Server Uptime"
                    value={`${dashboardData.stats.serverUptime}%`}
                    icon={<ServerIcon />}
                    color="green"
                    loading={loading}
                />
                <StatsCard
                    title="Security Status"
                    value={dashboardData.stats.securityAlerts === 0 ? 'Secure' : `${dashboardData.stats.securityAlerts} Alerts`}
                    icon={<ShieldIcon />}
                    color={dashboardData.stats.securityAlerts === 0 ? 'green' : 'red'}
                    loading={loading}
                />
                <StatsCard
                    title="Storage Used"
                    value={`${dashboardData.stats.storageUsed}%`}
                    icon={<DatabaseIcon />}
                    color="purple"
                    loading={loading}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - System & Users */}
                <div className="lg:col-span-2 space-y-6">
                    <SystemHealth health={dashboardData.systemHealth} loading={loading} />
                    <UserGrowthChart data={dashboardData.userGrowth} loading={loading} />
                    <AuditLogTable logs={dashboardData.recentAuditLogs} loading={loading} />
                </div>

                {/* Right Column - Backup & Approvals */}
                <div className="space-y-6">
                    <BackupStatus backup={dashboardData.backupInfo} loading={loading} />
                    <CourseOversight approvals={dashboardData.pendingApprovals} loading={loading} />

                    {/* Database Stats */}
                    <div className="bg-primary-light rounded-xl p-6 border border-gray-800">
                        <h3 className="text-lg font-semibold text-white mb-4">Database Statistics</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-text-secondary">Collections</span>
                                <span className="text-white font-medium">12</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary">Documents</span>
                                <span className="text-white font-medium">45,678</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary">Indexes</span>
                                <span className="text-white font-medium">34</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-secondary">Size</span>
                                <span className="text-white font-medium">2.4 GB</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}