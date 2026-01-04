'use client';
import { useState, useEffect } from 'react';
import {
    FileText,
    Search,
    Filter,
    Download,
    RefreshCw,
    Calendar,
    User,
    Shield,
    Clock,
    AlertTriangle,
    CheckCircle,
    Info,
    XCircle,
    Eye,
    ChevronLeft,
    ChevronRight,
    MoreVertical,
    Activity,
    Database,
    Lock,
    Unlock,
    Settings,
    Users,
    BookOpen,
    MessageSquare,
    X
} from 'lucide-react';
import { useAuth } from "../../../../contexts/AuthContext";
import { adminService } from "../../../../lib/services/admin-api";

interface AuditLog {
    _id: string;
    userId?: string;
    userEmail?: string;
    userName?: string;
    action: string;
    resource: string;
    resourceId?: string;
    details?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    timestamp: string;
    level: 'info' | 'warning' | 'error' | 'success';
    category: string;
}

interface LogStats {
    total: number;
    today: number;
    thisWeek: number;
    byLevel: Record<string, number>;
    byCategory: Record<string, number>;
}

export default function AdminLogs() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [stats, setStats] = useState<LogStats | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [levelFilter, setLevelFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [dateFromFilter, setDateFromFilter] = useState('');
    const [dateToFilter, setDateToFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
    const [showLogModal, setShowLogModal] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(false);

    const logLevels = ['info', 'warning', 'error', 'success'];
    const logCategories = [
        'authentication',
        'authorization',
        'user_management',
        'course_management',
        'system',
        'security',
        'data_access',
        'configuration',
        'backup',
        'api'
    ];

    useEffect(() => {
        fetchLogs();
        fetchLogStats();
    }, [currentPage, searchQuery, levelFilter, categoryFilter, dateFromFilter, dateToFilter]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (autoRefresh) {
            interval = setInterval(fetchLogs, 30000); // Refresh every 30 seconds
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [autoRefresh, currentPage, searchQuery, levelFilter, categoryFilter, dateFromFilter, dateToFilter]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            // Mock API call - replace with actual service
            const response = await mockFetchLogs({
                q: searchQuery,
                level: levelFilter,
                category: categoryFilter,
                dateFrom: dateFromFilter,
                dateTo: dateToFilter,
                page: currentPage,
                limit: 50
            });
            setLogs(response.items);
            setTotalPages(response.pages);
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLogStats = async () => {
        try {
            // Mock API call - replace with actual service
            const statsData = await mockFetchLogStats();
            setStats(statsData);
        } catch (error) {
            console.error('Error fetching log stats:', error);
        }
    };

    // Mock functions - replace with actual API calls
    const mockFetchLogs = async (filters: any) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const mockLogs: AuditLog[] = [
            {
                _id: '1',
                userId: 'user123',
                userEmail: 'john.doe@example.com',
                userName: 'John Doe',
                action: 'login',
                resource: 'authentication',
                details: { method: 'email', success: true },
                ipAddress: '192.168.1.100',
                userAgent: 'Mozilla/5.0...',
                timestamp: new Date().toISOString(),
                level: 'success',
                category: 'authentication'
            },
            {
                _id: '2',
                userId: 'admin456',
                userEmail: 'admin@example.com',
                userName: 'admin user',
                action: 'create_user',
                resource: 'users',
                resourceId: 'user789',
                details: { newUserEmail: 'newuser@example.com', role: 'student' },
                ipAddress: '10.0.0.50',
                timestamp: new Date(Date.now() - 300000).toISOString(),
                level: 'info',
                category: 'user_management'
            },
            {
                _id: '3',
                userId: 'user456',
                userEmail: 'jane@example.com',
                userName: 'Jane Smith',
                action: 'failed_login',
                resource: 'authentication',
                details: { reason: 'invalid_password', attempts: 3 },
                ipAddress: '203.0.113.10',
                timestamp: new Date(Date.now() - 600000).toISOString(),
                level: 'warning',
                category: 'security'
            }
        ];

        return {
            items: mockLogs.filter(log => {
                if (filters.level && log.level !== filters.level) return false;
                if (filters.category && log.category !== filters.category) return false;
                if (filters.q && !log.action.toLowerCase().includes(filters.q.toLowerCase()) &&
                    !log.userEmail?.toLowerCase().includes(filters.q.toLowerCase())) return false;
                return true;
            }),
            pages: 1
        };
    };

    const mockFetchLogStats = async () => {
        return {
            total: 1247,
            today: 89,
            thisWeek: 456,
            byLevel: {
                info: 745,
                success: 312,
                warning: 134,
                error: 56
            },
            byCategory: {
                authentication: 423,
                user_management: 187,
                security: 156,
                system: 134,
                course_management: 98
            }
        };
    };

    const handleExportLogs = async () => {
        try {
            // Mock export functionality
            const csvData = logs.map(log => ({
                timestamp: log.timestamp,
                user: log.userEmail || 'System',
                action: log.action,
                resource: log.resource,
                level: log.level,
                ipAddress: log.ipAddress
            }));

            const csv = [
                ['Timestamp', 'User', 'Action', 'Resource', 'Level', 'IP Address'],
                ...csvData.map(row => Object.values(row))
            ].map(row => row.join(',')).join('\n');

            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting logs:', error);
            alert('Failed to export logs');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'error':
                return 'bg-red-100 text-red-800';
            case 'warning':
                return 'bg-yellow-100 text-yellow-800';
            case 'success':
                return 'bg-green-100 text-green-800';
            case 'info':
            default:
                return 'bg-blue-100 text-blue-800';
        }
    };

    const getLevelIcon = (level: string) => {
        switch (level) {
            case 'error':
                return <XCircle className="w-4 h-4" />;
            case 'warning':
                return <AlertTriangle className="w-4 h-4" />;
            case 'success':
                return <CheckCircle className="w-4 h-4" />;
            case 'info':
            default:
                return <Info className="w-4 h-4" />;
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'authentication':
                return <Shield className="w-4 h-4" />;
            case 'user_management':
                return <Users className="w-4 h-4" />;
            case 'course_management':
                return <BookOpen className="w-4 h-4" />;
            case 'security':
                return <Lock className="w-4 h-4" />;
            case 'system':
                return <Settings className="w-4 h-4" />;
            case 'data_access':
                return <Database className="w-4 h-4" />;
            default:
                return <Activity className="w-4 h-4" />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <FileText className="w-6 h-6 text-blue-600 mr-2" />
                            <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={autoRefresh}
                                    onChange={(e) => setAutoRefresh(e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 mr-2"
                                />
                                <span className="text-sm text-gray-700">Auto-refresh</span>
                            </label>
                            <button
                                onClick={fetchLogs}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Refresh
                            </button>
                            <button
                                onClick={handleExportLogs}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Export
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Overview */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Logs</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total.toLocaleString()}</p>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <FileText className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Today</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.today}</p>
                                </div>
                                <div className="p-3 bg-green-50 rounded-lg">
                                    <Calendar className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">This Week</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.thisWeek}</p>
                                </div>
                                <div className="p-3 bg-purple-50 rounded-lg">
                                    <Clock className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Errors</p>
                                    <p className="text-3xl font-bold text-red-600 mt-1">{stats.byLevel.error}</p>
                                </div>
                                <div className="p-3 bg-red-50 rounded-lg">
                                    <AlertTriangle className="w-6 h-6 text-red-600" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                        <div className="lg:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search logs..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full"
                                />
                            </div>
                        </div>

                        <select
                            value={levelFilter}
                            onChange={(e) => setLevelFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg"
                        >
                            <option value="">All Levels</option>
                            {logLevels.map(level => (
                                <option key={level} value={level}>
                                    {level.charAt(0).toUpperCase() + level.slice(1)}
                                </option>
                            ))}
                        </select>

                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg"
                        >
                            <option value="">All Categories</option>
                            {logCategories.map(category => (
                                <option key={category} value={category}>
                                    {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </option>
                            ))}
                        </select>

                        <input
                            type="date"
                            value={dateFromFilter}
                            onChange={(e) => setDateFromFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg"
                            placeholder="From Date"
                        />

                        <input
                            type="date"
                            value={dateToFilter}
                            onChange={(e) => setDateToFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg"
                            placeholder="To Date"
                        />
                    </div>

                    {(searchQuery || levelFilter || categoryFilter || dateFromFilter || dateToFilter) && (
                        <div className="mt-4 flex items-center gap-2">
                            <span className="text-sm text-gray-600">Active filters:</span>
                            {searchQuery && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                    Search: {searchQuery}
                                </span>
                            )}
                            {levelFilter && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                    Level: {levelFilter}
                                </span>
                            )}
                            {categoryFilter && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                    Category: {categoryFilter}
                                </span>
                            )}
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setLevelFilter('');
                                    setCategoryFilter('');
                                    setDateFromFilter('');
                                    setDateToFilter('');
                                }}
                                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200"
                            >
                                Clear all
                            </button>
                        </div>
                    )}
                </div>

                {/* Logs Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Loading logs...</p>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="p-8 text-center">
                            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No logs found</h3>
                            <p className="text-gray-500">No audit logs match your current filters.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Timestamp
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Action
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Resource
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Level
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        IP Address
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Actions
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {logs.map((log) => (
                                    <tr key={log._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatDate(log.timestamp)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3">
                                                    {log.userName?.charAt(0) || log.userEmail?.charAt(0) || 'S'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {log.userName || 'System'}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{log.userEmail}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {getCategoryIcon(log.category)}
                                                <span className="ml-2 text-sm text-gray-900">
                                                        {log.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                    </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {log.resource}
                                            {log.resourceId && (
                                                <span className="text-gray-500">:{log.resourceId.slice(-8)}</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelColor(log.level)}`}>
                                                    {getLevelIcon(log.level)}
                                                    <span className="ml-1 capitalize">{log.level}</span>
                                                </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                            {log.ipAddress || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <button
                                                onClick={() => {
                                                    setSelectedLog(log);
                                                    setShowLogModal(true);
                                                }}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                            <p className="text-sm text-gray-700">
                                Showing page {currentPage} of {totalPages}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Log Detail Modal */}
            {showLogModal && selectedLog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Log Details</h3>
                            <button
                                onClick={() => setShowLogModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Timestamp</label>
                                <p className="text-gray-900">{formatDate(selectedLog.timestamp)}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelColor(selectedLog.level)}`}>
                                    {getLevelIcon(selectedLog.level)}
                                    <span className="ml-1 capitalize">{selectedLog.level}</span>
                                </span>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">User</label>
                                <p className="text-gray-900">{selectedLog.userName || 'System'}</p>
                                {selectedLog.userEmail && (
                                    <p className="text-sm text-gray-500">{selectedLog.userEmail}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                <div className="flex items-center">
                                    {getCategoryIcon(selectedLog.category)}
                                    <span className="ml-2 text-gray-900 capitalize">
                                        {selectedLog.category.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
                                <p className="text-gray-900">
                                    {selectedLog.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Resource</label>
                                <p className="text-gray-900">{selectedLog.resource}</p>
                                {selectedLog.resourceId && (
                                    <p className="text-sm text-gray-500 font-mono">ID: {selectedLog.resourceId}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">IP Address</label>
                                <p className="text-gray-900 font-mono">{selectedLog.ipAddress || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">User Agent</label>
                                <p className="text-gray-900 text-sm break-all">
                                    {selectedLog.userAgent || 'N/A'}
                                </p>
                            </div>
                        </div>

                        {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Details</label>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <pre className="text-sm text-gray-900 whitespace-pre-wrap">
                                        {JSON.stringify(selectedLog.details, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end mt-6">
                            <button
                                onClick={() => setShowLogModal(false)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
