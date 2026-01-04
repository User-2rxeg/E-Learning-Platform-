'use client';

import { useState, useEffect } from 'react';
import type { MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Grid, List, BookOpen, Users, Star, Layers, ChevronLeft, ChevronRight } from 'lucide-react';

import { useAuth } from '../../contexts/AuthContext';
import { courseService } from '../../services';

interface Course {
    _id: string;
    title: string;
    description: string;
    instructorId: {
        _id: string;
        name: string;
        email: string;
    };
    tags: string[];
    status: 'active' | 'archived' | 'draft';
    studentsEnrolled: string[];
    modules: any[];
    feedback: { rating: number; comment?: string }[];
    createdAt: string;
    updatedAt: string;
}

interface CourseResponse {
    courses: Course[];
    total: number;
}

export default function CoursesPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTag, setSelectedTag] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'rating'>('latest');
    const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);
    const coursesPerPage = 12;

    useEffect(() => {
        if (user?.role === 'student') {
            fetchEnrolledCourses();
        }
    }, [user]);

    const fetchEnrolledCourses = async () => {
        try {
            const enrolled = await courseService.getEnrolledCourses();
            setEnrolledCourses(enrolled.map((c: any) => c._id));
        } catch (error) {
            console.error('Error fetching enrolled courses:', error);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, [currentPage, sortBy]);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const response: CourseResponse = await courseService.getCourses(currentPage, coursesPerPage);
            let filteredCourses = response.courses || [];

            if (user?.role === 'student') {
                filteredCourses = filteredCourses.filter((c) => c.status === 'active');
            }

            if (sortBy === 'popular') {
                filteredCourses.sort((a, b) => b.studentsEnrolled.length - a.studentsEnrolled.length);
            } else if (sortBy === 'rating') {
                filteredCourses.sort((a, b) => getAverageRating(b.feedback) - getAverageRating(a.feedback));
            }

            setCourses(filteredCourses);
            setTotalPages(Math.ceil((response.total || 0) / coursesPerPage));
        } catch (error) {
            console.error('Error fetching courses:', error);
            setCourses([]);
        } finally {
            setLoading(false);
        }
    };

    const getAverageRating = (feedback: any[]) => {
        if (!feedback || feedback.length === 0) return 0;
        return feedback.reduce((acc, f) => acc + f.rating, 0) / feedback.length;
    };

    const handleSearch = async () => {
        if (!searchTerm && !selectedTag) {
            fetchCourses();
            return;
        }

        setLoading(true);
        try {
            const response = await courseService.searchCourses({
                title: searchTerm,
                tag: selectedTag,
                page: currentPage,
                limit: coursesPerPage,
            });
            setCourses(response.items || []);
            setTotalPages(Math.ceil((response.total || 0) / coursesPerPage));
        } catch (error) {
            console.error('Error searching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async (courseId: string, e: MouseEvent) => {
        e.stopPropagation();
        if (!user) {
            router.push('/login');
            return;
        }

        try {
            await courseService.enrollCourse(courseId);
            setEnrolledCourses([...enrolledCourses, courseId]);
            alert('Successfully enrolled in course!');
        } catch (error) {
            console.error('Error enrolling in course:', error);
            alert('Failed to enroll. Please try again.');
        }
    };

    const allTags = Array.from(new Set(courses.flatMap((c) => c.tags || [])));

    return (
        <div className="min-h-screen bg-gray-50 pt-16">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-16 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Expand Your Knowledge
                    </h1>
                    <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                        Discover courses taught by industry experts and advance your skills
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-2xl mx-auto">
                        <div className="relative flex items-center bg-white rounded-xl shadow-lg overflow-hidden">
                            <Search className="absolute left-4 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search courses, topics, or instructors..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full py-4 pl-12 pr-32 text-gray-900 placeholder-gray-400 focus:outline-none"
                            />
                            <button
                                onClick={handleSearch}
                                className="absolute right-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                            >
                                Search
                            </button>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex justify-center gap-12 mt-12">
                        <div className="text-center">
                            <div className="text-3xl font-bold">{courses.length}</div>
                            <div className="text-blue-200 text-sm">Courses</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold">50+</div>
                            <div className="text-blue-200 text-sm">Instructors</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold">10k+</div>
                            <div className="text-blue-200 text-sm">Students</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Filters and Controls */}
            <section className="max-w-6xl mx-auto px-4 py-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                !selectedTag
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                            onClick={() => setSelectedTag('')}
                        >
                            All
                        </button>
                        {allTags.slice(0, 6).map((tag) => (
                            <button
                                key={tag}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                    selectedTag === tag
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                                onClick={() => setSelectedTag(tag)}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>

                    {/* Sort and View */}
                    <div className="flex items-center gap-3">
                        <select
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                        >
                            <option value="latest">Latest</option>
                            <option value="popular">Most Popular</option>
                            <option value="rating">Highest Rated</option>
                        </select>

                        <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                            <button
                                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                                onClick={() => setViewMode('grid')}
                            >
                                <Grid className="w-5 h-5" />
                            </button>
                            <button
                                className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                                onClick={() => setViewMode('list')}
                            >
                                <List className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Courses Grid */}
            <section className="max-w-6xl mx-auto px-4 pb-12">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl shadow-sm animate-pulse">
                                <div className="h-48 bg-gray-200 rounded-t-xl" />
                                <div className="p-5">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                                    <div className="h-3 bg-gray-200 rounded w-full mb-2" />
                                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : courses.length === 0 ? (
                    <div className="text-center py-16">
                        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
                        <p className="text-gray-500">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className={
                        viewMode === 'grid'
                            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                            : 'flex flex-col gap-4'
                    }>
                        {courses.map((course) => (
                            <CourseCard
                                key={course._id}
                                course={course}
                                viewMode={viewMode}
                                isEnrolled={enrolledCourses.includes(course._id)}
                                onEnroll={handleEnroll}
                                userRole={user?.role}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-8">
                        <button
                            className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                                    currentPage === i + 1
                                        ? 'bg-blue-600 text-white'
                                        : 'border border-gray-300 hover:bg-gray-50'
                                }`}
                                onClick={() => setCurrentPage(i + 1)}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button
                            className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
}

function CourseCard({
    course,
    viewMode,
    isEnrolled,
    onEnroll,
    userRole,
}: {
    course: Course;
    viewMode: 'grid' | 'list';
    isEnrolled: boolean;
    onEnroll: (id: string, e: MouseEvent) => void;
    userRole?: string;
}) {
    const router = useRouter();
    const avgRating = course.feedback?.length > 0
        ? course.feedback.reduce((acc, f) => acc + f.rating, 0) / course.feedback.length
        : 0;

    const handleCardClick = () => {
        router.push(`/courses/${course._id}`);
    };

    if (viewMode === 'list') {
        return (
            <div
                className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer flex overflow-hidden"
                onClick={handleCardClick}
            >
                <div className="w-48 h-36 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-12 h-12 text-white/80" />
                </div>
                <div className="flex-1 p-5 flex flex-col justify-between">
                    <div>
                        <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-gray-900 text-lg">{course.title}</h3>
                            {isEnrolled && (
                                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">Enrolled</span>
                            )}
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{course.description}</p>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {course.studentsEnrolled?.length || 0}
                            </span>
                            <span className="flex items-center gap-1">
                                <Layers className="w-4 h-4" />
                                {course.modules?.length || 0} modules
                            </span>
                            {avgRating > 0 && (
                                <span className="flex items-center gap-1 text-yellow-500">
                                    <Star className="w-4 h-4 fill-current" />
                                    {avgRating.toFixed(1)}
                                </span>
                            )}
                        </div>
                        {userRole === 'student' && !isEnrolled && (
                            <button
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                onClick={(e) => onEnroll(course._id, e)}
                            >
                                Enroll
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer overflow-hidden group"
            onClick={handleCardClick}
        >
            <div className="h-40 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center relative">
                <BookOpen className="w-16 h-16 text-white/80" />
                {isEnrolled && (
                    <span className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        Enrolled
                    </span>
                )}
                {course.status === 'draft' && (
                    <span className="absolute top-3 left-3 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                        Draft
                    </span>
                )}
            </div>

            <div className="p-5">
                <div className="flex flex-wrap gap-1 mb-2">
                    {course.tags?.slice(0, 2).map((tag) => (
                        <span key={tag} className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded">
                            {tag}
                        </span>
                    ))}
                </div>

                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {course.title}
                </h3>

                <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                    {course.description}
                </p>

                <div className="text-sm text-gray-500 mb-3">
                    By {course.instructorId?.name || 'Unknown'}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {course.studentsEnrolled?.length || 0}
                        </span>
                        <span className="flex items-center gap-1">
                            <Layers className="w-4 h-4" />
                            {course.modules?.length || 0}
                        </span>
                        {avgRating > 0 && (
                            <span className="flex items-center gap-1 text-yellow-500">
                                <Star className="w-4 h-4 fill-current" />
                                {avgRating.toFixed(1)}
                            </span>
                        )}
                    </div>
                </div>

                {userRole === 'student' && !isEnrolled && (
                    <button
                        className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                        onClick={(e) => onEnroll(course._id, e)}
                    >
                        Enroll Now
                    </button>
                )}

                {isEnrolled && (
                    <button className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                        Continue Learning
                    </button>
                )}
            </div>
        </div>
    );
}
