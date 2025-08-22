// In frontend/src/Components/layout/Navbar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="bg-primary-dark py-4 px-6 shadow-md">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                {/* Logo */}
                <Link href="/" className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-white">E-Learning Platform</span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex space-x-6">
                    <Link href="/courses" className="text-text-secondary hover:text-white transition-colors">
                        Courses
                    </Link>
                    <Link href="/dashboard" className="text-text-secondary hover:text-white transition-colors">
                        Dashboard
                    </Link>
                    <Link href="/auth/login" className="btn-primary">
                        Sign In
                    </Link>
                </div>

                {/* Mobile menu button */}
                <button
                    className="md:hidden text-white"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                </button>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <div className="md:hidden mt-4 px-4 py-2 space-y-3">
                    <Link href="/courses" className="block text-text-secondary hover:text-white transition-colors">
                        Courses
                    </Link>
                    <Link href="/dashboard" className="block text-text-secondary hover:text-white transition-colors">
                        Dashboard
                    </Link>
                    <Link href="/auth/login" className="btn-primary block text-center mt-4">
                        Sign In
                    </Link>
                </div>
            )}
        </nav>
    );
}