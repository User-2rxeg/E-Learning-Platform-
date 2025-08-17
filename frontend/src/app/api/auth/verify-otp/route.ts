// src/app/api/auth/verify-otp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const response = await axios.post(`${BACKEND_URL}/auth/verify-otp`, body);

        return NextResponse.json(response.data);
    } catch (error: any) {
        return NextResponse.json(
            { message: error.response?.data?.message || 'OTP verification failed' },
            { status: error.response?.status || 500 }
        );
    }
}