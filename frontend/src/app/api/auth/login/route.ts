// // src/app/api/auth/login/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import {APP_CONFIG} from "../../../../config/app.config";
// import {serverTokenManager} from "../../../../lib/auth/tokenManager";
//
//
// export async function POST(request: NextRequest) {
//     try {
//         const body = await request.json();
//
//         // Your backend is at /auth/login (no /api prefix)
//         const backendResponse = await fetch(`${APP_CONFIG.API.BASE_URL}/auth/login`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(body),
//         });
//
//         const data = await backendResponse.json();
//
//         if (!backendResponse.ok) {
//             return NextResponse.json(
//                 { error: data.message || 'Login failed' },
//                 { status: backendResponse.status }
//             );
//         }
//
//         if (data.mfaRequired) {
//             return NextResponse.json({
//                 mfaRequired: true,
//                 tempToken: data.tempToken
//             });
//         }
//
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
//         console.error('Login error:', error);
//         return NextResponse.json(
//             { error: 'Internal server error' },
//             { status: 500 }
//         );
//     }
// }
//
//
// // // src/app/api/auth/login/route.ts
// // import { NextRequest, NextResponse } from 'next/server';
// // import { APP_CONFIG } from '../../../../config/app.config';
// // // Make sure this path EXACTLY matches the filename
// // import { serverTokenManager } from '../../../../lib/auth/tokenManager'; // <— lowercase t if your file is tokenManager.ts
// //
// // export async function POST(request: NextRequest) {
// //     try {
// //         const body = await request.json();
// //
// //         const backendResponse = await fetch(`${APP_CONFIG.API.BASE_URL}/auth/login`, {
// //             method: 'POST',
// //             headers: { 'Content-Type': 'application/json' },
// //             body: JSON.stringify(body),
// //         });
// //
// //         const data = await backendResponse.json();
// //
// //         if (!backendResponse.ok) {
// //             return NextResponse.json(
// //                 { error: data.message || 'Login failed' },
// //                 { status: backendResponse.status }
// //             );
// //         }
// //
// //         if (data.mfaRequired) {
// //             return NextResponse.json({
// //                 mfaRequired: true,
// //                 tempToken: data.tempToken,
// //             });
// //         }
// //
// //         const response = NextResponse.json({
// //             success: true,
// //             user: data.user,
// //         });
// //
// //         serverTokenManager.setTokens(response, {
// //             accessToken: data.access_token,   // align with backend keys
// //             refreshToken: data.refresh_token, // align with backend keys
// //         });
// //
// //         return response;
// //     } catch (error) {
// //         console.error('Login error:', error);
// //         return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
// //     }
// // }



// // // src/app/api/auth/login/route.ts
// // import { NextRequest, NextResponse } from 'next/server';
// // import {serverTokenManager} from "../../../../lib/auth/tokenManager";
// //
// // const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3555';
// // export async function POST(request: NextRequest) {
// //     try {
// //         const body = await request.json();
// // // Call backend login endpoint
// //         const backendResponse = await fetch(`${BACKEND_URL}/auth/login`, {
// //             method: 'POST',
// //             headers: { 'Content-Type': 'application/json' },
// //             body: JSON.stringify(body),
// //         });
// //
// //         const data = await backendResponse.json();
// //
// //         if (!backendResponse.ok) {
// //             return NextResponse.json(
// //                 { error: data.message || 'Login failed' },
// //                 { status: backendResponse.status }
// //             );
// //         }
// //
// // // Handle MFA required case
// //         if (data.mfaRequired && data.tempToken) {
// //             return NextResponse.json({
// //                 mfaRequired: true,
// //                 tempToken: data.tempToken
// //             });
// //         }
// //
// // // Successful login - set cookies
// //         const response = NextResponse.json({
// //             success: true,
// //             user: data.user,
// //         });
// //
// // // Set tokens in httpOnly cookies
// //         serverTokenManager.setTokens(response, {
// //             accessToken: data.access_token,
// //             refreshToken: data.refresh_token,
// //         });
// //
// //         return response;
// //     } catch (error) {
// //         console.error('Login error:', error);
// //         return NextResponse.json(
// //             { error: 'Internal server error' },
// //             { status: 500 }
// //         );
// //     }
// // }
//
// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { serverTokenManager } from '../../../../lib/auth/tokenManager';

const BASE = process.env.BACKEND_URL ?? 'http://localhost:3654'; // <-- server-side var

function isJsonResponse(res: Response) {
    const ct = res.headers.get('content-type') || '';
    return ct.includes('application/json');
}

export async function POST(request: NextRequest) {
    const body = await request.json();

    // If your Nest app uses a global prefix 'api', keep '/api/auth/login' here
    const url = new URL('/api/auth/login', BASE).toString();

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    try {
        const backendResponse = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            cache: 'no-store',
            signal: controller.signal,
        });

        // Try to parse JSON; if not JSON (e.g., "Cannot POST /auth/login"), read as text
        let payload: any = null;
        if (isJsonResponse(backendResponse)) {
            payload = await backendResponse.json();
        } else {
            const text = await backendResponse.text();
            // Surface the backend text in dev to make this obvious
            return NextResponse.json(
                { error: text || 'Upstream returned non-JSON response' },
                { status: backendResponse.status || 502 },
            );
        }

        if (!backendResponse.ok) {
            return NextResponse.json(
                { error: payload?.message || payload?.error || 'Login failed' },
                { status: backendResponse.status },
            );
        }

        // Handle MFA short-circuit
        if (payload.mfaRequired && payload.tempToken) {
            return NextResponse.json({
                mfaRequired: true,
                tempToken: payload.tempToken,
            });
        }

        // Normalize token field names (adjust these to your Nest dto's!)
        const accessToken =
            payload.access_token ?? payload.accessToken ?? payload.token;
        const refreshToken =
            payload.refresh_token ?? payload.refreshToken;

        const res = NextResponse.json({
            success: true,
            user: payload.user,
        });

        if (accessToken || refreshToken) {
            serverTokenManager.setTokens(res, {
                accessToken,
                refreshToken,
            });
        }

        return res;
    } catch (err: any) {
        // ECONNREFUSED/ENOTFOUND/Abort → 502
        console.error('Proxy /api/auth/login failed', { url, message: err?.message });
        return NextResponse.json(
            {
                error: 'Auth service unreachable',
                details:
                    process.env.NODE_ENV === 'development' ? String(err) : undefined,
            },
            { status: 502 },
        );
    } finally {
        clearTimeout(timer);
    }
}


// import { NextRequest, NextResponse } from "next/server";
// import { serverTokenManager } from "../../../../lib/auth/tokenManager";
//
// const BASE = process.env.BACKEND_URL ?? 'http://localhost:3555';
// export async function POST(request: NextRequest) {
//     try {
//         const body = await request.json();
//         const backendResponse = await fetch(`${BASE}/auth/login`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(body),
//         });
//
//         const data = await backendResponse.json();
//
//         if (!backendResponse.ok) {
//             return NextResponse.json(
//                 { error: data.message || 'Login failed' },
//                 { status: backendResponse.status }
//             );
//         }
//
//         // Handle MFA required
//         if (data.mfaRequired) {
//             return NextResponse.json({
//                 mfaRequired: true,
//                 tempToken: data.tempToken
//             });
//         }
//
//         // Set tokens in cookies
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
//         console.error('Login error:', error);
//         return NextResponse.json(
//             { error: 'Internal server error' },
//             { status: 500 }
//         );
//     }
// }