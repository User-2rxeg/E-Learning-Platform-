// src/app/dashboard/instructor/analytics/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { analyticsService } from '../../../../lib/services/analyticsApi';
import { courseService } from '../../../../lib/services/courseApi';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
    TrendingUp, TrendingDown, Users, BookOpen, Award, Clock,
    Download, Filter, Calendar, Activity, Target, Brain,
    Zap, ArrowUpRight, ArrowDownRight, RefreshCw, FileDown
} from 'lucide-react';

// Components
import { StatsCard } from '../../../../components/dashboard/common/StatsCard';
import { ChartCard } from '../../../../components/dashboard/common/ChartCard';
import { DataTable } from '../../../../components/dashboard/common/DataTable';
import { SkeletonLoader } from '../../../../components/dashboard/common/SkeletonLoader';
import { EmptyState } from '../../../../components/dashboard/common/EmptyState';

interface DashboardData {
    totalCourses: number;
    totalStudents: number;
    avgCompletionPct: number;
    courseEnrollments: Array<{
        id: string;
        title: string;
        enrollmentCount: number;
    }>;
}

interface CourseReport {
    course: { id: string; title: string };
    enrollment: number;
    attempts: number;
    avgScore: number;
    completionPct: number;
    engagementMinutes: number;
    difficultyMix: {
        easy: number;
        medium: number;
        hard: number;
    };
}

export default function InstructorAnalyticsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [selectedCourse, setSelectedCourse] = useState<string>('');
    const [courseReport, setCourseReport] = useState<CourseReport | null>(null);
    const [courses, setCourses] = useState<any[]>([]);
    const [timeRange, setTimeRange] = useState('month');
    const [viewMode, setViewMode] = useState('overview');
    const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
    const [studentData, setStudentData] = useState<any[]>([]);

    // Fetch initial data
    useEffect(() => {
        if (user?.id) {
            fetchAllData();
        }
    }, [user?.id]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchDashboardData(),
                fetchCourses()
            ]);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDashboardData = async () => {
        if (!user?.id) return;

        try {
            const data = await analyticsService.getInstructorDashboard(user.id);
            setDashboardData(data);
        } catch (error) {
            console.error('Error fetching dashboard:', error);
        }
    };

    const fetchCourses = async () => {
        try {
            const coursesData = await courseService.getInstructorCourses();
            setCourses(coursesData);
            if (coursesData.length > 0 && !selectedCourse) {
                setSelectedCourse(coursesData[0]._id);
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const fetchCourseReport = async (courseId: string) => {
        if (!user?.id || !courseId) return;

        try {
            const report = await analyticsService.getCourseReport(user.id, courseId);
            setCourseReport(report);

            // Fetch student data for the course
            const students = await analyticsService.getStudentSummary(user.id);
            setStudentData(students.courses || []);
        } catch (error) {
            console.error('Error fetching course report:', error);
        }
    };

    useEffect(() => {
        if (selectedCourse) {
            fetchCourseReport(selectedCourse);
        }
    }, [selectedCourse]);

    const handleExport = async () => {
        if (!user?.id || !selectedCourse) return;

        try {
            const data = await analyticsService.exportCourseReport(
                user.id,
                selectedCourse,
                exportFormat
            );

            // Create download link
            const blob = new Blob([exportFormat === 'csv' ? data : JSON.stringify(data, null, 2)], {
                type: exportFormat === 'csv' ? 'text/csv' : 'application/json'
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `analytics-${selectedCourse}-${Date.now()}.${exportFormat}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting report:', error);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchAllData();
        if (selectedCourse) {
            await fetchCourseReport(selectedCourse);
        }
        setTimeout(() => setRefreshing(false), 500);
    };

    // Generate time series data based on timeRange
    const generateTimeSeriesData = () => {
        const points = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90;
        return Array.from({ length: points }, (_, i) => ({
            date: timeRange === 'week' ? `Day ${i + 1}` : `${i + 1}`,
            students: Math.floor(Math.random() * 20) + 30,
            engagement: Math.floor(Math.random() * 30) + 60,
            completion: Math.floor(Math.random() * 15) + 70,
            avgScore: Math.floor(Math.random() * 10) + 75
        }));
    };

    const timeSeriesData = useMemo(() => generateTimeSeriesData(), [timeRange]);

    // Performance distribution data
    const performanceDistribution = [
        { range: '90-100%', students: 28, color: '#10B981' },
        { range: '80-89%', students: 45, color: '#3E64FF' },
        { range: '70-79%', students: 32, color: '#F59E0B' },
        { range: '60-69%', students: 18, color: '#EF4444' },
        { range: 'Below 60%', students: 12, color: '#991B1B' }
    ];

    // Module completion rates
    const moduleCompletionData = courses.find(c => c._id === selectedCourse)?.modules?.map((module: any, idx: number) => ({
        module: `Module ${idx + 1}`,
        completion: Math.floor(Math.random() * 40) + 55
    })) || [];

    // Engagement patterns
    const engagementPatterns = [
        { day: 'Mon', morning: 45, afternoon: 78, evening: 120 },
        { day: 'Tue', morning: 52, afternoon: 85, evening: 110 },
        { day: 'Wed', morning: 48, afternoon: 90, evening: 125 },
        { day: 'Thu', morning: 55, afternoon: 82, evening: 115 },
        { day: 'Fri', morning: 40, afternoon: 75, evening: 95 },
        { day: 'Sat', morning: 30, afternoon: 60, evening: 140 },
        { day: 'Sun', morning: 35, afternoon: 65, evening: 135 }
    ];

    // Skills radar data
    const skillsRadarData = [
        { skill: 'Concepts', A: 85, fullMark: 100 },
        { skill: 'Practice', A: 78, fullMark: 100 },
        { skill: 'Problem Solving', A: 72, fullMark: 100 },
        { skill: 'Speed', A: 65, fullMark: 100 },
        { skill: 'Accuracy', A: 88, fullMark: 100 },
        { skill: 'Retention', A: 70, fullMark: 100 }
    ];

    // Student performance table columns
    const studentTableColumns = [
        {
            key: 'courseTitle' as any,
            label: 'Student/Course',
            sortable: true,
            render: (value: string) => (
                <div>
                    <p className="text-white font-medium">{value}</p>
                </div>
            )
        },
        {
            key: 'progress' as any,
            label: 'Progress',
            sortable: true,
            render: (value: number) => (
                <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-[#3E64FF] to-[#667eea]"
                            style={{ width: `${value}%` }}
                        />
                    </div>
                    <span className="text-gray-400 text-sm">{value}%</span>
                </div>
            )
        },
        {
            key: 'lastScore' as any,
            label: 'Last Score',
            sortable: true,
            render: (value: number | null) => (
                <span className={`font-medium ${
                    value === null ? 'text-gray-500' :
                        value >= 80 ? 'text-green-400' :
                            value >= 60 ? 'text-yellow-400' :
                                'text-red-400'
                }`}>
          {value !== null ? `${value}%` : 'N/A'}
        </span>
            )
        },
        {
            key: 'lastActiveAt' as any,
            label: 'Last Active',
            sortable: true,
            render: (value: Date | null) => (
                <span className="text-gray-400 text-sm">
          {value ? new Date(value).toLocaleDateString() : 'Never'}
        </span>
            )
        }
    ];

    if (loading) {
        return (
            <div className="space-y-6">
                <SkeletonLoader type="text" rows={2} />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <SkeletonLoader key={i} type="card" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <SkeletonLoader type="chart" />
                    <SkeletonLoader type="chart" />
                </div>
            </div>
        );
    }

    if (!dashboardData) {
        return (
            <EmptyState
                title="No analytics data available"
                description="Start creating courses and enrolling students to see analytics"
                action={{
                    label: 'Create Your First Course',
                    onClick: () => router.push('/dashboard/instructor/courses/create')
                }}
            />
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
                    <p className="text-gray-400">Track performance, engagement, and student progress</p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleRefresh}
                        className={`px-4 py-2 bg-primary-light border border-gray-800 rounded-lg text-white hover:bg-primary transition-all flex items-center gap-2 ${
                            refreshing ? 'animate-spin' : ''
                        }`}
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>

                    <div className="flex items-center gap-2 bg-primary-light border border-gray-800 rounded-lg px-3">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="bg-transparent text-white outline-none py-2"
                        >
                            <option value="week">Last Week</option>
                            <option value="month">Last Month</option>
                            <option value="quarter">Last Quarter</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <select
                            value={exportFormat}
                            onChange={(e) => setExportFormat(e.target.value as 'csv' | 'json')}
                            className="bg-primary-light border border-gray-800 text-white px-3 py-2 rounded-lg outline-none"
                        >
                            <option value="csv">CSV</option>
                            <option value="json">JSON</option>
                        </select>
                        <button
                            onClick={handleExport}
                            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-all flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>
            </div>

            {/* View Mode Tabs */}
            <div className="flex gap-2 p-1 bg-primary-light rounded-lg w-fit">
                {['overview', 'students', 'engagement', 'performance'].map((mode) => (
                    <button
                        key={mode}
                        onClick={() => setViewMode(mode)}
                        className={`px-4 py-2 rounded-md capitalize transition-all ${
                            viewMode === mode
                                ? 'bg-accent text-white'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        {mode}
                    </button>
                ))}
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Total Students"
                    value={dashboardData.totalStudents}
                    change={12}
                    icon={<Users className="w-5 h-5" />}
                    color="blue"
                />
                <StatsCard
                    title="Active Courses"
                    value={dashboardData.totalCourses}
                    change={2}
                    icon={<BookOpen className="w-5 h-5" />}
                    color="green"
                />
                <StatsCard
                    title="Avg Completion"
                    value={`${dashboardData.avgCompletionPct}%`}
                    change={5}
                    icon={<Target className="w-5 h-5" />}
                    color="yellow"
                />
                <StatsCard
                    title="Avg Score"
                    value={`${courseReport?.avgScore || 0}%`}
                    change={-3}
                    icon={<Award className="w-5 h-5" />}
                    color="purple"
                />
            </div>

            {/* Course Selector for non-overview modes */}
            {viewMode !== 'overview' && courses.length > 0 && (
                <div className="flex items-center gap-4">
                    <label className="text-gray-400">Select Course:</label>
                    <select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="bg-primary-light border border-gray-800 text-white px-4 py-3 rounded-lg outline-none focus:border-accent transition-all"
                    >
                        {courses.map(course => (
                            <option key={course._id} value={course._id}>
                                {course.title} ({course.studentsEnrolled?.length || 0} students)
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Main Content Based on View Mode */}
            {viewMode === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Course Enrollments */}
                    <ChartCard title="Course Enrollments" subtitle="Students per course">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={dashboardData.courseEnrollments}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                                <XAxis
                                    dataKey="title"
                                    stroke="#666"
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                    fontSize={12}
                                />
                                <YAxis stroke="#666" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1A1A1A',
                                        border: '1px solid #2A2A2A',
                                        borderRadius: '8px'
                                    }}
                                    labelStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="enrollmentCount" fill="#3E64FF" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    {/* Performance Trends */}
                    <ChartCard title="Performance Trends" subtitle={`Last ${timeRange}`}>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={timeSeriesData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                                <XAxis dataKey="date" stroke="#666" />
                                <YAxis stroke="#666" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1A1A1A',
                                        border: '1px solid #2A2A2A',
                                        borderRadius: '8px'
                                    }}
                                    labelStyle={{ color: '#fff' }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="engagement" stroke="#3E64FF" strokeWidth={2} dot={false} name="Engagement" />
                                <Line type="monotone" dataKey="completion" stroke="#10B981" strokeWidth={2} dot={false} name="Completion" />
                                <Line type="monotone" dataKey="avgScore" stroke="#F59E0B" strokeWidth={2} dot={false} name="Avg Score" />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>
            )}

            {viewMode === 'students' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Performance Distribution */}
                        <ChartCard title="Performance Distribution" subtitle="Student score ranges">
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={performanceDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="students"
                                    >
                                        {performanceDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1A1A1A',
                                            border: '1px solid #2A2A2A',
                                            borderRadius: '8px'
                                        }}
                                        labelStyle={{ color: '#fff' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="mt-4 space-y-2">
                                {performanceDistribution.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                            <span className="text-gray-400 text-sm">{item.range}</span>
                                        </div>
                                        <span className="text-white font-medium">{item.students} students</span>
                                    </div>
                                ))}
                            </div>
                        </ChartCard>

                        {/* Course Stats */}
                        {courseReport && (
                            <ChartCard title="Course Statistics" subtitle={courseReport.course.title}>
                                <div className="space-y-4 p-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-primary rounded-lg p-4">
                                            <p className="text-gray-400 text-sm">Enrollment</p>
                                            <p className="text-2xl font-bold text-white">{courseReport.enrollment}</p>
                                        </div>
                                        <div className="bg-primary rounded-lg p-4">
                                            <p className="text-gray-400 text-sm">Quiz Attempts</p>
                                            <p className="text-2xl font-bold text-white">{courseReport.attempts}</p>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-800">
                                        <p className="text-gray-400 text-sm mb-2">Difficulty Distribution</p>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
                                                <p className="text-green-400 text-xl font-bold">{courseReport.difficultyMix.easy}</p>
                                                <p className="text-gray-400 text-xs">Easy</p>
                                            </div>
                                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-center">
                                                <p className="text-yellow-400 text-xl font-bold">{courseReport.difficultyMix.medium}</p>
                                                <p className="text-gray-400 text-xs">Medium</p>
                                            </div>
                                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
                                                <p className="text-red-400 text-xl font-bold">{courseReport.difficultyMix.hard}</p>
                                                <p className="text-gray-400 text-xs">Hard</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ChartCard>
                        )}
                    </div>

                    {/* Student Performance Table */}
                    <DataTable
                        data={studentData}
                        columns={studentTableColumns}
                        emptyMessage="No student data available"
                    />
                </div>
            )}

            {viewMode === 'engagement' && (
                <div className="space-y-6">
                    {/* Engagement Heatmap */}
                    <ChartCard title="Engagement Patterns" subtitle="Student activity by time of day">
                        <ResponsiveContainer width="100%" height={400}>
                            <AreaChart data={engagementPatterns}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                                <XAxis dataKey="day" stroke="#666" />
                                <YAxis stroke="#666" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1A1A1A',
                                        border: '1px solid #2A2A2A',
                                        borderRadius: '8px'
                                    }}
                                    labelStyle={{ color: '#fff' }}
                                />
                                <Legend />
                                <Area type="monotone" dataKey="morning" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
                                <Area type="monotone" dataKey="afternoon" stackId="1" stroke="#3E64FF" fill="#3E64FF" fillOpacity={0.6} />
                                <Area type="monotone" dataKey="evening" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Module Completion Rates */}
                        <ChartCard title="Module Completion Rates" subtitle="Drop-off analysis">
                            <div className="space-y-3 p-4">
                                {moduleCompletionData.map((module, idx) => (
                                    <div key={idx}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-400">{module.module}</span>
                                            <span className="text-white font-medium">{module.completion}%</span>
                                        </div>
                                        <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-500 ${
                                                    module.completion > 80 ? 'bg-green-500' :
                                                        module.completion > 60 ? 'bg-yellow-500' :
                                                            'bg-red-500'
                                                }`}
                                                style={{ width: `${module.completion}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ChartCard>

                        {/* Engagement Time */}
                        {courseReport && (
                            <ChartCard title="Total Engagement" subtitle="Time spent by all students">
                                <div className="p-8 text-center">
                                    <div className="text-5xl font-bold text-white mb-2">
                                        {Math.floor((courseReport.engagementMinutes || 0) / 60)}h {(courseReport.engagementMinutes || 0) % 60}m
                                    </div>
                                    <p className="text-gray-400">Total engagement time</p>

                                    <div className="mt-8 grid grid-cols-2 gap-4">
                                        <div className="bg-primary rounded-lg p-4">
                                            <p className="text-gray-400 text-sm">Avg per Student</p>
                                            <p className="text-xl font-bold text-white">
                                                {courseReport.enrollment > 0
                                                    ? `${Math.floor(courseReport.engagementMinutes / courseReport.enrollment)}m`
                                                    : '0m'
                                                }
                                            </p>
                                        </div>
                                        <div className="bg-primary rounded-lg p-4">
                                            <p className="text-gray-400 text-sm">Peak Activity</p>
                                            <p className="text-xl font-bold text-white">7-9 PM</p>
                                        </div>
                                    </div>
                                </div>
                            </ChartCard>
                        )}
                    </div>
                </div>
            )}

            {viewMode === 'performance' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Skills Radar */}
                        <ChartCard title="Average Student Skills" subtitle="Performance breakdown">
                            <ResponsiveContainer width="100%" height={300}>
                                <RadarChart data={skillsRadarData}>
                                    <PolarGrid stroke="#2A2A2A" />
                                    <PolarAngleAxis dataKey="skill" stroke="#666" />
                                    <Radar
                                        name="Skills"
                                        dataKey="A"
                                        stroke="#3E64FF"
                                        fill="#3E64FF"
                                        fillOpacity={0.6}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </ChartCard>

                        {/* Performance Summary */}
                        {courseReport && (
                            <ChartCard title="Performance Summary" subtitle={courseReport.course.title}>
                                <div className="space-y-4 p-4">
                                    <StatItem
                                        label="Quiz Attempts"
                                        value={courseReport.attempts}
                                        icon={<Activity className="w-4 h-4" />}
                                        trend={15}
                                    />
                                    <StatItem
                                        label="Average Score"
                                        value={`${courseReport.avgScore}%`}
                                        icon={<Award className="w-4 h-4" />}
                                        trend={-3}
                                    />
                                    <StatItem
                                        label="Completion Rate"
                                        value={`${courseReport.completionPct}%`}
                                        icon={<Target className="w-4 h-4" />}
                                        trend={5}
                                    />
                                    <StatItem
                                        label="Active Students"
                                        value={courseReport.enrollment}
                                        icon={<Users className="w-4 h-4" />}
                                        trend={8}
                                    />
                                </div>
                            </ChartCard>
                        )}
                    </div>

                    {/* Learning Progress Over Time */}
                    <ChartCard title="Learning Progress" subtitle="Completion trends over time">
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={timeSeriesData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                                <XAxis dataKey="date" stroke="#666" />
                                <YAxis stroke="#666" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1A1A1A',
                                        border: '1px solid #2A2A2A',
                                        borderRadius: '8px'
                                    }}
                                    labelStyle={{ color: '#fff' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="completion"
                                    stroke="#10B981"
                                    fill="#10B981"
                                    fillOpacity={0.6}
                                    name="Completion %"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="avgScore"
                                    stroke="#3E64FF"
                                    fill="#3E64FF"
                                    fillOpacity={0.4}
                                    name="Average Score"
                                />