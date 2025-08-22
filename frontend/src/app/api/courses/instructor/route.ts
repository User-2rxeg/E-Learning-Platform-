// src/app/api/courses/instructor/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        if (!apiUrl) {
            console.error('NEXT_PUBLIC_BACKEND_URL environment variable is not defined');
            return NextResponse.json(
                { error: 'API configuration error' },
                { status: 500 }
            );
        }

        const response = await fetch(`${apiUrl}/courses/instructor`, {
            headers: {
                'Authorization': authHeader
            }
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Error fetching instructor courses:', error);
        return NextResponse.json(
            { error: 'Failed to fetch courses' },
            { status: 500 }
        );
    }
}