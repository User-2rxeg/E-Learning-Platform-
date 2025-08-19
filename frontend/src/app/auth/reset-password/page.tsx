// src/app/auth/reset-password/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

export default function ResetPasswordPage() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    // Retrieve email and OTP from session storage
    useEffect(() => {
        const storedEmail = sessionStorage.getItem('resetEmail');
        const storedOtp = sessionStorage.getItem('resetOtp');

        if (!storedEmail || !storedOtp) {
            router.push('/auth/forgot-password');
            return;
        }

        setEmail(storedEmail);
        setOtp(storedOtp);
    }, [router]);

    const validatePassword = (password: string) => {
        const minLength = password.length >= 8;
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);

        return {
            minLength,
            hasUpper,
            hasLower,
            hasNumber,
            isValid: minLength && hasUpper && hasLower && hasNumber
        };
    };

    const passwordValidation = validatePassword(newPassword);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate passwords match
        if (newPassword !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        // Validate password strength
        if (!passwordValidation.isValid) {
            setError("Password doesn't meet security requirements");
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await axios.post('/api/auth/reset-password', {
                email,
                otp,
                password: newPassword
            });

            setSuccess("Password reset successful! Redirecting to login...");

            // Clear session storage
            sessionStorage.removeItem('resetEmail');
            sessionStorage.removeItem('resetOtp');

            // Redirect after showing success message
            setTimeout(() => {
                router.push('/auth/login?reset=success');
            }, 2000);

        } catch (error: any) {
            if (error.response?.status === 401) {
                setError("The verification code is invalid or has expired. Please request a new code.");
            } else {
                setError(error.response?.data?.message || "Failed to reset password. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto my-12 p-8 bg-primary-light rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-white mb-6 text-center">Reset Your Password</h1>

            {email && (
                <p className="text-text-secondary mb-6 text-center">
                    Setting new password for <span className="text-white">{email}</span>
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
                {/* New Password */}
                <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-text-secondary mb-1">
                        New Password
                    </label>
                    <div className="relative">
                        <input
                            id="newPassword"
                            type={showPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={8}
                            className="w-full p-3 bg-primary border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent placeholder-gray-400 pr-12"
                            placeholder="Enter new password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-white"
                        >
                            {showPassword ? '👁️' : '👁️‍🗨️'}
                        </button>
                    </div>

                    {/* Password Requirements */}
                    {newPassword && (
                        <div className="mt-2 space-y-1">
                            <p className="text-xs text-text-secondary">Password Requirements:</p>
                            <div className="grid grid-cols-2 gap-1 text-xs">
                                <span className={passwordValidation.minLength ? 'text-green-400' : 'text-red-400'}>
                                    ✓ 8+ characters
                                </span>
                                <span className={passwordValidation.hasUpper ? 'text-green-400' : 'text-red-400'}>
                                    ✓ Uppercase letter
                                </span>
                                <span className={passwordValidation.hasLower ? 'text-green-400' : 'text-red-400'}>
                                    ✓ Lowercase letter
                                </span>
                                <span className={passwordValidation.hasNumber ? 'text-green-400' : 'text-red-400'}>
                                    ✓ Number
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Confirm Password */}
                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-secondary mb-1">
                        Confirm New Password
                    </label>
                    <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full p-3 bg-primary border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent placeholder-gray-400"
                        placeholder="Confirm new password"
                    />
                    {confirmPassword && newPassword !== confirmPassword && (
                        <p className="text-red-400 text-xs mt-1">Passwords don't match</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading || !passwordValidation.isValid || newPassword !== confirmPassword || !email || !otp}
                    className="w-full py-3 px-4 bg-accent hover:bg-accent-hover text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? 'Resetting Password...' : 'Reset Password'}
                </button>
            </form>

            <div className="mt-6 text-center space-y-2">
                <p className="text-text-secondary text-sm">
                    <Link href="/auth/forgot-password" className="text-accent hover:text-accent-hover">
                        Use a different email
                    </Link>
                </p>
                <p className="text-text-secondary text-sm">
                    Remember your password?{' '}
                    <Link href="/auth/login" className="text-accent hover:text-accent-hover">
                        Back to Login
                    </Link>
                </p>
            </div>
        </div>
    );
}