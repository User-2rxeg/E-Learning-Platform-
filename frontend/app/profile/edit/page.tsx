'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { Camera, Save, X, User, Mail, AlertCircle } from 'lucide-react';

export default function ProfileEditPage() {
    const { user, refreshUser } = useAuth();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [profileData, setProfileData] = useState({
        name: '',
        bio: '',
        phone: '',
        location: '',
        website: '',
        github: '',
        linkedin: '',
        twitter: '',
        avatar: null as File | null,
        avatarPreview: ''
    });

    useEffect(() => {
        if (!user) {
            router.push('/login');
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
                setProfileData(prev => ({
                    ...prev,
                    ...data,
                    avatarPreview: data.avatarUrl || ''
                }));
            }
        } catch (error) {
            console.error('Failed to load profile:', error);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Image must be less than 5MB');
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const formData = new FormData();
            Object.entries(profileData).forEach(([key, value]) => {
                if (value && key !== 'avatarPreview') {
                    if (key === 'avatar' && value instanceof File) {
                        formData.append(key, value);
                    } else if (typeof value === 'string') {
                        formData.append(key, value);
                    }
                }
            });

            const response = await fetch('/api/user/profile', {
                method: 'PATCH',
                body: formData,
                credentials: 'include'
            });

            if (response.ok) {
                setSuccess('Profile updated successfully!');
                await refreshUser();
                setTimeout(() => {
                    router.push('/profile');
                }, 1200);
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to update profile');
            }
        } catch (error) {
            setError('An error occurred while updating profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background py-10">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white dark:bg-primary.light rounded-xl border border-border shadow-sm">
                    {/* Header */}
                    <div className="px-6 md:px-8 py-5 border-b border-border flex items-center justify-between">
                        <h1 className="text-xl md:text-2xl font-semibold text-foreground">Edit Profile</h1>
                        <button
                            onClick={() => router.push('/profile')}
                            className="p-2 rounded-lg text-text-secondary hover:bg-background"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 md:p-8">
                        {error && (
                            <div className="mb-6 p-4 border border-red-300/60 bg-red-50 rounded-lg flex items-center gap-2 text-red-800">
                                <AlertCircle className="w-5 h-5" />
                                <span>{error}</span>
                            </div>
                        )}

                        {success && (
                            <div className="mb-6 p-4 border border-green-300/60 bg-green-50 rounded-lg text-green-800">
                                {success}
                            </div>
                        )}

                        {/* Avatar */}
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-foreground mb-3">Profile Picture</label>
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full overflow-hidden bg-background border border-border">
                                        {profileData.avatarPreview ? (
                                            <img
                                                src={profileData.avatarPreview}
                                                alt="Avatar"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <User className="w-10 h-10 text-text-secondary" />
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute -bottom-2 -right-2 p-2 rounded-full bg-accent text-white hover:bg-accent-hover shadow"
                                    >
                                        <Camera className="w-4 h-4" />
                                    </button>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                                <div>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-sm text-accent hover:text-accent-hover"
                                    >
                                        Change photo
                                    </button>
                                    <p className="text-xs text-text-secondary mt-1">JPG, PNG or GIF. Max 5MB.</p>
                                </div>
                            </div>
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={profileData.name}
                                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
                                <input
                                    type="tel"
                                    value={profileData.phone}
                                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                    placeholder="+1 (555) 000-0000"
                                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Location</label>
                                <input
                                    type="text"
                                    value={profileData.location}
                                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                                    placeholder="City, Country"
                                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Website</label>
                                <input
                                    type="url"
                                    value={profileData.website}
                                    onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                                    placeholder="https://yourwebsite.com"
                                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
                                />
                            </div>
                        </div>

                        {/* Bio */}
                        <div className="mt-6">
                            <label className="block text-sm font-medium text-foreground mb-2">Bio</label>
                            <textarea
                                value={profileData.bio}
                                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                rows={4}
                                placeholder="Tell us about yourself..."
                                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
                            />
                        </div>

                        {/* Social */}
                        <div className="mt-6 space-y-4">
                            <h3 className="text-sm font-medium text-foreground">Social Links</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-text-secondary mb-2">GitHub</label>
                                    <input
                                        type="url"
                                        value={profileData.github}
                                        onChange={(e) => setProfileData({ ...profileData, github: e.target.value })}
                                        placeholder="https://github.com/username"
                                        className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-text-secondary mb-2">LinkedIn</label>
                                    <input
                                        type="url"
                                        value={profileData.linkedin}
                                        onChange={(e) => setProfileData({ ...profileData, linkedin: e.target.value })}
                                        placeholder="https://linkedin.com/in/username"
                                        className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm text-text-secondary mb-2">Twitter</label>
                                    <input
                                        type="url"
                                        value={profileData.twitter}
                                        onChange={(e) => setProfileData({ ...profileData, twitter: e.target.value })}
                                        placeholder="https://twitter.com/username"
                                        className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                type="button"
                                onClick={() => router.push('/profile')}
                                className="px-5 py-2 rounded-lg border border-border text-foreground hover:bg-background"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2 rounded-lg bg-accent text-white hover:bg-accent-hover disabled:opacity-50 inline-flex items-center gap-2"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}































// // src/app/profile/edit/page.tsx
// 'use client';
//
// import { useState, useEffect, useRef } from 'react';
// import { useRouter } from 'next/navigation';
// import { useAuth } from '../../../contexts/AuthContext';
// import {
//     Camera, Save, X, user, Mail, Phone, MapPin,
//     Globe, Github, Linkedin, Twitter, AlertCircle
// } from 'lucide-react';
//
// export default function ProfileEditPage() {
//     const { user, refreshUser } = useAuth();
//     const router = useRouter();
//     const fileInputRef = useRef<HTMLInputElement>(null);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState('');
//     const [success, setSuccess] = useState('');
//
//     const [profileData, setProfileData] = useState({
//         name: '',
//         bio: '',
//         phone: '',
//         location: '',
//         website: '',
//         github: '',
//         linkedin: '',
//         twitter: '',
//         avatar: null as File | null,
//         avatarPreview: ''
//     });
//
//     useEffect(() => {
//         if (!user) {
//             router.push('/login');
//             return;
//         }
//         loadProfile();
//     }, [user, router]);
//
//     const loadProfile = async () => {
//         try {
//             const response = await fetch('/api/user/profile', {
//                 credentials: 'include'
//             });
//
//             if (response.ok) {
//                 const data = await response.json();
//                 setProfileData({
//                     ...profileData,
//                     ...data,
//                     avatarPreview: data.avatarUrl || ''
//                 });
//             }
//         } catch (error) {
//             console.error('Failed to load profile:', error);
//         }
//     };
//
//     const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const file = e.target.files?.[0];
//         if (file) {
//             if (file.size > 5 * 1024 * 1024) {
//                 setError('Image must be less than 5MB');
//                 return;
//             }
//
//             setProfileData(prev => ({ ...prev, avatar: file }));
//             const reader = new FileReader();
//             reader.onloadend = () => {
//                 setProfileData(prev => ({ ...prev, avatarPreview: reader.result as string }));
//             };
//             reader.readAsDataURL(file);
//         }
//     };
//
//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setLoading(true);
//         setError('');
//         setSuccess('');
//
//         try {
//             const formData = new FormData();
//             Object.entries(profileData).forEach(([key, value]) => {
//                 if (value && key !== 'avatarPreview') {
//                     if (key === 'avatar' && value instanceof File) {
//                         formData.append(key, value);
//                     } else if (typeof value === 'string') {
//                         formData.append(key, value);
//                     }
//                 }
//             });
//
//             const response = await fetch('/api/user/profile', {
//                 method: 'PATCH',
//                 body: formData,
//                 credentials: 'include'
//             });
//
//             if (response.ok) {
//                 setSuccess('Profile updated successfully!');
//                 await refreshUser();
//                 setTimeout(() => {
//                     router.push('/profile');
//                 }, 1500);
//             } else {
//                 const data = await response.json();
//                 setError(data.error || 'Failed to update profile');
//             }
//         } catch (error) {
//             setError('An error occurred while updating profile');
//         } finally {
//             setLoading(false);
//         }
//     };
//
//     return (
//         <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
//             <div className="max-w-4xl mx-auto px-4">
//                 <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
//                     {/* Header */}
//                     <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700">
//                         <div className="flex items-center justify-between">
//                             <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Profile</h1>
//                             <button
//                                 onClick={() => router.push('/profile')}
//                                 className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
//                             >
//                                 <X className="w-5 h-5" />
//                             </button>
//                         </div>
//                     </div>
//
//                     {/* Form */}
//                     <form onSubmit={handleSubmit} className="p-8">
//                         {error && (
//                             <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
//                                 <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
//                                 <span className="text-red-800">{error}</span>
//                             </div>
//                         )}
//
//                         {success && (
//                             <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
//                                 <span className="text-green-800">{success}</span>
//                             </div>
//                         )}
//
//                         {/* Avatar */}
//                         <div className="mb-8">
//                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
//                                 Profile Picture
//                             </label>
//                             <div className="flex items-center">
//                                 <div className="relative">
//                                     <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
//                                         {profileData.avatarPreview ? (
//                                             <img
//                                                 src={profileData.avatarPreview}
//                                                 alt="Avatar"
//                                                 className="w-full h-full object-cover"
//                                             />
//                                         ) : (
//                                             <div className="w-full h-full flex items-center justify-center">
//                                                 <user className="w-12 h-12 text-gray-400" />
//                                             </div>
//                                         )}
//                                     </div>
//                                     <button
//                                         type="button"
//                                         onClick={() => fileInputRef.current?.click()}
//                                         className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full text-white hover:bg-blue-700"
//                                     >
//                                         <Camera className="w-4 h-4" />
//                                     </button>
//                                 </div>
//                                 <input
//                                     ref={fileInputRef}
//                                     type="file"
//                                     accept="image/*"
//                                     onChange={handleImageUpload}
//                                     className="hidden"
//                                 />
//                                 <div className="ml-6">
//                                     <button
//                                         type="button"
//                                         onClick={() => fileInputRef.current?.click()}
//                                         className="text-sm text-blue-600 hover:text-blue-700"
//                                     >
//                                         Change photo
//                                     </button>
//                                     <p className="text-xs text-gray-500 mt-1">JPG, PNG or GIF. Max 5MB.</p>
//                                 </div>
//                             </div>
//                         </div>
//
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                             {/* Name */}
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                     Full Name
//                                 </label>
//                                 <input
//                                     type="text"
//                                     value={profileData.name}
//                                     onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
//                                     className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
//                                 />
//                             </div>
//
//                             {/* Phone */}
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                     Phone Number
//                                 </label>
//                                 <input
//                                     type="tel"
//                                     value={profileData.phone}
//                                     onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
//                                     placeholder="+1 (555) 000-0000"
//                                     className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
//                                 />
//                             </div>
//
//                             {/* Location */}
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                     Location
//                                 </label>
//                                 <input
//                                     type="text"
//                                     value={profileData.location}
//                                     onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
//                                     placeholder="City, Country"
//                                     className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
//                                 />
//                             </div>
//
//                             {/* Website */}
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                     Website
//                                 </label>
//                                 <input
//                                     type="url"
//                                     value={profileData.website}
//                                     onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
//                                     placeholder="https://yourwebsite.com"
//                                     className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
//                                 />
//                             </div>
//                         </div>
//
//                         {/* Bio */}
//                         <div className="mt-6">
//                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                 Bio
//                             </label>
//                             <textarea
//                                 value={profileData.bio}
//                                 onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
//                                 rows={4}
//                                 placeholder="Tell us about yourself..."
//                                 className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
//                             />
//                         </div>
//
//                         {/* Social Links */}
//                         <div className="mt-6 space-y-4">
//                             <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Social Links</h3>
//
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
//                                         GitHub
//                                     </label>
//                                     <input
//                                         type="url"
//                                         value={profileData.github}
//                                         onChange={(e) => setProfileData({ ...profileData, github: e.target.value })}
//                                         placeholder="https://github.com/username"
//                                         className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
//                                     />
//                                 </div>
//
//                                 <div>
//                                     <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
//                                         LinkedIn
//                                     </label>
//                                     <input
//                                         type="url"
//                                         value={profileData.linkedin}
//                                         onChange={(e) => setProfileData({ ...profileData, linkedin: e.target.value })}
//                                         placeholder="https://linkedin.com/in/username"
//                                         className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
//                                     />
//                                 </div>
//                             </div>
//                         </div>
//
//                         {/* Actions */}
//                         <div className="flex justify-end gap-4 mt-8">
//                             <button
//                                 type="button"
//                                 onClick={() => router.push('/profile')}
//                                 className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
//                                 disabled={loading}
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 type="submit"
//                                 className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
//                                 disabled={loading}
//                             >
//                                 {loading ? (
//                                     <>Saving...</>
//                                 ) : (
//                                     <>
//                                         <Save className="w-4 h-4 mr-2" />
//                                         Save Changes
//                                     </>
//                                 )}
//                             </button>
//                         </div>
//                     </form>
//                 </div>
//             </div>
//         </div>
//     );
// }

