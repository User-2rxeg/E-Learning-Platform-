import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

async function proxyRequest(request: NextRequest, path: string) {
    const url = `${BACKEND_URL}/api/auth/${path}`;

    const headers = new Headers();
    headers.set('Content-Type', 'application/json');

    // Forward authorization header if present
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
        headers.set('Authorization', authHeader);
    }

    // Forward cookies
    const cookies = request.headers.get('cookie');
    if (cookies) {
        headers.set('Cookie', cookies);
    }

    try {
        const body = request.method !== 'GET' && request.method !== 'HEAD'
            ? await request.text()
            : undefined;

        const response = await fetch(url, {
            method: request.method,
            headers,
            body,
            credentials: 'include',
        });

        const data = await response.json().catch(() => ({}));

        const nextResponse = NextResponse.json(data, { status: response.status });

        // Forward set-cookie headers from backend
        const setCookie = response.headers.get('set-cookie');
        if (setCookie) {
            nextResponse.headers.set('Set-Cookie', setCookie);
        }

        return nextResponse;
    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json(
            { error: 'Service unavailable' },
            { status: 503 }
        );
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: { path: string[] } }
) {
    const path = params.path.join('/');
    return proxyRequest(request, path);
}

export async function POST(
    request: NextRequest,
    { params }: { params: { path: string[] } }
) {
    const path = params.path.join('/');
    return proxyRequest(request, path);
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: { path: string[] } }
) {
    const path = params.path.join('/');
    return proxyRequest(request, path);
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { path: string[] } }
) {
    const path = params.path.join('/');
    return proxyRequest(request, path);
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { path: string[] } }
) {
    const path = params.path.join('/');
    return proxyRequest(request, path);
}

