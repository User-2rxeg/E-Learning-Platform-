'use client';

import Link from 'next/link';

interface Course {
    id: number;
    title: string;
    progress: number;
    nextLesson: string;
}

interface CourseProgressProps {
    courses: Course[];
    loading?: boolean;
}

export function CourseProgress({ courses, loading }: CourseProgressProps) {
    if (loading) {
        return (
            <div className="bg-primary-light rounded-xl p-6 border border-gray-800">
                <div className="h-6 bg-primary w-40 rounded mb-4"></div>
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="p-4 bg-primary rounded-lg animate-pulse">
                            <div className="h-5 bg-primary-light w-3/4 rounded mb-3"></div>
                            <div className="h-2 bg-primary-light rounded-full"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-primary-light rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Continue Learning</h3>
                <Link href="/courses" className="text-accent hover:text-accent-hover text-sm">
                    View All →
                </Link>
            </div>

            {courses.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-text-secondary mb-4">No courses enrolled yet</p>
                    <Link href="/courses" className="text-accent hover:text-accent-hover">
                        Browse Courses →
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {courses.map((course) => (
                        <Link
                            key={course.id}
                            href={`/courses/${course.id}`}
                            className="block p-4 bg-primary rounded-lg hover:bg-primary/50
                transition-all duration-200 group"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-white font-medium group-hover:text-accent transition-colors">
                                    {course.title}
                                </h4>
                                <span className="text-sm text-text-secondary">{course.progress}%</span>
                            </div>

                            <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                                <div
                                    className="bg-gradient-to-r from-accent to-blue-500 h-2 rounded-full
                    transition-all duration-500"
                                    style={{ width: `${course.progress}%` }}
                                />
                            </div>

                            <p className="text-text-secondary text-sm">
                                Next: {course.nextLesson}
                            </p>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}