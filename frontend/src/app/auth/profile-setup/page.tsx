'use client';

import {useState, useEffect, JSX} from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import authApi from '../../../lib/services/authApi';

export default function ProfileSetup() {
    const { user, token, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [profileData, setProfileData] = useState<any>({});
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/auth/login');
        }

        if (user && token) {
            authApi.getProfile(token).then((data) => {
                setProfileData(data);
            }).catch(() => {
                setError('Failed to load profile data.');
            });
        }
    }, [isLoading, isAuthenticated, user, token, router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProfileData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleMultiSelectChange = (name: string, value: string) => {
        setProfileData((prev) => {
            const currentValues = prev[name] || [];
            return {
                ...prev,
                [name]: currentValues.includes(value)
                    ? currentValues.filter((item) => item !== value)
                    : [...currentValues, value],
            };
        });
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};
        if (!profileData.bio) errors.bio = 'Bio is required.';
        if (!profileData.learningPreferences?.length) errors.learningPreferences = 'Learning preferences are required.';
        if (!profileData.subjectsOfInterest?.length) errors.subjectsOfInterest = 'Subjects of interest are required.';
        if (user.role === 'instructor' && !profileData.expertise?.length) {
            errors.expertise = 'Expertise is required.';
        }
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        if (!validateForm()) {
            setSaving(false);
            return;
        }

        try {
            await authApi.updateUser(user.id, profileData);
            router.push(`/dashboard/${user.role}`);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save profile information.');
        } finally {
            setSaving(false);
        }
    };

    const renderRoleSpecificFields = () => {
        if (!user || !user.role) {
            return null;
        }

        const roleFields: Record<string, JSX.Element> = {
            student: (
                <>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                            Learning Preferences
                        </label>
                        <div className="space-y-2">
                            {['visual', 'auditory', 'kinesthetic', 'reading-writing'].map((preference) => (
                                <div key={preference} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id={`learningPreferences-${preference}`}
                                        name="learningPreferences"
                                        value={preference}
                                        checked={profileData.learningPreferences?.includes(preference) || false}
                                        onChange={(e) => handleMultiSelectChange('learningPreferences', e.target.value)}
                                        className="mr-2"
                                    />
                                    <label
                                        htmlFor={`learningPreferences-${preference}`}
                                        className="text-blue-500"
                                    >
                                        {preference.charAt(0).toUpperCase() + preference.slice(1).replace('-', ' ')}
                                    </label>
                                </div>
                            ))}
                        </div>
                        {validationErrors.learningPreferences && (
                            <p className="text-red-500 text-sm mt-1">{validationErrors.learningPreferences}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                            Subjects of Interest
                        </label>
                        <div className="space-y-2">
                            {['IT Security', 'Data Science', 'Software Engineering', 'Media Informatics', 'Business', 'Machine Learning'].map((subject) => (
                                <div key={subject} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id={`subjectsOfInterest-${subject}`}
                                        name="subjectsOfInterest"
                                        value={subject}
                                        checked={profileData.subjectsOfInterest?.includes(subject) || false}
                                        onChange={(e) => handleMultiSelectChange('subjectsOfInterest', e.target.value)}
                                        className="mr-2"
                                    />
                                    <label
                                        htmlFor={`subjectsOfInterest-${subject}`}
                                        className="text-blue-500"
                                    >
                                        {subject.charAt(0).toUpperCase() + subject.slice(1)}
                                    </label>
                                </div>
                            ))}
                            <div className="flex items-center mt-2">
                                <input
                                    type="text"
                                    id="customSubject"
                                    name="customSubject"
                                    placeholder="Add your own subject"
                                    value={profileData.customSubject || ''}
                                    onChange={handleInputChange}
                                    className="w-full p-2 bg-primary border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent"
                                />
                            </div>
                        </div>
                        {validationErrors.subjectsOfInterest && (
                            <p className="text-red-500 text-sm mt-1">{validationErrors.subjectsOfInterest}</p>
                        )}
                    </div>
                </>
            ),
            instructor: (
                <>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">
                            Areas of Expertise
                        </label>
                        <div className="space-y-2">
                            {['IT Security', 'Data Science', 'Software Engineering', 'Media Informatics', 'Business', 'Machine Learning'].map((expertise) => (
                                <div key={expertise} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id={`expertise-${expertise}`}
                                        name="expertise"
                                        value={expertise}
                                        checked={profileData.expertise?.includes(expertise) || false}
                                        onChange={(e) => handleMultiSelectChange('expertise', e.target.value)}
                                        className="mr-2"
                                    />
                                    <label
                                        htmlFor={`expertise-${expertise}`}
                                        className="text-blue-500"
                                    >
                                        {expertise.charAt(0).toUpperCase() + expertise.slice(1)}
                                    </label>
                                </div>
                            ))}
                            <div className="flex items-center mt-2">
                                <input
                                    type="text"
                                    id="customExpertise"
                                    name="customExpertise"
                                    placeholder="Add your own expertise"
                                    value={profileData.customExpertise || ''}
                                    onChange={handleInputChange}
                                    className="w-full p-2 bg-primary border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent"
                                />
                            </div>
                        </div>
                        {validationErrors.expertise && (
                            <p className="text-red-500 text-sm mt-1">{validationErrors.expertise}</p>
                        )}
                    </div>
                </>
            ),
        };

        return roleFields[user.role] || null;
    };
    return (
        <div className="max-w-2xl mx-auto my-12 p-8 bg-primary-light rounded-lg shadow-lg">
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
                        value={profileData.bio || ''}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full p-3 bg-primary border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="Tell us about yourself"
                    />
                    {validationErrors.bio && (
                        <p className="text-red-500 text-sm mt-1">{validationErrors.bio}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="profileImage" className="block text-sm font-medium text-text-secondary mb-1">
                        Profile Image URL (Optional)
                    </label>
                    <input
                        type="text"
                        id="profileImage"
                        name="profileImage"
                        value={profileData.profileImage || ''}
                        onChange={handleInputChange}
                        className="w-full p-3 bg-primary border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="Enter your profile image URL"
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