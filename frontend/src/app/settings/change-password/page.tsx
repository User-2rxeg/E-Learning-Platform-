// src/app/settings/change-password/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { Lock, Eye, EyeOff, AlertCircle, Check } from 'lucide-react';

export default function ChangePasswordPage() {
    const router = useRouter();
    const { user } = useAuth();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        message: '',
        color: ''
    });

    const calculatePasswordStrength = (password: string) => {
        let score = 0;
        const checks = {
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            numbers: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        };
        Object.values(checks).forEach(passed => { if (passed) score++; });

        const levels = [
            { min: 5, message: 'Very Strong', color: '#10b981' },
            { min: 4, message: 'Strong', color: '#22c55e' },
            { min: 3, message: 'Good', color: '#84cc16' },
            { min: 2, message: 'Fair', color: '#eab308' },
            { min: 1, message: 'Weak', color: '#f97316' },
            { min: 0, message: 'Very Weak', color: '#ef4444' }
        ];

        const level = levels.find(l => score >= l.min) || levels[levels.length - 1];

        setPasswordStrength({
            score: (score / 5) * 100,
            message: level.message,
            color: level.color
        });

        return checks;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
            setError('All fields are required');
            return;
        }
        if (passwords.newPassword !== passwords.confirmPassword) {
            setError('New passwords do not match');
            return;
        }
        if (passwords.newPassword.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }
        if (passwords.currentPassword === passwords.newPassword) {
            setError('New password must be different from current password');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/user/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: passwords.currentPassword,
                    newPassword: passwords.newPassword
                }),
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Password changed successfully!');
                setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });

                setTimeout(() => {
                    router.push('/settings');
                }, 1500);
            } else {
                setError(data.error || 'Failed to change password');
            }
        } catch {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const strengthColorClass =
        passwordStrength.score >= 80 ? 'bg-emerald-500' :
            passwordStrength.score >= 60 ? 'bg-green-500' :
                passwordStrength.score >= 40 ? 'bg-lime-500' :
                    passwordStrength.score >= 20 ? 'bg-amber-500' :
                        passwordStrength.score > 0    ? 'bg-orange-500' :
                            'bg-rose-500';

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900 py-12">
            <div className="max-w-md mx-auto px-4">
                <div className="bg-white dark:bg-gray-900/60 rounded-2xl shadow-sm border border-gray-200/70 dark:border-gray-700/60 p-8 backdrop-blur">
                    <div className="flex items-center mb-6">
                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600/10 text-blue-700 dark:text-blue-300 ring-1 ring-blue-200/50 dark:ring-blue-900/40 mr-3">
                            <Lock className="w-5 h-5" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Change Password</h1>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 rounded-lg border border-rose-300/60 bg-rose-50 text-rose-800 dark:border-rose-700/60 dark:bg-rose-900/30 dark:text-rose-200 flex items-center">
                            <AlertCircle className="w-5 h-5 mr-2 text-rose-600 dark:text-rose-400" />
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-4 rounded-lg border border-emerald-300/60 bg-emerald-50 text-emerald-800 dark:border-emerald-700/60 dark:bg-emerald-900/30 dark:text-emerald-200 flex items-center">
                            <Check className="w-5 h-5 mr-2 text-emerald-600 dark:text-emerald-400" />
                            <span>{success}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Current Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
                            <div className="relative">
                                <input
                                    type={showPasswords.current ? 'text' : 'password'}
                                    value={passwords.currentPassword}
                                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                    className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800/60 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                            <div className="relative">
                                <input
                                    type={showPasswords.new ? 'text' : 'password'}
                                    value={passwords.newPassword}
                                    onChange={(e) => {
                                        setPasswords({ ...passwords, newPassword: e.target.value });
                                        if (e.target.value) calculatePasswordStrength(e.target.value);
                                        else setPasswordStrength({ score: 0, message: '', color: '' });
                                    }}
                                    className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800/60 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>

                            {passwords.newPassword && (
                                <div className="mt-2">
                                    <div className="flex items-center justify-between text-sm mb-1">
                                        <span className="text-gray-600 dark:text-gray-400">Password strength</span>
                                        <span className="text-gray-700 dark:text-gray-300" style={{ color: passwordStrength.color }}>{passwordStrength.message}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div
                                            className={['h-2 rounded-full transition-all', strengthColorClass].join(' ')}
                                            style={{ width: `${passwordStrength.score}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
                            <div className="relative">
                                <input
                                    type={showPasswords.confirm ? 'text' : 'password'}
                                    value={passwords.confirmPassword}
                                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                    className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800/60 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword && (
                                <p className="text-sm text-rose-600 dark:text-rose-400 mt-1">Passwords do not match</p>
                            )}
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => router.push('/settings')}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/70 text-gray-800 dark:text-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400 dark:focus-visible:ring-offset-gray-900"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 dark:focus-visible:ring-offset-gray-900"
                                disabled={loading}
                            >
                                {loading ? 'Changing...' : 'Change Password'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}