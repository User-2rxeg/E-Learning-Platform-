// src/app/auth/mfa-setup/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import axios from 'axios';
import {
    Shield, Smartphone, Key, Copy, Check,
    AlertCircle, ChevronRight, Lock, Download
} from 'lucide-react';
import {useAuth} from "../../../../contexts/AuthContext";

interface MFASetupData {
    otpauthUrl?: string;
    base32: string;
    backupCodes: string[];
}

export default function MFASetupPage() {
    const router = useRouter();
    const { user, token } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [setupData, setSetupData] = useState<MFASetupData | null>(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [copiedSecret, setCopiedSecret] = useState(false);
    const [copiedCodes, setCopiedCodes] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState('');

    useEffect(() => {
        if (!user || !token) {
            router.push('/auth/login');
        }
    }, [user, token, router]);

    const initiateMFASetup = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await axios.post(
                '/api/auth/mfa/setup',
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setSetupData(response.data);

            // Generate QR code from otpauth URL
            if (response.data.otpauthUrl) {
                // Using QR Server API for QR code generation
                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(response.data.otpauthUrl)}`;
                setQrCodeUrl(qrUrl);
            }

            setStep(2);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to initiate MFA setup');
        } finally {
            setLoading(false);
        }
    };

    const verifyAndActivateMFA = async () => {
        if (verificationCode.length !== 6) {
            setError('Please enter a 6-digit code');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await axios.post(
                '/api/auth/mfa/activate',
                { token: verificationCode },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setStep(3);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid verification code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string, type: 'secret' | 'codes') => {
        navigator.clipboard.writeText(text);
        if (type === 'secret') {
            setCopiedSecret(true);
            setTimeout(() => setCopiedSecret(false), 2000);
        } else {
            setCopiedCodes(true);
            setTimeout(() => setCopiedCodes(false), 2000);
        }
    };

    const downloadBackupCodes = () => {
        if (!setupData?.backupCodes) return;

        const content = `Two-Factor Authentication Backup Codes
Generated: ${new Date().toLocaleString()}
Account: ${user?.email}

Keep these codes in a safe place. Each code can only be used once.

${setupData.backupCodes.map((code, i) => `${i + 1}. ${code}`).join('\n')}

⚠️ Warning: Store these codes securely. Anyone with access to these codes can access your account.`;

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mfa-backup-codes.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const completeMFASetup = () => {
        router.push(`/dashboard/${user?.role}`);
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-6">
            <div className="max-w-2xl w-full">
                {/* Progress Steps */}
                <div className="flex items-center justify-center mb-8">
                    <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            step >= 1 ? 'bg-[#3E64FF] text-white' : 'bg-[#1A1A1A] text-gray-500'
                        }`}>
                            1
                        </div>
                        <div className={`w-20 h-1 ${step >= 2 ? 'bg-[#3E64FF]' : 'bg-[#1A1A1A]'}`} />
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            step >= 2 ? 'bg-[#3E64FF] text-white' : 'bg-[#1A1A1A] text-gray-500'
                        }`}>
                            2
                        </div>
                        <div className={`w-20 h-1 ${step >= 3 ? 'bg-[#3E64FF]' : 'bg-[#1A1A1A]'}`} />
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            step >= 3 ? 'bg-[#3E64FF] text-white' : 'bg-[#1A1A1A] text-gray-500'
                        }`}>
                            3
                        </div>
                    </div>
                </div>

                <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-8">
                    {/* Step 1: Introduction */}
                    {step === 1 && (
                        <div className="text-center">
                            <div className="w-20 h-20 bg-[#3E64FF]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Shield className="w-10 h-10 text-[#3E64FF]" />
                            </div>

                            <h1 className="text-3xl font-bold text-white mb-4">
                                Secure Your Account with 2FA
                            </h1>

                            <p className="text-gray-400 mb-8 max-w-md mx-auto">
                                Two-factor authentication adds an extra layer of security to your account by requiring a verification code in addition to your password.
                            </p>

                            <div className="space-y-4 text-left max-w-md mx-auto mb-8">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-[#10B981]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                                        <Check className="w-4 h-4 text-[#10B981]" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-medium">Enhanced Security</h3>
                                        <p className="text-gray-400 text-sm">Protect your account from unauthorized access</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-[#10B981]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                                        <Check className="w-4 h-4 text-[#10B981]" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-medium">Easy Setup</h3>
                                        <p className="text-gray-400 text-sm">Configure in minutes with any authenticator app</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-[#10B981]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                                        <Check className="w-4 h-4 text-[#10B981]" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-medium">Backup Codes</h3>
                                        <p className="text-gray-400 text-sm">Emergency access codes if you lose your device</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={initiateMFASetup}
                                disabled={loading}
                                className="px-8 py-3 bg-[#3E64FF] text-white rounded-lg hover:bg-[#5576ff] transition-all flex items-center gap-2 mx-auto"
                            >
                                {loading ? 'Setting up...' : 'Get Started'}
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Step 2: QR Code & Verification */}
                    {step === 2 && setupData && (
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-6 text-center">
                                Set Up Your Authenticator App
                            </h2>

                            <div className="grid md:grid-cols-2 gap-8">
                                {/* QR Code Side */}
                                <div>
                                    <p className="text-gray-400 mb-4">
                                        1. Install an authenticator app like Google Authenticator or Authy
                                    </p>
                                    <p className="text-gray-400 mb-4">
                                        2. Scan this QR code with your authenticator app:
                                    </p>

                                    <div className="bg-white p-4 rounded-lg inline-block">
                                        {qrCodeUrl ? (
                                            <img src={qrCodeUrl} alt="MFA QR Code" className="w-48 h-48" />
                                        ) : (
                                            <div className="w-48 h-48 bg-gray-200 flex items-center justify-center">
                                                <Smartphone className="w-12 h-12 text-gray-400" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4">
                                        <p className="text-gray-400 text-sm mb-2">Can't scan? Enter this code manually:</p>
                                        <div className="flex items-center gap-2">
                                            <code className="bg-[#0A0A0A] px-3 py-2 rounded text-xs text-white break-all">
                                                {setupData.base32}
                                            </code>
                                            <button
                                                onClick={() => copyToClipboard(setupData.base32, 'secret')}
                                                className="p-2 bg-[#2A2A2A] rounded hover:bg-[#3A3A3A] transition-colors"
                                            >
                                                {copiedSecret ? (
                                                    <Check className="w-4 h-4 text-[#10B981]" />
                                                ) : (
                                                    <Copy className="w-4 h-4 text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Verification Side */}
                                <div>
                                    <p className="text-gray-400 mb-4">
                                        3. Enter the 6-digit code from your authenticator app:
                                    </p>

                                    <div className="space-y-4">
                                        <input
                                            type="text"
                                            value={verificationCode}
                                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            placeholder="000000"
                                            className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-[#3E64FF] focus:border-transparent"
                                            maxLength={6}
                                        />

                                        {error && (
                                            <div className="flex items-center gap-2 text-red-400 text-sm">
                                                <AlertCircle className="w-4 h-4" />
                                                {error}
                                            </div>
                                        )}

                                        <button
                                            onClick={verifyAndActivateMFA}
                                            disabled={loading || verificationCode.length !== 6}
                                            className="w-full px-6 py-3 bg-[#3E64FF] text-white rounded-lg hover:bg-[#5576ff] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? 'Verifying...' : 'Verify & Activate'}
                                        </button>
                                    </div>

                                    <div className="mt-6 p-4 bg-[#F59E0B]/10 border border-[#F59E0B]/20 rounded-lg">
                                        <div className="flex items-start gap-2">
                                            <AlertCircle className="w-5 h-5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-[#F59E0B] font-medium text-sm">Important</p>
                                                <p className="text-gray-400 text-sm mt-1">
                                                    Keep your authenticator app installed. You'll need it every time you log in.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Backup Codes */}
                    {step === 3 && setupData && (
                        <div className="text-center">
                            <div className="w-20 h-20 bg-[#10B981]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Check className="w-10 h-10 text-[#10B981]" />
                            </div>

                            <h2 className="text-3xl font-bold text-white mb-4">
                                2FA Successfully Activated!
                            </h2>

                            <p className="text-gray-400 mb-8">
                                Your account is now protected with two-factor authentication. Save these backup codes in a secure location.
                            </p>

                            <div className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg p-6 mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <Key className="w-5 h-5" />
                                        Backup Codes
                                    </h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => copyToClipboard(setupData.backupCodes.join('\n'), 'codes')}
                                            className="p-2 bg-[#2A2A2A] rounded hover:bg-[#3A3A3A] transition-colors"
                                        >
                                            {copiedCodes ? (
                                                <Check className="w-4 h-4 text-[#10B981]" />
                                            ) : (
                                                <Copy className="w-4 h-4 text-gray-400" />
                                            )}
                                        </button>
                                        <button
                                            onClick={downloadBackupCodes}
                                            className="p-2 bg-[#2A2A2A] rounded hover:bg-[#3A3A3A] transition-colors"
                                        >
                                            <Download className="w-4 h-4 text-gray-400" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {setupData.backupCodes.map((code, index) => (
                                        <div key={index} className="font-mono text-sm text-gray-300 bg-[#1A1A1A] px-3 py-2 rounded">
                                            {code}
                                        </div>
                                    ))}
                                </div>

                                <p className="text-yellow-400 text-xs mt-4 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    Each code can only be used once. Store them securely!
                                </p>
                            </div>

                            <button
                                onClick={completeMFASetup}
                                className="px-8 py-3 bg-[#3E64FF] text-white rounded-lg hover:bg-[#5576ff] transition-all"
                            >
                                Continue to Dashboard
                            </button>
                        </div>
                    )}

                    {error && step === 1 && (
                        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <div className="flex items-center gap-2 text-red-400">
                                <AlertCircle className="w-5 h-5" />
                                {error}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}