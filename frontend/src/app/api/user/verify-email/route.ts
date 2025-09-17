// src/app/api/user/verify-email/route.ts
import {NextRequest, NextResponse} from "next/server";
import {APP_CONFIG} from "../../../../config/app.config";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const backendResponse = await fetch(`${APP_CONFIG.API.BASE_URL}/users/verify-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const data = await backendResponse.json();

        if (!backendResponse.ok) {
            return NextResponse.json(
                { error: data.message || 'Failed to verify email' },
                { status: backendResponse.status }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Email verified successfully'
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}