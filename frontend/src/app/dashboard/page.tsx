// src/app/dashboard/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

export default function DashboardRedirector() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && user) {
            // Redirect based on user role
            switch (user.role) {
                case 'student':
                    router.replace('/dashboard/student');
                    break;
                case 'instructor':
                    router.replace('/dashboard/instructor');
                    break;
                case 'admin':
                    router.replace('/dashboard/admin');
                    break;
                default:
                    router.replace('/');
            }
        }
    }, [user, isLoading, router]);

    return (
        <div className="min-h-screen bg-primary-dark flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
                <p className="text-text-secondary mt-4">Loading dashboard...</p>
            </div>
        </div>
    );
}