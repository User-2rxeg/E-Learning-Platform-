// src/components/dashboard/instructor/EngagementChart.tsx
export function EngagementChart({ loading }: { loading?: boolean }) {
    if (loading) {
        return (
            <div className="bg-primary-light rounded-xl p-6 border border-gray-800">
                <div className="h-6 bg-primary w-40 rounded mb-4"></div>
                <div className="h-64 bg-primary rounded animate-pulse"></div>
            </div>
        );
    }

    const data = [
        { week: 'Week 1', views: 245, submissions: 42, interactions: 156 },
        { week: 'Week 2', views: 312, submissions: 58, interactions: 203 },
        { week: 'Week 3', views: 289, submissions: 51, interactions: 178 },
        { week: 'Week 4', views: 367, submissions: 64, interactions: 234 }
    ];

    const maxValue = Math.max(
        ...data.flatMap(d => [d.views, d.submissions, d.interactions])
    );

    return (
        <div className="bg-primary-light rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Student Engagement</h3>

            <div className="h-64 flex items-end justify-between space-x-4">
                {data.map((week) => (
                    <div key={week.week} className="flex-1">
                        <div className="flex items-end justify-between space-x-1 h-48">
                            <div className="flex-1 relative group">
                                <div
                                    className="w-full bg-blue-500 rounded-t hover:bg-blue-400 transition-colors"
                                    style={{ height: `${(week.views / maxValue) * 100}%` }}
                                >
                                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2
                    bg-primary-dark px-2 py-1 rounded text-xs text-white opacity-0
                    group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        Views: {week.views}
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 relative group">
                                <div
                                    className="w-full bg-green-500 rounded-t hover:bg-green-400 transition-colors"
                                    style={{ height: `${(week.submissions / maxValue) * 100}%` }}
                                >
                                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2
                    bg-primary-dark px-2 py-1 rounded text-xs text-white opacity-0
                    group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        Submissions: {week.submissions}
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 relative group">
                                <div
                                    className="w-full bg-purple-500 rounded-t hover:bg-purple-400 transition-colors"
                                    style={{ height: `${(week.interactions / maxValue) * 100}%` }}
                                >
                                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2
                    bg-primary-dark px-2 py-1 rounded text-xs text-white opacity-0
                    group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        Interactions: {week.interactions}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="text-text-secondary text-xs text-center mt-2">{week.week}</p>
                    </div>
                ))}
            </div>

            <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span className="text-text-secondary">Course Views</span>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span className="text-text-secondary">Submissions</span>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded"></div>
                    <span className="text-text-secondary">Interactions</span>
                </div>
            </div>
        </div>
    );
}