// src/components/dashboard/admin/BackupStatus.tsx
interface BackupInfo {
    lastBackup: Date | null;
    nextScheduled: Date | null;
    backupSize: number;
    status: 'success' | 'failed' | 'in-progress';
}

interface BackupStatusProps {
    backup: BackupInfo;
    loading?: boolean;
}

export function BackupStatus({ backup, loading }: BackupStatusProps) {
    const statusStyles = {
        'success': 'bg-green-500/10 text-green-400 border-green-500/20',
        'failed': 'bg-red-500/10 text-red-400 border-red-500/20',
        'in-progress': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
    };

    const statusIcons = {
        'success': '✓',
        'failed': '✗',
        'in-progress': '⟳'
    };

    if (loading) {
        return (
            <div className="bg-primary-light rounded-xl p-6 border border-gray-800">
                <div className="h-6 bg-primary w-32 rounded mb-4"></div>
                <div className="space-y-3">
                    <div className="h-16 bg-primary rounded animate-pulse"></div>
                    <div className="h-10 bg-primary rounded animate-pulse"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-primary-light rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Backup Status</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusStyles[backup.status]}`}>
          {statusIcons[backup.status]} {backup.status}
        </span>
            </div>

            <div className="space-y-4">
                {/* Last Backup */}
                <div className="p-4 bg-primary rounded-lg">
                    <p className="text-text-secondary text-xs mb-1">Last Backup</p>
                    <p className="text-white font-medium">
                        {backup.lastBackup
                            ? new Date(backup.lastBackup).toLocaleString()
                            : 'No backups yet'}
                    </p>
                    {backup.backupSize > 0 && (
                        <p className="text-text-secondary text-xs mt-1">
                            Size: {backup.backupSize} GB
                        </p>
                    )}
                </div>

                {/* Next Scheduled */}
                <div className="p-4 bg-primary rounded-lg">
                    <p className="text-text-secondary text-xs mb-1">Next Scheduled</p>
                    <p className="text-white font-medium">
                        {backup.nextScheduled
                            ? new Date(backup.nextScheduled).toLocaleString()
                            : 'Not scheduled'}
                    </p>
                    {backup.nextScheduled && (
                        <p className="text-text-secondary text-xs mt-1">
                            In {Math.round((new Date(backup.nextScheduled).getTime() - Date.now()) / (1000 * 60 * 60))} hours
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                    <button className="flex-1 px-3 py-2 bg-accent hover:bg-accent-hover text-white
            rounded-lg text-sm transition-colors">
                        Run Backup Now
                    </button>
                    <button className="flex-1 px-3 py-2 bg-primary hover:bg-primary/50 text-text-secondary
            hover:text-white rounded-lg text-sm transition-colors border border-gray-700">
                        Settings
                    </button>
                </div>

                {/* Backup History */}
                <div className="pt-4 border-t border-gray-700">
                    <p className="text-text-secondary text-xs mb-2">Recent Backups</p>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-text-secondary">2024-01-15 03:00</span>
                            <span className="text-green-400">Success (2.4 GB)</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-text-secondary">2024-01-14 03:00</span>
                            <span className="text-green-400">Success (2.3 GB)</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-text-secondary">2024-01-13 03:00</span>
                            <span className="text-green-400">Success (2.3 GB)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}