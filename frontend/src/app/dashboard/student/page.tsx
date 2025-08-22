// src/app/dashboard/student/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { StatsCard } from '../../../components/dashboard/common/StatsCard';
import { ActivityFeed } from '../../../components/dashboard/common/ActivityFeed';
import { ProgressRing } from '../../../components/dashboard/common/ProgressRing';
import { EmptyState } from '../../../components/dashboard/common/EmptyState';
import { CourseProgress } from '../../../components/dashboard/student/CourseProgress';
import { QuizHistory } from '../../../components/dashboard/student/QuizHistory';
import { StudyStreak } from '../../../components/dashboard/student/StudyStreak';
import { LearningChart } from '../../../components/dashboard/student/LearningChart';

// Icons
const BookIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
);

const TrophyIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
);

const ClockIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ChartIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

export default function StudentDashboard() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState<any>({
        stats: {
            enrolledCourses: 0,
            completedCourses: 0,
            averageScore: 0,
            studyStreak: 0,
            totalHours: 0,
            completionRate: 0
        },
        courses: [],
        recentActivity: [],
        quizHistory: [],
        upcomingDeadlines: []
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            // Fetch dashboard data from API
            // const response = await dashboardApi.getStudentDashboard();
            // setDashboardData(response);

            // Mock data for now
            setTimeout(() => {
                setDashboardData({
                    stats: {
                        enrolledCourses: 5,
                        completedCourses: 2,
                        averageScore: 85,
                        studyStreak: 7,
                        totalHours: 124,
                        completionRate: 67
                    },
                    courses: [
                        { id: 1, title: 'Web Development', progress: 75, nextLesson: 'React Hooks' },
                        { id: 2, title: 'Data Science', progress: 45, nextLesson: 'Linear Regression' },
                        { id: 3, title: 'Machine Learning', progress: 30, nextLesson: 'Neural Networks' }
                    ],
                    recentActivity: [
                        {
                            id: '1',
                            type: 'quiz',
                            title: 'Completed Quiz',
                            description: 'JavaScript Fundamentals - Score: 92%',
                            timestamp: new Date(Date.now() - 1000 * 60 * 30)
                        },
                        {
                            id: '2',
                            type: 'course',
                            title: 'Course Progress',
                            description: 'Completed Module 3 in Web Development',
                            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2)
                        },
                        {
                            id: '3',
                            type: 'achievement',
                            title: 'Achievement Unlocked',
                            description: '7-Day Study Streak!',
                            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5)
                        }
                    ],
                    quizHistory: [
                        { id: 1, title: 'JavaScript Basics', score: 92, date: new Date(), difficulty: 'medium' },
                        { id: 2, title: 'HTML & CSS', score: 88, date: new Date(), difficulty: 'easy' },
                        { id: 3, title: 'React Fundamentals', score: 78, date: new Date(), difficulty: 'hard' }
                    ],
                    upcomingDeadlines: [
                        { id: 1, title: 'Assignment: Build a Todo App', dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2) },
                        { id: 2, title: 'Quiz: Advanced JavaScript', dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5) }
                    ]
                });
                setLoading(false);
            }, 1000);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-accent to-blue-500 rounded-xl p-8 text-white">
                <h1 className="text-3xl font-bold mb-2">
                    Welcome back, {user?.fullName || 'Student'}! 👋
                </h1>
                <p className="text-white/80">
                    You're on a {dashboardData.stats.studyStreak} day learning streak! Keep it up!
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Enrolled Courses"
                    value={dashboardData.stats.enrolledCourses}
                    icon={<BookIcon />}
                    color="blue"
                    loading={loading}
                />
                <StatsCard
                    title="Average Score"
                    value={`${dashboardData.stats.averageScore}%`}
                    change={5}
                    icon={<TrophyIcon />}
                    color="green"
                    loading={loading}
                />
                <StatsCard
                    title="Study Streak"
                    value={`${dashboardData.stats.studyStreak} days`}
                    icon={<ClockIcon />}
                    color="yellow"
                    loading={loading}
                />
                <StatsCard
                    title="Total Hours"
                    value={dashboardData.stats.totalHours}
                    change={12}
                    icon={<ChartIcon />}
                    color="purple"
                    loading={loading}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Course Progress */}
                <div className="lg:col-span-2 space-y-6">
                    <CourseProgress courses={dashboardData.courses} loading={loading} />
                    <LearningChart loading={loading} />
                    <QuizHistory quizzes={dashboardData.quizHistory} loading={loading} />
                </div>

                {/* Right Column - Activity & Stats */}
                <div className="space-y-6">
                    {/* Overall Progress */}
                    <div className="bg-primary-light rounded-xl p-6 border border-gray-800">
                        <h3 className="text-lg font-semibold text-white mb-4">Overall Progress</h3>
                        <div className="flex justify-center">
                            <ProgressRing progress={dashboardData.stats.completionRate} />
                        </div>
                        <div className="mt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-text-secondary">Completed</span>
                                <span className="text-white font-medium">{dashboardData.stats.completedCourses} courses</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-text-secondary">In Progress</span>
                                <span className="text-white font-medium">
                  {dashboardData.stats.enrolledCourses - dashboardData.stats.completedCourses} courses
                </span>
                            </div>
                        </div>
                    </div>

                    <StudyStreak streak={dashboardData.stats.studyStreak} loading={loading} />
                    <ActivityFeed activities={dashboardData.recentActivity} loading={loading} />

                    {/* Upcoming Deadlines */}
                    <div className="bg-primary-light rounded-xl p-6 border border-gray-800">
                        <h3 className="text-lg font-semibold text-white mb-4">Upcoming Deadlines</h3>
                        <div className="space-y-3">
                            {dashboardData.upcomingDeadlines.length === 0 ? (
                                <p className="text-text-secondary text-center py-4">No upcoming deadlines</p>
                            ) : (
                                dashboardData.upcomingDeadlines.map((deadline: any) => (
                                    <div key={deadline.id} className="p-3 bg-primary rounded-lg">
                                        <p className="text-white text-sm font-medium">{deadline.title}</p>
                                        <p className="text-text-secondary text-xs mt-1">
                                            Due: {new Date(deadline.dueDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}