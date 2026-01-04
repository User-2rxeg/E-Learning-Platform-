import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '../contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import MainLayout from '../components/layout/MainLayout';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#3b82f6',
};

export const metadata: Metadata = {
    title: 'E-Learning Platform',
    description: 'A comprehensive e-learning platform for students, instructors, and administrators',
    keywords: ['e-learning', 'education', 'courses', 'online learning'],
    authors: [{ name: 'E-Learning Team' }],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.className} antialiased`}>
                <AuthProvider>
                    <MainLayout>
                        {children}
                    </MainLayout>
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: '#363636',
                                color: '#fff',
                            },
                            success: {
                                style: {
                                    background: '#10b981',
                                },
                            },
                            error: {
                                style: {
                                    background: '#ef4444',
                                },
                            },
                        }}
                    />
                </AuthProvider>
            </body>
        </html>
    );
}


