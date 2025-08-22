interface PendingApproval {
    id: number;
    type: 'course' | 'instructor';
    title: string;
    name?: string;
    instructor?: string;
    date: Date;
}

interface CourseOversightProps {
    approvals: PendingApproval[];
    loading?: boolean;
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


export function CourseOversight({ approvals, loading }: CourseOversightProps) {
    if (loading) {
        return (
            <div className="bg-primary-light rounded-xl p-6 border border-gray-800">
                <div className="h-6 bg-primary w-40 rounded mb-4"></div>
                <div className="space-y-3">
                    {[1, 2].map(i => (
                        <div key={i} className="p-3 bg-primary rounded-lg animate-pulse">
                            <div className="h-4 bg-primary-light w-3/4 rounded mb-2"></div>
                            <div className="h-3 bg-primary-light w-1/2 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const typeStyles = {
        course: 'bg-blue-500/10 text-blue-400',
        instructor: 'bg-purple-500/10 text-purple-400'
    };

    return (
        <div className="bg-primary-light rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Pending Approvals</h3>
                <span className="px-2 py-1 bg-accent/20 text-accent rounded-full text-xs">
          {approvals.length} pending
        </span>
            </div>

            {approvals.length === 0 ? (
                <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary flex items-center justify-center">
                        <svg className="w-8 h-8 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-text-secondary">No pending approvals</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {approvals.map((approval) => (
                        <div key={approval.id} className="p-4 bg-primary rounded-lg">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeStyles[approval.type]}`}>
                      {approval.type}
                    </span>
                                        <span className="text-text-secondary text-xs">
                      {formatTimeAgo(approval.date)}
                    </span>
                                    </div>
                                    <p className="text-white font-medium text-sm">{approval.title}</p>
                                    {approval.type === 'course' && approval.instructor && (
                                        <p className="text-text-secondary text-xs mt-1">by {approval.instructor}</p>
                                    )}
                                    {approval.type === 'instructor' && approval.name && (
                                        <p className="text-text-secondary text-xs mt-1">{approval.name}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex space-x-2">
                                <button className="flex-1 px-3 py-1.5 bg-green-500/10 text-green-400
                  hover:bg-green-500/20 rounded text-xs transition-colors">
                                    Approve
                                </button>
                                <button className="flex-1 px-3 py-1.5 bg-red-500/10 text-red-400
                  hover:bg-red-500/20 rounded text-xs transition-colors">
                                    Reject
                                </button>
                                <button className="flex-1 px-3 py-1.5 bg-primary hover:bg-primary/50
                  text-text-secondary hover:text-white rounded text-xs transition-colors
                  border border-gray-700">
                                    Review
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {approvals.length > 0 && (
                <button className="mt-4 w-full text-center text-accent hover:text-accent-hover text-sm">
                    View All Pending →
                </button>
            )}
        </div>
    );
}