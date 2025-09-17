// // // src/app/api/auth/me/route.ts
// // import { NextRequest, NextResponse } from 'next/server';
// // import { serverTokenManager } from '../../../../lib/auth/tokenManager';
// // import { APP_CONFIG } from '../../../../config/app.config';
// //
// // export async function GET(request: NextRequest) {
// //     try {
// //         const { accessToken } = await serverTokenManager.getTokens();
// //
// //         if (!accessToken) {
// //             return NextResponse.json(
// //                 { error: 'Not authenticated' },
// //                 { status: 401 }
// //             );
// //         }
// //
// //         const backendResponse = await fetch(`${APP_CONFIG.API.BASE_URL}/auth/me`, {
// //             headers: {
// //                 'Authorization': `Bearer ${accessToken}`
// //             },
// //         });
// //
// //         if (!backendResponse.ok) {
// //             return NextResponse.json(
// //                 { error: 'Failed to fetch user' },
// //                 { status: backendResponse.status }
// //             );
// //         }
// //
// //         const user = await backendResponse.json();
// //         return NextResponse.json(user);
// //     } catch (error) {
// //         console.error('Get user error:', error);
// //         return NextResponse.json(
// //             { error: 'Internal server error' },
// //             { status: 500 }
// //         );
// //     }
// // }
//
// import { NextRequest, NextResponse } from 'next/server';
//
// export async function GET(request: NextRequest) {
//
//     try {
//         const { accessToken } = await serverTokenManager.getTokens();
//
//          if (!accessToken) {
//              return NextResponse.json(
//                 { error: 'Not authenticated' },
//                  { status: 401 }
//             );
//         }
//
//          const backendResponse = await fetch(`${APP_CONFIG.API.BASE_URL}/auth/me`, {
//              headers: {
//                 'Authorization': `Bearer ${accessToken}`
//              },
//          });
//
//         if (!backendResponse.ok) {
//              return NextResponse.json(
//                 { error: 'Failed to fetch user' },
//                 { status: backendResponse.status }
//             );
//          }
//
// zzzz        const user = await backendResponse.json();
//     // Mock user data for testing
//     return NextResponse.json({
//         _id: '123',
//         id: '123',
//         name: 'Test Student',
//         email: 'student@test.com',
//         role: 'student',
//         isEmailVerified: true,
//         profileComplete: true
//     });
//     catch (error) {
// //         console.error('Get user error:', error);
// //         return NextResponse.json(
// //             { error: 'Internal server error' },
// //             { status: 500 }
// //         );
// //     }
// // }
//
//         }

// src/app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const hasToken = request.cookies.has('access_token');

    if (!hasToken) {
        // No token = not authenticated
        return NextResponse.json(
            { error: 'Not authenticated' },
            { status: 401 }
        );
    }

    return NextResponse.json({
        _id: '123',
        id: '123',
        name: 'Test Student',
        email: 'student@test.com',
        role: 'student',
        isEmailVerified: true,
        mfaEnabled: false,
        profileComplete: true,
        enrolledCourses: [],
        teachingCourses: []
    });
}