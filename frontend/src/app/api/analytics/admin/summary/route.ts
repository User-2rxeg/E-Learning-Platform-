import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    return NextResponse.json({
        platformStats: {
            totalUsers: 2847,
            totalCourses: 145,
            totalRevenue: 285600,
            monthlyActiveUsers: 1923,
            newUsersToday: 23,
            coursesPublishedToday: 3
        },
        userBreakdown: {
            students: 2650,
            instructors: 187,
            admins: 10
        },
        revenueData: [
            { month: 'Jan', revenue: 42000 },
            { month: 'Feb', revenue: 45000 },
            { month: 'Mar', revenue: 48000 },
            { month: 'Apr', revenue: 52000 },
            { month: 'May', revenue: 49000 },
            { month: 'Jun', revenue: 55000 }
        ],
        topCourses: [
            { id: '1', title: 'React Complete Guide', students: 342, revenue: 34200 },
            { id: '2', title: 'Python for Data Science', students: 298, revenue: 29800 },
            { id: '3', title: 'AWS Cloud Practitioner', students: 276, revenue: 27600 }
        ],
        topInstructors: [
            { id: '1', name: 'John Doe', students: 567, courses: 12, revenue: 56700 },
            { id: '2', name: 'Jane Smith', students: 423, courses: 8, revenue: 42300 },
            { id: '3', name: 'Mike Johnson', students: 389, courses: 10, revenue: 38900 }
        ],
        recentActivity: [
            { type: 'new_user', message: 'New student registered', time: '5 minutes ago' },
            { type: 'course_published', message: 'New course published: Vue.js 3', time: '1 hour ago' },
            { type: 'payment', message: 'Payment received: $99', time: '2 hours ago' },
            { type: 'support_ticket', message: 'New support ticket #1234', time: '3 hours ago' }
        ],
        systemHealth: {
            serverStatus: 'healthy',
            dbStatus: 'healthy',
            storageUsed: 67,
            apiLatency: 145,
            errorRate: 0.02
        }
    });
}