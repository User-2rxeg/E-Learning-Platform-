// src/app/api/courses/instructor/[id]/route.ts
import {NextRequest, NextResponse} from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    return NextResponse.json([
        {
            _id: '1',
            title: 'React Advanced Patterns',
            description: 'Master advanced React patterns and best practices',
            instructorId: params.id,
            students: 45,
            modules: [
                { _id: 'm1', title: 'Introduction', lessons: 5 },
                { _id: 'm2', title: 'Advanced Hooks', lessons: 8 }
            ],
            status: 'published',
            rating: 4.8,
            revenue: 4500,
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        },
        {
            _id: '2',
            title: 'Node.js Masterclass',
            description: 'Complete backend development guide',
            instructorId: params.id,
            students: 38,
            modules: [
                { _id: 'm3', title: 'Setup', lessons: 3 },
                { _id: 'm4', title: 'REST APIs', lessons: 10 }
            ],
            status: 'published',
            rating: 4.6,
            revenue: 3800,
            createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)
        },
        {
            _id: '3',
            title: 'TypeScript Deep Dive',
            description: 'Advanced TypeScript concepts',
            instructorId: params.id,
            students: 0,
            modules: [
                { _id: 'm5', title: 'Basics', lessons: 4 }
            ],
            status: 'draft',
            rating: 0,
            revenue: 0,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        }
    ]);
}