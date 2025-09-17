// src/app/profile/[id]/page.tsx - Public Profile View
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import Link from 'next/link';
import {
    User, Mail, MapPin, Globe, Github, Linkedin, Twitter,
    Calendar, Award, BookOpen, Clock, Edit, Users, Star
} from 'lucide-react';

interface PublicProfile {
    _id: string;
    name: string;
    email: string;
    bio: string;
    location: string;
    website: string;
    github: string;
    linkedin: string;
    twitter: string;
    avatarUrl: string;
    role: string;
    joinedDate: string;
    isVerified: boolean;
    stats: {
        coursesEnrolled?: number;
        coursesTeaching?: number;
        certificatesEarned: number;
        totalStudents?: number;
        rating?: number;
    };
    achievements: Array<{
        id: string;
        name: string;
        icon: string;
        earnedDate: string;
    }>;
    recentActivity: Array<{
        id: string;
        type: string;
        description: string;
        date: string;
    }>;
}

export default function PublicProfilePage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [profile, setProfile] = useState<PublicProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [following, setFollowing] = useState(false);

    const profileId = params.id as string;
    const isOwnProfile = user?.id === profileId || user?._id === profileId;

    useEffect(() => {
        loadProfile();
    }, [profileId]);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/user/${profileId}`, {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setProfile(data);
                setFollowing(data.isFollowing || false);
            } else if (response.status === 404) {
                router.push('/404');
            }
        } catch (error) {
            console.error('Failed to load profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFollow = async () => {
        if (!user) {
            router.push('/auth/login');
            return;
        }

        try {
            const response = await fetch(`/api/user/${profileId}/follow`, {
                method: following ? 'DELETE' : 'POST',
                credentials: 'include'
            });

            if (response.ok) {
                setFollowing(!following);
            }
        } catch (error) {
            console.error('Failed to follow/unfollow:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Profile Not Found</h1>
                    <p className="text-gray-600 dark:text-gray-400">The profile you're looking for doesn't exist.</p>
                    <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">
                        Go back home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Cover Image */}
            <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600"></div>

            <div className="max-w-7xl mx-auto px-4 -mt-24">
                {/* Profile Header */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                        <div className="flex items-center">
                            {/* Avatar */}
                            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-1">
                                {profile.avatarUrl ? (
                                    <img
                                        src={profile.avatarUrl}
                                        alt={profile.name}
                                        className="w-full h-full rounded-full object-cover bg-white"
                                    />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-white dark:bg-gray-700 flex items-center justify-center">
                                        <User className="w-16 h-16 text-gray-400" />
                                    </div>
                                )}
                            </div>

                            {/* Basic Info */}
                            <div className="ml-6">
                                <div className="flex items-center">
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {profile.name}
                                    </h1>
                                    {profile.isVerified && (
                                        <div className="ml-2 bg-blue-100 text-blue-700 p-1 rounded-full">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">@{profile.email.split('@')[0]}</p>
                                <div className="flex items-center gap-4 mt-3">
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm capitalize">
                    {profile.role}
                  </span>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        Joined {new Date(profile.joinedDate).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-6 md:mt-0 flex gap-3">
                            {isOwnProfile ? (
                                <>
                                    <Link
                                        href="/profile/edit"
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                                    >
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit Profile
                                    </Link>
                                    <Link
                                        href="/settings"
                                        className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        Settings
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={handleFollow}
                                        className={`px-6 py-2 rounded-lg ${
                                            following
                                                ? 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                    >
                                        {following ? 'Following' : 'Follow'}
                                    </button>
                                    <button className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                                        Message
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Bio */}
                    {profile.bio && (
                        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-gray-700 dark:text-gray-300">{profile.bio}</p>
                        </div>
                    )}

                    {/* Links */}
                    <div className="mt-6 flex flex-wrap gap-4">
                        {profile.location && (
                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                                <MapPin className="w-4 h-4 mr-2" />
                                {profile.location}
                            </div>
                        )}
                        {profile.website && (
                            <a href={profile.website} className="flex items-center text-blue-600 hover:underline">
                                <Globe className="w-4 h-4 mr-2" />
                                Website
                            </a>
                        )}
                        {profile.github && (
                            <a href={profile.github} className="flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600">
                                <Github className="w-4 h-4 mr-2" />
                                GitHub
                            </a>
                        )}
                        {profile.linkedin && (
                            <a href={profile.linkedin} className="flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600">
                                <Linkedin className="w-4 h-4 mr-2" />
                                LinkedIn
                            </a>
                        )}
                    </div>
                </div>

                {/* Rest of profile content continues... */}
            </div>
        </div>
    );
}