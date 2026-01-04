'use client';
import { useState, useEffect } from 'react';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Users,
    BookOpen,
    Activity,
    Shield,
    AlertTriangle,
    CheckCircle,
    Clock,
    Calendar,
    Download,
    RefreshCw,
    Eye,
    Filter,
    Search,
    ChevronDown,
    ChevronUp,
    PieChart,
    LineChart,
    Database,
    Server,
    Cpu,
    HardDrive,
    Wifi,
    Globe,
    Zap,
    Target,
    Award,
    MessageSquare,
    Bell,
    UserCheck,
    UserX,
    Lock,
    Unlock
} from 'lucide-react';
import { adminService } from "../../../../services";
import {useAuth} from "../../../../contexts/AuthContext";


interface AnalyticsData {
    users: {
        total: number;
        byRole: Record<string, number>;
        verified: number;
        unverified: number;
        verifiedPercent: number;
        mfaEnabled: number;
        mfaEnabledPercent: number;
        newRegistrations24h: number;
    };
    notifications: {
        unreadTotal: number;
    };
    security: {
        failedLogins24h: number;
        unauthorizedAccess24h: number;
        tokenBlacklisted24h: number;
        loginSuccess24h: number;
        passwordResetRequests24h: number;
        activeUsers7d: number;
    };
    generatedAt: string;
}

interface SecurityEvent {
    _id: string;
    event: string;
    userId?: string;
    timestamp: string;
    details: Record<string, any>;
}

export default function AdminAnalytics() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
    const [selectedMetric, setSelectedMetric] = useState<string>('overview');
    const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchAnalyticsData();
    }, [timeRange]);

    const fetchAnalyticsData = async () => {
        try {
            setLoading(true);
            const [metricsData, securityData, auditData] = await Promise.all([
                adminService.getMetrics(),
                adminService.getSecurityOverview({ limit: 50 }),
                adminService.getAuditLogs({ page: 1, limit: 20 })
            ]);

            setAnalyticsData(metricsData);
            setSecurityEvents(securityData.items || []);
            setAuditLogs(auditData.items || []);
        } catch (error) {
            console.error('Error fetching analytics data:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleCardExpansion = (cardId: string) => {
        const newExpanded = new Set(expandedCards);
        if (newExpanded.has(cardId)) {
            newExpanded.delete(cardId);
        } else {
            newExpanded.add(cardId);
        }
        setExpandedCards(newExpanded);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getEventIcon = (event: string) => {
        switch (event) {
            case 'LOGIN_SUCCESS':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'LOGIN_FAILED':
                return <AlertTriangle className="w-4 h-4 text-red-600" />;
            case 'UNAUTHORIZED_ACCESS':
                return <Shield className="w-4 h-4 text-orange-600" />;
            case 'MFA_ENABLED':
                return <Lock className="w-4 h-4 text-blue-600" />;
            case 'MFA_DISABLED':
                return <Unlock className="w-4 h-4 text-gray-600" />;
            default:
                return <Activity className="w-4 h-4 text-gray-600" />;
        }
    };

    const getEventColor = (event: string) => {
        switch (event) {
            case 'LOGIN_SUCCESS':
                return 'text-green-600 bg-green-50';
            case 'LOGIN_FAILED':
                return 'text-red-600 bg-red-50';
            case 'UNAUTHORIZED_ACCESS':
                return 'text-orange-600 bg-orange-50';
            case 'MFA_ENABLED':
                return 'text-blue-600 bg-blue-50';
            case 'MFA_DISABLED':
                return 'text-gray-600 bg-gray-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <BarChart3 className="w-6 h-6 text-blue-600 mr-2" />
                            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <select
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value as any)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            >
                                <option value="24h">Last 24 Hours</option>
                                <option value="7d">Last 7 Days</option>
                                <option value="30d">Last 30 Days</option>
                            </select>
                            <button
                                onClick={fetchAnalyticsData}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Key Metrics Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Users</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">
                                    {analyticsData?.users.total || 0}
                                </p>
                                <p className="text-xs text-green-600 mt-2">
                                    +{analyticsData?.users.newRegistrations24h || 0} new today
                                </p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Active Users (7d)</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">
                                    {analyticsData?.security.activeUsers7d || 0}
                                </p>
                                <p className="text-xs text-blue-600 mt-2">
                                    {analyticsData?.users.total ?
                                        Math.round((analyticsData.security.activeUsers7d / analyticsData.users.total) * 100) : 0}% of total
                                </p>
                            </div>
                            <div className="p-3 bg-green-50 rounded-lg">
                                <Activity className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Security Events</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">
                                    {analyticsData?.security.failedLogins24h || 0}
                                </p>
                                <p className="text-xs text-red-600 mt-2">
                                    Failed logins (24h)
                                </p>
                            </div>
                            <div className="p-3 bg-red-50 rounded-lg">
                                <Shield className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">MFA Adoption</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">
                                    {analyticsData?.users.mfaEnabledPercent || 0}%
                                </p>
                                <p className="text-xs text-purple-600 mt-2">
                                    {analyticsData?.users.mfaEnabled || 0} users enabled
                                </p>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-lg">
                                <Lock className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detailed analytics Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* user Distribution */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">User Distribution</h3>
                            <PieChart className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="space-y-4">
                            {analyticsData?.users.byRole && Object.entries(analyticsData.users.byRole).map(([role, count]) => (
                                <div key={role} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className={`w-3 h-3 rounded-full mr-3 ${
                                            role === 'student' ? 'bg-blue-500' :
                                                role === 'instructor' ? 'bg-green-500' :
                                                    role === 'admin' ? 'bg-purple-500' : 'bg-gray-500'
                                        }`}></div>
                                        <span className="text-sm font-medium text-gray-900 capitalize">{role}s</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="text-sm text-gray-600 mr-2">{count}</span>
                                        <span className="text-xs text-gray-500">
                                            ({analyticsData.users.total ? Math.round((count / analyticsData.users.total) * 100) : 0}%)
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Security Overview */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Security Overview</h3>
                            <Shield className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                                    <span className="text-sm text-gray-900">Successful Logins</span>
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                    {analyticsData?.security.loginSuccess24h || 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                                    <span className="text-sm text-gray-900">Failed Logins</span>
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                    {analyticsData?.security.failedLogins24h || 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Shield className="w-4 h-4 text-orange-600 mr-2" />
                                    <span className="text-sm text-gray-900">Unauthorized Access</span>
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                    {analyticsData?.security.unauthorizedAccess24h || 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Lock className="w-4 h-4 text-purple-600 mr-2" />
                                    <span className="text-sm text-gray-900">Password Resets</span>
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                    {analyticsData?.security.passwordResetRequests24h || 0}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security Events Timeline */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Recent Security Events</h3>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => toggleCardExpansion('security-events')}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                            >
                                {expandedCards.has('security-events') ?
                                    <ChevronUp className="w-4 h-4" /> :
                                    <ChevronDown className="w-4 h-4" />
                                }
                            </button>
                        </div>
                    </div>

                    <div className={`space-y-3 ${expandedCards.has('security-events') ? '' : 'max-h-96 overflow-hidden'}`}>
                        {securityEvents.map((event) => (
                            <div key={event._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    {getEventIcon(event.event)}
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{event.event.replace(/_/g, ' ')}</p>
                                        <p className="text-xs text-gray-500">
                                            {event.userId ? `User: ${event.userId}` : 'System Event'}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500">{formatDate(event.timestamp)}</p>
                                    <span className={`px-2 py-1 text-xs rounded-full ${getEventColor(event.event)}`}>
                                        {event.event}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {!expandedCards.has('security-events') && securityEvents.length > 5 && (
                        <div className="mt-4 text-center">
                            <button
                                onClick={() => toggleCardExpansion('security-events')}
                                className="text-blue-600 hover:text-blue-700 text-sm"
                            >
                                Show all {securityEvents.length} events
                            </button>
                        </div>
                    )}
                </div>

                {/* System performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium text-gray-900">Database Performance</h4>
                            <Database className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Query Time</span>
                                <span className="text-sm font-medium">45ms avg</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Connections</span>
                                <span className="text-sm font-medium">12/50</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Cache Hit Rate</span>
                                <span className="text-sm font-medium text-green-600">94%</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium text-gray-900">Server Resources</h4>
                            <Server className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">CPU Usage</span>
                                <span className="text-sm font-medium">23%</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Memory</span>
                                <span className="text-sm font-medium">2.1/8 GB</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Disk Space</span>
                                <span className="text-sm font-medium">45% used</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium text-gray-900">API Performance</h4>
                            <Zap className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Requests/min</span>
                                <span className="text-sm font-medium">342</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Avg Response</span>
                                <span className="text-sm font-medium">89ms</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Error Rate</span>
                                <span className="text-sm font-medium text-green-600">0.1%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Recent System Activity</h3>
                        <button
                            onClick={() => toggleCardExpansion('recent-activity')}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                        >
                            {expandedCards.has('recent-activity') ?
                                <ChevronUp className="w-4 h-4" /> :
                                <ChevronDown className="w-4 h-4" />
                            }
                        </button>
                    </div>

                    <div className={`space-y-3 ${expandedCards.has('recent-activity') ? '' : 'max-h-64 overflow-hidden'}`}>
                        {auditLogs.map((log) => (
                            <div key={log._id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                                <div className="p-2 bg-gray-50 rounded-lg">
                                    <Activity className="w-4 h-4 text-gray-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{log.event}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {log.userId ? `User: ${log.userId}` : 'System'} • {formatDate(log.timestamp)}
                                    </p>
                                    {log.details && Object.keys(log.details).length > 0 && (
                                        <p className="text-xs text-gray-400 mt-1">
                                            {JSON.stringify(log.details).slice(0, 100)}...
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {!expandedCards.has('recent-activity') && auditLogs.length > 3 && (
                        <div className="mt-4 text-center">
                            <button
                                onClick={() => toggleCardExpansion('recent-activity')}
                                className="text-blue-600 hover:text-blue-700 text-sm"
                            >
                                Show all {auditLogs.length} activities
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

