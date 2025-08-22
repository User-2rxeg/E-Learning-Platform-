// src/components/dashboard/student/LearningChart.tsx
export function LearningChart({ loading }: { loading?: boolean }) {
    if (loading) {
        return (
            <div className="bg-primary-light rounded-xl p-6 border border-gray-800">
                <div className="h-6 bg-primary w-40 rounded mb-4"></div>
                <div className="h-64 bg-primary rounded animate-pulse"></div>
            </div>
        );
    }

    // Simple chart visualization (replace with actual chart library)
    const data = [
        { day: 'Mon', hours: 2 },
        { day: 'Tue', hours: 3 },
        { day: 'Wed', hours: 1.5 },
        { day: 'Thu', hours: 4 },
        { day: 'Fri', hours: 2.5 },
        { day: 'Sat', hours: 3 },
        { day: 'Sun', hours: 1 }
    ];

    const maxHours = Math.max(...data.map(d => d.hours));

    return (
        <div className="bg-primary-light rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Learning Activity</h3>

            <div className="h-64 flex items-end justify-between space-x-2">
                {data.map((item) => (
                    <div key={item.day} className="flex-1 flex flex-col items-center">
                        <div className="w-full bg-primary rounded-t hover:bg-accent/20 transition-all
              duration-300 relative group">
                            <div
                                className="w-full bg-gradient-to-t from-accent to-blue-500 rounded-t
                  transition-all duration-500"
                                style={{ height: `${(item.hours / maxHours) * 100}%` }}
                            >
                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2
                  bg-primary-dark px-2 py-1 rounded text-xs text-white opacity-0
                  group-hover:opacity-100 transition-opacity">
                                    {item.hours}h
                                </div>
                            </div>
                        </div>
                        <span className="text-text-secondary text-xs mt-2">{item.day}</span>
                    </div>
                ))}
            </div>

            <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-text-secondary">Total this week:</span>
                <span className="text-white font-medium">
          {data.reduce((sum, item) => sum + item.hours, 0)} hours
        </span>
            </div>
        </div>
    );
}