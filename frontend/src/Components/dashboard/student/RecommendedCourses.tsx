// src/components/dashboard/student/RecommendedCourses.tsx
interface Course {
    id: number;
    title: string;
    instructor: string;
    rating: number;
    students: number;
    match: number; // Match percentage based on AI
}

interface RecommendedCoursesProps {
    courses?: Course[];
    loading?: boolean;
}

export function RecommendedCourses({ courses = [], loading }: RecommendedCoursesProps) {
    if (loading) {
        return (
            <div className="bg-primary-light rounded-xl p-6 border border-gray-800">
                <div className="h-6 bg-primary w-48 rounded mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2].map(i => (
                        <div key={i} className="p-4 bg-primary rounded-lg animate-pulse">
                            <div className="h-5 bg-primary-light w-3/4 rounded mb-3"></div>
                            <div className="h-4 bg-primary-light w-1/2 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Mock data if no courses provided
    const recommendedCourses = courses.length > 0 ? courses : [
        {
            id: 1,
            title: 'Advanced React Patterns',
            instructor: 'Sarah Johnson',
            rating: 4.9,
            students: 1234,
            match: 95
        },
        {
            id: 2,
            title: 'Node.js Microservices',
            instructor: 'Mike Chen',
            rating: 4.8,
            students: 892,
            match: 88
        }
    ];

    return (
        <div className="bg-primary-light rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Recommended for You</h3>
                <span className="text-xs text-text-secondary">AI-Powered</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendedCourses.map((course) => (
                    <div key={course.id}
                         className="p-4 bg-primary rounded-lg hover:bg-primary/50 transition-all
              duration-200 cursor-pointer group relative overflow-hidden">

                        {/* Match percentage badge */}
                        <div className="absolute top-2 right-2 px-2 py-1 bg-accent/20 rounded-full">
                            <span className="text-accent text-xs font-medium">{course.match}% match</span>
                        </div>

                        <h4 className="text-white font-medium mb-2 pr-20 group-hover:text-accent transition-colors">
                            {course.title}
                        </h4>

                        <p className="text-text-secondary text-sm mb-3">by {course.instructor}</p>

                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-3">
                                <span className="text-yellow-400">⭐ {course.rating}</span>
                                <span className="text-text-secondary">{course.students} students</span>
                            </div>
                        </div>

                        <button className="mt-3 w-full py-2 bg-accent/10 text-accent rounded
              hover:bg-accent hover:text-white transition-all duration-200 text-sm">
                            View Course
                        </button>
                    </div>
                ))}
            </div>

            <button className="mt-4 w-full text-center text-accent hover:text-accent-hover text-sm">
                See More Recommendations →
            </button>
        </div>
    );
}