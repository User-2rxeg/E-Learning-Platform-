// src/app/api/profile/update/route.ts - NEW FILE
import { NextRequest, NextResponse } from "next/server";
import {serverTokenManager} from "../../../../../lib/auth/tokenManager";
import {APP_CONFIG} from "../../../../../config/app.config";


export async function PUT(request: NextRequest) {
    try {
        const { accessToken } = await serverTokenManager.getTokens();
        if (!accessToken) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        const formData = await request.formData();

        // Forward to backend
        const backendResponse = await fetch(`${APP_CONFIG.API.BASE_URL}/users/profile`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
            body: formData,
        });

        if (!backendResponse.ok) {
            return NextResponse.json(
                { error: 'Failed to update profile' },
                { status: backendResponse.status }
            );
        }

        const data = await backendResponse.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}