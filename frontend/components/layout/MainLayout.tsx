'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from './Navbar';
import Footer from './footer';

interface MainLayoutProps {
    children: React.ReactNode;
}

// Pages that should NOT show the main layout (they have their own layouts)
const excludedPaths = [
    '/dashboard',
    '/server',
];

export default function MainLayout({ children }: MainLayoutProps) {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Check if current path should be excluded from main layout
    const shouldExclude = excludedPaths.some(path => pathname?.startsWith(path));

    if (shouldExclude) {
        return <>{children}</>;
    }

    // Prevent hydration mismatch by rendering minimal layout until mounted
    if (!mounted) {
        return (
            <div className="min-h-screen flex flex-col">
                <div className="h-16" /> {/* Navbar placeholder */}
                <main className="flex-1 pt-16">
                    {children}
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 pt-16">
                {children}
            </main>
            <Footer />
        </div>
    );
}


