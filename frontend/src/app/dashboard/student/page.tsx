// src/app/dashboard/student/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import Link from 'next/link';
import axios from 'axios';

interface EnrolledCourse {
    _id: string;
    title: string;
    description: string;
    instructorId: {
        _id: string;
        name: string;
    };
    modules: any[];
    progress?: number; // We'll calculate this from performance data
}

interface Performance {
    _id: string;
    studentId: string;
    courseId: string;
    completionPercentage: number;
    averageScore: number;
    lastAccessed: string;
    totalTimeSpent: number;
    quizzesTaken: number;
    assignmentsCompleted: number;
}

interface StudentSummary {
    completionPct: number;
    avgScore: number;
    attemptsCount: number;
    recentActivity?: {
        attemptsLast7Days: number;
        attemptsLast30Days: number;
    };
}

export default function StudentDashboard() {
    const { user, token } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
    const [performances, setPerformances] = useState<Performance[]>([]);
    const [studentSummary, setStudentSummary] = useState<StudentSummary | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user && token) {
            fetchDashboardData();
        }
    }, [user, token]);

    const fetchDashboardData = async () => {
        if (!user) return;

        try {
            setLoading(true);
            setError(null);

            // Fetch enrolled courses using the correct endpoint
            const coursesResponse = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/courses/enrolled`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            console.log('Enrolled courses:', coursesResponse.data);
            setEnrolledCourses(coursesResponse.data || []);

            // Fetch performance data for the student
            const performanceResponse = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/performance/student/${user.id}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            console.log('Performance data:', performanceResponse.data);
            setPerformances(performanceResponse.data || []);

            // Fetch analytics summary
            try {
                const summaryResponse = await axios.get(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/analytics/student/${user.id}/summary`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
                console.log('Student summary:', summaryResponse.data);
                setStudentSummary(summaryResponse.data);
            } catch (summaryError) {
                console.log('Analytics summary not available:', summaryError);
                // Continue without summary - it's not critical
            }

        } catch (error: any) {
            console.error('Error fetching dashboard data:', error);
            setError(error.response?.data?.message || 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    // Helper function to get course progress
    const getCourseProgress = (courseId: string): number => {
        const performance = performances.find(p => p.courseId === courseId);
        return performance?.completionPercentage || 0;
    };

    // Helper function to get course performance data
    const getCoursePerformance = (courseId: string): Performance | undefined => {
        return performances.find(p => p.courseId === courseId);
    };

    // Calculate overall stats from performance data
    const calculateStats = () => {
        const totalCourses = enrolledCourses.length;
        const completedCourses = performances.filter(p => p.completionPercentage >= 100).length;
        const avgScore = performances.length > 0
            ? performances.reduce((acc, p) => acc + (p.averageScore || 0), 0) / performances.length
            : 0;
        const totalQuizzes = performances.reduce((acc, p) => acc + (p.quizzesTaken || 0), 0);
        const totalHours = performances.reduce((acc, p) => acc + (p.totalTimeSpent || 0), 0) / 60; // Convert minutes to hours

        return {
            totalCourses,
            completedCourses,
            avgScore: Math.round(avgScore),
            totalQuizzes,
            totalHours: Math.round(totalHours)
        };
    };

    const stats = calculateStats();

    const getProgressColor = (progress: number) => {
        if (progress >= 80) return 'bg-green-500';
        if (progress >= 50) return 'bg-yellow-500';
        return 'bg-blue-500';
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays <= 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-500 px-4 py-3 rounded-md">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                    Welcome back, {user?.fullName}! 👋
                </h1>
                <p className="text-text-secondary">
                    Track your learning progress and continue your courses
                </p>
            </div>

            {/* Stats Overview - Using actual data from backend */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <div className="bg-primary-light p-6 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-text-secondary text-sm">Enrolled</span>
                        <span className="text-2xl">📚</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{stats.totalCourses}</div>
                    <Link href="/courses" className="text-accent text-sm hover:text-accent-hover">
                        Browse more →
                    </Link>
                </div>

                <div className="bg-primary-light p-6 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-text-secondary text-sm">Completed</span>
                        <span className="text-2xl">✅</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{stats.completedCourses}</div>
                    <div className="text-green-400 text-sm">
                        {stats.totalCourses > 0
                            ? `${Math.round((stats.completedCourses / stats.totalCourses) * 100)}% rate`
                            : 'Start learning!'}
                    </div>
                </div>

                <div className="bg-primary-light p-6 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-text-secondary text-sm">Avg Score</span>
                        <span className="text-2xl">📊</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {studentSummary?.avgScore || stats.avgScore}%
                    </div>
                    <div className="text-text-secondary text-sm">
                        Overall performance
                    </div>
                </div>

                <div className="bg-primary-light p-6 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-text-secondary text-sm">Quizzes</span>
                        <span className="text-2xl">📝</span>
                    </div>
                    <div className="text-2xl font-bold text-white">
                        {studentSummary?.attemptsCount || stats.totalQuizzes}
                    </div>
                    <div className="text-text-secondary text-sm">
                        Total attempts
                    </div>
                </div>

                <div className="bg-primary-light p-6 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-text-secondary text-sm">Study Time</span>
                        <span className="text-2xl">⏱️</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{stats.totalHours}h</div>
                    <div className="text-text-secondary text-sm">
                        Total hours
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    {/* Continue Learning Section */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-white">My Courses</h2>
                            <Link href="/courses" className="text-accent hover:text-accent-hover text-sm">
                                Browse all courses →
                            </Link>
                        </div>

                        {enrolledCourses.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {enrolledCourses.slice(0, 4).map((course) => {
                                    const progress = getCourseProgress(course._id);
                                    const performance = getCoursePerformance(course._id);

                                    return (
                                        <div key={course._id} className="bg-primary-light rounded-lg p-4 hover:shadow-lg transition-shadow">
                                            <h3 className="font-semibold text-white mb-2 line-clamp-1">
                                                {course.title}
                                            </h3>
                                            <p className="text-text-secondary text-sm mb-1">
                                                by {course.instructorId?.name || 'Unknown'}
                                            </p>
                                            <p className="text-text-secondary text-xs mb-3 line-clamp-2">
                                                {course.description}
                                            </p>

                                            {/* Progress Bar */}
                                            <div className="mb-3">
                                                <div className="flex justify-between text-xs text-text-secondary mb-1">
                                                    <span>Progress</span>
                                                    <span>{progress}%</span>
                                                </div>
                                                <div className="w-full bg-primary rounded-full h-2">
                                                    <div
                                                        className={`${getProgressColor(progress)} h-2 rounded-full transition-all`}
                                                        style={{ width: `${progress}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Course Stats */}
                                            {performance && (
                                                <div className="flex justify-between text-xs text-text-secondary mb-3">
                                                    <span>Score: {Math.round(performance.averageScore)}%</span>
                                                    <span>Last: {formatDate(performance.lastAccessed)}</span>
                                                </div>
                                            )}

                                            <button
                                                onClick={() => router.push(`/courses/${course._id}/learn`)}
                                                className="w-full py-2 bg-accent hover:bg-accent-hover text-white rounded-md text-sm transition-colors"
                                            >
                                                {progress > 0 ? 'Continue Learning' : 'Start Course'}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="bg-primary-light rounded-lg p-8 text-center">
                                <div className="text-4xl mb-4">📚</div>
                                <p className="text-text-secondary mb-4">You haven't enrolled in any courses yet</p>
                                <Link href="/courses" className="btn-primary inline-block">
                                    Browse Courses
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Recent Activity from Analytics */}
                    {studentSummary?.recentActivity && (
                        <div>
                            <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
                            <div className="bg-primary-light rounded-lg p-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-accent">
                                            {studentSummary.recentActivity.attemptsLast7Days}
                                        </div>
                                        <p className="text-text-secondary text-sm">Quizzes Last 7 Days</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-accent">
                                            {studentSummary.recentActivity.attemptsLast30Days}
                                        </div>
                                        <p className="text-text-secondary text-sm">Quizzes Last 30 Days</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <div>
                        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
                        <div className="bg-primary-light rounded-lg p-4 space-y-2">
                            <Link href="/courses" className="block w-full py-2 px-4 bg-primary hover:bg-primary-dark text-white rounded-md text-center transition-colors">
                                Browse Courses
                            </Link>
                            <Link href="/dashboard/my-courses" className="block w-full py-2 px-4 bg-primary hover:bg-primary-dark text-white rounded-md text-center transition-colors">
                                All My Courses
                            </Link>
                            <Link href="/chat" className="block w-full py-2 px-4 bg-primary hover:bg-primary-dark text-white rounded-md text-center transition-colors">
                                Study Chat
                            </Link>
                            <Link href="/forums" className="block w-full py-2 px-4 bg-primary hover:bg-primary-dark text-white rounded-md text-center transition-colors">
                                Forums
                            </Link>
                            <Link href="/notes" className="block w-full py-2 px-4 bg-primary hover:bg-primary-dark text-white rounded-md text-center transition-colors">
                                My Notes
                            </Link>
                        </div>
                    </div>

                    {/* Completion Overview */}
                    {studentSummary && (
                        <div>
                            <h2 className="text-xl font-semibold text-white mb-4">Overall Progress</h2>
                            <div className="bg-primary-light rounded-lg p-6">
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-accent mb-2">
                                        {Math.round(studentSummary.completionPct)}%
                                    </div>
                                    <p className="text-text-secondary">Overall Completion</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}