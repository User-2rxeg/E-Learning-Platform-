import {ReactNode} from "react";

interface Activity {
    id: string;
    type: 'course' | 'quiz' | 'assignment' | 'achievement';
    title: string;
    description: string;
    timestamp: Date;
    icon?: ReactNode;
}

interface ActivityFeedProps {
    activities: Activity[];
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

export function ActivityFeed({ activities, loading }: ActivityFeedProps) {
    if (loading) {
        return (
            <div className="bg-primary-light rounded-xl p-6">
                <div className="h-6 bg-primary w-32 rounded mb-4"></div>
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="animate-pulse">
                            <div className="flex space-x-4">
                                <div className="w-10 h-10 bg-primary rounded-full"></div>
                                <div className="flex-1">
                                    <div className="h-4 bg-primary w-3/4 rounded mb-2"></div>
                                    <div className="h-3 bg-primary w-1/2 rounded"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const typeColors = {
        course: 'bg-blue-500',
        quiz: 'bg-green-500',
        assignment: 'bg-yellow-500',
        achievement: 'bg-purple-500'
    };

    return (
        <div className="bg-primary-light rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>

            <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                {activities.length === 0 ? (
                    <p className="text-text-secondary text-center py-8">No recent activity</p>
                ) : (
                    activities.map((activity) => (
                        <div key={activity.id} className="flex space-x-4 group">
                            <div className={`w-10 h-10 rounded-full ${typeColors[activity.type]} 
                bg-opacity-20 flex items-center justify-center flex-shrink-0
                group-hover:scale-110 transition-transform`}>
                                {activity.icon || (
                                    <div className={`w-2 h-2 rounded-full ${typeColors[activity.type]}`} />
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-white font-medium truncate">{activity.title}</p>
                                <p className="text-text-secondary text-sm truncate">{activity.description}</p>
                                <p className="text-text-secondary text-xs mt-1">
                                    {formatTimeAgo(activity.timestamp)}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
