// src/components/dashboard/instructor/RecentSubmissions.tsx
interface Submission {
    id: number;
    student: string;
    assignment: string;
    course: string;
    submittedAt: Date;
    status: 'pending' | 'reviewed' | 'graded';
}

interface RecentSubmissionsProps {
    submissions: Submission[];
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

export function RecentSubmissions({ submissions, loading }: RecentSubmissionsProps) {
    if (loading) {
        return (
            <div className="bg-primary-light rounded-xl p-6 border border-gray-800">
                <div className="h-6 bg-primary w-40 rounded mb-4"></div>
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="p-3 bg-primary rounded-lg animate-pulse">
                            <div className="h-4 bg-primary-light w-3/4 rounded mb-2"></div>
                            <div className="h-3 bg-primary-light w-1/2 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const statusStyles = {
        pending: 'bg-yellow-500/10 text-yellow-400',
        reviewed: 'bg-blue-500/10 text-blue-400',
        graded: 'bg-green-500/10 text-green-400'
    };

    return (
        <div className="bg-primary-light rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Recent Submissions</h3>
                <span className="px-2 py-1 bg-accent/20 text-accent rounded-full text-xs">
          {submissions.filter(s => s.status === 'pending').length} pending
        </span>
            </div>

            <div className="space-y-3">
                {submissions.map((submission) => (
                    <div
                        key={submission.id}
                        className="p-3 bg-primary rounded-lg hover:bg-primary/50
              transition-colors cursor-pointer"
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <p className="text-white font-medium text-sm">{submission.student}</p>
                                <p className="text-text-secondary text-xs">{submission.assignment}</p>
                                <p className="text-text-secondary text-xs">{submission.course}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[submission.status]}`}>
                {submission.status}
              </span>
                        </div>
                        <p className="text-text-secondary text-xs">
                            Submitted {formatTimeAgo(submission.submittedAt)}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
