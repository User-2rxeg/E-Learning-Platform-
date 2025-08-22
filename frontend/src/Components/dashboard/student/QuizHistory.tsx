import Link from "next/link";

interface Quiz {
    id: number;
    title: string;
    score: number;
    date: Date;
    difficulty: 'easy' | 'medium' | 'hard';
}

interface QuizHistoryProps {
    quizzes: Quiz[];
    loading?: boolean;
}

export function QuizHistory({ quizzes, loading }: QuizHistoryProps) {
    const difficultyColors = {
        easy: 'text-green-400 bg-green-400/10',
        medium: 'text-yellow-400 bg-yellow-400/10',
        hard: 'text-red-400 bg-red-400/10'
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-400';
        if (score >= 70) return 'text-yellow-400';
        return 'text-red-400';
    };

    if (loading) {
        return (
            <div className="bg-primary-light rounded-xl p-6 border border-gray-800">
                <div className="h-6 bg-primary w-32 rounded mb-4"></div>
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="p-4 bg-primary rounded-lg animate-pulse">
                            <div className="flex justify-between">
                                <div className="h-4 bg-primary-light w-1/2 rounded"></div>
                                <div className="h-4 bg-primary-light w-16 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-primary-light rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Recent Quizzes</h3>
                <Link href="/dashboard/quizzes" className="text-accent hover:text-accent-hover text-sm">
                    View All →
                </Link>
            </div>

            {quizzes.length === 0 ? (
                <p className="text-text-secondary text-center py-8">No quiz attempts yet</p>
            ) : (
                <div className="space-y-3">
                    {quizzes.map((quiz) => (
                        <div key={quiz.id} className="p-4 bg-primary rounded-lg hover:bg-primary/50
              transition-all duration-200">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-white font-medium">{quiz.title}</h4>
                                <span className={`text-2xl font-bold ${getScoreColor(quiz.score)}`}>
                  {quiz.score}%
                </span>
                            </div>

                            <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-medium 
                  ${difficultyColors[quiz.difficulty]}`}>
                  {quiz.difficulty}
                </span>
                                <span className="text-text-secondary text-xs">
                  {new Date(quiz.date).toLocaleDateString()}
                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}