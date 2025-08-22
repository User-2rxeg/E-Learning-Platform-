// src/components/dashboard/admin/UserGrowthChart.tsx
interface UserGrowthData {
    month: string;
    students: number;
    instructors: number;
    total: number;
}

interface UserGrowthChartProps {
    data: UserGrowthData[];
    loading?: boolean;
}

export function UserGrowthChart({ data, loading }: UserGrowthChartProps) {
    if (loading) {
        return (
            <div className="bg-primary-light rounded-xl p-6 border border-gray-800">
                <div className="h-6 bg-primary w-32 rounded mb-4"></div>
                <div className="h-64 bg-primary rounded animate-pulse"></div>
            </div>
        );
    }

    const maxValue = Math.max(...data.map(d => d.total));
    const scale = 250 / maxValue; // Chart height is 250px

    return (
        <div className="bg-primary-light rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">User Growth</h3>
                <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded"></div>
                        <span className="text-text-secondary">Students</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-purple-500 rounded"></div>
                        <span className="text-text-secondary">Instructors</span>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="relative h-64">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-text-secondary">
                    <span>{maxValue}</span>
                    <span>{Math.round(maxValue * 0.75)}</span>
                    <span>{Math.round(maxValue * 0.5)}</span>
                    <span>{Math.round(maxValue * 0.25)}</span>
                    <span>0</span>
                </div>

                {/* Chart area */}
                <div className="ml-10 h-full flex items-end justify-between space-x-2">
                    {data.map((item, index) => (
                        <div key={item.month} className="flex-1 flex flex-col items-center">
                            <div className="w-full flex items-end justify-center space-x-1 h-[250px] relative group">
                                {/* Students bar */}
                                <div className="flex-1 relative">
                                    <div
                                        className="w-full bg-blue-500 rounded-t hover:bg-blue-400 transition-all duration-300"
                                        style={{ height: `${item.students * scale}px` }}
                                    >
                                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2
                      bg-primary-dark px-2 py-1 rounded text-xs text-white opacity-0
                      group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                            Students: {item.students}
                                        </div>
                                    </div>
                                </div>

                                {/* Instructors bar */}
                                <div className="flex-1 relative">
                                    <div
                                        className="w-full bg-purple-500 rounded-t hover:bg-purple-400 transition-all duration-300"
                                        style={{ height: `${item.instructors * scale}px` }}
                                    >
                                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2
                      bg-primary-dark px-2 py-1 rounded text-xs text-white opacity-0
                      group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                            Instructors: {item.instructors}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* X-axis label */}
                            <span className="text-text-secondary text-xs mt-2">{item.month}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Summary Stats */}
            <div className="mt-6 grid grid-cols-3 gap-4 pt-4 border-t border-gray-700">
                <div>
                    <p className="text-text-secondary text-xs">Total Users</p>
                    <p className="text-white font-bold text-lg">
                        {data[data.length - 1]?.total || 0}
                    </p>
                </div>
                <div>
                    <p className="text-text-secondary text-xs">Growth Rate</p>
                    <p className="text-green-400 font-bold text-lg">
                        +{Math.round(((data[data.length - 1]?.total - data[0]?.total) / data[0]?.total) * 100)}%
                    </p>
                </div>
                <div>
                    <p className="text-text-secondary text-xs">Avg. Monthly</p>
                    <p className="text-white font-bold text-lg">
                        +{Math.round((data[data.length - 1]?.total - data[0]?.total) / data.length)}
                    </p>
                </div>
            </div>
        </div>
    );
}
