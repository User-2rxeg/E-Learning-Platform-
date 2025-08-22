// src/app/api/courses/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const token = authHeader.substring(7); // R
        const courseData = await request.json();

        // Get current user data from token
        const userResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!userResponse.ok) {
            return NextResponse.json({ error: 'Failed to get user data' }, { status: 401 });
        }

        const userData = await userResponse.json();

        // Add instructorId to course data
        const enrichedCourseData = {
            ...courseData,
            instructorId: userData._id // Use the correct property name (_id for MongoDB)
        };

        // Send to backend
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/courses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(enrichedCourseData)
        });


        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Backend error (${response.status}):`, errorText);
            try {
                const errorJson = JSON.parse(errorText);
                return NextResponse.json(errorJson, { status: response.status });
            } catch {
                return NextResponse.json({ message: errorText }, { status: response.status });
            }
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error creating course:', error);
        return NextResponse.json(
            { error: 'Failed to create course', details: error.message },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

        if (!apiUrl) {
            return NextResponse.json(
                { error: 'API configuration error' },
                { status: 500 }
            );
        }

        const response = await fetch(`${apiUrl}/courses`, {
            headers: authHeader ? { 'Authorization': authHeader } : {}
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Error fetching courses:', error);
        return NextResponse.json(
            { error: 'Failed to fetch courses' },
            { status: 500 }
        );
    }
}