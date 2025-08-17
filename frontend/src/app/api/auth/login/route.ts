// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const response = await axios.post(`${BACKEND_URL}/auth/login`, body);

        return NextResponse.json(response.data);
    } catch (error: any) {
        return NextResponse.json(
            { message: error.response?.data?.message || 'Login failed' },
            { status: error.response?.status || 500 }
        );
    }
}