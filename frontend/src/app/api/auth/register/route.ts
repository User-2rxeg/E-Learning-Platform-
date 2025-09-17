// // src/app/api/auth/register/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { APP_CONFIG } from '../../../../config/app.config';
//
// export async function POST(request: NextRequest) {
//     try {
//         const body = await request.json();
//
//         // FIX: Backend expects /auth/register, not /api/auth/register
//         const backendResponse = await fetch(`${APP_CONFIG.API.BASE_URL}/auth/register`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(body),
//         });
//
//         const data = await backendResponse.json();
//
//         if (!backendResponse.ok) {
//             return NextResponse.json(
//                 { error: data.message || 'Registration failed' },
//                 { status: backendResponse.status }
//             );
//         }
//
//         return NextResponse.json(data);
//     } catch (error) {
//         console.error('Registration error:', error);
//         return NextResponse.json(
//             { error: 'Internal server error' },
//             { status: 500 }
//         );
//     }
// }


import {NextRequest, NextResponse} from "next/server";
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3654';
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const backendResponse = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const data = await backendResponse.json();

        if (!backendResponse.ok) {
            return NextResponse.json(
                { error: data.message || 'Registration failed' },
                { status: backendResponse.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}