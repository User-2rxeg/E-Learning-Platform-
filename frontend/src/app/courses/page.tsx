// src/app/courses/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
 // Adjust the path as necessary

import { useAuth } from '../../contexts/AuthContext';
import {courseService} from "../../lib/services/courseApi";
import styles from './courses.module.css'; // Adjust the path as necessary

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
    }, [currentPage, sortBy]);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const response: CourseResponse = await courseService.getCourses(currentPage, coursesPerPage);

            // Filter only active courses for students
            let filteredCourses = response.courses;
            if (user?.role === 'student') {
                filteredCourses = response.courses.filter(c => c.status === 'active');
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
                limit: coursesPerPage
            });
            setCourses(response.items);
            setTotalPages(Math.ceil(response.total / coursesPerPage));
        } catch (error) {
            console.error('Error searching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async (courseId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (user?.role !== 'student') {
            router.push('/auth/login');
            return;
        }

        try {
            await courseService.enrollCourse(courseId);
            setEnrolledCourses([...enrolledCourses, courseId]);
            // Show success notification
            alert('Successfully enrolled in course!');
        } catch (error) {
            console.error('Error enrolling in course:', error);
            alert('Failed to enroll. Please try again.');
        }
    };

    const allTags = Array.from(new Set(courses.flatMap(c => c.tags)));

    return (
        <div className={styles.container}>
            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>
                        Expand Your Knowledge
                        <span className={styles.gradient}> Learn Without Limits</span>
                    </h1>
                    <p className={styles.heroSubtitle}>
                        Discover courses taught by industry experts and advance your skills
                    </p>

                    {/* Search Bar */}
                    <div className={styles.searchContainer}>
                        <div className={styles.searchBar}>
                            <svg className={styles.searchIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search courses, topics, or instructors..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className={styles.searchInput}
                            />
                            <button onClick={handleSearch} className={styles.searchButton}>
                                Search
                            </button>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className={styles.stats}>
                        <div className={styles.stat}>
                            <span className={styles.statNumber}>{courses.length}</span>
                            <span className={styles.statLabel}>Available Courses</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statNumber}>50+</span>
                            <span className={styles.statLabel}>Expert Instructors</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statNumber}>10k+</span>
                            <span className={styles.statLabel}>Active Students</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Filters and Controls */}
            <section className={styles.controls}>
                <div className={styles.filters}>
                    {/* Tags Filter */}
                    <div className={styles.tagFilter}>
                        <button
                            className={`${styles.tag} ${!selectedTag ? styles.tagActive : ''}`}
                            onClick={() => setSelectedTag('')}
                        >
                            All
                        </button>
                        {allTags.slice(0, 6).map(tag => (
                            <button
                                key={tag}
                                className={`${styles.tag} ${selectedTag === tag ? styles.tagActive : ''}`}
                                onClick={() => setSelectedTag(tag)}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>

                    {/* Sort and View Controls */}
                    <div className={styles.viewControls}>
                        <select
                            className={styles.sortSelect}
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                        >
                            <option value="latest">Latest</option>
                            <option value="popular">Most Popular</option>
                            <option value="rating">Highest Rated</option>
                        </select>

                        <div className={styles.viewToggle}>
                            <button
                                className={`${styles.viewButton} ${viewMode === 'grid' ? styles.viewActive : ''}`}
                                onClick={() => setViewMode('grid')}
                            >
                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM13 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z" />
                                </svg>
                            </button>
                            <button
                                className={`${styles.viewButton} ${viewMode === 'list' ? styles.viewActive : ''}`}
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
            <section className={styles.coursesSection}>
                {loading ? (
                    <div className={styles.loadingGrid}>
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className={styles.skeletonCard}>
                                <div className={styles.skeletonImage}></div>
                                <div className={styles.skeletonContent}>
                                    <div className={styles.skeletonTitle}></div>
                                    <div className={styles.skeletonText}></div>
                                    <div className={styles.skeletonText}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : courses.length === 0 ? (
                    <div className={styles.emptyState}>
                        <svg className={styles.emptyIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <h3>No courses found</h3>
                        <p>Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className={viewMode === 'grid' ? styles.coursesGrid : styles.coursesList}>
                        {courses.map(course => (
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
                <div className={styles.pagination}>
                    <button
                        className={styles.pageButton}
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>

                    <div className={styles.pageNumbers}>
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                className={`${styles.pageNumber} ${currentPage === i + 1 ? styles.pageActive : ''}`}
                                onClick={() => setCurrentPage(i + 1)}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>

                    <button
                        className={styles.pageButton}
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}

// Course Card Component
function CourseCard({
                        course,
                        viewMode,
                        isEnrolled,
                        onEnroll,
                        userRole
                    }: {
    course: Course;
    viewMode: 'grid' | 'list';
    isEnrolled: boolean;
    onEnroll: (id: string, e: React.MouseEvent) => void;
    userRole?: string;
}) {
    const router = useRouter();
    const avgRating = course.feedback.length > 0
        ? course.feedback.reduce((acc, f) => acc + f.rating, 0) / course.feedback.length
        : 0;

    const handleCardClick = () => {
        router.push(`/courses/${course._id}`);
    };

    return (
        <div
            className={viewMode === 'grid' ? styles.courseCard : styles.courseListItem}
            onClick={handleCardClick}
        >
            {/* Course Image/Thumbnail */}
            <div className={styles.courseImage}>
                <div className={styles.imagePlaceholder}>
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                </div>
                {course.status === 'draft' && (
                    <span className={styles.draftBadge}>Draft</span>
                )}
                {isEnrolled && (
                    <span className={styles.enrolledBadge}>Enrolled</span>
                )}
            </div>

            {/* Course Content */}
            <div className={styles.courseContent}>
                <div className={styles.courseHeader}>
                    <h3 className={styles.courseTitle}>{course.title}</h3>
                    {course.tags.length > 0 && (
                        <div className={styles.courseTags}>
                            {course.tags.slice(0, 2).map(tag => (
                                <span key={tag} className={styles.courseTag}>{tag}</span>
                            ))}
                        </div>
                    )}
                </div>

                <p className={styles.courseDescription}>
                    {course.description.length > 100
                        ? `${course.description.substring(0, 100)}...`
                        : course.description}
                </p>

                <div className={styles.courseInstructor}>
                    <svg className={styles.instructorIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>{course.instructorId.name}</span>
                </div>

                <div className={styles.courseMeta}>
                    <div className={styles.metaItem}>
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span>{course.studentsEnrolled.length} students</span>
                    </div>

                    <div className={styles.metaItem}>
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span>{course.modules.length} modules</span>
                    </div>

                    {avgRating > 0 && (
                        <div className={styles.metaItem}>
                            <svg fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span>{avgRating.toFixed(1)}</span>
                        </div>
                    )}
                </div>

                {/* Action Button */}
                <div className={styles.courseActions}>
                    {userRole === 'student' ? (
                        isEnrolled ? (
                            <button className={styles.continueButton}>
                                Continue Learning
                            </button>
                        ) : (
                            <button
                                className={styles.enrollButton}
                                onClick={(e) => onEnroll(course._id, e)}
                            >
                                Enroll Now
                            </button>
                        )
                    ) : userRole === 'instructor' && course.instructorId._id === localStorage.getItem('userId') ? (
                        <button className={styles.editButton}>
                            Edit Course
                        </button>
                    ) : (
                        <button className={styles.viewButton}>
                            View Details
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}