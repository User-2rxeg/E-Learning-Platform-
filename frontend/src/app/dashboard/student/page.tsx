
// src/app/dashboard/student/page.tsx
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import { courseService } from '../../../lib/services/courses-api';
import apiClient from '../../../lib/services/apiClient';
import {
    BookOpen, Clock, TrendingUp, Award, Calendar, BarChart3,
    Play, Target, Zap, Users, ChevronRight, Star, Activity,
    AlertCircle, CheckCircle, Book, Video, FileText, Timer,
    Trophy, Brain, Flame, GraduationCap, RefreshCw
} from 'lucide-react';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    RadialLinearScale,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    RadialLinearScale,
    Title,
    Tooltip,
    Legend,
    Filler
);
// Types
interface EnrolledCourse {
    _id: string;
    title: string;
    description: string;
    instructorId: {
        _id: string;
        name: string;
    };
    modules: Array<{
        _id: string;
        title: string;
        resources: any[];
    }>;
    progress?: number;
    lastAccessed?: string;
    nextDeadline?: string;
    certificateAvailable: boolean;
    thumbnail?: string;
}
interface LearningStats {
    totalCourses: number;
    coursesCompleted: number;
    coursesInProgress: number;
    totalHoursLearned: number;
    currentStreak: number;
    longestStreak: number;
    averageScore: number;
    certificatesEarned: number;
    rank?: number;
    totalStudents?: number;
    weeklyGoal: number;
    weeklyProgress: number;
}
interface Activity {
    id: string;
    type: 'course_started' | 'quiz_completed' | 'module_completed' | 'certificate_earned';
    title: string;
    description: string;
    timestamp: string;
    icon?: any;
    color?: string;
    courseId?: string;
    score?: number;
}
interface QuizSchedule {
    id: string;
    courseId: string;
    courseTitle: string;
    quizTitle: string;
    dueDate: string;
    duration: number;
    questions: number;
    attempted: boolean;
    difficulty: 'easy' | 'medium' | 'hard';
}
interface AnalyticsData {
    studentId: string;
    completionPct: number;
    avgScore: number;
    totalTimeSpent: number;
    recentActivity: {
        attemptsLast7Days: number;
        attemptsLast30Days: number;
        modulesCompletedLast7Days: number;
        timeSpentLast7Days: number;
    };
    courses: Array<{
        courseId: string;
        courseTitle: string;
        progress: number;
        lastScore: number | null;
        lastActiveAt: Date | null;
        timeSpent: number;
        quizzesTaken: number;
        averageQuizScore: number;
    }>;
    attemptsCount: number;
    performanceTrend: Array<{
        date: string;
        score: number;
        timeSpent: number;
    }>;
    skillsProgress: Array<{
        skill: string;
        level: number;
        progress: number;
    }>;
}
// Utility functions
const safeParse = (s: string | null) => {
    try {
        return s ? JSON.parse(s) : null;
    } catch {
        return null;
    }
};
const formatTimeAgo = (timestamp: string | Date) => {
    const now = new Date().getTime();
    const time = new Date(timestamp).getTime();
    const diff = now - time;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days < 7) return `${days} days ago`;
    return new Date(timestamp).toLocaleDateString();
};
const formatDueDate = (date: string | Date) => {
    const dueDate = new Date(date);
    const now = new Date();
    const diff = dueDate.getTime() - now.getTime();
    const days = Math.floor(diff / 86400000);
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days < 7) return `In ${days} days`;
    return dueDate.toLocaleDateString();
};
const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
};
export default function StudentDashboard() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
// State Management
    const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
    const [stats, setStats] = useState<LearningStats | null>(null);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
    const [upcomingQuizzes, setUpcomingQuizzes] = useState<QuizSchedule[]>([]);
    const [loading, setLoading] = useState(false);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'performance' | 'analytics'>('overview');
    const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
    const [refreshing, setRefreshing] = useState(false);
// Auth and Role Check
    useEffect(() => {
        if (authLoading) return;
        if (!user) return; // Layout handles redirect to login
        if (user.role !== 'student') {
            router.replace('/dashboard');
            return;
        }

// Load all dashboard data
        loadDashboardData();
    }, [authLoading, user, router]);
// Main data loading function
    const loadDashboardData = async () => {
        if (!user) return;
        setLoading(true);
        setError(null);

        try {
            // Load courses and basic stats in parallel
            const [coursesData, analyticsData] = await Promise.all([
                courseService.getEnrolledCourses(),
                fetchAnalytics()
            ]);

            // Process courses with progress
            const coursesWithProgress = coursesData.map((course: any) => ({
                ...course,
                progress: calculateCourseProgress(course),
                lastAccessed: getLastAccessedTime(course._id),
            }));

            setEnrolledCourses(coursesWithProgress);
            setStats(calculateStats(coursesWithProgress, analyticsData));
            setRecentActivity(await loadRecentActivity());
            setUpcomingQuizzes(await loadUpcomingQuizzes(coursesWithProgress));
        } catch (error) {
            console.error('Error loading dashboard:', error);
            setError('Failed to load dashboard data. Please try again.');
        } finally {
            setLoading(false);
        }
    };
// Fetch analytics from backend
    const fetchAnalytics = async (): Promise<AnalyticsData | null> => {
        if (!user?.id && !user?._id) return null;
        try {
            setAnalyticsLoading(true);
            const userId = user.id || user._id;
            const response = await apiClient.get(`/analytics/student/${userId}/summary`);
            const data = response.data;
            setAnalytics(data);
            return data;
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
            return null;
        } finally {
            setAnalyticsLoading(false);
        }
    };
// Calculate course progress from localStorage
    const calculateCourseProgress = (course: any): number => {
        const saved = safeParse(localStorage.getItem(`course-progress-${course._id}`));
        if (!saved) return 0;
        const totalResources = (course.modules || []).reduce(
            (sum: number, module: any) => sum + (module?.resources?.length || 0),
            0
        );

        if (totalResources === 0) return 0;
        const completed = saved.completed?.length || 0;
        return Math.round((completed / totalResources) * 100);
    };
// Get last accessed time
    const getLastAccessedTime = (courseId: string): string => {
        const saved = safeParse(localStorage.getItem(`course-progress-${courseId}`));
        return saved?.timestamp || new Date().toISOString();
    };
// Calculate comprehensive stats
    const calculateStats = (courses: EnrolledCourse[], analyticsData: AnalyticsData | null): LearningStats => {
        const completed = courses.filter(c => (c.progress ?? 0) === 100).length;
        const inProgress = courses.filter(c => (c.progress ?? 0) > 0 && (c.progress ?? 0) < 100).length;
// Calculate hours from analytics or estimate
        const totalHours = analyticsData?.totalTimeSpent
            ? Math.round(analyticsData.totalTimeSpent / 60)
            : courses.reduce((sum, course) => {
                const moduleHours = (course.modules?.length || 0) * 2;
                return sum + (moduleHours * (course.progress || 0) / 100);
            }, 0);

        const streakData = safeParse(localStorage.getItem('learning-streak')) || {};
        const weeklyGoal = 10; // Default weekly goal in hours
        const weeklyProgress = analyticsData?.recentActivity?.timeSpentLast7Days
            ? analyticsData.recentActivity.timeSpentLast7Days / 60
            : Math.min(totalHours * 0.3, weeklyGoal);

        return {
            totalCourses: courses.length,
            coursesCompleted: completed,
            coursesInProgress: inProgress,
            totalHoursLearned: Math.round(totalHours),
            currentStreak: streakData.current || 0,
            longestStreak: streakData.longest || 0,
            averageScore: analyticsData?.avgScore || 0,
            certificatesEarned: completed,
            rank: 42,
            totalStudents: 1250,
            weeklyGoal,
            weeklyProgress: Math.round(weeklyProgress)
        };
    };
// Load recent activity
    const loadRecentActivity = async (): Promise<Activity[]> => {
// In production, fetch from backend
// For now, generate mock data with analytics integration
        const activities: Activity[] = [];
        if (analytics?.courses) {
            analytics.courses.forEach(course => {
                if (course.lastActiveAt) {
                    activities.push({
                        id: `activity-${course.courseId}`,
                        type: 'module_completed',
                        title: 'courses Activity',
                        description: `Progress in ${course.courseTitle}`,
                        timestamp: course.lastActiveAt.toString(),
                        courseId: course.courseId,
                        icon: BookOpen,
                        color: 'text-blue-500'
                    });
                }
            });
        }

// Add some default activities
        activities.push(
            {
                id: '1',
                type: 'module_completed',
                title: 'Completed Module',
                description: 'Advanced React Patterns',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                icon: CheckCircle,
                color: 'text-green-500'
            },
            {
                id: '2',
                type: 'quiz_completed',
                title: 'quiz Completed',
                description: 'Scored 92% in JavaScript quiz',
                timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
                icon: Award,
                color: 'text-blue-500',
                score: 92
            }
        );

        return activities.sort((a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ).slice(0, 5);
    };
// Load upcoming quizzes
    const loadUpcomingQuizzes = async (courses: EnrolledCourse[]): Promise<QuizSchedule[]> => {
// In production, fetch from backend
        return courses.slice(0, 3).map((course, index) => ({
            id: `quiz-${index}`,
        courseId: course._id,
            courseTitle: course.title,
            quizTitle:` Module ${index + 1} Assessment`,
            dueDate: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000).toISOString(),
            duration: 30 + (index * 10),
            questions: 10 + (index * 5),
            attempted: false,
            difficulty: ['easy', 'medium', 'hard'][index] as 'easy' | 'medium' | 'hard'
    }));
    };
// Refresh dashboard data
    const handleRefresh = async () => {
        setRefreshing(true);
        await loadDashboardData();
        setRefreshing(false);
    };
// Chart configurations
    const getChartData = () => {
        if (!analytics) return null;
        const progressChartData = {
            labels: analytics.courses.map(c => c.courseTitle.substring(0, 15) + '...'),
            datasets: [{
                label: 'progress-tracking %',
                data: analytics.courses.map(c => c.progress),
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 2,
                borderRadius: 5
            }]
        };

        const performanceChartData = {
            labels: analytics.performanceTrend?.map(p =>
                new Date(p.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })
            ) || [],
            datasets: [{
                label: 'quiz Scores',
                data: analytics.performanceTrend?.map(p => p.score) || [],
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                tension: 0.4,
                fill: true
            }]
        };

        const activityChartData = {
            labels: ['Last 7 Days', 'Last 30 Days', 'Total'],
            datasets: [{
                label: 'Learning Activity',
                data: [
                    analytics.recentActivity.attemptsLast7Days,
                    analytics.recentActivity.attemptsLast30Days,
                    analytics.attemptsCount
                ],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(168, 85, 247, 0.8)',
                    'rgba(251, 146, 60, 0.8)'
                ],
                borderWidth: 0
            }]
        };

        const skillsRadarData = {
            labels: analytics.skillsProgress?.map(s => s.skill) || ['JavaScript', 'React', 'Node.js', 'database', 'Testing'],
            datasets: [{
                label: 'Skill Level',
                data: analytics.skillsProgress?.map(s => s.level) || [85, 75, 60, 70, 50],
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                borderColor: 'rgb(99, 102, 241)',
                pointBackgroundColor: 'rgb(99, 102, 241)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(99, 102, 241)'
            }]
        };

        return { progressChartData, performanceChartData, activityChartData, skillsRadarData };
    };
// Loading state
    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading your dashboard...</p>
                </div>
            </div>
        );
    }
// Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={handleRefresh}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }
    const chartData = getChartData();
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
                            {refreshing && (
                                <RefreshCw className="w-4 h-4 ml-3 text-gray-400 animate-spin" />
                            )}
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={handleRefresh}
                                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                disabled={refreshing}
                            >
                                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                <AlertCircle className="w-5 h-5" />
                            </button>
                            <div className="flex items-center space-x-3">
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                    <p className="text-xs text-gray-500">Student</p>
                                </div>
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">
                        {getGreeting()}, {user?.name?.split(' ')[0]}! 👋
                    </h2>
                    <p className="text-gray-600 mt-2">
                        {stats?.currentStreak ? (
                            <>You're on a <span className="font-bold text-orange-500">{stats.currentStreak} day streak!</span> Keep it up! 🔥</>
                        ) : (
                            'Ready to continue your learning journey?'
                        )}
                    </p>
                </div>

                {/* Quick Stats with analytics Integration */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Enrolled Courses</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.totalCourses || 0}</p>
                                <p className="text-xs text-gray-500 mt-2">
                                    {stats?.coursesInProgress || 0} in progress
                                </p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <BookOpen className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Learning Hours</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.totalHoursLearned || 0}</p>
                                <div className="flex items-center mt-2">
                                    <div className="flex-1 bg-gray-200 rounded-full h-1 mr-2">
                                        <div
                                            className="bg-purple-600 h-1 rounded-full transition-all"
                                            style={{ width: `${Math.min(100, (stats?.weeklyProgress || 0) / (stats?.weeklyGoal || 10) * 100)}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-gray-500">{stats?.weeklyProgress}/{stats?.weeklyGoal}h</span>
                                </div>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-lg">
                                <Clock className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Average Score</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">
                                    {Math.round(analytics?.avgScore || stats?.averageScore || 0)}%
                                </p>
                                <p className="text-xs text-green-600 mt-2 flex items-center">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    {analytics?.recentActivity?.attemptsLast7Days || 0} quizzes this week
                                </p>
                            </div>
                            <div className="p-3 bg-green-50 rounded-lg">
                                <Target className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Completion Rate</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">
                                    {Math.round(analytics?.completionPct || 0)}%
                                </p>
                                <p className="text-xs text-gray-500 mt-2">
                                    {stats?.certificatesEarned || 0} certificates earned
                                </p>
                            </div>
                            <div className="p-3 bg-yellow-50 rounded-lg">
                                <Award className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
                    {(['overview', 'courses', 'performance', 'analytics'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-md font-medium text-sm transition-all capitalize ${
                                activeTab === tab
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Continue Learning */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Continue Learning</h3>
                                    <Link href="/courses" className="text-sm text-blue-600 hover:text-blue-700">
                                        View all courses →
                                    </Link>
                                </div>

                                {enrolledCourses.length > 0 ? (
                                    <div className="space-y-4">
                                        {enrolledCourses.slice(0, 3).map((course) => (
                                            <div key={course._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-gray-900">{course.title}</h4>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            by {course.instructorId.name}
                                                        </p>
                                                        <div className="flex items-center gap-4 mt-3">
                                                            <div className="flex items-center text-sm text-gray-500">
                                                                <Book className="w-4 h-4 mr-1" />
                                                                {course.modules.length} modules
                                                            </div>
                                                            <div className="flex items-center text-sm text-gray-500">
                                                                <Clock className="w-4 h-4 mr-1" />
                                                                {formatTimeAgo(course.lastAccessed || new Date())}
                                                            </div>
                                                        </div>
                                                        <div className="mt-3">
                                                            <div className="flex items-center justify-between text-sm mb-1">
                                                                <span className="text-gray-600">Progress</span>
                                                                <span className="font-medium">{course.progress || 0}%</span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                                <div
                                                                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                                                                    style={{ width: `${course.progress || 0}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Link
                                                        href={`/courses/${course._id}/learn`}
                                                        className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                                                    >
                                                        <Play className="w-4 h-4 mr-1" />
                                                        Resume
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                        <p className="text-gray-600">No courses enrolled yet</p>
                                        <Link
                                            href="/courses"
                                            className="inline-flex items-center mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                        >
                                            Browse Courses
                                            <ChevronRight className="w-4 h-4 ml-1" />
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Recent Activity */}
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                                <div className="space-y-4">
                                    {recentActivity.map((activity) => {
                                        const Icon = activity.icon || Activity;
                                        return (
                                            <div key={activity.id} className="flex items-start space-x-3">
                                                <div className={`p-2 rounded-lg bg-gray-50 ${activity.color}`}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                                                    <p className="text-sm text-gray-600">{activity.description}</p>
                                                    {activity.score && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mt-1">RetryEContinueEdittypescript             Score: {activity.score}%
                           </span>
                                                    )}
                                                    <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(activity.timestamp)}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Stats & Achievements */}
                        <div className="space-y-6">
                            {/* Upcoming quizzes */}
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Upcoming Quizzes</h3>
                                    <Calendar className="w-5 h-5 text-gray-400" />
                                </div>
                                {upcomingQuizzes.length > 0 ? (
                                    <div className="space-y-3">
                                        {upcomingQuizzes.map((quiz) => (
                                            <div key={quiz.id} className="border-l-4 border-blue-500 pl-4 py-2">
                                                <h4 className="font-medium text-gray-900 text-sm">{quiz.quizTitle}</h4>
                                                <p className="text-xs text-gray-600">{quiz.courseTitle}</p>
                                                <div className="flex items-center gap-3 mt-2">
                         <span className="text-xs text-gray-500 flex items-center">
                           <Timer className="w-3 h-3 mr-1" />
                             {quiz.duration} min
                         </span>
                                                    <span className="text-xs text-gray-500">
                           {quiz.questions} questions
                         </span>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                        quiz.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                                            quiz.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-red-100 text-red-700'
                                                    }`}>
                           {quiz.difficulty}
                         </span>
                                                </div>
                                                <p className="text-xs font-medium text-blue-600 mt-2">
                                                    {formatDueDate(quiz.dueDate)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-600">No upcoming quizzes</p>
                                )}
                            </div>

                            {/* Learning Streak */}
                            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-sm p-6 text-white">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold">Learning Streak</h3>
                                    <Flame className="w-6 h-6" />
                                </div>
                                <div className="text-center">
                                    <p className="text-5xl font-bold">{stats?.currentStreak || 0}</p>
                                    <p className="text-sm opacity-90 mt-2">days in a row</p>
                                </div>
                                <div className="mt-4 pt-4 border-t border-white/20">
                                    <div className="flex justify-between text-sm">
                                        <span className="opacity-90">Longest streak</span>
                                        <span className="font-semibold">{stats?.longestStreak || 0} days</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'courses' && (
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">My Courses</h3>
                            <div className="flex items-center gap-2">
                                <Link
                                    href="/courses"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                >
                                    Browse More Courses
                                </Link>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {enrolledCourses.map((course) => (
                                <div key={course._id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                                    <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 relative">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <BookOpen className="w-12 h-12 text-white/80" />
                                        </div>
                                        {course.progress === 100 && (
                                            <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Completed
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h4 className="font-semibold text-gray-900">{course.title}</h4>
                                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{course.description}</p>
                                        <div className="mt-4 space-y-3">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">Progress</span>
                                                <span className="font-medium">{course.progress || 0}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                                                    style={{ width: `${course.progress || 0}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="flex items-center text-sm text-gray-500">
                                                <Video className="w-4 h-4 mr-1" />
                                                {course.modules.length} modules
                                            </div>
                                            <Link
                                                href={`/courses/${course._id}/learn`}
                                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                            >
                                                Continue →
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'performance' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Skills progress-tracking */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills Development</h3>
                            <div className="space-y-4">
                                {(analytics?.skillsProgress || [
                                    { skill: 'JavaScript', progress: 85 },
                                    { skill: 'React', progress: 75 },
                                    { skill: 'Node.js', progress: 60 },
                                    { skill: 'TypeScript', progress: 70 },
                                    { skill: 'MongoDB', progress: 50 },
                                ]).map((skill, index) => (
                                    <div key={skill.skill}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium text-gray-700">{skill.skill}</span>
                                            <span className="text-sm text-gray-600">{skill.progress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all`}
                                                style={{ width: `${skill.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* quiz performance */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quiz Performance</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <p className="text-3xl font-bold text-gray-900">
                                        {Math.round(analytics?.avgScore || stats?.averageScore || 0)}%
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">Average Score</p>
                                </div>
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <p className="text-3xl font-bold text-gray-900">
                                        {analytics?.attemptsCount || 0}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">Quizzes Taken</p>
                                </div>
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <p className="text-3xl font-bold text-gray-900">
                                        {analytics?.recentActivity?.attemptsLast7Days || 0}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">This Week</p>
                                </div>
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <p className="text-3xl font-bold text-gray-900">
                                        {Math.round(analytics?.completionPct || 0)}%
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">Completion</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'analytics' && chartData && (
                    <div className="space-y-6">
                        {/* analytics Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Progress</h3>
                                <Bar
                                    data={chartData.progressChartData}
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: { display: false }
                                        },
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                max: 100
                                            }
                                        }
                                    }}
                                />
                            </div>

                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Activity</h3>
                                <Doughnut
                                    data={chartData.activityChartData}
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: {
                                                position: 'bottom'
                                            }
                                        }
                                    }}
                                />
                            </div>

                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trend</h3>
                                <Line
                                    data={chartData.performanceChartData}
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: { display: false }
                                        },
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                max: 100
                                            }
                                        }
                                    }}
                                />
                            </div>

                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills Radar</h3>
                                <Radar
                                    data={chartData.skillsRadarData}
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: { display: false }
                                        },
                                        scales: {
                                            r: {
                                                beginAtZero: true,
                                                max: 100
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {/* Detailed courses analytics */}
                        {analytics && (
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Details</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Course
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Progress
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Last Score
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Time Spent
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Last Active
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                        {analytics.courses.map((course) => (
                                            <tr key={course.courseId}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {course.courseTitle}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-1 max-w-xs">
                                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                                <div
                                                                    className="bg-blue-600 h-2 rounded-full"
                                                                    style={{ width: `${course.progress}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <span className="ml-2 text-sm text-gray-900">{course.progress}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {course.lastScore ? `${course.lastScore}%` : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {Math.round(course.timeSpent / 60)}h
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {course.lastActiveAt ? formatTimeAgo(course.lastActiveAt) : 'Never'}
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}