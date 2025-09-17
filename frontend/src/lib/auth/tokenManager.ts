// src/lib/auth/tokenManager.ts
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { APP_CONFIG } from '../../config/app.config';
export const serverTokenManager = {
    setTokens(response: NextResponse, tokens: {
        accessToken: string;
        refreshToken?: string
    }) {
        response.cookies.set(APP_CONFIG.COOKIES.ACCESS_TOKEN, tokens.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60, // 1 hour
            path: '/',
        });
        if (tokens.refreshToken) {
            response.cookies.set(APP_CONFIG.COOKIES.REFRESH_TOKEN, tokens.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7, // 7 days
                path: '/',
            });
        }
    },
    async getTokens() {
        const cookieStore = await cookies(); // Need await in Next.js 15
        return {
            accessToken: cookieStore.get(APP_CONFIG.COOKIES.ACCESS_TOKEN)?.value,
            refreshToken: cookieStore.get(APP_CONFIG.COOKIES.REFRESH_TOKEN)?.value,
        };
    },
    getTokensFromRequest(request: NextRequest) {
        return {
            accessToken: request.cookies.get(APP_CONFIG.COOKIES.ACCESS_TOKEN)?.value,
            refreshToken: request.cookies.get(APP_CONFIG.COOKIES.REFRESH_TOKEN)?.value,
        };
    },
    clearTokens(response: NextResponse) {
        response.cookies.delete(APP_CONFIG.COOKIES.ACCESS_TOKEN);
        response.cookies.delete(APP_CONFIG.COOKIES.REFRESH_TOKEN);
    }
};