import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    return NextResponse.json({
        instructorId: params.id,
        totalStudents: 156,
        totalCourses: 5,
        totalRevenue: 12500,
        averageRating: 4.7,
        completionRate: 78,
        engagementRate: 85,
        recentActivity: {
            newStudentsLast7Days: 12,
            newStudentsLast30Days: 45,
            submissionsToReview: 8,
            messagesUnread: 3
        },
        courses: [
            {
                courseId: '1',
                title: 'React Advanced Patterns',
                students: 45,
                averageProgress: 67,
                rating: 4.8,
                revenue: 4500,
                lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
            },
            {
                courseId: '2',
                title: 'Node.js Masterclass',
                students: 38,
                averageProgress: 72,
                rating: 4.6,
                revenue: 3800,
                lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
            }
        ],
        studentPerformance: [
            { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), avgScore: 82 },
            { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), avgScore: 85 },
            { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), avgScore: 83 },
            { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), avgScore: 87 },
            { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), avgScore: 86 },
            { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), avgScore: 88 }
        ],
        topStudents: [
            { id: '1', name: 'Alice Johnson', progress: 95, avgScore: 92 },
            { id: '2', name: 'Bob Smith', progress: 89, avgScore: 88 },
            { id: '3', name: 'Carol White', progress: 87, avgScore: 90 }
        ]
    });
}