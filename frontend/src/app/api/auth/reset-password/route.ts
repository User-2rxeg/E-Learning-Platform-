// src/app/api/auth/reset-password/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
    try {
        const { email, otp, password } = await request.json();
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

        if (!backendUrl) {
            throw new Error("NEXT_PUBLIC_BACKEND_URL environment variable is not defined");
        }

        const response = await axios.post(`${backendUrl}/auth/reset-password`, {
            email,
            otp,
            password
        });

        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error('Reset password error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });

        return NextResponse.json(
            { message: error.response?.data?.message || error.message || 'An error occurred' },
            { status: error.response?.status || 500 }
        );
    }
}