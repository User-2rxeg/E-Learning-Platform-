// src/app/dashboard/my-courses/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { courseService } from '../../../services/courseApi';

export default function EnrolledCoursesPage() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        const fetchEnrolledCourses = async () => {
            try {
                // You'll need to implement this endpoint in your backend
                // It should return courses the current user is enrolled in
                const data = await courseService.getEnrolledCourses();
                setCourses(data);
            } catch (error) {
                console.error('Failed to fetch enrolled courses:', error);
                setError('Failed to load your courses');
            } finally {
                setLoading(false);
            }
        };

        fetchEnrolledCourses();
    }, []);

    if (loading) return <div className="flex justify-center p-10">Loading your courses...</div>;
    if (error) return <div className="text-red-500 text-center p-10">{error}</div>;

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6">My Enrolled Courses</h1>

            {courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <div
                            key={course._id}
                            className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => router.push(`/courses/${course._id}`)}
                        >
                            <div className="h-40 bg-gradient-to-r from-blue-500 to-blue-700 relative flex items-center justify-center text-white">
                                <span className="text-3xl font-bold">{course.title.charAt(0)}</span>
                            </div>
                            <div className="p-4">
                                <h2 className="text-lg font-semibold mb-2">{course.title}</h2>
                                <p className="text-sm text-gray-600 mb-2">
                                    By {course.instructorId?.name || 'Unknown instructor'}
                                </p>

                                <div className="mt-4 flex justify-between items-center">
                                    <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                        {course.progress || 0}% Complete
                                    </div>
                                    <button
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded text-sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            router.push(`/courses/${course._id}/learn`);
                                        }}
                                    >
                                        Continue Learning
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 bg-gray-50 rounded-lg">
                    <p className="text-lg mb-4">You are not enrolled in any courses yet</p>
                    <button
                        onClick={() => router.push('/courses')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
                    >
                        Browse Courses
                    </button>
                </div>
            )}
        </div>
    );
}