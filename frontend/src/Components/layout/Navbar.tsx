'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
//import NotificationSystem from '../NotificationSystem';
import {
    Menu,
    X,
    BookOpen,
    User,
    LogOut,
    Settings,
    ChevronDown,
    Home,
    MessageSquare,
    Award,
    LayoutDashboard
} from 'lucide-react';
export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    const handleLogout = () => {
        logout();
        router.push('/');
    };
    const navigation = [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Courses', href: '/courses', icon: BookOpen },
        { name: 'Messages', href: '/messages', icon: MessageSquare, requireAuth: true },
        { name: 'Dashboard', href: `/dashboard/${user?.role || ''}`, icon: LayoutDashboard, requireAuth: true },
    ];
    const userNavigation = [
        { name: 'Profile', href: '/profile', icon: User },
        { name: 'Settings', href: '/settings', icon: Settings },
        { name: 'Certificates', href: '/certificates', icon: Award },
    ];
    return (
        <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'bg-white shadow-lg' : 'bg-white/95 backdrop-blur-md'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                EduLearn
                            </span>
                        </Link>
                    </div>
                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navigation
                            .filter(item => !item.requireAuth || user)
                            .map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center space-x-1 px-3 py-2 text-sm font-medium transition-colors ${
                                        pathname === item.href
                                            ? 'text-blue-600'
                                            : 'text-gray-700 hover:text-blue-600'
                                    }`}
                                >
                                    <item.icon className="w-4 h-4" />
                                    <span>{item.name}</span>
                                </Link>
                            ))}
                    </div>

                    {/* Right side */}
                    <div className="flex items-center space-x-4">
                        {user ? (
                            <>
                                {/* Notifications */}
                                {/* <NotificationSystem /> */}

                                {/* User Menu */}
                                <div className="relative">
                                    <button
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                                            {user.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${
                                            userMenuOpen ? 'rotate-180' : ''
                                        }`} />
                                    </button>

                                    {userMenuOpen && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-30"
                                                onClick={() => setUserMenuOpen(false)}
                                            />
                                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-40">
                                                <div className="p-3 border-b border-gray-100">
                                                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                                    <p className="text-xs text-gray-500">{user.email}</p>
                                                    <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full capitalize">
                                                        {user.role}
                                                    </span>
                                                </div>

                                                <div className="py-1">
                                                    {userNavigation.map((item) => (
                                                        <Link
                                                            key={item.name}
                                                            href={item.href}
                                                            onClick={() => setUserMenuOpen(false)}
                                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                        >
                                                            <item.icon className="w-4 h-4 mr-3 text-gray-400" />
                                                            {item.name}
                                                        </Link>
                                                    ))}
                                                </div>

                                                <div className="border-t border-gray-100">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                                    >
                                                        <LogOut className="w-4 h-4 mr-3" />
                                                        Sign out
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link
                                    href="/auth/login"
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                                >
                                    Sign in
                                </Link>
                                <Link
                                    href="/auth/register"
                                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                        >
                            {mobileMenuOpen ? (
                                <X className="w-6 h-6 text-gray-600" />
                            ) : (
                                <Menu className="w-6 h-6 text-gray-600" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-200">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {navigation
                            .filter(item => !item.requireAuth || user)
                            .map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-base font-medium ${
                                        pathname === item.href
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span>{item.name}</span>
                                </Link>
                            ))}
                        {user && (
                            <div className="border-t border-gray-200 pt-2 mt-2">
                                {userNavigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center space-x-2 px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span>{item.name}</span>
                                    </Link>
                                ))}
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-2 w-full px-3 py-2 rounded-lg text-base font-medium text-red-600 hover:bg-red-50"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span>Sign out</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}