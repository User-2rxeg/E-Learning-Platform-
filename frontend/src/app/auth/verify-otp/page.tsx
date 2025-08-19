// src/app/auth/verify-otp/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

export default function VerifyOTPPage() {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [resendLoading, setResendLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    const email = searchParams?.get('email') || '';
    const mode = searchParams?.get('mode') || 'register'; // 'register' or 'reset'

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            if (mode === 'reset') {
                // Store email and OTP in sessionStorage for the reset password page
                sessionStorage.setItem('resetEmail', email);
                sessionStorage.setItem('resetOtp', otp);
                setSuccess('OTP verified! Redirecting to password reset...');

                setTimeout(() => {
                    router.push('/auth/reset-password');
                }, 1500);
            } else {
                // Regular OTP verification (for registration)
                await axios.post('/api/auth/verify-otp', { email, otp });
                setSuccess('Email verified successfully! Redirecting to login...');

                setTimeout(() => {
                    router.push('/auth/login?verified=true');
                }, 1500);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setResendLoading(true);
        setError('');
        setSuccess('');

        try {
            await axios.post('/api/auth/resend-otp', { email });
            setSuccess('A new OTP has been sent to your email');
            setOtp(''); // Clear current OTP input
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
        } finally {
            setResendLoading(false);
        }
    };

    // If no email in params, redirect to appropriate page
    useEffect(() => {
        if (!email) {
            if (mode === 'reset') {
                router.push('/auth/forgot-password');
            } else {
                router.push('/auth/register');
            }
        }
    }, [email, mode, router]);

    return (
        <div className="max-w-md mx-auto my-12 p-8 bg-primary-light rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-white mb-6 text-center">
                {mode === 'reset' ? 'Verify Code to Reset Password' : 'Verify Your Email'}
            </h1>

            {email && (
                <p className="text-text-secondary mb-6 text-center">
                    {mode === 'reset'
                        ? `Enter the verification code sent to ${email} to reset your password.`
                        : `We've sent a verification code to ${email}. Please enter it below to complete your registration.`
                    }
                </p>
            )}

            {/* Success Message */}
            {success && (
                <div className="bg-green-500 bg-opacity-20 border border-green-500 text-green-400 px-4 py-2 rounded-md mb-6">
                    {success}
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
                    <label htmlFor="otp" className="block text-sm font-medium text-text-secondary mb-1">
                        Verification Code (OTP)
                    </label>
                    <input
                        id="otp"
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} // Only allow 6 digits
                        required
                        maxLength={6}
                        className="w-full p-3 bg-primary border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent placeholder-gray-400 text-center text-lg tracking-widest"
                        placeholder="000000"
                    />
                    <p className="text-xs text-text-secondary mt-1">Enter the 6-digit code sent to your email</p>
                </div>

                <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full py-3 px-4 bg-accent hover:bg-accent-hover text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? 'Verifying...' : 'Verify Code'}
                </button>
            </form>

            <div className="mt-6 space-y-3">
                {/* Resend OTP */}
                <div className="text-center">
                    <button
                        onClick={handleResendOTP}
                        disabled={resendLoading}
                        className="text-accent hover:text-accent-hover text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {resendLoading ? 'Resending...' : "Didn't receive a code? Resend"}
                    </button>
                </div>

                {/* Navigation Links */}
                <div className="text-center text-text-secondary text-sm space-y-1">
                    <p>
                        <Link
                            href={mode === 'reset' ? '/auth/forgot-password' : '/auth/register'}
                            className="text-accent hover:text-accent-hover"
                        >
                            {mode === 'reset' ? 'Use a different email' : 'Change email address'}
                        </Link>
                    </p>
                    <p>
                        <Link href="/auth/login" className="text-accent hover:text-accent-hover">
                            Back to Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}