
'use client';

import { useState, useEffect } from 'react';
import type { MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

    // Fetch enrolled courses if student
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

    // Fetch courses
    useEffect(() => {
        fetchCourses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, sortBy]);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const response: CourseResponse = await courseService.getCourses(currentPage, coursesPerPage);

            // Filter only active courses for students
            let filteredCourses = response.courses;
            if (user?.role === 'student') {
                filteredCourses = response.courses.filter((c) => c.status === 'active');
            }

            // Sort courses
            if (sortBy === 'popular') {
                filteredCourses.sort((a, b) => b.studentsEnrolled.length - a.studentsEnrolled.length);
            } else if (sortBy === 'rating') {
                filteredCourses.sort((a, b) => {
                    const avgA = getAverageRating(a.feedback);
                    const avgB = getAverageRating(b.feedback);
                    return avgB - avgA;
                });
            }

            setCourses(filteredCourses);
            setTotalPages(Math.ceil(response.total / coursesPerPage));
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const getAverageRating = (feedback: any[]) => {
        if (!feedback || feedback.length === 0) return 0;
        const sum = feedback.reduce((acc, f) => acc + f.rating, 0);
        return sum / feedback.length;
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
            setCourses(response.items);
            setTotalPages(Math.ceil(response.total / coursesPerPage));
        } catch (error) {
            console.error('Error searching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async (courseId: string, e: MouseEvent) => {
        e.stopPropagation();
        if (user?.role !== 'student') {
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

    const allTags = Array.from(new Set(courses.flatMap((c) => c.tags)));

    return (
        <div className="course-container">
            {/* Hero Section */}
            <section className="course-hero">
                <div className="course-heroContent">
                    <h1 className="course-heroTitle">
                        Expand Your Knowledge
                        <span className="course-gradient"> Learn Without Limits</span>
                    </h1>
                    <p className="course-heroSubtitle">
                        Discover courses taught by industry experts and advance your skills
                    </p>

                    {/* Search Bar */}
                    <div className="course-searchContainer">
                        <div className="course-searchBar">
                            <svg className="course-searchIcon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search courses, topics, or instructors..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="course-searchInput"
                            />
                            <button onClick={handleSearch} className="course-searchButton">
                                Search
                            </button>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="course-stats">
                        <div className="course-stat">
                            <span className="course-statNumber">{courses.length}</span>
                            <span className="course-statLabel">Available Courses</span>
                        </div>
                        <div className="course-stat">
                            <span className="course-statNumber">50+</span>
                            <span className="course-statLabel">Expert Instructors</span>
                        </div>
                        <div className="course-stat">
                            <span className="course-statNumber">10k+</span>
                            <span className="course-statLabel">Active Students</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Filters and Controls */}
            <section className="course-controls">
                <div className="course-filters">
                    {/* Tags Filter */}
                    <div className="course-tagFilter">
                        <button
                            className={`course-tag ${!selectedTag ? 'course-tagActive' : ''}`}
                            onClick={() => setSelectedTag('')}
                        >
                            All
                        </button>
                        {allTags.slice(0, 6).map((tag) => (
                            <button
                                key={tag}
                                className={`course-tag ${selectedTag === tag ? 'course-tagActive' : ''}`}
                                onClick={() => setSelectedTag(tag)}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>

                    {/* Sort and View Controls */}
                    <div className="course-viewControls">
                        <select
                            className="course-sortSelect"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                        >
                            <option value="latest">Latest</option>
                            <option value="popular">Most Popular</option>
                            <option value="rating">Highest Rated</option>
                        </select>

                        <div className="course-viewToggle">
                            <button
                                className={`course-viewButton ${viewMode === 'grid' ? 'course-viewActive' : ''}`}
                                onClick={() => setViewMode('grid')}
                            >
                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM13 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z" />
                                </svg>
                            </button>
                            <button
                                className={`course-viewButton ${viewMode === 'list' ? 'course-viewActive' : ''}`}
                                onClick={() => setViewMode('list')}
                            >
                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Courses Grid/List */}
            <section className="course-coursesSection">
                {loading ? (
                    <div className="course-loadingGrid">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="course-skeletonCard">
                                <div className="course-skeletonImage" />
                                <div className="course-skeletonContent">
                                    <div className="course-skeletonTitle" />
                                    <div className="course-skeletonText" />
                                    <div className="course-skeletonText" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : courses.length === 0 ? (
                    <div className="course-emptyState">
                        <svg className="course-emptyIcon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <h3>No courses found</h3>
                        <p>Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className={viewMode === 'grid' ? 'course-coursesGrid' : 'course-coursesList'}>
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
            </section>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="course-pagination">
                    <button
                        className="course-pageButton"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>

                    <div className="course-pageNumbers">
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                className={`course-pageNumber ${currentPage === i + 1 ? 'course-pageActive' : ''}`}
                                onClick={() => setCurrentPage(i + 1)}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>

                    <button
                        className="course-pageButton"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}

// courses Card Component
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
    const avgRating =
        course.feedback.length > 0
            ? course.feedback.reduce((acc, f) => acc + f.rating, 0) / course.feedback.length
            : 0;

    const handleCardClick = () => {
        router.push(`/courses/${course._id}`);
    };

    return (
        <div
            className={viewMode === 'grid' ? 'course-courseCard' : 'course-courseListItem'}
            onClick={handleCardClick}
        >
            {/* courses Image/Thumbnail */}
            <div className="course-courseImage">
                <div className="course-imagePlaceholder">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                    </svg>
                </div>
                {course.status === 'draft' && <span className="course-draftBadge">Draft</span>}
                {isEnrolled && <span className="course-enrolledBadge">Enrolled</span>}
            </div>

            {/* courses Content */}
            <div className="course-courseContent">
                <div className="course-courseHeader">
                    <h3 className="course-courseTitle">{course.title}</h3>
                    {course.tags.length > 0 && (
                        <div className="course-courseTags">
                            {course.tags.slice(0, 2).map((tag) => (
                                <span key={tag} className="course-courseTag">
                  {tag}
                </span>
                            ))}
                        </div>
                    )}
                </div>

                <p className="course-courseDescription">
                    {course.description.length > 100 ? `${course.description.substring(0, 100)}...` : course.description}
                </p>

                <div className="course-courseInstructor">
                    <svg className="course-instructorIcon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>{course.instructorId.name}</span>
                </div>

                <div className="course-courseMeta">
                    <div className="course-metaItem">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span>{course.studentsEnrolled.length} students</span>
                    </div>

                    <div className="course-metaItem">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span>{course.modules.length} modules</span>
                    </div>

                    {avgRating > 0 && (
                        <div className="course-metaItem">
                            <svg fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span>{avgRating.toFixed(1)}</span>
                        </div>
                    )}
                </div>

                {/* Action Button */}
                <div className="course-courseActions">
                    {userRole === 'student' ? (
                        isEnrolled ? (
                            <button className="course-continueButton">Continue Learning</button>
                        ) : (
                            <button className="course-enrollButton" onClick={(e) => onEnroll(course._id, e)}>
                                Enroll Now
                            </button>
                        )
                    ) : userRole === 'instructor' && course.instructorId._id === localStorage.getItem('userId') ? (
                        <button className="course-editButton">Edit Course</button>
                    ) : (
                        <button className="course-viewButton">View Details</button>
                    )}
                </div>
            </div>
        </div>
    );
}

