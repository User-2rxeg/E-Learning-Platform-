import { NextRequest, NextResponse } from 'next/server';
import { serverTokenManager } from '../../../../lib/auth/tokenManager';
import { APP_CONFIG } from '../../../../config/app.config';

export async function POST(request: NextRequest) {
    try {
        const { accessToken } = await serverTokenManager.getTokens();

        if (accessToken) {
            // Call backend logout to blacklist token
            await fetch(`${APP_CONFIG.API.BASE_URL}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
            });
        }

        // Clear cookies
        const response = NextResponse.json({ success: true });
        serverTokenManager.clearTokens(response);
        return response;
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { error: 'Logout failed' },
            { status: 500 }
        );
    }
}
