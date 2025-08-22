interface StudyStreakProps {
    streak: number;
    loading?: boolean;
}

export function StudyStreak({ streak, loading }: StudyStreakProps) {
    if (loading) {
        return (
            <div className="bg-primary-light rounded-xl p-6 border border-gray-800 animate-pulse">
                <div className="h-6 bg-primary w-32 rounded mb-4"></div>
                <div className="h-20 bg-primary rounded"></div>
            </div>
        );
    }

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date().getDay();

    return (
        <div className="bg-primary-light rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Study Streak 🔥</h3>

            <div className="text-center mb-4">
                <p className="text-4xl font-bold text-accent">{streak}</p>
                <p className="text-text-secondary">day streak</p>
            </div>

            <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                    const isActive = index <= today && index > today - streak;
                    return (
                        <div
                            key={day}
                            className={`text-center py-2 rounded ${
                                isActive
                                    ? 'bg-accent text-white'
                                    : 'bg-primary text-text-secondary'
                            }`}
                        >
                            <p className="text-xs">{day}</p>
                        </div>
                    );
                })}
            </div>

            {streak >= 7 && (
                <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg">
                    <p className="text-yellow-400 text-sm text-center">
                        🏆 Week Warrior! Keep going!
                    </p>
                </div>
            )}
        </div>
    );
}