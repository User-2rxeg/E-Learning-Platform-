// src/components/dashboard/instructor/CourseManagement.tsx
'use client';

import { useRouter } from 'next/navigation';

interface Course {
    id: number;
    title: string;
    students: number;
    rating: number;
    status: 'active' | 'draft';
    completion: number;
}

interface CourseManagementProps {
    courses: Course[];
    loading?: boolean;
}

export function CourseManagement({ courses, loading }: CourseManagementProps) {
    const router = useRouter();

    if (loading) {
        return (
            <div className="bg-primary-light rounded-xl p-6 border border-gray-800">
                <div className="h-6 bg-primary w-40 rounded mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="p-4 bg-primary rounded-lg animate-pulse">
                            <div className="h-5 bg-primary-light w-3/4 rounded mb-3"></div>
                            <div className="h-4 bg-primary-light w-1/2 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const statusColors = {
        active: 'bg-green-500/10 text-green-400 border-green-500/20',
        draft: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
    };

    return (
        <div className="bg-primary-light rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">My Courses</h3>
                <button
                    onClick={() => router.push('/dashboard/instructor/courses/create')}
                    className="px-4 py-2 bg-accent hover:bg-accent-hover text-white
            rounded-lg transition-colors text-sm"
                >
                    + Create New
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map((course) => (
                    <div
                        key={course.id}
                        className="p-4 bg-primary rounded-lg hover:bg-primary/50
              transition-all duration-200 cursor-pointer group"
                        onClick={() => router.push(`/dashboard/instructor/courses/${course.id}`)}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <h4 className="text-white font-medium group-hover:text-accent transition-colors">
                                {course.title}
                            </h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[course.status]}`}>
                {course.status}
              </span>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-text-secondary">Students</span>
                                <span className="text-white font-medium">{course.students}</span>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-text-secondary">Rating</span>
                                <span className="text-yellow-400">⭐ {course.rating}</span>
                            </div>

                            <div className="pt-2">
                                <div className="flex items-center justify-between text-xs mb-1">
                                    <span className="text-text-secondary">Completion</span>
                                    <span className="text-white">{course.completion}%</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-1.5">
                                    <div
                                        className="bg-gradient-to-r from-accent to-blue-500 h-1.5 rounded-full"
                                        style={{ width: `${course.completion}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-700 flex space-x-2">
                            <button className="flex-1 text-xs text-accent hover:text-accent-hover">
                                Edit
                            </button>
                            <button className="flex-1 text-xs text-text-secondary hover:text-white">
                                Analytics
                            </button>
                            <button className="flex-1 text-xs text-text-secondary hover:text-white">
                                Students
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
