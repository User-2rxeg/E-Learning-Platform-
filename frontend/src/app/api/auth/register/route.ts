// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Try using IP instead of localhost if in Docker/WSL environment
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:3222';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log('Connecting to:', BACKEND_URL);

        const response = await axios.post(`${BACKEND_URL}/auth/register`, body, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000
        });

        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error('Connection error:', {
            message: error.message,
            code: error.code
        });

        return NextResponse.json(
            { message: 'Cannot connect to backend server' },
            { status: 500 }
        );
    }
}