'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await login(email, password);
            // Redirect is handled in the AuthContext
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto my-12 p-8 bg-primary-light rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-white mb-6 text-center">Sign In</h1>

            {error && (
                <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-500 px-4 py-2 rounded-md mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full p-3 bg-primary border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="Enter your email"
                    />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label htmlFor="password" className="block text-sm font-medium text-text-secondary">
                            Password
                        </label>
                        <Link href="/auth/forgot-password" className="text-xs text-accent hover:text-accent-hover">
                            Forgot password?
                        </Link>
                    </div>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full p-3 bg-primary border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="Enter your password"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-accent hover:bg-accent-hover text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50"
                >
                    {loading ? 'Signing In...' : 'Sign In'}
                </button>
            </form>

            <p className="mt-6 text-center text-text-secondary">
                Don't have an account?{' '}
                <Link href="/auth/register" className="text-accent hover:text-accent-hover">
                    Sign Up
                </Link>
            </p>
        </div>
    );
}