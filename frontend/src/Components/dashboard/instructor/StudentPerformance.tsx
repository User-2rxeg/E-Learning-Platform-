// src/components/dashboard/instructor/StudentPerformanceTable.tsx
interface Student {
    id: number;
    name: string;
    course: string;
    progress: number;
    lastActive: Date;
    avgScore: number;
}

interface StudentPerformanceTableProps {
    students: Student[];
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

export function StudentPerformanceTable({ students, loading }: StudentPerformanceTableProps) {
    if (loading) {
        return (
            <div className="bg-primary-light rounded-xl p-6 border border-gray-800">
                <div className="h-6 bg-primary w-48 rounded mb-4"></div>
                <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-12 bg-primary rounded animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-400';
        if (score >= 70) return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <div className="bg-primary-light rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Student Performance</h3>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                    <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Student</th>
                        <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Course</th>
                        <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Progress</th>
                        <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Avg Score</th>
                        <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Last Active</th>
                    </tr>
                    </thead>
                    <tbody>
                    {students.map((student) => (
                        <tr
                            key={student.id}
                            className="border-b border-gray-800 hover:bg-primary/50 transition-colors"
                        >
                            <td className="py-3 px-4">
                                <p className="text-white font-medium">{student.name}</p>
                            </td>
                            <td className="py-3 px-4">
                                <p className="text-text-secondary">{student.course}</p>
                            </td>
                            <td className="py-3 px-4">
                                <div className="flex items-center space-x-2">
                                    <div className="w-24 bg-gray-700 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-accent to-blue-500 h-2 rounded-full"
                                            style={{ width: `${student.progress}%` }}
                                        />
                                    </div>
                                    <span className="text-text-secondary text-sm">{student.progress}%</span>
                                </div>
                            </td>
                            <td className="py-3 px-4">
                  <span className={`font-bold ${getScoreColor(student.avgScore)}`}>
                    {student.avgScore}%
                  </span>
                            </td>
                            <td className="py-3 px-4">
                                <p className="text-text-secondary text-sm">
                                    {formatTimeAgo(student.lastActive)}
                                </p>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
