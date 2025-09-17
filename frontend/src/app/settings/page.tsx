// src/app/settings/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import {
    User, Lock, Bell, Shield, Palette, Globe,
    CreditCard, Key, AlertCircle, Check, X,
    ChevronRight, Mail, Phone, MapPin, Camera,
    Trash2, Download, LogOut
} from 'lucide-react';
type SettingsTab = 'profile' | 'account' | 'security' | 'notifications' | 'preferences' | 'billing';
export default function SettingsPage() {
    const { user, logout } = useAuth();
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
                // Update all settings from backend
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
        } catch (error) {
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
            } catch (error) {
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
                        await logout();
                        router.push('/');
                    }
                } catch (error) {
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
        } catch (error) {
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your account settings and preferences</p>
                </div>
                {/* Success/Error Messages */}
                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                        <Check className="w-5 h-5 text-green-600 mr-2" />
                        <span className="text-green-800">{success}</span>
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                        <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                        <span className="text-red-800">{error}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <nav className="space-y-1">
                            {settingsTabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as SettingsTab)}
                                        className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                                            activeTab === tab.id
                                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                                                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                                        }`}
                                    >
                                        <Icon className="w-5 h-5 mr-3" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </nav>

                        {/* Danger Zone */}
                        <div className="mt-8 p-4 border border-red-200 dark:border-red-800 rounded-lg">
                            <h3 className="text-sm font-medium text-red-600 dark:text-red-400 mb-3">Danger Zone</h3>
                            <button
                                onClick={handleDeleteAccount}
                                className="w-full px-3 py-2 text-sm text-red-600 border border-red-300 rounded-md hover:bg-red-50 dark:hover:bg-red-900"
                            >
                                Delete Account
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            {/* Profile Tab */}
                            {activeTab === 'profile' && (
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Profile Information</h2>

                                    <div className="space-y-6">
                                        {/* Avatar */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Profile Picture
                                            </label>
                                            <div className="flex items-center">
                                                <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                                    {profileData.avatarUrl ? (
                                                        <img src={profileData.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                                                    ) : (
                                                        <User className="w-10 h-10 text-gray-400" />
                                                    )}
                                                </div>
                                                <button className="ml-4 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
                                                    <Camera className="w-4 h-4 inline mr-2" />
                                                    Change Photo
                                                </button>
                                            </div>
                                        </div>

                                        {/* Name */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Full Name
                                            </label>
                                            <input
                                                type="text"
                                                value={profileData.name}
                                                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                value={profileData.email}
                                                disabled
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                                            />
                                        </div>

                                        {/* Phone */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Phone Number
                                            </label>
                                            <input
                                                type="tel"
                                                value={profileData.phone}
                                                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                                placeholder="+1 (555) 000-0000"
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>

                                        {/* Bio */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Bio
                                            </label>
                                            <textarea
                                                value={profileData.bio}
                                                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                                rows={4}
                                                placeholder="Tell us about yourself..."
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>

                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={loading}
                                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            {loading ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Security Tab */}
                            {activeTab === 'security' && (
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Security Settings</h2>

                                    <div className="space-y-6">
                                        {/* Password */}
                                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-medium text-gray-900 dark:text-white">Password</h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                        Last changed 3 months ago
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={handleChangePassword}
                                                    className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900"
                                                >
                                                    Change Password
                                                </button>
                                            </div>
                                        </div>

                                        {/* 2FA */}
                                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                        {securitySettings.mfaEnabled
                                                            ? 'Your account is protected with 2FA'
                                                            : 'Add an extra layer of security'}
                                                    </p>
                                                </div>
                                                {securitySettings.mfaEnabled ? (
                                                    <button
                                                        onClick={handleDisable2FA}
                                                        className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50"
                                                    >
                                                        Disable 2FA
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={handleEnable2FA}
                                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                                    >
                                                        Enable 2FA
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Active Sessions */}
                                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                            <h3 className="font-medium text-gray-900 dark:text-white mb-3">Active Sessions</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                                You have {securitySettings.activeSessions} active session(s)
                                            </p>
                                            <button className="text-sm text-blue-600 hover:underline">
                                                View all sessions →
                                            </button>
                                        </div>

                                        {/* Data Export */}
                                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Export Your Data</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                                Download a copy of your data in JSON format
                                            </p>
                                            <button
                                                onClick={handleExportData}
                                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
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
                                            courseUpdates: 'Course Updates',
                                            promotionalEmails: 'Promotional Emails',
                                            weeklyDigest: 'Weekly Digest',
                                            instantMessages: 'Instant Messages'
                                        }).map(([key, label]) => (
                                            <label key={key} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
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

                                    <button className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                        Save Preferences
                                    </button>
                                </div>
                            )}

                            {/* Other tabs... */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}