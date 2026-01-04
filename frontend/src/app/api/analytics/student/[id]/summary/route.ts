import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    // Check if you want to call your real backend
    try {
        // If your NestJS backend has this endpoint:
        // const response = await fetch(`http://localhost:3555/analytics/student/${params.id}/summary`);
        // const data = await response.json();
        // return NextResponse.json(data);

        // For now, return mock data
        return NextResponse.json({
            studentId: params.id,
            completionPct: 75,
            avgScore: 85,
            totalTimeSpent: 1200,
            recentActivity: {
                attemptsLast7Days: 5,
                attemptsLast30Days: 20,
                modulesCompletedLast7Days: 3,
                timeSpentLast7Days: 420
            },
            courses: [
                {
                    courseId: '1',
                    courseTitle: 'React Fundamentals',
                    progress: 60,
                    lastScore: 88,
                    lastActiveAt: new Date(),
                    timeSpent: 300,
                    quizzesTaken: 3,
                    averageQuizScore: 85
                }
            ],
            attemptsCount: 25,
            performanceTrend: [
                { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), score: 80, timeSpent: 60 },
                { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), score: 85, timeSpent: 45 },
                { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), score: 82, timeSpent: 50 },
                { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), score: 90, timeSpent: 55 },
                { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), score: 88, timeSpent: 48 },
                { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), score: 92, timeSpent: 52 }
            ],
            skillsProgress: [
                { skill: 'JavaScript', level: 80, progress: 80 },
                { skill: 'React', level: 70, progress: 70 },
                { skill: 'Node.js', level: 60, progress: 60 },
                { skill: 'TypeScript', level: 65, progress: 65 },
                { skill: 'MongoDB', level: 55, progress: 55 }
            ]
        });
    } catch (error) {
        console.error('analytics error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics' },
            { status: 500 }
        );
    }
}