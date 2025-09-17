//
// import {NextRequest, NextResponse} from "next/server";
// import {serverTokenManager} from "../../../../../lib/auth/tokenManager";
// const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3555';
// export async function POST(request: NextRequest) {
//     try {
//         const { accessToken } = serverTokenManager.getTokensFromRequest(request);
//         if (!accessToken) {
//             return NextResponse.json(
//                 { error: 'Not authenticated' },
//                 { status: 401 }
//             );
//         }
//
//         const backendResponse = await fetch(`${BACKEND_URL}/auth/mfa/setup`, {
//             method: 'POST',
//             headers: {
//                 'Authorization': `Bearer ${accessToken}`
//             },
//         });
//
//         const data = await backendResponse.json();
//
//         if (!backendResponse.ok) {
//             return NextResponse.json(
//                 { error: data.message || 'Failed to setup MFA' },
//                 { status: backendResponse.status }
//             );
//         }
//
//         return NextResponse.json(data);
//     } catch (error) {
//         console.error('MFA setup error:', error);
//         return NextResponse.json(
//             { error: 'Internal server error' },
//             { status: 500 }
//         );
//     }
// }


import { NextRequest, NextResponse } from "next/server";
import { serverTokenManager } from "../../../../../lib/auth/tokenManager";
import {APP_CONFIG} from "../../../../../config/app.config";

export async function POST(request: NextRequest) {
    try {
        const { accessToken } = await serverTokenManager.getTokens();
        if (!accessToken) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        const backendResponse = await fetch(`${APP_CONFIG.API.BASE_URL}/auth/mfa/setup`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
        });

        const data = await backendResponse.json();

        if (!backendResponse.ok) {
            return NextResponse.json(
                { error: data.message || 'Failed to setup MFA' },
                { status: backendResponse.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('MFA setup error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}


