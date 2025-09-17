// src/app/instructor/analytics/page.tsx - NEW FILE
'use client';
import { useState, useEffect } from 'react';
import apiClient from "../../../../lib/services/apiC";
import {useAuth} from "../../../../contexts/AuthContext";
import { Bar } from 'react-chartjs-2';

interface InstructorAnalytics {
    totalCourses: number;
    totalStudents: number;
    avgCompletionPct: number;
    courseEnrollments: {
        id: string;
        title: string;
        enrollmentCount: number;
    }[];
}
export default function InstructorAnalytics() {
    const { user } = useAuth();
    const [analytics, setAnalytics] = useState<InstructorAnalytics | null>(null);
    const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
    const [courseReport, setCourseReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetchDashboard();
    }, [user]);

    const fetchDashboard = async () => {
        if (!user?.id) return;

        try {
            setLoading(true);
            const response = await apiClient.get(`/analytics/instructor/${user.id}/dashboard`);
            setAnalytics(response.data);

            // Auto-select first course if available
            if (response.data.courseEnrollments.length > 0) {
                setSelectedCourse(response.data.courseEnrollments[0].id);
            }
        } catch (error) {
            console.error('Failed to fetch instructor analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCourseReport = async (courseId: string) => {
        try {
            const response = await apiClient.get(
                `/analytics/instructor/${user?.id}/course/${courseId}/report`
            );
            setCourseReport(response.data);
        } catch (error) {
            console.error('Failed to fetch course report:', error);
        }
    };

    useEffect(() => {
        if (selectedCourse) {
            fetchCourseReport(selectedCourse);
        }
    }, [selectedCourse]);

    const exportData = async (format: 'csv' | 'json') => {
        if (!selectedCourse) return;

        try {
            const response = await apiClient.get(
                `/analytics/instructor/${user?.id}/course/${selectedCourse}/report/export?format=${format}`,
                { responseType: format === 'csv' ? 'blob' : 'json' }
            );

            if (format === 'csv') {
                const blob = new Blob([response.data], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `course-${selectedCourse}-report.csv`;
                a.click();
            } else {
                const dataStr = JSON.stringify(response.data, null, 2);
                const blob = new Blob([dataStr], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `course-${selectedCourse}-report.json`;
                a.click();
            }
        } catch (error) {
            console.error('Export failed:', error);
        }
    };

    if (loading) {
        return <div>Loading analytics...</div>;
    }

    return (
        <div className="instructor-analytics">
            <h1>Instructor Analytics Dashboard</h1>

            {/* Overview Cards */}
            <div className="overview-cards">
                <div className="stat-card">
                    <h3>Total Courses</h3>
                    <p className="stat-value">{analytics?.totalCourses}</p>
                </div>
                <div className="stat-card">
                    <h3>Total Students</h3>
                    <p className="stat-value">{analytics?.totalStudents}</p>
                </div>
                <div className="stat-card">
                    <h3>Avg Completion</h3>
                    <p className="stat-value">{analytics?.avgCompletionPct}%</p>
                </div>
            </div>

            {/* Course Selector */}
            <div className="course-selector">
                <label>Select Course:</label>
                <select
                    value={selectedCourse || ''}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                >
                    {analytics?.courseEnrollments.map(course => (
                        <option key={course.id} value={course.id}>
                            {course.title} ({course.enrollmentCount} students)
                        </option>
                    ))}
                </select>

                <div className="export-buttons">
                    <button onClick={() => exportData('csv')}>Export CSV</button>
                    <button onClick={() => exportData('json')}>Export JSON</button>
                </div>
            </div>

            {/* Course Report */}
            {courseReport && (
                <div className="course-report">
                    <h2>{courseReport.course.title} - Detailed Report</h2>

                    <div className="report-metrics">
                        <div className="metric">
                            <span>Enrollment:</span>
                            <strong>{courseReport.enrollment}</strong>
                        </div>
                        <div className="metric">
                            <span>Total Attempts:</span>
                            <strong>{courseReport.attempts}</strong>
                        </div>
                        <div className="metric">
                            <span>Avg Score:</span>
                            <strong>{courseReport.avgScore}%</strong>
                        </div>
                        <div className="metric">
                            <span>Completion:</span>
                            <strong>{courseReport.completionPct}%</strong>
                        </div>
                        <div className="metric">
                            <span>Engagement:</span>
                            <strong>{courseReport.engagementMinutes} mins</strong>
                        </div>
                    </div>

                    {/* Difficulty Distribution */}
                    <div className="difficulty-chart">
                        <h3>Quiz Difficulty Distribution</h3>
                        <Bar
                            data={{
                                labels: ['Easy', 'Medium', 'Hard'],
                                datasets: [{
                                    label: 'Question Count',
                                    data: [
                                        courseReport.difficultyMix.easy,
                                        courseReport.difficultyMix.medium,
                                        courseReport.difficultyMix.hard
                                    ],
                                    backgroundColor: [
                                        'rgba(34, 197, 94, 0.5)',
                                        'rgba(251, 146, 60, 0.5)',
                                        'rgba(239, 68, 68, 0.5)'
                                    ]
                                }]
                            }}
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: { display: false }
                                }
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}