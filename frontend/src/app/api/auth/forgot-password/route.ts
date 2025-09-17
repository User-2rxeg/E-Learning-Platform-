// src/app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {APP_CONFIG} from "../../../../config/app.config";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3654';
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const backendResponse = await fetch(`${APP_CONFIG.API.BASE_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const data = await backendResponse.json();

        if (!backendResponse.ok) {
            return NextResponse.json(
                { error: data.message || 'Failed to send reset code' },
                { status: backendResponse.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}