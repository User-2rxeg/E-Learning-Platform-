// src/app/api/user/change-password/route.ts

import {NextRequest, NextResponse} from "next/server";
import {APP_CONFIG} from "../../../../config/app.config";
import {serverTokenManager} from "../../../../lib/auth/tokenManager";

export async function POST(request: NextRequest) {
    try {
        const { accessToken } = await serverTokenManager.getTokens();
        if (!accessToken) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const body = await request.json();

        const response = await fetch(`${APP_CONFIG.API.BASE_URL}/api/users/change-password`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const data = await response.json();
            return NextResponse.json({ error: data.message || 'Failed to change password' }, { status: response.status });
        }

        return NextResponse.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}