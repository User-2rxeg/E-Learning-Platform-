// src/components/dashboard/admin/AuditLogTable.tsx
interface AuditLog {
    id: number;
    user: string;
    action: string;
    details: string;
    timestamp: Date;
    severity: 'info' | 'warning' | 'error' | 'success';
}

interface AuditLogTableProps {
    logs: AuditLog[];
    loading?: boolean;
}

export function AuditLogTable({ logs, loading }: AuditLogTableProps) {
    const severityStyles = {
        info: 'bg-blue-500/10 text-blue-400',
        warning: 'bg-yellow-500/10 text-yellow-400',
        error: 'bg-red-500/10 text-red-400',
        success: 'bg-green-500/10 text-green-400'
    };

    const actionIcons = {
        'LOGIN': '🔐',
        'LOGIN_FAILED': '❌',
        'USER_ROLE_CHANGE': '👤',
        'BACKUP_COMPLETED': '💾',
        'COURSE_CREATED': '📚',
        'SYSTEM_UPDATE': '🔧',
        'SECURITY_ALERT': '🚨'
    };

    if (loading) {
        return (
            <div className="bg-primary-light rounded-xl p-6 border border-gray-800">
                <div className="h-6 bg-primary w-32 rounded mb-4"></div>
                <div className="space-y-2">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-12 bg-primary rounded animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-primary-light rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Recent Audit Logs</h3>
                <button className="text-accent hover:text-accent-hover text-sm">
                    View All →
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                    <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-2 text-text-secondary text-xs font-medium">Time</th>
                        <th className="text-left py-3 px-2 text-text-secondary text-xs font-medium">User</th>
                        <th className="text-left py-3 px-2 text-text-secondary text-xs font-medium">Action</th>
                        <th className="text-left py-3 px-2 text-text-secondary text-xs font-medium">Details</th>
                        <th className="text-left py-3 px-2 text-text-secondary text-xs font-medium">Status</th>
                    </tr>
                    </thead>
                    <tbody>
                    {logs.map((log) => (
                        <tr
                            key={log.id}
                            className="border-b border-gray-800 hover:bg-primary/50 transition-colors"
                        >
                            <td className="py-3 px-2">
                                <p className="text-text-secondary text-xs">
                                    {new Date(log.timestamp).toLocaleTimeString()}
                                </p>
                                <p className="text-text-secondary text-xs">
                                    {new Date(log.timestamp).toLocaleDateString()}
                                </p>
                            </td>
                            <td className="py-3 px-2">
                                <p className="text-white text-sm truncate max-w-[150px]" title={log.user}>
                                    {log.user}
                                </p>
                            </td>
                            <td className="py-3 px-2">
                                <div className="flex items-center space-x-2">
                                    <span>{actionIcons[log.action] || '📝'}</span>
                                    <p className="text-white text-sm">{log.action}</p>
                                </div>
                            </td>
                            <td className="py-3 px-2">
                                <p className="text-text-secondary text-xs truncate max-w-[200px]" title={log.details}>
                                    {log.details}
                                </p>
                            </td>
                            <td className="py-3 px-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${severityStyles[log.severity]}`}>
                    {log.severity}
                  </span>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Quick Filters */}
            <div className="mt-4 flex items-center space-x-2">
                <button className="px-3 py-1 bg-primary rounded-lg text-xs text-text-secondary hover:text-white transition-colors">
                    All
                </button>
                <button className="px-3 py-1 bg-primary rounded-lg text-xs text-text-secondary hover:text-white transition-colors">
                    Errors
                </button>
                <button className="px-3 py-1 bg-primary rounded-lg text-xs text-text-secondary hover:text-white transition-colors">
                    Security
                </button>
                <button className="px-3 py-1 bg-primary rounded-lg text-xs text-text-secondary hover:text-white transition-colors">
                    System
                </button>
            </div>
        </div>
    );
}
