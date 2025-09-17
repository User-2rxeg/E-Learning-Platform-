// src/app/api/auth/mfa/activate/route.ts

import {NextRequest, NextResponse} from "next/server";
import {serverTokenManager} from "../../../../../lib/auth/tokenManager";
import {APP_CONFIG} from "../../../../../config/app.config";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3654';
export async function POST(request: NextRequest) {
    try {
        const { accessToken } = serverTokenManager.getTokensFromRequest(request);
        const body = await request.json();
        if (!accessToken) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        const backendResponse = await fetch(`${APP_CONFIG.API.BASE_URL}/auth/mfa/activate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(body),
        });

        const data = await backendResponse.json();

        if (!backendResponse.ok) {
            return NextResponse.json(
                { error: data.message || 'Failed to activate MFA' },
                { status: backendResponse.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('MFA activate error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}