
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

export default function DashboardPage() {
    const router = useRouter();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (loading) return;
        if (!user) return; // layout handles redirect to /server/login

        switch (user.role) {
            case 'student':
                router.replace('/dashboard/student'); break;
            case 'instructor':
                router.replace('/dashboard/instructor'); break;
            case 'admin':
                router.replace('/dashboard/admin'); break;
            default:
                router.replace('/courses');
        }
    }, [loading, user, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
                <p className="mt-4 text-gray-600">Redirecting to your dashboard...</p>
            </div>
        </div>
    );
}

