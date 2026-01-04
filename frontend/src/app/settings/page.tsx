// src/app/settings/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import {
    User, Lock, Bell, Shield, Palette, Globe,
    CreditCard, AlertCircle, Check, ChevronRight, Mail,
    Phone, MapPin, Camera, Trash2, Download
} from 'lucide-react';

type SettingsTab = 'profile' | 'account' | 'security' | 'notifications' | 'preferences' | 'billing';

export default function SettingsPage() {
    const { user } = useAuth();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    // Profile Settings State
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        bio: '',
        location: '',
        website: '',
        avatarUrl: ''
    });

    // Account Settings State
    const [accountSettings, setAccountSettings] = useState({
        username: '',
        language: 'en',
        timezone: 'UTC',
        dateFormat: 'MM/DD/YYYY'
    });

    // Security Settings State
    const [securitySettings, setSecuritySettings] = useState({
        mfaEnabled: user?.mfaEnabled || false,
        emailVerified: user?.isEmailVerified || false,
        lastPasswordChange: '',
        activeSessions: 1
    });

    // Notification Settings State
    const [notifications, setNotifications] = useState({
        emailNotifications: true,
        pushNotifications: false,
        courseUpdates: true,
        promotionalEmails: false,
        weeklyDigest: true,
        instantMessages: true
    });

    // Preferences State
    const [preferences, setPreferences] = useState({
        theme: 'dark',
        autoplay: true,
        quality: 'auto',
        subtitles: false,
        downloadQuality: 'high'
    });

    useEffect(() => {
        if (!user) {
            router.push('/auth/login');
        }
        loadSettings();
    }, [user, router]);

    const loadSettings = async () => {
        try {
            const response = await fetch('/api/user/settings', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                if (data.profile) setProfileData(prev => ({ ...prev, ...data.profile }));
                if (data.account) setAccountSettings(data.account);
                if (data.notifications) setNotifications(data.notifications);
                if (data.preferences) setPreferences(data.preferences);
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    };

    const handleSaveProfile = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const response = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileData),
                credentials: 'include'
            });

            if (response.ok) {
                setSuccess('Profile updated successfully!');
            } else {
                setError('Failed to update profile');
            }
        } catch {
            setError('An error occurred while updating profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = () => {
        router.push('/settings/change-password');
    };

    const handleEnable2FA = () => {
        router.push('/auth/mfa-setup');
    };

    const handleDisable2FA = async () => {
        if (confirm('Are you sure you want to disable 2FA? This will make your account less secure.')) {
            try {
                const response = await fetch('/api/auth/mfa/disable', {
                    method: 'POST',
                    credentials: 'include'
                });
                if (response.ok) {
                    setSecuritySettings(prev => ({ ...prev, mfaEnabled: false }));
                    setSuccess('2FA has been disabled');
                }
            } catch {
                setError('Failed to disable 2FA');
            }
        }
    };

    const handleDeleteAccount = async () => {
        if (confirm('Are you sure? This action cannot be undone. All your data will be permanently deleted.')) {
            if (confirm('Please confirm once more. Type "DELETE" to proceed.')) {
                try {
                    const response = await fetch('/api/user/delete', {
                        method: 'DELETE',
                        credentials: 'include'
                    });
                    if (response.ok) {
                        router.push('/');
                    }
                } catch {
                    setError('Failed to delete account');
                }
            }
        }
    };

    const handleExportData = async () => {
        try {
            const response = await fetch('/api/user/export', {
                credentials: 'include'
            });
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `user-data-${Date.now()}.json`;
                a.click();
            }
        } catch {
            setError('Failed to export data');
        }
    };

    const settingsTabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'account', label: 'Account', icon: Globe },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'preferences', label: 'Preferences', icon: Palette },
        { id: 'billing', label: 'Billing', icon: CreditCard }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900">
            <div className="max-w-7xl mx-auto px-4 py-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Settings</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your account settings and preferences</p>
                </div>

                {success && (
                    <div className="mb-6 p-4 rounded-lg border border-emerald-300/60 bg-emerald-50 text-emerald-800 dark:border-emerald-700/60 dark:bg-emerald-900/30 dark:text-emerald-200 flex items-center">
                        <Check className="w-5 h-5 mr-2 text-emerald-600 dark:text-emerald-400" />
                        <span>{success}</span>
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 rounded-lg border border-rose-300/60 bg-rose-50 text-rose-800 dark:border-rose-700/60 dark:bg-rose-900/30 dark:text-rose-200 flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2 text-rose-600 dark:text-rose-400" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <nav className="space-y-2">
                            {settingsTabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === (tab.id as SettingsTab);
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as SettingsTab)}
                                        className={[
                                            'w-full group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition',
                                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 dark:focus-visible:ring-offset-gray-900',
                                            isActive
                                                ? 'bg-blue-600 text-white shadow-sm'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/70'
                                        ].join(' ')}
                                    >
                    <span className="flex items-center">
                      <Icon className={['w-5 h-5 mr-3', isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'].join(' ')} />
                        {tab.label}
                    </span>
                                        <ChevronRight className={['w-4 h-4', isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'].join(' ')} />
                                    </button>
                                );
                            })}
                        </nav>

                        {/* Danger Zone */}
                        <div className="mt-8 p-4 border border-red-200/60 dark:border-red-800/60 rounded-lg bg-white/50 dark:bg-gray-900/40">
                            <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-3">Danger Zone</h3>
                            <button
                                onClick={handleDeleteAccount}
                                className="w-full px-3 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500 dark:focus-visible:ring-offset-gray-900"
                            >
                                Delete Account
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <div className="bg-white dark:bg-gray-900/60 rounded-2xl shadow-sm border border-gray-200/70 dark:border-gray-700/60 p-6 backdrop-blur">
                            {/* Profile Tab */}
                            {activeTab === 'profile' && (
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Profile Information</h2>

                                    <div className="space-y-6">
                                        {/* Avatar */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Profile Picture</label>
                                            <div className="flex items-center">
                                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 ring-2 ring-gray-200/70 dark:ring-gray-700/70 overflow-hidden">
                                                    {profileData.avatarUrl ? (
                                                        <img src={profileData.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <User className="w-9 h-9 text-gray-500 dark:text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    className="ml-4 inline-flex items-center px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/70 text-gray-700 dark:text-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 dark:focus-visible:ring-offset-gray-900"
                                                    type="button"
                                                >
                                                    <Camera className="w-4 h-4 mr-2" />
                                                    Change Photo
                                                </button>
                                            </div>
                                        </div>

                                        {/* Name */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                                            <input
                                                type="text"
                                                value={profileData.name}
                                                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800/60 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Your full name"
                                            />
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                                            <input
                                                type="email"
                                                value={profileData.email}
                                                disabled
                                                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                            />
                                        </div>

                                        {/* Phone */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                                            <input
                                                type="tel"
                                                value={profileData.phone}
                                                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                                placeholder="+1 (555) 000-0000"
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800/60 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        {/* Bio */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bio</label>
                                            <textarea
                                                value={profileData.bio}
                                                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                                rows={4}
                                                placeholder="Tell us about yourself..."
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800/60 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={handleSaveProfile}
                                                disabled={loading}
                                                className="px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 dark:focus-visible:ring-offset-gray-900"
                                            >
                                                {loading ? 'Saving...' : 'Save Changes'}
                                            </button>
                                            <button
                                                onClick={() => loadSettings()}
                                                type="button"
                                                className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/70 text-gray-700 dark:text-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400 dark:focus-visible:ring-offset-gray-900"
                                            >
                                                Reset
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Security Tab */}
                            {activeTab === 'security' && (
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Security Settings</h2>

                                    <div className="space-y-6">
                                        {/* Password */}
                                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-sm transition">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-medium text-gray-900 dark:text-white flex items-center">
                                                        <Lock className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                                                        Password
                                                    </h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Last changed 3 months ago</p>
                                                </div>
                                                <button
                                                    onClick={handleChangePassword}
                                                    className="px-4 py-2 text-blue-600 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 dark:focus-visible:ring-offset-gray-900"
                                                >
                                                    Change Password
                                                </button>
                                            </div>
                                        </div>

                                        {/* 2FA */}
                                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-sm transition">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                        {securitySettings.mfaEnabled ? 'Your account is protected with 2FA' : 'Add an extra layer of security'}
                                                    </p>
                                                </div>
                                                {securitySettings.mfaEnabled ? (
                                                    <button
                                                        onClick={handleDisable2FA}
                                                        className="px-4 py-2 text-red-600 border border-red-300 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500 dark:focus-visible:ring-offset-gray-900"
                                                    >
                                                        Disable 2FA
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={handleEnable2FA}
                                                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-500 dark:focus-visible:ring-offset-gray-900"
                                                    >
                                                        Enable 2FA
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Active Sessions */}
                                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-sm transition">
                                            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Active Sessions</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                                You have {securitySettings.activeSessions} active session(s)
                                            </p>
                                            <button className="text-sm text-blue-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">
                                                View all sessions →
                                            </button>
                                        </div>

                                        {/* Data Export */}
                                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-sm transition">
                                            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Export Your Data</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                                Download a copy of your data in JSON format
                                            </p>
                                            <button
                                                onClick={handleExportData}
                                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400 dark:focus-visible:ring-offset-gray-900 text-gray-800 dark:text-gray-100"
                                            >
                                                <Download className="w-4 h-4 inline mr-2" />
                                                Export Data
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Notifications Tab */}
                            {activeTab === 'notifications' && (
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Notification Preferences</h2>
                                    <div className="space-y-4">
                                        {Object.entries({
                                            emailNotifications: 'Email Notifications',
                                            pushNotifications: 'Push Notifications',
                                            courseUpdates: 'courses Updates',
                                            promotionalEmails: 'Promotional Emails',
                                            weeklyDigest: 'Weekly Digest',
                                            instantMessages: 'Instant Messages'
                                        }).map(([key, label]) => (
                                            <label
                                                key={key}
                                                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/70 transition"
                                            >
                                                <div>
                                                    <span className="font-medium text-gray-900 dark:text-white">{label}</span>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                        Receive {label.toLowerCase()} about your account
                                                    </p>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={notifications[key as keyof typeof notifications]}
                                                    onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })}
                                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                                />
                                            </label>
                                        ))}
                                    </div>
                                    <button className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 dark:focus-visible:ring-offset-gray-900">
                                        Save Preferences
                                    </button>
                                </div>
                            )}

                            {/* TODO: Other tabs can be enhanced similarly */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
