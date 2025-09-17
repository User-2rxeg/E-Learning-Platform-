import {NextRequest, NextResponse} from "next/server";

export async function GET(request: NextRequest) {
    return NextResponse.json([
        {
            _id: '1',
            title: 'React Complete Guide',
            instructor: 'John Doe',
            students: 342,
            status: 'published',
            revenue: 34200,
            rating: 4.8,
            createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        },
        {
            _id: '2',
            title: 'Python for Data Science',
            instructor: 'Jane Smith',
            students: 298,
            status: 'published',
            revenue: 29800,
            rating: 4.7,
            createdAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000)
        },
        {
            _id: '3',
            title: 'AWS Cloud Practitioner',
            instructor: 'Mike Johnson',
            students: 276,
            status: 'under_review',
            revenue: 27600,
            rating: 4.6,
            createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)
        }
    ]);
}