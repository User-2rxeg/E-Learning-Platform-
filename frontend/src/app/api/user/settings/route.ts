// src/app/api/user/settings/route.ts
import {NextRequest, NextResponse} from "next/server";
import {APP_CONFIG} from "../../../../config/app.config";
import {serverTokenManager} from "../../../../lib/auth/tokenManager";

export async function GET(request: NextRequest) {
    try {
        const { accessToken } = await serverTokenManager.getTokens();
        if (!accessToken) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const response = await fetch(`${APP_CONFIG.API.BASE_URL}/api/users/settings`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch settings' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
export async function PATCH(request: NextRequest) {
    try {
        const { accessToken } = await serverTokenManager.getTokens();
        if (!accessToken) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const body = await request.json();

        const response = await fetch(`${APP_CONFIG.API.BASE_URL}/api/users/settings`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to update settings' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}