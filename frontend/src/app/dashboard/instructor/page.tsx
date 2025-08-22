// src/app/dashboard/instructor/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { StatsCard } from '../../../components/dashboard/common/StatsCard';
import { ActivityFeed } from '../../../components/dashboard/common/ActivityFeed';
import { CourseManagement } from '../../../components/dashboard/instructor/CourseManagement';

import { EngagementChart } from '../../../components/dashboard/instructor/EngagementChart';
import { RecentSubmissions } from '../../../components/dashboard/instructor/RecentSubmissions';
import {StudentPerformanceTable} from "../../../Components/dashboard/instructor/StudentPerformance";

// Icons
const StudentsIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const CourseIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
);

const StarIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
);

const ChartBarIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

export default function InstructorDashboard() {
    const { user, token } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState<any>({
        stats: {
            totalStudents: 0,
            activeCourses: 0,
            averageRating: 0,
            engagementRate: 0,
            pendingReviews: 0,
            totalRevenue: 0
        },
        courses: [],
        studentPerformance: [],
        recentSubmissions: [],
        activities: []
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            // Fetch instructor dashboard data
            // const response = await analyticsApi.getInstructorDashboard(user.id);

            // Mock data for now
            setTimeout(() => {
                setDashboardData({
                    stats: {
                        totalStudents: 156,
                        activeCourses: 4,
                        averageRating: 4.7,
                        engagementRate: 78,
                        pendingReviews: 12,
                        totalRevenue: 15420
                    },
                    courses: [
                        {
                            id: 1,
                            title: 'Web Development Masterclass',
                            students: 45,
                            rating: 4.8,
                            status: 'active',
                            completion: 67
                        },
                        {
                            id: 2,
                            title: 'JavaScript Advanced Concepts',
                            students: 38,
                            rating: 4.6,
                            status: 'active',
                            completion: 45
                        },
                        {
                            id: 3,
                            title: 'React & Redux Complete Guide',
                            students: 52,
                            rating: 4.9,
                            status: 'active',
                            completion: 82
                        },
                        {
                            id: 4,
                            title: 'Node.js Backend Development',
                            students: 21,
                            rating: 4.5,
                            status: 'draft',
                            completion: 30
                        }
                    ],
                    studentPerformance: [
                        {
                            id: 1,
                            name: 'John Doe',
                            course: 'Web Development',
                            progress: 85,
                            lastActive: new Date(),
                            avgScore: 92
                        },
                        {
                            id: 2,
                            name: 'Jane Smith',
                            course: 'JavaScript Advanced',
                            progress: 72,
                            lastActive: new Date(),
                            avgScore: 88
                        },
                        {
                            id: 3,
                            name: 'Mike Johnson',
                            course: 'React & Redux',
                            progress: 95,
                            lastActive: new Date(),
                            avgScore: 95
                        }
                    ],
                    recentSubmissions: [
                        {
                            id: 1,
                            student: 'Alice Brown',
                            assignment: 'Build a Todo App',
                            course: 'React & Redux',
                            submittedAt: new Date(),
                            status: 'pending'
                        },
                        {
                            id: 2,
                            student: 'Bob Wilson',
                            assignment: 'REST API Project',
                            course: 'Node.js Backend',
                            submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
                            status: 'pending'
                        }
                    ],
                    activities: [
                        {
                            id: '1',
                            type: 'course',
                            title: 'New Enrollment',
                            description: '5 new students enrolled in Web Development',
                            timestamp: new Date(Date.now() - 1000 * 60 * 30)
                        },
                        {
                            id: '2',
                            type: 'assignment',
                            title: 'Assignment Submitted',
                            description: 'John Doe submitted Todo App project',
                            timestamp: new Date(Date.now() - 1000 * 60 * 60)
                        },
                        {
                            id: '3',
                            type: 'achievement',
                            title: 'Course Milestone',
                            description: 'JavaScript Advanced reached 50 enrollments!',
                            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3)
                        }
                    ]
                });
                setLoading(false);
            }, 1000);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            setLoading(false);
        }
    };

    const handleCreateCourse = () => {
        router.push('/dashboard/instructor/courses/create');
    };

    return (
        <div className="space-y-6">
            {/* Welcome Header with Quick Actions */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">
                            Instructor Dashboard
                        </h1>
                        <p className="text-white/80">
                            Welcome back, {user?.fullName || 'Instructor'}! You have {dashboardData.stats.pendingReviews} pending reviews.
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={handleCreateCourse}
                            className="px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/30
                rounded-lg hover:bg-white/30 transition-all duration-200"
                        >
                            + Create Course
                        </button>
                        <button
                            onClick={() => router.push('/dashboard/instructor/announcements')}
                            className="px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/30
                rounded-lg hover:bg-white/30 transition-all duration-200"
                        >
                            📢 Announcement
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Students"
                    value={dashboardData.stats.totalStudents}
                    change={12}
                    icon={<StudentsIcon />}
                    color="blue"
                    loading={loading}
                />
                <StatsCard
                    title="Active Courses"
                    value={dashboardData.stats.activeCourses}
                    icon={<CourseIcon />}
                    color="green"
                    loading={loading}
                />
                <StatsCard
                    title="Average Rating"
                    value={`${dashboardData.stats.averageRating} ⭐`}
                    change={3}
                    icon={<StarIcon />}
                    color="yellow"
                    loading={loading}
                />
                <StatsCard
                    title="Engagement Rate"
                    value={`${dashboardData.stats.engagementRate}%`}
                    change={5}
                    icon={<ChartBarIcon />}
                    color="purple"
                    loading={loading}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Courses & Performance */}
                <div className="lg:col-span-2 space-y-6">
                    <CourseManagement courses={dashboardData.courses} loading={loading} />
                    <StudentPerformanceTable students={dashboardData.studentPerformance} loading={loading} />
                    <EngagementChart loading={loading} />
                </div>

                {/* Right Column - Submissions & Activity */}
                <div className="space-y-6">
                    <RecentSubmissions submissions={dashboardData.recentSubmissions} loading={loading} />

                    {/* Revenue Overview */}
                    <div className="bg-primary-light rounded-xl p-6 border border-gray-800">
                        <h3 className="text-lg font-semibold text-white mb-4">Revenue Overview</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-text-secondary text-sm mb-1">This Month</p>
                                <p className="text-3xl font-bold text-white">${dashboardData.stats.totalRevenue}</p>
                                <p className="text-green-400 text-sm mt-1">↑ 15% from last month</p>
                            </div>
                            <div className="pt-4 border-t border-gray-700">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-text-secondary">Course Sales</span>
                                    <span className="text-white">$12,340</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-secondary">Subscriptions</span>
                                    <span className="text-white">$3,080</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <ActivityFeed activities={dashboardData.activities} loading={loading} />
                </div>
            </div>
        </div>
    );
}