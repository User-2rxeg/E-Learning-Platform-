// src/app/courses/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './courseDetails.module.css';
import { useAuth } from '../../../contexts/AuthContext';
import {courseService} from "../../../lib/services/courseApi";
interface Module {
    title: string;
    resources: {
        resourceType: 'video' | 'pdf' | 'link';
        url: string;
        filename?: string;
        mimeType?: string;
        size?: number;
    }[];
    quizzes?: string[];
    notesEnabled?: boolean;
}

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
    modules: Module[];
    feedback: { rating: number; comment?: string; createdAt: string }[];
    versionHistory: any[];
    certificateAvailable: boolean;
    createdAt: string;
    updatedAt: string;
}

export default function CourseDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const courseId = params.id as string;

    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [expandedModules, setExpandedModules] = useState<number[]>([]);
    const [activeTab, setActiveTab] = useState<'overview' | 'modules' | 'reviews'>('overview');

    useEffect(() => {
        fetchCourseDetails();
    }, [courseId]);

    const fetchCourseDetails = async () => {
        try {
            const data = await courseService.getCourse(courseId);
            setCourse(data);

            // Check if student is enrolled
            if (user?.role === 'student' && data.studentsEnrolled) {
                setIsEnrolled(data.studentsEnrolled.includes(user.id));
            }
        } catch (error) {
            console.error('Error fetching course:', error);
            router.push('/courses');
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async () => {
        if (!user) {
            router.push('/auth/login');
            return;
        }

        try {
            await courseService.enrollCourse(courseId);
            setIsEnrolled(true);
            // Update the course to reflect new enrollment
            if (course) {
                setCourse({
                    ...course,
                    studentsEnrolled: [...course.studentsEnrolled, user.id]
                });
            }
            alert('Successfully enrolled in the course!');
        } catch (error) {
            console.error('Error enrolling:', error);
            alert('Failed to enroll. Please try again.');
        }
    };

    const toggleModule = (index: number) => {
        setExpandedModules(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    const getAverageRating = () => {
        if (!course || course.feedback.length === 0) return 0;
        const sum = course.feedback.reduce((acc, f) => acc + f.rating, 0);
        return (sum / course.feedback.length).toFixed(1);
    };

    const getRatingDistribution = () => {
        if (!course) return [];
        const distribution = [0, 0, 0, 0, 0]; // 1-5 stars
        course.feedback.forEach(f => {
            distribution[f.rating - 1]++;
        });
        return distribution.reverse(); // 5 stars first
    };

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return '';
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loader}></div>
                <p>Loading course details...</p>
            </div>
        );
    }

    if (!course) {
        return (
            <div className={styles.errorContainer}>
                <h2>Course not found</h2>
                <Link href="/courses" className={styles.backButton}>
                    Back to Courses
                </Link>
            </div>
        );
    }

    const isInstructor = user?.role === 'instructor' && course.instructorId._id === user.id;
    const canStartLearning = isEnrolled || isInstructor;

    return (
        <div className={styles.container}>
            {/* Header Section */}
            <section className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.breadcrumb}>
                        <Link href="/courses">Courses</Link>
                        <span>/</span>
                        <span>{course.title}</span>
                    </div>

                    <div className={styles.headerMain}>
                        <div className={styles.headerInfo}>
                            <div className={styles.tags}>
                                {course.tags.map(tag => (
                                    <span key={tag} className={styles.tag}>{tag}</span>
                                ))}
                            </div>

                            <h1 className={styles.title}>{course.title}</h1>

                            <p className={styles.description}>{course.description}</p>

                            <div className={styles.instructor}>
                                <div className={styles.instructorAvatar}>
                                    {course.instructorId.name[0].toUpperCase()}
                                </div>
                                <div>
                                    <p className={styles.instructorLabel}>Instructor</p>
                                    <p className={styles.instructorName}>{course.instructorId.name}</p>
                                </div>
                            </div>

                            <div className={styles.stats}>
                                <div className={styles.stat}>
                                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                    <span>{course.studentsEnrolled.length} students enrolled</span>
                                </div>

                                <div className={styles.stat}>
                                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span>{course.modules.length} modules</span>
                                </div>

                                {getAverageRating() !== '0' && (
                                    <div className={styles.stat}>
                                        <svg fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        <span>{getAverageRating()} ({course.feedback.length} reviews)</span>
                                    </div>
                                )}

                                {course.certificateAvailable && (
                                    <div className={styles.stat}>
                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                        </svg>
                                        <span>Certificate available</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={styles.headerActions}>
                            <div className={styles.enrollCard}>
                                <div className={styles.enrollPrice}>
                                    <span className={styles.priceLabel}>Course Access</span>
                                    <span className={styles.price}>Free</span>
                                </div>

                                {user?.role === 'student' ? (
                                    isEnrolled ? (
                                        <Link href={`/courses/${courseId}/learn`} className={styles.startButton}>
                                            Continue Learning
                                        </Link>
                                    ) : (
                                        <button onClick={handleEnroll} className={styles.enrollButton}>
                                            Enroll Now
                                        </button>
                                    )
                                ) : isInstructor ? (
                                    <>
                                        <Link href={`/courses/${courseId}/edit`} className={styles.editButton}>
                                            Edit Course
                                        </Link>
                                        <Link href={`/courses/${courseId}/learn`} className={styles.previewButton}>
                                            Preview Course
                                        </Link>
                                    </>
                                ) : (
                                    <Link href="/auth/login" className={styles.loginButton}>
                                        Login to Enroll
                                    </Link>
                                )}

                                <div className={styles.enrollFeatures}>
                                    <div className={styles.feature}>
                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Lifetime access</span>
                                    </div>
                                    <div className={styles.feature}>
                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Interactive quizzes</span>
                                    </div>
                                    <div className={styles.feature}>
                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Downloadable resources</span>
                                    </div>
                                    {course.certificateAvailable && (
                                        <div className={styles.feature}>
                                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span>Certificate of completion</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content Tabs */}
            <section className={styles.content}>
                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'overview' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'modules' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('modules')}
                    >
                        Course Content ({course.modules.length})
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'reviews' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('reviews')}
                    >
                        Reviews ({course.feedback.length})
                    </button>
                </div>

                <div className={styles.tabContent}>
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className={styles.overview}>
                            <div className={styles.section}>
                                <h2>What you'll learn</h2>
                                <div className={styles.learningObjectives}>
                                    <div className={styles.objective}>
                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Master the fundamentals of {course.title}</span>
                                    </div>
                                    <div className={styles.objective}>
                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Build practical projects and gain hands-on experience</span>
                                    </div>
                                    <div className={styles.objective}>
                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Learn industry best practices and modern techniques</span>
                                    </div>
                                    <div className={styles.objective}>
                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Prepare for real-world applications and challenges</span>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.section}>
                                <h2>Course Description</h2>
                                <p className={styles.longDescription}>{course.description}</p>
                            </div>

                            <div className={styles.section}>
                                <h2>Requirements</h2>
                                <ul className={styles.requirements}>
                                    <li>Basic understanding of the subject matter</li>
                                    <li>A computer with internet connection</li>
                                    <li>Willingness to learn and practice</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Modules Tab */}
                    {activeTab === 'modules' && (
                        <div className={styles.modules}>
                            {course.modules.length === 0 ? (
                                <div className={styles.emptyModules}>
                                    <p>No modules have been added yet.</p>
                                </div>
                            ) : (
                                course.modules.map((module, index) => (
                                    <div key={index} className={styles.module}>
                                        <div
                                            className={styles.moduleHeader}
                                            onClick={() => toggleModule(index)}
                                        >
                                            <div className={styles.moduleInfo}>
                                                <span className={styles.moduleNumber}>Module {index + 1}</span>
                                                <h3 className={styles.moduleTitle}>{module.title}</h3>
                                                <span className={styles.moduleCount}>
                          {module.resources.length} resources
                                                    {module.quizzes && module.quizzes.length > 0 && `, ${module.quizzes.length} quiz`}
                        </span>
                                            </div>
                                            <svg
                                                className={`${styles.chevron} ${expandedModules.includes(index) ? styles.chevronOpen : ''}`}
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>

                                        {expandedModules.includes(index) && (
                                            <div className={styles.moduleContent}>
                                                {module.resources.map((resource, rIndex) => (
                                                    <div key={rIndex} className={styles.resource}>
                                                        <div className={styles.resourceIcon}>
                                                            {resource.resourceType === 'video' && (
                                                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                            )}
                                                            {resource.resourceType === 'pdf' && (
                                                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                </svg>
                                                            )}
                                                            {resource.resourceType === 'link' && (
                                                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                                          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                                </svg>
                                                            )}