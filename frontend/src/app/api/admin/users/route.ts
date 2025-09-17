// src/app/api/admin/users/route.ts
import {NextRequest, NextResponse} from "next/server";

export async function GET(request: NextRequest) {
    return NextResponse.json([
        {
            _id: '1',
            name: 'Alice Johnson',
            email: 'alice@example.com',
            role: 'student',
            status: 'active',
            joinedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
            _id: '2',
            name: 'Bob Smith',
            email: 'bob@example.com',
            role: 'instructor',
            status: 'active',
            joinedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000)
        },
        {
            _id: '3',
            name: 'Carol White',
            email: 'carol@example.com',
            role: 'student',
            status: 'suspended',
            joinedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            lastLogin: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        }
    ]);
}
