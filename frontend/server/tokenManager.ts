// src/lib/server/tokenManager.ts
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { APP_CONFIG } from '../config/app.config';
export const serverTokenManager = {
    setAccessToken(response: NextResponse, accessToken: string) {
        response.cookies.set(APP_CONFIG.COOKIES.ACCESS_TOKEN, accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60, // 1 hour
            path: '/',
        });
    },
    async getAccessToken() {
        const cookieStore = await cookies(); // Need await in Next.js 15
        return cookieStore.get(APP_CONFIG.COOKIES.ACCESS_TOKEN)?.value;
    },
    getAccessTokenFromRequest(request: NextRequest) {
        return request.cookies.get(APP_CONFIG.COOKIES.ACCESS_TOKEN)?.value;
    },
    clearTokens(response: NextResponse) {
        response.cookies.delete(APP_CONFIG.COOKIES.ACCESS_TOKEN);
    }
};
