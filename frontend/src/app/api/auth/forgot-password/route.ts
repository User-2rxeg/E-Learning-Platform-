// src/app/api/auth/forgot-password/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        // Use the correct environment variable
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

        // Log the request for debugging
        console.log(`Sending forgot password request for: ${email}`);
        console.log(`Backend URL: ${backendUrl}`);

        if (!backendUrl) {
            throw new Error("NEXT_PUBLIC_BACKEND_URL environment variable is not defined");
        }

        const response = await axios.post(`${backendUrl}/auth/forgot-password`, {
            email
        });

        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error('Forgot password error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/forgot-password`
        });

        return NextResponse.json(
            { message: error.message || 'An error occurred' },
            { status: error.response?.status || 500 }
        );
    }
}