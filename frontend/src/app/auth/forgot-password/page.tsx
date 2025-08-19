// src/app/auth/forgot-password/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            await axios.post('/api/auth/forgot-password', { email });
            setMessage('OTP sent to your email. Please check your inbox.');

            // Redirect to verify OTP page with email and reset mode
            setTimeout(() => {
                router.push(`/auth/verify-otp?email=${encodeURIComponent(email)}&mode=reset`);
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to process request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto my-12 p-8 bg-primary-light rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-white mb-6 text-center">Forgot Password</h1>

            <p className="text-text-secondary mb-6 text-center">
                Enter your email address and we'll send you a verification code to reset your password.
            </p>

            {/* Success Message */}
            {message && (
                <div className="bg-green-500 bg-opacity-20 border border-green-500 text-green-400 px-4 py-2 rounded-md mb-6">
                    {message}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-500 px-4 py-2 rounded-md mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">
                        Email Address
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full p-3 bg-primary border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent placeholder-gray-400"
                        placeholder="Enter your email address"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading || !email.trim()}
                    className="w-full py-3 px-4 bg-accent hover:bg-accent-hover text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? 'Sending Reset Code...' : 'Send Reset Code'}
                </button>
            </form>

            <div className="mt-6 text-center space-y-2">
                <p className="text-text-secondary text-sm">
                    Remember your password?{' '}
                    <Link href="/auth/login" className="text-accent hover:text-accent-hover">
                        Sign In
                    </Link>
                </p>
                <p className="text-text-secondary text-sm">
                    Don't have an account?{' '}
                    <Link href="/auth/register" className="text-accent hover:text-accent-hover">
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
}