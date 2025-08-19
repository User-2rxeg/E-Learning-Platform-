// src/app/instructor/courses/page.tsx
'use client';

import { useState, useEffect } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {courseService} from "../../../services/courseApi";

export default function InstructorCoursesPage() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchInstructorCourses = async () => {
            try {
                const { courses } = await courseService.getCourses(1, 100);
                // In a real app, you'd filter by instructor ID or make a dedicated API call
                setCourses(courses);
            } catch (error) {
                console.error('Failed to fetch courses:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchInstructorCourses();
    }, []);

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">My Courses</h1>
                <Link
                    href="/instructor/courses/create"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                    Create New Course
                </Link>
            </div>

            {loading ? (
                <div className="text-center py-10">Loading your courses...</div>
            ) : courses.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="py-3 px-4 text-left">Title</th>
                            <th className="py-3 px-4 text-left">Status</th>
                            <th className="py-3 px-4 text-left">Students</th>
                            <th className="py-3 px-4 text-left">Created</th>
                            <th className="py-3 px-4 text-left">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {courses.map((course) => (
                            <tr key={course._id} className="hover:bg-gray-50">
                                <td className="py-3 px-4">
                                    <div className="font-medium text-blue-600">
                                        <Link href={`/instructor/courses/${course._id}`}>
                                            {course.title}
                                        </Link>
                                    </div>
                                </td>
                                <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                        course.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : course.status === 'draft'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                    }`}>
                      {course.status || 'draft'}
                    </span>
                                </td>
                                <td className="py-3 px-4">
                                    {course.studentsEnrolled?.length || 0}
                                </td>
                                <td className="py-3 px-4">
                                    {new Date(course.createdAt).toLocaleDateString()}
                                </td>
                                <td className="py-3 px-4">
                                    <div className="flex space-x-2">
                                        <Link
                                            href={`/instructor/courses/${course._id}/edit`}
                                            className="text-blue-600 hover:underline"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => router.push(`/instructor/courses/${course._id}/modules`)}
                                            className="text-purple-600 hover:underline"
                                        >
                                            Modules
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-10 bg-gray-50 rounded-lg">
                    <p className="text-lg mb-4">You haven't created any courses yet</p>
                    <Link
                        href="/instructor/courses/create"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
                    >
                        Create Your First Course
                    </Link>
                </div>
            )}
        </div>
    );
}