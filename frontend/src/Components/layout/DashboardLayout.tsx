// components/layout/DashboardLayout.tsx
import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

import { redirect } from 'next/navigation';
import {useAuth} from "../../contexts/authContext";

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) return <div>Loading...</div>;
    if (!isAuthenticated) redirect('/auth/login');

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="content-area">
                <Header />
                <main>{children}</main>
            </div>
        </div>
    );
}