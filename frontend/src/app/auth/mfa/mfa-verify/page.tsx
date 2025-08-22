// src/app/auth/mfa-verify/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {useAuth} from "../../../../contexts/AuthContext";
import axios from 'axios';
import { Shield, Smartphone, Key, AlertCircle, ArrowLeft } from 'lucide-react';

export default function MFAVerifyPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setToken, setUser } = useAuth();
    const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
    const [useBackupCode, setUseBackupCode] = useState(false);
    const [backupCode, setBackupCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Get the temp token from query params or session storage
    const tempToken = searchParams.get('token') || sessionStorage.getItem('mfaTempToken');

    useEffect(() => {
        if (!tempToken) {
            router.push('/auth/login');
        }
    }, [tempToken, router]);

    const handleCodeChange = (index: number, value: string) => {
        // Only allow digits
        const digit = value.replace(/\D/g, '').slice(0, 1);

        const newCode = [...verificationCode];
        newCode[index] = digit;
        setVerificationCode(newCode);

        // Auto-focus next input
        if (digit && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all digits are entered
        if (index === 5 && digit) {
            const fullCode = newCode.join('');
            if (fullCode.length === 6) {
                handleVerification(fullCode);
            }
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const digits = pastedData.split('');

        const newCode = [...verificationCode];
        digits.forEach((digit, i) => {
            if (i < 6) newCode[i] = digit;
        });
        setVerificationCode(newCode);

        // Focus last filled input or last input
        const lastIndex = Math.min(digits.length - 1, 5);
        inputRefs.current[lastIndex]?.focus();

        // Auto-submit if complete
        if (digits.length === 6) {
            handleVerification(pastedData);
        }
    };

    const handleVerification = async (code?: string) => {
        const verifyCode = code || (useBackupCode ? backupCode : verificationCode.join(''));

        if (!useBackupCode && verifyCode.length !== 6) {
            setError('Please enter a 6-digit code');
            return;
        }

        if (useBackupCode && !backupCode) {
            setError('Please enter a backup code');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const payload = useBackupCode
                ? { backup: backupCode }
                : { token: verifyCode };

            const response = await axios.post(
                '/api/auth/mfa/verify-login',
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${tempToken}`
                    }
                }
            );

            const { access_token, refresh_token, user } = response.data;

            // Store tokens and user data
            localStorage.setItem('token', access_token);
            localStorage.setItem('refreshToken', refresh_token);
            localStorage.setItem('user', JSON.stringify(user));

            // Clear temp token
            sessionStorage.removeItem('mfaTempToken');

            // Update auth context
            setToken(access_token);
            setUser(user);

            // Redirect to dashboard
            router.push(`/dashboard/${user.role}`);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid verification code. Please try again.');
            // Clear the code inputs on error
            if (!useBackupCode) {
                setVerificationCode(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            }
        } finally {
            setLoading(false);
        }
    };

    const handleBackToLogin = () => {
        sessionStorage.removeItem('mfaTempToken');
        router.push('/auth/login');
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6">
            <div className="max-w-md w-full">
                <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-[#3E64FF]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Shield className="w-8 h-8 text-[#3E64FF]" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">
                            Two-Factor Authentication
                        </h1>
                        <p className="text-gray-400">
                            {useBackupCode
                                ? 'Enter one of your backup codes'
                                : 'Enter the 6-digit code from your authenticator app'}
                        </p>
                    </div>

                    {!useBackupCode ? (
                        // TOTP Code Input
                        <div className="space-y-6">
                            <div className="flex justify-center gap-2">
                                {verificationCode.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => (inputRefs.current[index] = el)}
                                        type="text"
                                        value={digit}
                                        onChange={(e) => handleCodeChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        onPaste={index === 0 ? handlePaste : undefined}
                                        className="w-12 h-14 text-center text-2xl font-bold bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#3E64FF] focus:border-transparent transition-all"
                                        maxLength={1}
                                        autoFocus={index === 0}
                                        disabled={loading}
                                    />
                                ))}
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-red-400 text-sm justify-center">
                                    <AlertCircle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}

                            <button
                                onClick={() => handleVerification()}
                                disabled={loading || verificationCode.join('').length !== 6}
                                className="w-full px-6 py-3 bg-[#3E64FF] text-white rounded-lg hover:bg-[#5576ff] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                                {loading ? 'Verifying...' : 'Verify'}
                            </button>

                            <div className="text-center space-y-3">
                                <button
                                    onClick={() => setUseBackupCode(true)}
                                    className="text-gray-400 hover:text-white text-sm transition-colors"
                                >
                                    Use a backup code instead
                                </button>
                            </div>
                        </div>
                    ) : (
                        // Backup Code Input
                        <div className="space-y-6">
                            <div>
                                <input
                                    type="text"
                                    value={backupCode}
                                    onChange={(e) => setBackupCode(e.target.value)}
                                    placeholder="Enter backup code"
                                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#3E64FF] focus:border-transparent"
                                    autoFocus
                                    disabled={loading}
                                />
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-red-400 text-sm">
                                    <AlertCircle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}

                            <button
                                onClick={() => handleVerification()}
                                disabled={loading || !backupCode}
                                className="w-full px-6 py-3 bg-[#3E64FF] text-white rounded-lg hover:bg-[#5576ff] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                                {loading ? 'Verifying...' : 'Verify Backup Code'}
                            </button>

                            <div className="text-center space-y-3">
                                <button
                                    onClick={() => {
                                        setUseBackupCode(false);
                                        setBackupCode('');
                                        setError('');
                                    }}
                                    className="text-gray-400 hover:text-white text-sm transition-colors"
                                >
                                    Use authenticator app instead
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Back to Login */}
                    <div className="mt-6 pt-6 border-t border-[#2A2A2A]">
                        <button
                            onClick={handleBackToLogin}
                            className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors mx-auto"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to login
                        </button>
                    </div>

                    {/* Help Text */}
                    <div className="mt-6 p-4 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg">
                        <div className="flex items-start gap-2">
                            <Smartphone className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-gray-400 text-sm">
                                    Open your authenticator app to view your verification code. The code refreshes every 30 seconds.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}