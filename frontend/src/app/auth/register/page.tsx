'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from "../../../contexts/AuthContext";
import axios from "axios";

export default function Register() {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student' // Default role
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [registered, setRegistered] = useState(false);
    const [verificationEmail, setVerificationEmail] = useState('');
    const [otp, setOtp] = useState('');

    const { register, verifyOtp, resendOtp,setToken, setUser } = useAuth();
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const result = await register({
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                role: formData.role // Include role in registration
            });

            setVerificationEmail(formData.email);
            setRegistered(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await verifyOtp(verificationEmail, otp);

            // Store authentication data
            if (result.token) {
                localStorage.setItem('token', result.token);
                localStorage.setItem('user', JSON.stringify(result.user));

                // Set auth state
                setToken(result.token);
                setUser(result.user);

                // Set authorization header
                axios.defaults.headers.common['Authorization'] = `Bearer ${result.token}`;
            }

            router.push('/auth/me'); // Use the route that exists in your app
        } catch (err: any) {
            setError(err.response?.data?.message || 'OTP verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        try {
            await resendOtp(verificationEmail);
            setError('');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to resend OTP');
        }
    };

    if (registered) {
        return (
            <div className="max-w-md mx-auto my-12 p-8 bg-primary-light rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold text-white mb-6 text-center">Verify Your Email</h1>

                {error && (
                    <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-500 px-4 py-2 rounded-md mb-6">
                        {error}
                    </div>
                )}

                <p className="text-text-secondary mb-4">
                    We've sent a verification code to <span className="text-white">{verificationEmail}</span>.
                    Please enter it below to complete your registration.
                </p>

                <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div>
                        <label htmlFor="otp" className="block text-sm font-medium text-text-secondary mb-1">
                            Verification Code (OTP)
                        </label>
                        <input
                            id="otp"
                            name="otp"
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                            className="w-full p-3 bg-primary border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent"
                            placeholder="Enter 6-digit code"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-accent hover:bg-accent-hover text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50"
                    >
                        {loading ? 'Verifying...' : 'Verify Email'}
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <button
                        onClick={handleResendOtp}
                        className="text-accent hover:text-accent-hover text-sm"
                    >
                        Didn't receive a code? Resend
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto my-12 p-8 bg-primary-light rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-white mb-6 text-center">Create Account</h1>

            {error && (
                <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-500 px-4 py-2 rounded-md mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-text-secondary mb-1">
                        Full Name
                    </label>
                    <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        className="w-full p-3 bg-primary border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="Enter your full name"
                    />
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">
                        Email
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full p-3 bg-primary border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="Enter your email"
                    />
                </div>

                <div>
                    <label htmlFor="role" className="block text-sm font-medium text-text-secondary mb-1">
                        I am a
                    </label>
                    <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full p-3 bg-primary border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                        <option value="student">Student</option>
                        <option value="instructor">Instructor</option>
                        <option value="admin">Administrator</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1">
                        Password
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="w-full p-3 bg-primary border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="Create a password"
                    />
                </div>

                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-secondary mb-1">
                        Confirm Password
                    </label>
                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className="w-full p-3 bg-primary border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="Confirm your password"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-accent hover:bg-accent-hover text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50"
                >
                    {loading ? 'Creating Account...' : 'Sign Up'}
                </button>
            </form>

            <p className="mt-6 text-center text-text-secondary">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-accent hover:text-accent-hover">
                    Sign In
                </Link>
            </p>
        </div>
    );
}