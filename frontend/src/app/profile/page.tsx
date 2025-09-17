// src/app/profile/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import Link from 'next/link';
import {
    User, Mail, Phone, MapPin, Globe, Github, Linkedin,
    Calendar, Award, BookOpen, Clock, Edit, Settings
} from 'lucide-react';
export default function ProfilePage() {
    const { user } = useAuth();
    const router = useRouter();
    const [profileData, setProfileData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (!user) {
            router.push('/auth/login');
            return;
        }
        loadProfile();
    }, [user, router]);
    const loadProfile = async () => {
        try {
            const response = await fetch('/api/user/profile', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setProfileData(data);
            }
        } catch (error) {
            console.error('Failed to load profile:', error);
        } finally {
            setLoading(false);
        }
    };
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Profile Header */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-6">
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{user?.name}</h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">{user?.email}</p>
                                <div className="flex items-center gap-4 mt-3">
<span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm capitalize">
{user?.role}
</span>
                                    {user?.isEmailVerified && (
                                        <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200 rounded-full text-sm">
Verified
</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Link
                                href="/settings"
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center"
                            >
                                <Settings className="w-4 h-4 mr-2" />
                                Settings
                            </Link>
                            <Link
                                href="/profile/edit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Profile
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                    {/* Left Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* About */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">About</h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                {profileData?.bio || 'No bio added yet.'}
                            </p>
                        </div>

                        {/* Contact Info */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h2>
                            <div className="space-y-3">
                                <div className="flex items-center text-gray-600 dark:text-gray-400">
                                    <Mail className="w-4 h-4 mr-3" />
                                    {user?.email}
                                </div>
                                {profileData?.phone && (
                                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                                        <Phone className="w-4 h-4 mr-3" />
                                        {profileData.phone}
                                    </div>
                                )}
                                {profileData?.location && (
                                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                                        <MapPin className="w-4 h-4 mr-3" />
                                        {profileData.location}
                                    </div>
                                )}
                                {profileData?.website && (
                                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                                        <Globe className="w-4 h-4 mr-3" />
                                        <a href={profileData.website} className="hover:text-blue-600">
                                            {profileData.website}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {user?.role === 'student' ? profileData?.enrolledCourses?.length || 0 : profileData?.teachingCourses?.length || 0}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            {user?.role === 'student' ? 'Enrolled Courses' : 'Courses Teaching'}
                                        </p>
                                    </div>
                                    <BookOpen className="w-8 h-8 text-blue-600" />
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {profileData?.certificatesEarned || 0}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Certificates</p>
                                    </div>
                                    <Award className="w-8 h-8 text-yellow-600" />
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {profileData?.learningHours || 0}h
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Learning Hours</p>
                                    </div>
                                    <Clock className="w-8 h-8 text-green-600" />
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
                            <div className="space-y-4">
                                {profileData?.recentActivity?.length > 0 ? (
                                    profileData.recentActivity.map((activity: any, index: number) => (
                                        <div key={index} className="flex items-start">
                                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                                            <div>
                                                <p className="text-gray-900 dark:text-white">{activity.description}</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{activity.date}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-600 dark:text-gray-400">No recent activity</p>
                                )}
                            </div>
                        </div>RetryEContinueEdittypescript           {/* Achievements */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Achievements</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {profileData?.achievements?.length > 0 ? (
                                    profileData.achievements.map((achievement: any, index: number) => (
                                        <div key={index} className="text-center">
                                            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                                                <Award className="w-8 h-8 text-white" />
                                            </div>
                                            <p className="text-sm text-gray-900 dark:text-white">{achievement.name}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-600 dark:text-gray-400 col-span-4">No achievements yet</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
