// src/app/api/user/export/route.ts

import {NextRequest, NextResponse} from "next/server";
import {APP_CONFIG} from "../../../../config/app.config";
import {serverTokenManager} from "../../../../lib/auth/tokenManager";
export async function GET(request: NextRequest) {
    try {
        const { accessToken } = await serverTokenManager.getTokens();
        if (!accessToken) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const response = await fetch(`${APP_CONFIG.API.BASE_URL}/api/users/export`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to export data' }, { status: response.status });
        }

        const data = await response.blob();
        return new NextResponse(data, {
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="user-data-${Date.now()}.json"`
            }
        });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}