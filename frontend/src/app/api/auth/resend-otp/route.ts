// src/app/api/auth/resend-otp/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
    try {
        const { email, mode } = await request.json();
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

        if (!backendUrl) {
            throw new Error("NEXT_PUBLIC_BACKEND_URL environment variable is not defined");
        }

        const response = await axios.post(`${backendUrl}/auth/resend-otp`, {
            email,
            mode
        });

        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error('Resend OTP error details:', {
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