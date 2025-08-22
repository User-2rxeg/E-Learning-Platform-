'use client';

interface SystemHealthProps {
    health: {
        cpuUsage: number;
        memoryUsage: number;
        diskUsage: number;
        activeConnections: number;
        apiResponseTime: number;
        errorRate: number;
    };
    loading?: boolean;
}

export function SystemHealth({ health, loading }: SystemHealthProps) {
    const getStatusColor = (value: number, type: 'usage' | 'time' | 'error') => {
        if (type === 'usage') {
            if (value < 50) return 'text-green-400';
            if (value < 75) return 'text-yellow-400';
            return 'text-red-400';
        }
        if (type === 'time') {
            if (value < 200) return 'text-green-400';
            if (value < 500) return 'text-yellow-400';
            return 'text-red-400';
        }
        if (type === 'error') {
            if (value < 1) return 'text-green-400';
            if (value < 5) return 'text-yellow-400';
            return 'text-red-400';
        }
        return 'text-gray-400';
    };

    const getStatusIcon = (value: number, type: 'usage' | 'time' | 'error') => {
        if (type === 'usage') {
            if (value < 50) return '✓';
            if (value < 75) return '⚠';
            return '✗';
        }
        if (type === 'time') {
            if (value < 200) return '⚡';
            if (value < 500) return '⚠';
            return '🐌';
        }
        if (type === 'error') {
            if (value < 1) return '✓';
            if (value < 5) return '⚠';
            return '✗';
        }
        return '';
    };

    if (loading) {
        return (
            <div className="bg-primary-light rounded-xl p-6 border border-gray-800">
                <div className="h-6 bg-primary w-32 rounded mb-4"></div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="animate-pulse">
                            <div className="h-4 bg-primary w-20 rounded mb-2"></div>
                            <div className="h-8 bg-primary w-24 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-primary-light rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">System Health</h3>
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-sm">All Systems Operational</span>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {/* CPU Usage */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-text-secondary text-sm">CPU Usage</span>
                        <span className={getStatusColor(health.cpuUsage, 'usage')}>
              {getStatusIcon(health.cpuUsage, 'usage')}
            </span>
                    </div>
                    <div className="relative">
                        <div className="text-2xl font-bold text-white">{health.cpuUsage}%</div>
                        <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full transition-all duration-500 ${
                                    health.cpuUsage < 50 ? 'bg-green-500' :
                                        health.cpuUsage < 75 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${health.cpuUsage}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Memory Usage */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-text-secondary text-sm">Memory</span>
                        <span className={getStatusColor(health.memoryUsage, 'usage')}>
              {getStatusIcon(health.memoryUsage, 'usage')}
            </span>
                    </div>
                    <div className="relative">
                        <div className="text-2xl font-bold text-white">{health.memoryUsage}%</div>
                        <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full transition-all duration-500 ${
                                    health.memoryUsage < 50 ? 'bg-green-500' :
                                        health.memoryUsage < 75 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${health.memoryUsage}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Disk Usage */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-text-secondary text-sm">Disk Space</span>
                        <span className={getStatusColor(health.diskUsage, 'usage')}>
              {getStatusIcon(health.diskUsage, 'usage')}
            </span>
                    </div>
                    <div className="relative">
                        <div className="text-2xl font-bold text-white">{health.diskUsage}%</div>
                        <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full transition-all duration-500 ${
                                    health.diskUsage < 50 ? 'bg-green-500' :
                                        health.diskUsage < 75 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${health.diskUsage}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Active Connections */}
                <div className="space-y-2">
                    <span className="text-text-secondary text-sm">Connections</span>
                    <div className="text-2xl font-bold text-white">{health.activeConnections}</div>
                    <div className="text-xs text-text-secondary">Active users</div>
                </div>

                {/* API Response Time */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-text-secondary text-sm">API Response</span>
                        <span className={getStatusColor(health.apiResponseTime, 'time')}>
              {getStatusIcon(health.apiResponseTime, 'time')}
            </span>
                    </div>
                    <div className="text-2xl font-bold text-white">{health.apiResponseTime}ms</div>
                    <div className="text-xs text-text-secondary">Avg. response time</div>
                </div>

                {/* Error Rate */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-text-secondary text-sm">Error Rate</span>
                        <span className={getStatusColor(health.errorRate, 'error')}>
              {getStatusIcon(health.errorRate, 'error')}
            </span>
                    </div>
                    <div className="text-2xl font-bold text-white">{health.errorRate}%</div>
                    <div className="text-xs text-text-secondary">Last 24 hours</div>
                </div>
            </div>

            {/* System Alerts */}
            {(health.cpuUsage > 75 || health.memoryUsage > 75 || health.diskUsage > 75 || health.errorRate > 5) && (
                <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-red-400 text-sm font-medium mb-2">⚠️ System Alerts</p>
                    <ul className="space-y-1 text-xs text-red-300">
                        {health.cpuUsage > 75 && <li>• High CPU usage detected</li>}
                        {health.memoryUsage > 75 && <li>• High memory usage detected</li>}
                        {health.diskUsage > 75 && <li>• Low disk space warning</li>}
                        {health.errorRate > 5 && <li>• High error rate detected</li>}
                    </ul>
                </div>
            )}
        </div>
    );
}