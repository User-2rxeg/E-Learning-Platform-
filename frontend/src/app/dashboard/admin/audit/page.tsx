// src/app/dashboard/admin/audit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '../../../../components/dashboard/common/DataTable';

interface AuditLog {
    id: string;
    user: string;
    action: string;
    resource: string;
    details: string;
    ipAddress: string;
    timestamp: Date;
    severity: 'info' | 'warning' | 'error' | 'critical';
}

export default function AdminAuditPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    useEffect(() => {
        fetchAuditLogs();
    }, [filter, dateRange]);

    const fetchAuditLogs = async () => {
        try {
            setLoading(true);
            // const response = await auditService.getLogs({ filter, dateRange });

            // Mock data
            setLogs([
                {
                    id: '1',
                    user: 'admin@platform.com',
                    action: 'USER_ROLE_CHANGE',
                    resource: 'User:123',
                    details: 'Changed role from student to instructor',
                    ipAddress: '192.168.1.1',
                    timestamp: new Date(),
                    severity: 'warning'
                },
                {
                    id: '2',
                    user: 'john.doe@example.com',
                    action: 'LOGIN',
                    resource: 'Auth',
                    details: 'Successful login',
                    ipAddress: '10.0.0.1',
                    timestamp: new Date(Date.now() - 1000 * 60 * 30),
                    severity: 'info'
                },
                {
                    id: '3',
                    user: 'system',
                    action: 'BACKUP_COMPLETED',
                    resource: 'Database',
                    details: 'Daily backup completed successfully',
                    ipAddress: 'localhost',
                    timestamp: new Date(Date.now() - 1000 * 60 * 60),
                    severity: 'info'
                },
                {
                    id: '4',
                    user: 'unknown',
                    action: 'LOGIN_FAILED',
                    resource: 'Auth',
                    details: 'Multiple failed login attempts',
                    ipAddress: '203.0.113.0',
                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
                    severity: 'error'
                },
                {
                    id: '5',
                    user: 'admin@platform.com',
                    action: 'COURSE_DELETED',
                    resource: 'Course:456',
                    details: 'Permanently deleted course',
                    ipAddress: '192.168.1.1',
                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
                    severity: 'critical'
                }
            ]);
        } catch (error) {
            console.error('Failed to fetch audit logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        // Export audit logs to CSV
        console.log('Exporting audit logs...');
    };

    const columns = [
        {
            key: 'timestamp' as keyof AuditLog,
            label: 'Time',
            sortable: true,
            render: (value: Date) => (
                <div className="text-sm">
                    <p className="text-white">{new Date(value).toLocaleTimeString()}</p>
                    <p className="text-text-secondary text-xs">{new Date(value).toLocaleDateString()}</p>
                </div>
            )
        },
        {
            key: 'user' as keyof AuditLog,
            label: 'User',
            sortable: true,
            render: (value: string) => (
                <span className="text-white text-sm truncate max-w-[150px]" title={value}>
          {value}
        </span>
            )
        },
        {
            key: 'action' as keyof AuditLog,
            label: 'Action',
            sortable: true,
            render: (value: string) => (
                <span className="text-white font-medium text-sm">{value}</span>
            )
        },
        {
            key: 'resource' as keyof AuditLog,
            label: 'Resource',
            render: (value: string) => (
                <span className="text-text-secondary text-sm">{value}</span>
            )
        },
        {
            key: 'details' as keyof AuditLog,
            label: 'Details',
            render: (value: string) => (
                <span className="text-text-secondary text-sm truncate max-w-[200px]" title={value}>
          {value}
        </span>
            )
        },
        {
            key: 'ipAddress' as keyof AuditLog,
            label: 'IP Address',
            render: (value: string) => (
                <span className="text-text-secondary text-xs font-mono">{value}</span>
            )
        },
        {
            key: 'severity' as keyof AuditLog,
            label: 'Severity',
            sortable: true,
            render: (value: string) => {
                const severityStyles = {
                    info: 'bg-blue-500/10 text-blue-400',
                    warning: 'bg-yellow-500/10 text-yellow-400',
                    error: 'bg-red-500/10 text-red-400',
                    critical: 'bg-red-600/20 text-red-300 font-bold'
                };
                return (
                    <span className={`px-2 py-1 rounded-full text-xs ${severityStyles[value as keyof typeof severityStyles]}`}>
            {value}
          </span>
                );
            }
        }
    ];

    const severityCounts = {
        info: logs.filter(l => l.severity === 'info').length,
        warning: logs.filter(l => l.severity === 'warning').length,
        error: logs.filter(l => l.severity === 'error').length,
        critical: logs.filter(l => l.severity === 'critical').length
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
                    <p className="text-text-secondary mt-1">System activity and security events</p>
                </div>
                <button
                    onClick={handleExport}
                    className="px-6 py-3 bg-accent hover:bg-accent-hover text-white font-medium
            rounded-lg transition-colors"
                >
                    Export Logs
                </button>
            </div>

            {/* Severity Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <p className="text-blue-400 text-sm">Info</p>
                    <p className="text-2xl font-bold text-white mt-1">{severityCounts.info}</p>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                    <p className="text-yellow-400 text-sm">Warning</p>
                    <p className="text-2xl font-bold text-white mt-1">{severityCounts.warning}</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <p className="text-red-400 text-sm">Error</p>
                    <p className="text-2xl font-bold text-white mt-1">{severityCounts.error}</p>
                </div>
                <div className="bg-red-600/20 border border-red-600/30 rounded-lg p-4">
                    <p className="text-red-300 text-sm">Critical</p>
                    <p className="text-2xl font-bold text-white mt-1">{severityCounts.critical}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex space-x-4 items-end">
                <div className="flex-1 max-w-xs">
                    <label className="block text-sm text-text-secondary mb-1">Filter by Severity</label>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full px-4 py-2 bg-primary-light border border-gray-700 rounded-lg text-white"
                    >
                        <option value="all">All Events</option>
                        <option value="info">Info</option>
                        <option value="warning">Warning</option>
                        <option value="error">Error</option>
                        <option value="critical">Critical</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm text-text-secondary mb-1">Start Date</label>
                    <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        className="px-4 py-2 bg-primary-light border border-gray-700 rounded-lg text-white"
                    />
                </div>
                <div>
                    <label className="block text-sm text-text-secondary mb-1">End Date</label>
                    <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        className="px-4 py-2 bg-primary-light border border-gray-700 rounded-lg text-white"
                    />
                </div>
                <button
                    onClick={fetchAuditLogs}
                    className="px-4 py-2 bg-primary hover:bg-primary/50 text-text-secondary
            hover:text-white border border-gray-700 rounded-lg transition-colors"
                >
                    Apply Filters
                </button>
            </div>

            {/* Audit Logs Table */}
            <DataTable
                data={logs}
                columns={columns}
                loading={loading}
                emptyMessage="No audit logs found"
            />

            {/* Quick Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-800">
                <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-primary rounded-lg text-xs text-text-secondary
            hover:text-white transition-colors">
                        Clear Old Logs
                    </button>
                    <button className="px-3 py-1 bg-primary rounded-lg text-xs text-text-secondary
            hover:text-white transition-colors">
                        Archive Logs
                    </button>
                </div>
                <p className="text-text-secondary text-sm">
                    Showing {logs.length} events
                </p>
            </div>
        </div>
    );
}

// Helper function
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