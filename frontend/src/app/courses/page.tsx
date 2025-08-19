// src/app/courses/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {courseService} from "../../services/courseApi";


export default function CoursesPage() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalCourses, setTotalCourses] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const router = useRouter();
    const searchParams = useSearchParams();

    const title = searchParams?.get('title') || '';
    const instructorName = searchParams?.get('instructor') || '';
    const tag = searchParams?.get('tag') || '';
    const page = parseInt(searchParams?.get('page') || '1');
    const limit = 12;

    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            try {
                const data = await courseService.searchCourses({
                    title,
                    instructorName,
                    tag,
                    page,
                    limit
                });
                setCourses(data.items);
                setTotalCourses(data.total);
                setCurrentPage(data.page);
            } catch (error) {
                console.error('Failed to fetch courses:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, [title, instructorName, tag, page, limit]);

    const handleSearch = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const searchTitle = formData.get('searchTitle') as string;

        router.push(`/courses?title=${encodeURIComponent(searchTitle || '')}`);
    };

    const totalPages = Math.ceil(totalCourses / limit);

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6">Explore Courses</h1>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="mb-8">
                <div className="flex flex-col md:flex-row gap-4">
                    <input
                        type="text"
                        name="searchTitle"
                        placeholder="Search courses..."
                        className="p-2 border rounded flex-grow"
                        defaultValue={title}
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                    >
                        Search
                    </button>
                </div>
            </form>

            {/* Course Grid */}
            {loading ? (
                <div className="text-center py-10">Loading courses...</div>
            ) : courses.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <CourseCard key={course._id} course={course} />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center mt-8">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                <button
                                    key={p}
                                    onClick={() => router.push(`/courses?title=${encodeURIComponent(title)}&page=${p}`)}
                                    className={`mx-1 px-3 py-1 rounded ${
                                        currentPage === p ? 'bg-blue-600 text-white' : 'bg-gray-200'
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-10">
                    No courses found matching your criteria.
                </div>
            )}
        </div>
    );
}

function CourseCard({ course }) {
    const router = useRouter();

    return (
        <div
            className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => router.push(`/courses/${course._id}`)}
        >
            <div className="h-40 bg-gray-200 relative">
                {/* Course thumbnail would go here */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-gray-500">{course.title.charAt(0)}</span>
                </div>
            </div>
            <div className="p-4">
                <h2 className="text-lg font-semibold mb-2 line-clamp-2">{course.title}</h2>
                <p className="text-sm text-gray-600 mb-2">
                    By {course.instructor?.name || 'Unknown instructor'}
                </p>
                <p className="text-sm text-gray-700 line-clamp-3 mb-3">
                    {course.description}
                </p>

                {course.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                        {course.tags.map(tag => (
                            <span key={tag} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {tag}
              </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}