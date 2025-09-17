// // src/app/api/auth/mfa/verify-login/route.ts
// import {NextRequest, NextResponse} from "next/server";
// import {serverTokenManager} from "../../../../../lib/auth/tokenManager";
// import {APP_CONFIG} from "../../../../../config/app.config";
// const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3555';
// export async function POST(request: NextRequest) {
//     try {
//         const body = await request.json();
//         const { tempToken, ...verifyData } = body;
//         const backendResponse = await fetch(`${APP_CONFIG.API.BASE_URL}/auth/mfa/verify-login`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${tempToken}`
//             },
//             body: JSON.stringify(verifyData),
//         });
//
//         const data = await backendResponse.json();
//
//         if (!backendResponse.ok) {
//             return NextResponse.json(
//                 { error: data.message || 'MFA verification failed' },
//                 { status: backendResponse.status }
//             );
//         }
//
// // Set tokens in cookies
//         const response = NextResponse.json({
//             success: true,
//             user: data.user,
//         });
//
//         serverTokenManager.setTokens(response, {
//             accessToken: data.access_token,
//             refreshToken: data.refresh_token,
//         });
//
//         return response;
//     } catch (error) {
//         console.error('MFA verification error:', error);
//         return NextResponse.json(
//             { error: 'Internal server error' },
//             { status: 500 }
//         );
//     }
// }


// src/app/api/auth/mfa/verify-login/route.ts
import {NextRequest, NextResponse} from "next/server";
import {serverTokenManager} from "../../../../../lib/auth/tokenManager";
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3654';
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { tempToken, ...verifyData } = body;
        const backendResponse = await fetch(`${API_BASE_URL}/auth/mfa/verify-login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tempToken}`
            },
            body: JSON.stringify(verifyData),
        });

        const data = await backendResponse.json();

        if (!backendResponse.ok) {
            return NextResponse.json(
                { error: data.message || 'MFA verification failed' },
                { status: backendResponse.status }
            );
        }

// Set tokens in cookies
        const response = NextResponse.json({
            success: true,
            user: data.user,
        });

        serverTokenManager.setTokens(response, {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
        });

        return response;
    } catch (error) {
        console.error('MFA verification error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
