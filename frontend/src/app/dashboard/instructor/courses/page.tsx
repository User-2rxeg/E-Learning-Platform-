// src/app/dashboard/instructor/courses/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { DataTable } from '../../../../components/dashboard/common/DataTable';
import { EmptyState } from '../../../../components/dashboard/common/EmptyState';
import { courseService } from '../../../../lib/services/courseApi';

interface Course {
    id: string;
    title: string;
    description: string;
    students: number;
    status: 'active' | 'draft' | 'archived';
    rating: number;
    createdAt: Date;
    updatedAt: Date;
}

export default function InstructorCoursesPage() {
    const { user, token } = useAuth();
    const router = useRouter();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            // const response = await courseService.getInstructorCourses();
            // setCourses(response.data);

            // Mock data
            setCourses([
                {
                    id: '1',
                    title: 'Web Development Masterclass',
                    description: 'Complete guide to modern web development',
                    students: 156,
                    status: 'active',
                    rating: 4.8,
                    createdAt: new Date('2024-01-15'),
                    updatedAt: new Date('2024-01-20')
                },
                {
                    id: '2',
                    title: 'JavaScript Advanced Concepts',
                    description: 'Deep dive into JavaScript',
                    students: 89,
                    status: 'active',
                    rating: 4.6,
                    createdAt: new Date('2024-01-10'),
                    updatedAt: new Date('2024-01-18')
                },
                {
                    id: '3',
                    title: 'React & Redux Complete Guide',
                    description: 'Master React with Redux',
                    students: 234,
                    status: 'active',
                    rating: 4.9,
                    createdAt: new Date('2024-01-05'),
                    updatedAt: new Date('2024-01-19')
                },
                {
                    id: '4',
                    title: 'Node.js Backend Development',
                    description: 'Build scalable backend applications',
                    students: 0,
                    status: 'draft',
                    rating: 0,
                    createdAt: new Date('2024-01-20'),
                    updatedAt: new Date('2024-01-20')
                }
            ]);
        } catch (err) {
            setError('Failed to fetch courses');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCourse = () => {
        router.push('/dashboard/instructor/courses/create');
    };

    const handleEditCourse = (courseId: string) => {
        router.push(`/dashboard/instructor/courses/${courseId}/edit`);
    };

    const handleViewAnalytics = (courseId: string) => {
        router.push(`/dashboard/instructor/courses/${courseId}/analytics`);
    };

    const columns = [
        {
            key: 'title' as keyof Course,
            label: 'Course Title',
            sortable: true,
            render: (value: string, item: Course) => (
                <div>
                    <p className="text-white font-medium">{value}</p>
                    <p className="text-text-secondary text-xs">{item.description}</p>
                </div>
            )
        },
        {
            key: 'students' as keyof Course,
            label: 'Students',
            sortable: true,
            render: (value: number) => (
                <span className="text-white">{value}</span>
            )
        },
        {
            key: 'status' as keyof Course,
            label: 'Status',
            sortable: true,
            render: (value: string) => {
                const statusStyles = {
                    active: 'bg-green-500/10 text-green-400 border-green-500/20',
                    draft: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
                    archived: 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                };
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusStyles[value as keyof typeof statusStyles]}`}>
            {value}
          </span>
                );
            }
        },
        {
            key: 'rating' as keyof Course,
            label: 'Rating',
            sortable: true,
            render: (value: number) => (
                <span className="text-yellow-400">
          {value > 0 ? `⭐ ${value}` : '-'}
        </span>
            )
        },
        {
            key: 'updatedAt' as keyof Course,
            label: 'Last Updated',
            sortable: true,
            render: (value: Date) => (
                <span className="text-text-secondary text-sm">
          {new Date(value).toLocaleDateString()}
        </span>
            )
        }
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">My Courses</h1>
                    <p className="text-text-secondary mt-1">Manage and monitor your courses</p>
                </div>
                <button
                    onClick={handleCreateCourse}
                    className="px-6 py-3 bg-accent hover:bg-accent-hover text-white font-medium
            rounded-lg transition-colors"
                >
                    + Create New Course
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-primary-light rounded-lg p-4 border border-gray-800">
                    <p className="text-text-secondary text-sm">Total Courses</p>
                    <p className="text-2xl font-bold text-white mt-1">{courses.length}</p>
                </div>
                <div className="bg-primary-light rounded-lg p-4 border border-gray-800">
                    <p className="text-text-secondary text-sm">Active Courses</p>
                    <p className="text-2xl font-bold text-white mt-1">
                        {courses.filter(c => c.status === 'active').length}
                    </p>
                </div>
                <div className="bg-primary-light rounded-lg p-4 border border-gray-800">
                    <p className="text-text-secondary text-sm">Total Students</p>
                    <p className="text-2xl font-bold text-white mt-1">
                        {courses.reduce((sum, c) => sum + c.students, 0)}
                    </p>
                </div>
                <div className="bg-primary-light rounded-lg p-4 border border-gray-800">
                    <p className="text-text-secondary text-sm">Avg Rating</p>
                    <p className="text-2xl font-bold text-yellow-400 mt-1">
                        ⭐ {(courses.filter(c => c.rating > 0).reduce((sum, c) => sum + c.rating, 0) / courses.filter(c => c.rating > 0).length || 0).toFixed(1)}
                    </p>
                </div>
            </div>

            {/* Courses Table */}
            {courses.length === 0 && !loading ? (
                <EmptyState
                    title="No courses yet"
                    description="Create your first course to start teaching"
                    action={{
                        label: 'Create Course',
                        onClick: handleCreateCourse
                    }}
                />
            ) : (
                <DataTable
                    data={courses}
                    columns={columns}
                    loading={loading}
                    onRowClick={(course) => router.push(`/dashboard/instructor/courses/${course.id}`)}
                    emptyMessage="No courses found"
                />
            )}
        </div>
    );
}
