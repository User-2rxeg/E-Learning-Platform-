// src/app/auth/profile-setup/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import axios from 'axios';

export default function ProfileSetup() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const [profileData, setProfileData] = useState({
        // Common fields
        bio: '',
        phoneNumber: '',

        // Student-specific fields
        learningInterests: [] as string[],
        educationLevel: '',

        // Instructor-specific fields
        expertise: [] as string[],
        yearsOfExperience: '',
        qualifications: '',
    });

    useEffect(() => {
        // Redirect if not authenticated
        if (!isLoading && !isAuthenticated) {
            router.push('/auth/login');
        }
    }, [isLoading, isAuthenticated, router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleMultiSelectChange = (name: string, value: string) => {
        setProfileData(prev => {
            const currentValues = prev[name as keyof typeof prev] as string[];

            if (Array.isArray(currentValues)) {
                if (currentValues.includes(value)) {
                    return {
                        ...prev,
                        [name]: currentValues.filter(item => item !== value)
                    };
                } else {
                    return {
                        ...prev,
                        [name]: [...currentValues, value]
                    };
                }
            }

            return prev;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            await axios.post('/api/users/complete-profile', profileData);
            router.push(`/dashboard/${user?.role}`);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save profile information. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (isLoading || !user) {
        return <div className="max-w-3xl mx-auto my-12 p-8 bg-primary-light rounded-lg shadow-lg">Loading...</div>;
    }

    // Different fields based on user role
    const renderRoleSpecificFields = () => {
        if (user.role === 'student') {
            return (
                <>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                            Learning Interests
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {['Programming', 'Data Science', 'Web Development', 'Mobile Development',
                                'Cloud Computing', 'Artificial Intelligence', 'Design', 'Business'].map(interest => (
                                <div key={interest} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id={`interest-${interest}`}
                                        checked={profileData.learningInterests.includes(interest)}
                                        onChange={() => handleMultiSelectChange('learningInterests', interest)}
                                        className="mr-2"
                                    />
                                    <label htmlFor={`interest-${interest}`} className="text-white text-sm">
                                        {interest}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="educationLevel" className="block text-sm font-medium text-text-secondary mb-1">
                            Education Level
                        </label>
                        <select
                            id="educationLevel"
                            name="educationLevel"
                            value={profileData.educationLevel}
                            onChange={handleInputChange}
                            className="w-full p-3 bg-primary border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent"
                        >
                            <option value="">Select your education level</option>
                            <option value="high-school">High School</option>
                            <option value="undergraduate">Undergraduate</option>
                            <option value="graduate">Graduate</option>
                            <option value="postgraduate">Postgraduate</option>
                            <option value="professional">Professional</option>
                        </select>
                    </div>
                </>
            );
        } else if (user.role === 'instructor') {
            return (
                <>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                            Areas of Expertise
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {['Programming', 'Data Science', 'Web Development', 'Mobile Development',
                                'Cloud Computing', 'Artificial Intelligence', 'Design', 'Business'].map(expertise => (
                                <div key={expertise} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id={`expertise-${expertise}`}
                                        checked={profileData.expertise.includes(expertise)}
                                        onChange={() => handleMultiSelectChange('expertise', expertise)}
                                        className="mr-2"
                                    />
                                    <label htmlFor={`expertise-${expertise}`} className="text-white text-sm">
                                        {expertise}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-text-secondary mb-1">
                            Years of Experience
                        </label>
                        <input
                            type="number"
                            id="yearsOfExperience"
                            name="yearsOfExperience"
                            value={profileData.yearsOfExperience}
                            onChange={handleInputChange}
                            min="0"
                            className="w-full p-3 bg-primary border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                    </div>

                    <div>
                        <label htmlFor="qualifications" className="block text-sm font-medium text-text-secondary mb-1">
                            Qualifications & Certifications
                        </label>
                        <textarea
                            id="qualifications"
                            name="qualifications"
                            value={profileData.qualifications}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full p-3 bg-primary border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                    </div>
                </>
            );
        }

        return null; // Admin has no special profile fields
    };

    return (
        <div className="max-w-3xl mx-auto my-12 p-8 bg-primary-light rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold text-white mb-6 text-center">Complete Your Profile</h1>

            {error && (
                <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-500 px-4 py-2 rounded-md mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-text-secondary mb-1">
                        Bio
                    </label>
                    <textarea
                        id="bio"
                        name="bio"
                        value={profileData.bio}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full p-3 bg-primary border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="Tell us about yourself"
                    />
                </div>

                <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-text-secondary mb-1">
                        Phone Number (Optional)
                    </label>
                    <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={profileData.phoneNumber}
                        onChange={handleInputChange}
                        className="w-full p-3 bg-primary border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="Your phone number"
                    />
                </div>

                {renderRoleSpecificFields()}

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full py-3 px-4 bg-accent hover:bg-accent-hover text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Complete Profile'}
                    </button>
                </div>
            </form>
        </div>
    );
}