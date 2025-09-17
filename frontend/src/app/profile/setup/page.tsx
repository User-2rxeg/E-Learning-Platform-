
// src/app/auth/profile-setup/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import {useAuth} from "../../../contexts/AuthContext";
import { Camera, Save, Edit2, Mail, Phone, MapPin, Shield } from 'lucide-react';

// Icons
const CheckIcon = () => <span>✓</span>;
const CameraIcon = () => <span>📷</span>;
const UserIcon = () => <span>👤</span>;
const BookIcon = () => <span>📚</span>;
const TargetIcon = () => <span>🎯</span>;
const RocketIcon = () => <span>🚀</span>;

// Predefined options for preferences
const learningPreferences = [
    { id: 'visual', label: 'Visual Learning', icon: '👁️', description: 'Charts, diagrams, videos' },
    { id: 'auditory', label: 'Auditory Learning', icon: '👂', description: 'Lectures, discussions' },
    { id: 'reading', label: 'Reading/Writing', icon: '📖', description: 'Notes, articles, lists' },
    { id: 'kinesthetic', label: 'Hands-on Practice', icon: '🤲', description: 'Labs, exercises, projects' },
];

const subjectInterests = [
    { id: 'programming', label: 'Programming', icon: '💻' },
    { id: 'data-science', label: 'Data Science', icon: '📊' },
    { id: 'design', label: 'Design', icon: '🎨' },
    { id: 'business', label: 'Business', icon: '💼' },
    { id: 'mathematics', label: 'Mathematics', icon: '🔢' },
    { id: 'languages', label: 'Languages', icon: '🌍' },
    { id: 'science', label: 'Science', icon: '🔬' },
    { id: 'humanities', label: 'Humanities', icon: '📚' },
    { id: 'engineering', label: 'Engineering', icon: '⚙️' },
    { id: 'arts', label: 'Arts', icon: '🎭' },
];

const expertiseAreas = [
    { id: 'web-dev', label: 'Web Development' },
    { id: 'mobile-dev', label: 'Mobile Development' },
    { id: 'ai-ml', label: 'AI/Machine Learning' },
    { id: 'cloud', label: 'Cloud Computing' },
    { id: 'cybersecurity', label: 'Cybersecurity' },
    { id: 'databases', label: 'Databases' },
    { id: 'devops', label: 'DevOps' },
    { id: 'blockchain', label: 'Blockchain' },
    { id: 'game-dev', label: 'Game Development' },
    { id: 'iot', label: 'IoT' },
];

interface UserData {
    id: string;
    email: string;
    name: string;
    role: 'student' | 'instructor' | 'admin';
}

export default function ProfilePage() {
    const { user } = useAuth();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'achievements' | 'settings'>('overview');
// Profile data
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        bio: '',
        location: '',
        website: '',
        github: '',
        linkedin: '',
        avatar: null as File | null,
        avatarPreview: '',
    });
    const [preferences, setPreferences] = useState({
        emailNotifications: true,
        pushNotifications: false,
        courseReminders: true,
        promotionalEmails: false,
        twoFactorEnabled: user?.mfaEnabled || false,
    });
    useEffect(() => {
        if (!user) {
            router.push('/auth/login');
        }
    }, [user, router]);
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('Image must be less than 5MB');
                return;
            }
            setProfileData(prev => ({ ...prev, avatar: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileData(prev => ({ ...prev, avatarPreview: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };
    const handleSaveProfile = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken'); // Get token from localStorage
            const formData = new FormData();
            Object.entries(profileData).forEach(([key, value]) => {
                if (value && key !== 'avatarPreview') {
                    formData.append(key, value as string | Blob);
                }
            });

            const response = await fetch('/api/profile/update', {
                method: 'PUT',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${token}` // Add auth header
                },
            });

            if (response.ok) {
                setEditing(false);
                alert('Profile updated successfully!');
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Profile update error:', error);
            alert('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };
    const enable2FA = () => {
        router.push('/auth/mfa-setup');
    };
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a]">
            {/* Header */}
            <div className="bg-[rgba(26,26,26,0.8)] backdrop-blur-xl border-b border-[rgba(255,255,255,0.1)]">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-100">My Profile</h1>
                        <button
                            onClick={() => editing ? handleSaveProfile() : setEditing(true)}
                            disabled={loading}
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                                editing
                                    ? 'bg-gradient-to-r from-[#3e64ff] to-[#667eea] text-white hover:shadow-[0_10px_30px_rgba(62,100,255,0.3)]'
                                    : 'bg-[rgba(255,255,255,0.05)] text-gray-100 hover:bg-[rgba(255,255,255,0.1)]'
                            }`}
                        >
                            {editing ? (
                                <>
                                    <Save className="w-4 h-4" />
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </>
                            ) : (
                                <>
                                    <Edit2 className="w-4 h-4" />
                                    Edit Profile
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Sidebar - Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-[rgba(26,26,26,0.8)] backdrop-blur-xl rounded-xl p-6 border border-[rgba(255,255,255,0.1)]">
                            {/* Avatar */}
                            <div className="text-center mb-6">
                                <div className="relative inline-block">
                                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-[#3e64ff] to-[#667eea] p-1">
                                        {profileData.avatarPreview ? (
                                            <img
                                                src={profileData.avatarPreview}
                                                alt="Profile"
                                                className="w-full h-full rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full rounded-full bg-[#1a1a1a] flex items-center justify-center text-3xl font-bold text-gray-100">
                                                {user?.name?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    {editing && (
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute bottom-0 right-0 p-2 bg-[#3e64ff] rounded-full text-white hover:bg-[#667eea] transition-colors"
                                        >
                                            <Camera className="w-4 h-4" />
                                        </button>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </div>
                            </div>

                            {/* Basic Info */}
                            <div className="text-center mb-6">
                                {editing ? (
                                    <input
                                        type="text"
                                        value={profileData.name}
                                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-3 py-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg text-gray-100 text-center text-xl font-semibold"
                                    />
                                ) : (
                                    <h2 className="text-xl font-semibold text-gray-100">{profileData.name}</h2>
                                )}
                                <p className="text-[#a0a0a0] mt-1">{user?.role}</p>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <Mail className="w-4 h-4 text-[#a0a0a0]" />
                                    <span className="text-gray-100">{profileData.email}</span>
                                </div>
                                {editing ? (
                                    <>
                                        <input
                                            type="text"
                                            placeholder="Phone number"
                                            value={profileData.phone}
                                            onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                                            className="w-full px-3 py-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg text-gray-100 text-sm"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Location"
                                            value={profileData.location}
                                            onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                                            className="w-full px-3 py-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg text-gray-100 text-sm"
                                        />
                                    </>
                                ) : (
                                    <>
                                        {profileData.phone && (
                                            <div className="flex items-center gap-3 text-sm">
                                                <Phone className="w-4 h-4 text-[#a0a0a0]" />
                                                <span className="text-gray-100">{profileData.phone}</span>
                                            </div>
                                        )}
                                        {profileData.location && (
                                            <div className="flex items-center gap-3 text-sm">
                                                <MapPin className="w-4 h-4 text-[#a0a0a0]" />
                                                <span className="text-gray-100">{profileData.location}</span>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Social Links */}
                            {editing && (
                                <div className="mt-6 space-y-3">
                                    <h3 className="text-sm font-medium text-[#a0a0a0]">Social Links</h3>
                                    <input
                                        type="url"
                                        placeholder="Website URL"
                                        value={profileData.website}
                                        onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                                        className="w-full px-3 py-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg text-gray-100 text-sm"
                                    />
                                    <input
                                        type="url"
                                        placeholder="GitHub URL"
                                        value={profileData.github}
                                        onChange={(e) => setProfileData(prev => ({ ...prev, github: e.target.value }))}
                                        className="w-full px-3 py-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg text-gray-100 text-sm"
                                    />
                                    <input
                                        type="url"
                                        placeholder="LinkedIn URL"
                                        value={profileData.linkedin}
                                        onChange={(e) => setProfileData(prev => ({ ...prev, linkedin: e.target.value }))}
                                        className="w-full px-3 py-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg text-gray-100 text-sm"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Content Area */}
                    <div className="lg:col-span-2">
                        {/* Tab Navigation */}
                        <div className="flex space-x-1 mb-6 bg-[rgba(255,255,255,0.05)] p-1 rounded-lg w-fit">
                            {(['overview', 'courses', 'achievements', 'settings'] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 rounded-md font-medium text-sm transition-all capitalize ${
                                        activeTab === tab
                                            ? 'bg-[rgba(255,255,255,0.1)] text-gray-100'
                                            : 'text-[#a0a0a0] hover:text-gray-100'
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        {activeTab === 'settings' && (
                            <div className="space-y-6">
                                {/* Security Settings */}
                                <div className="bg-[rgba(26,26,26,0.8)] backdrop-blur-xl rounded-xl p-6 border border-[rgba(255,255,255,0.1)]">
                                    <h3 className="text-lg font-semibold text-gray-100 mb-4">Security</h3>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Shield className="w-5 h-5 text-[#a0a0a0]" />
                                                <div>
                                                    <p className="text-gray-100 font-medium">Two-Factor Authentication</p>
                                                    <p className="text-sm text-[#a0a0a0]">Add an extra layer of security</p>
                                                </div>
                                            </div>
                                            {preferences.twoFactorEnabled ? (
                                                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                                                  Enabled
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={enable2FA}
                                                    className="px-4 py-2 bg-[#3e64ff] text-white rounded-lg hover:bg-[#667eea] text-sm"
                                                >
                                                    Enable
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Notification Preferences */}
                                <div className="bg-[rgba(26,26,26,0.8)] backdrop-blur-xl rounded-xl p-6 border border-[rgba(255,255,255,0.1)]">
                                    <h3 className="text-lg font-semibold text-gray-100 mb-4">Notifications</h3>

                                    <div className="space-y-4">
                                        {Object.entries({
                                            emailNotifications: 'Email Notifications',
                                            pushNotifications: 'Push Notifications',
                                            courseReminders: 'Course Reminders',
                                            promotionalEmails: 'Promotional Emails'
                                        }).map(([key, label]) => (
                                            <label key={key} className="flex items-center justify-between cursor-pointer">
                                                <span className="text-gray-100">{label}</span>
                                                <input
                                                    type="checkbox"
                                                    checked={preferences[key as keyof typeof preferences] as boolean}
                                                    onChange={(e) => setPreferences(prev => ({ ...prev, [key]: e.target.checked }))}
                                                    className="w-4 h-4 text-[#3e64ff] bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] rounded focus:ring-[#3e64ff]"
                                                />
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}