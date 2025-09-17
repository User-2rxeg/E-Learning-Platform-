// src/app/api/user/change-email/route.ts
import {NextRequest, NextResponse} from "next/server";
import {APP_CONFIG} from "../../../../config/app.config";
import {serverTokenManager} from "../../../../lib/auth/tokenManager";

export async function POST(request: NextRequest) {
    try {
        const { accessToken } = await serverTokenManager.getTokens();

        if (!accessToken) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        const body = await request.json();

        const backendResponse = await fetch(`${APP_CONFIG.API.BASE_URL}/users/change-email`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const data = await backendResponse.json();

        if (!backendResponse.ok) {
            return NextResponse.json(
                { error: data.message || 'Failed to change email' },
                { status: backendResponse.status }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Verification email sent to new address'
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}