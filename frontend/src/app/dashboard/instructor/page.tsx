// src/app/dashboard/instructor/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import { courseService } from '../../../lib/services/courseApi';
import {
    BookOpen,
    Users,
    TrendingUp,
    Award,
    Calendar,
    BarChart3,
    Plus,
    Edit,
    Eye,
    MoreVertical,
    Clock,
    DollarSign,
    Star,
    MessageSquare,
    Video,
    FileText,
    ChevronRight,
    AlertCircle,
    CheckCircle,
    XCircle,
    Upload,
    Settings,
    Activity,
    Target,
    Briefcase,
    GraduationCap,
    PlayCircle,
    PauseCircle,
    Archive
} from 'lucide-react';
interface InstructorCourse {
    _id: string;
    title: string;
    description: string;
    status: 'active' | 'draft' | 'archived';
    studentsEnrolled: string[];
    modules: any[];
    feedback: { rating: number; comment?: string; createdAt: string }[];
    createdAt: string;
    updatedAt: string;
}
interface DashboardStats {
    totalCourses: number;
    totalStudents: number;
    averageRating: number;
    totalRevenue: number;
    activeCourses: number;
    draftCourses: number;
    completionRate: number;
    engagementRate: number;
}
interface StudentProgress {
    studentId: string;
    studentName: string;
    courseName: string;
    progress: number;
    lastActive: string;
    quizAverage: number;
}
interface RecentActivity {
    id: string;
    type: 'enrollment' | 'completion' | 'quiz' | 'feedback' | 'question';
    studentName: string;
    courseName: string;
    description: string;
    timestamp: string;
    status?: 'completed' | 'pending' | 'failed';
}
interface UpcomingClass {
    id: string;
    courseName: string;
    type: 'live' | 'assignment' | 'quiz';
    date: string;
    time: string;
    studentsCount: number;
}
export default function InstructorDashboard() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(false);
    const [courses, setCourses] = useState<InstructorCourse[]>([]);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([]);
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
    const [upcomingClasses, setUpcomingClasses] = useState<UpcomingClass[]>([]);
    const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'students' | 'analytics'>('overview');
    const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
    const [showCreateModal, setShowCreateModal] = useState(false);
    useEffect(() => {
        if (authLoading) return;
        if (!user) return; // Layout handles redirect

        if (user.role !== 'instructor') {
            router.replace('/dashboard');
            return;
        }

        fetchDashboardData();
    }, [authLoading, user, router]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            // Fetch instructor's courses
            const allCourses = await courseService.getCourses(1, 100);
            const instructorCourses = allCourses.courses.filter(
                (course: any) => course.instructorId._id === user?.id || course.instructorId._id === user?._id
            );

            setCourses(instructorCourses);

            // Calculate statistics
            const dashboardStats = calculateStats(instructorCourses);
            setStats(dashboardStats);

            // Generate mock student progress data
            const progressData = generateStudentProgress(instructorCourses);
            setStudentProgress(progressData);

            // Generate recent activity
            const activities = generateRecentActivity(instructorCourses);
            setRecentActivity(activities);

            // Generate upcoming classes
            const classes = generateUpcomingClasses(instructorCourses);
            setUpcomingClasses(classes);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };
    const calculateStats = (courses: InstructorCourse[]): DashboardStats => {
        const totalStudents = courses.reduce((sum, course) => sum + course.studentsEnrolled.length, 0);
        const activeCourses = courses.filter(c => c.status === 'active').length;
        const draftCourses = courses.filter(c => c.status === 'draft').length;
// Calculate average rating
        let totalRating = 0;
        let ratingCount = 0;
        courses.forEach(course => {
            course.feedback.forEach(f => {
                totalRating += f.rating;
                ratingCount++;
            });
        });
        const averageRating = ratingCount > 0 ? totalRating / ratingCount : 0;

        return {
            totalCourses: courses.length,
            totalStudents,
            averageRating: Math.round(averageRating * 10) / 10,
            totalRevenue: totalStudents * 49.99, // Mock revenue calculation
            activeCourses,
            draftCourses,
            completionRate: 78, // Mock completion rate
            engagementRate: 85, // Mock engagement rate
        };
    };
    const generateStudentProgress = (courses: InstructorCourse[]): StudentProgress[] => {
        const progress: StudentProgress[] = [];
        courses.forEach(course => {
// Mock student progress for each enrolled student
            for (let i = 0; i < Math.min(course.studentsEnrolled.length, 5); i++) {
                progress.push({
                    studentId: course.studentsEnrolled[i],
                    studentName: `Student ${i + 1}`,
                    courseName: course.title,
                    progress: Math.floor(Math.random() * 100),
                    lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
                    quizAverage: 70 + Math.floor(Math.random() * 30),
                });
            }
        });
        return progress.sort((a, b) => b.progress - a.progress).slice(0, 10);
    };
    const generateRecentActivity = (courses: InstructorCourse[]): RecentActivity[] => {
        const activities: RecentActivity[] = [
            {
                id: '1',
                type: 'enrollment',
                studentName: 'John Smith',
                courseName: courses[0]?.title || 'React Advanced',
                description: 'enrolled in your course',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                status: 'completed',
            },
            {
                id: '2',
                type: 'completion',
                studentName: 'Sarah Johnson',
                courseName: courses[0]?.title || 'React Advanced',
                description: 'completed Module 3',
                timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
                status: 'completed',
            },
            {
                id: '3',
                type: 'quiz',
                studentName: 'Mike Wilson',
                courseName: courses[0]?.title || 'React Advanced',
                description: 'scored 95% on Quiz 2',
                timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
                status: 'completed',
            },
            {
                id: '4',
                type: 'feedback',
                studentName: 'Emily Davis',
                courseName: courses[0]?.title || 'React Advanced',
                description: 'left a 5-star review',
                timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                status: 'completed',
            },
            {
                id: '5',
                type: 'question',
                studentName: 'David Brown',
                courseName: courses[0]?.title || 'React Advanced',
                description: 'asked a question in Module 2',
                timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
                status: 'pending',
            },
        ];
        return activities;
    };
    const generateUpcomingClasses = (courses: InstructorCourse[]): UpcomingClass[] => {
        return courses.slice(0, 3).map((course, index) => ({
            id: `class-${index}`,
        courseName: course.title,
            type: index === 0 ? 'live' : index === 1 ? 'quiz' : 'assignment',
            date: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000).toLocaleDateString(),
            time: `${14 + index}:00`,
            studentsCount: course.studentsEnrolled.length,
    }));
    };
    const formatTimeAgo = (timestamp: string) => {
        const now = new Date().getTime();
        const time = new Date(timestamp).getTime();
        const diff = now - time;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 60) return `${minutes} minutes ago`;
        if (hours < 24) return `${hours} hours ago`;
        return `${days} days ago`;
    };
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'draft':
                return 'bg-yellow-100 text-yellow-800';
            case 'archived':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };
    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'enrollment':
                return Users;
            case 'completion':
                return CheckCircle;
            case 'quiz':
                return Award;
            case 'feedback':
                return Star;
            case 'question':
                return MessageSquare;
            default:
                return Activity;
        }
    };
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading instructor dashboard...</p>
                </div>
            </div>
        );
    }
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold text-gray-900">Instructor Dashboard</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => router.push('/dashboard/instructor/create-course')}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create Course
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600">
                                <AlertCircle className="w-5 h-5" />
                            </button>
                            <div className="flex items-center space-x-3">
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                    <p className="text-xs text-gray-500">Instructor</p>
                                </div>
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
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
                        Welcome back, {user?.name?.split(' ')[0]}! 👋
                    </h2>
                    <p className="text-gray-600 mt-2">
                        Here's an overview of your teaching activities and student progress.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Courses</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.totalCourses || 0}</p>
                                <p className="text-xs text-gray-500 mt-2">
                                    {stats?.activeCourses || 0} active, {stats?.draftCourses || 0} draft
                                </p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <BookOpen className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Students</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.totalStudents || 0}</p>
                                <p className="text-xs text-green-600 mt-2 flex items-center">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    +12% this month
                                </p>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-lg">
                                <Users className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Average Rating</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">
                                    {stats?.averageRating || 0}
                                    <span className="text-lg text-gray-500">/5</span>
                                </p>
                                <div className="flex items-center mt-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-3 h-3 ${
                                                i < Math.floor(stats?.averageRating || 0)
                                                    ? 'text-yellow-400 fill-current'
                                                    : 'text-gray-300'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="p-3 bg-yellow-50 rounded-lg">
                                <Star className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Revenue</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">
                                    ${stats?.totalRevenue?.toLocaleString() || 0}
                                </p>
                                <p className="text-xs text-gray-500 mt-2">This month</p>
                            </div>
                            <div className="p-3 bg-green-50 rounded-lg">
                                <DollarSign className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
                    {(['overview', 'courses', 'students', 'analytics'] as const).map((tab) => (
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
                        {/* Left Column - Courses & Activity */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* My Courses */}
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">My Courses</h3>
                                    <Link
                                        href="/dashboard/instructor/courses"
                                        className="text-sm text-blue-600 hover:text-blue-700"
                                    >
                                        View all →
                                    </Link>
                                </div>

                                {courses.length > 0 ? (
                                    <div className="space-y-4">
                                        {courses.slice(0, 3).map((course) => (
                                            <div
                                                key={course._id}
                                                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-medium text-gray-900">{course.title}</h4>
                                                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(course.status)}`}>
                            {course.status}
                          </span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                            {course.description}
                                                        </p>
                                                        <div className="flex items-center gap-4 mt-3">
                                                            <div className="flex items-center text-sm text-gray-500">
                                                                <Users className="w-4 h-4 mr-1" />
                                                                {course.studentsEnrolled.length} students
                                                            </div>
                                                            <div className="flex items-center text-sm text-gray-500">
                                                                <BookOpen className="w-4 h-4 mr-1" />
                                                                {course.modules.length} modules
                                                            </div>
                                                            {course.feedback.length > 0 && (
                                                                <div className="flex items-center text-sm text-gray-500">
                                                                    <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                                                                    {(
                                                                        course.feedback.reduce((sum, f) => sum + f.rating, 0) /
                                                                        course.feedback.length
                                                                    ).toFixed(1)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 ml-4">
                                                        <Link
                                                            href={`/dashboard/instructor/courses/${course._id}/edit`}
                                                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Link>
                                                        <Link
                                                            href={`/dashboard/instructor/courses/${course._id}/analytics`}
                                                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                                                        >
                                                            <BarChart3 className="w-4 h-4" />
                                                        </Link>
                                                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                        <p className="text-gray-600">No courses created yet</p>
                                        <button
                                            onClick={() => router.push('/dashboard/instructor/create-course')}
                                            className="inline-flex items-center mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Create Your First Course
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Recent Activity */}
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                                <div className="space-y-4">
                                    {recentActivity.map((activity) => {
                                        const Icon = getActivityIcon(activity.type);
                                        return (
                                            <div key={activity.id} className="flex items-start space-x-3">
                                                <div
                                                    className={`p-2 rounded-lg ${
                                                        activity.status === 'completed'
                                                            ? 'bg-green-50 text-green-600'
                                                            : activity.status === 'pending'
                                                                ? 'bg-yellow-50 text-yellow-600'
                                                                : 'bg-gray-50 text-gray-600'
                                                    }`}
                                                >
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-gray-900">
                                                        <span className="font-medium">{activity.studentName}</span>{' '}
                                                        {activity.description}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {activity.courseName} • {formatTimeAgo(activity.timestamp)}
                                                    </p>
                                                </div>
                                                {activity.status === 'pending' && (
                                                    <button className="text-blue-600 hover:text-blue-700 text-sm">
                                                        Reply
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Schedule & Top Students */}
                        <div className="space-y-6">
                            {/* Upcoming Classes */}
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Upcoming Schedule</h3>
                                    <Calendar className="w-5 h-5 text-gray-400" />
                                </div>
                                {upcomingClasses.length > 0 ? (
                                    <div className="space-y-3">
                                        {upcomingClasses.map((class_) => (
                                            <div key={class_.id} className="border-l-4 border-blue-500 pl-4 py-2">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 text-sm">{class_.courseName}</h4>
                                                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-500">
                            {class_.type === 'live' && '🔴 Live Session'}
                              {class_.type === 'quiz' && '📝 Quiz Due'}
                              {class_.type === 'assignment' && '📚 Assignment'}
                          </span>
                                                            <span className="text-xs text-gray-500">
                            {class_.studentsCount} students
                          </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs font-medium text-gray-900">{class_.date}</p>
                                                        <p className="text-xs text-gray-500">{class_.time}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-600">No upcoming classes scheduled</p>
                                )}
                            </div>

                            {/* Top Performing Students */}
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Students</h3>
                                <div className="space-y-3">
                                    {studentProgress.slice(0, 5).map((student, index) => (
                                        <div key={student.studentId} className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{student.studentName}</p>
                                                    <p className="text-xs text-gray-500">{student.courseName}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-gray-900">{student.progress}%</p>
                                                <p className="text-xs text-gray-500">Avg: {student.quizAverage}%</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-sm p-6 text-white">
                                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => router.push('/dashboard/instructor/create-course')}
                                        className="w-full px-4 py-2 bg-white/20 backdrop-blur rounded-lg hover:bg-white/30 transition-colors flex items-center justify-between"
                                    >
                <span className="flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Course
                </span>
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                    <button className="w-full px-4 py-2 bg-white/20 backdrop-blur rounded-lg hover:bg-white/30 transition-colors flex items-center justify-between">
                <span className="flex items-center">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Resources
                </span>
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                    <button className="w-full px-4 py-2 bg-white/20 backdrop-blur rounded-lg hover:bg-white/30 transition-colors flex items-center justify-between">
                <span className="flex items-center">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  View Messages
                </span>
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'courses' && (
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">All Courses</h3>
                            <div className="flex items-center gap-2">
                                <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                    <option>All Status</option>
                                    <option>Active</option>
                                    <option>Draft</option>
                                    <option>Archived</option>
                                </select>
                                <button
                                    onClick={() => router.push('/dashboard/instructor/create-course')}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-RetryEContinueEditcenter"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    New Course
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Course
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Students
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Rating
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Revenue
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {courses.map((course) => {
                                    const avgRating = course.feedback.length > 0
                                        ? course.feedback.reduce((sum, f) => sum + f.rating, 0) / course.feedback.length
                                        : 0;
                                    const revenue = course.studentsEnrolled.length * 49.99;

                                    return (
                                        <tr key={course._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{course.title}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {course.modules.length} modules • Created {new Date(course.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(course.status)}`}>
                        {course.status}
                      </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <Users className="w-4 h-4 text-gray-400 mr-1" />
                                                    <span className="text-sm text-gray-900">{course.studentsEnrolled.length}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {avgRating > 0 ? (
                                                    <div className="flex items-center">
                                                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                                                        <span className="text-sm text-gray-900">{avgRating.toFixed(1)}</span>
                                                        <span className="text-xs text-gray-500 ml-1">({course.feedback.length})</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-500">No ratings</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-gray-900">${revenue.toFixed(2)}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        href={`/courses/${course._id}`}
                                                        className="text-gray-400 hover:text-gray-600"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                    <Link
                                                        href={`/dashboard/instructor/courses/${course._id}/edit`}
                                                        className="text-gray-400 hover:text-gray-600"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                    <button className="text-gray-400 hover:text-gray-600">
                                                        <BarChart3 className="w-4 h-4" />
                                                    </button>
                                                    <button className="text-gray-400 hover:text-gray-600">
                                                        <Archive className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>

                            {courses.length === 0 && (
                                <div className="text-center py-12">
                                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-600">No courses found</p>
                                    <button
                                        onClick={() => router.push('/dashboard/instructor/create-course')}
                                        className="inline-flex items-center mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create Your First Course
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'students' && (
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Student Progress</h3>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    placeholder="Search students..."
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                                <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                    <option>All Courses</option>
                                    {courses.map(course => (
                                        <option key={course._id} value={course._id}>{course.title}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Student
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Course
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Progress
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Quiz Average
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Last Active
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {studentProgress.map((student) => (
                                    <tr key={student.studentId} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3">
                                                    {student.studentName.charAt(0)}
                                                </div>
                                                <p className="text-sm font-medium text-gray-900">{student.studentName}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-900">{student.courseName}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="flex-1 mr-3">
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                                                            style={{ width: `${student.progress}%` }}
                                                        />
                                                    </div>
                                                </div>
                                                <span className="text-sm font-medium text-gray-900">{student.progress}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                    <span className={`text-sm font-medium ${
                        student.quizAverage >= 80 ? 'text-green-600' :
                            student.quizAverage >= 60 ? 'text-yellow-600' :
                                'text-red-600'
                    }`}>
                      {student.quizAverage}%
                    </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-500">{formatTimeAgo(student.lastActive)}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button className="text-blue-600 hover:text-blue-700 text-sm">View</button>
                                                <button className="text-gray-600 hover:text-gray-700 text-sm">Message</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Engagement Chart */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Student Engagement</h3>
                                <select
                                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                                    value={timeRange}
                                    onChange={(e) => setTimeRange(e.target.value as any)}
                                >
                                    <option value="week">This Week</option>
                                    <option value="month">This Month</option>
                                    <option value="year">This Year</option>
                                </select>
                            </div>
                            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                                <div className="text-center">
                                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                    <p className="text-sm text-gray-600">Engagement chart would go here</p>
                                    <p className="text-xs text-gray-500 mt-1">Connect with a charting library</p>
                                </div>
                            </div>
                        </div>

                        {/* Completion Rates */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Completion Rates</h3>
                            <div className="space-y-4">
                                {courses.slice(0, 5).map((course) => {
                                    const completionRate = Math.floor(Math.random() * 40) + 60; // Mock data
                                    return (
                                        <div key={course._id}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium text-gray-700 truncate">{course.title}</span>
                                                <span className="text-sm text-gray-600">{completionRate}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full transition-all ${
                                                        completionRate >= 80
                                                            ? 'bg-green-500'
                                                            : completionRate >= 60
                                                                ? 'bg-yellow-500'
                                                                : 'bg-red-500'
                                                    }`}
                                                    style={{ width: `${completionRate}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Revenue Overview */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <p className="text-2xl font-bold text-gray-900">${stats?.totalRevenue?.toLocaleString() || 0}</p>
                                    <p className="text-sm text-gray-600 mt-1">Total Revenue</p>
                                </div>
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <p className="text-2xl font-bold text-gray-900">$49.99</p>
                                    <p className="text-sm text-gray-600 mt-1">Avg. Course Price</p>
                                </div>
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <p className="text-2xl font-bold text-gray-900">
                                        ${((stats?.totalRevenue || 0) / 30).toFixed(0)}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">Daily Average</p>
                                </div>
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <p className="text-2xl font-bold text-green-600">+23%</p>
                                    <p className="text-sm text-gray-600 mt-1">Growth</p>
                                </div>
                            </div>
                        </div>

                        {/* Popular Content */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Popular Content</h3>
                            <div className="space-y-3">
                                {[
                                    { title: 'Introduction to React Hooks', views: 1234, type: 'video' },
                                    { title: 'State Management Best Practices', views: 987, type: 'pdf' },
                                    { title: 'Building Custom Components', views: 856, type: 'video' },
                                    { title: 'Performance Optimization', views: 743, type: 'video' },
                                    { title: 'Testing React Applications', views: 612, type: 'pdf' },
                                ].map((content, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            {content.type === 'video' ? (
                                                <Video className="w-4 h-4 text-gray-400 mr-3" />
                                            ) : (
                                                <FileText className="w-4 h-4 text-gray-400 mr-3" />
                                            )}
                                            <p className="text-sm text-gray-900">{content.title}</p>
                                        </div>
                                        <p className="text-sm text-gray-600">{content.views} views</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Performance Insights */}
                <div className="mt-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg p-8 text-white">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-2xl font-bold">Performance Insights</h3>
                            <p className="text-purple-100 mt-1">Your teaching impact this month</p>
                        </div>
                        <Target className="w-8 h-8 text-yellow-300" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <Clock className="w-5 h-5 text-purple-200" />
                                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">+15%</span>
                            </div>
                            <p className="text-2xl font-bold">124h</p>
                            <p className="text-sm text-purple-100 mt-1">Content Watched</p>
                        </div>

                        <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <Users className="w-5 h-5 text-purple-200" />
                                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">+8</span>
                            </div>
                            <p className="text-2xl font-bold">{stats?.totalStudents || 0}</p>
                            <p className="text-sm text-purple-100 mt-1">Active Students</p>
                        </div>

                        <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <MessageSquare className="w-5 h-5 text-purple-200" />
                                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">New</span>
                            </div>
                            <p className="text-2xl font-bold">47</p>
                            <p className="text-sm text-purple-100 mt-1">Discussions</p>
                        </div>

                        <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <Award className="w-5 h-5 text-purple-200" />
                                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Top 10%</span>
                            </div>
                            <p className="text-2xl font-bold">{stats?.averageRating || 0}/5</p>
                            <p className="text-sm text-purple-100 mt-1">Instructor Rating</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
