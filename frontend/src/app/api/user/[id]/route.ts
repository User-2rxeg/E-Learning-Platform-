// src/app/api/user/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { serverTokenManager } from '../../../../lib/auth/tokenManager';
import { APP_CONFIG } from '../../../../config/app.config';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { accessToken } = await serverTokenManager.getTokens();

        const headers: HeadersInit = {};
        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }

        const backendResponse = await fetch(
            `${APP_CONFIG.API.BASE_URL}/users/${params.id}/profile`,
            { headers }
        );

        if (!backendResponse.ok) {
            return NextResponse.json(
                { error: 'Profile not found' },
                { status: backendResponse.status }
            );
        }

        const profile = await backendResponse.json();
        return NextResponse.json(profile);
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}