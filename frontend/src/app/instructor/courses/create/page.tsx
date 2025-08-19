"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {useAuth} from "../../../../contexts/AuthContext";


export default function CreateCourse() {
    const router = useRouter();
    const { token, user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [course, setCourse] = useState({
        title: '',
        description: '',
        tags: '',
        difficulty: 'beginner',
        status: 'draft'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCourse(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Convert tags string to array and validate
            const tagsArray = course.tags.split(',').map(tag => tag.trim()).filter(Boolean);

            const formattedCourse = {
                ...course,
                tags: tagsArray
            };

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/courses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formattedCourse)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create course');
            }

            setSuccess('Course created successfully!');

            // Redirect to instructor dashboard after a short delay
            setTimeout(() => {
                router.push('/dashboard/instructor');
            }, 1500);

        } catch (error: any) {
            console.error('Error creating course:', error);
            setError(error.message || 'Failed to create course. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Redirect if not instructor
    if (user && user.role !== 'instructor') {
        router.push('/dashboard');
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-white mb-2">Create New Course</h1>
                <p className="text-text-secondary">Fill in the details below to create your course</p>
            </div>

            {/* Success Message */}
            {success && (
                <div className="bg-green-500 bg-opacity-20 border border-green-500 text-green-400 px-4 py-2 rounded-md mb-6">
                    {success}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-500 px-4 py-2 rounded-md mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-primary-light p-6 rounded-lg shadow-lg space-y-6">
                {/* Course Title */}
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-text-secondary mb-1">
                        Course Title *
                    </label>
                    <input
                        id="title"
                        name="title"
                        type="text"
                        value={course.title}
                        onChange={handleChange}
                        required
                        className="w-full p-3 bg-primary border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent placeholder-gray-400"
                        placeholder="Enter course title"
                    />
                </div>

                {/* Course Description */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-text-secondary mb-1">
                        Description *
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={course.description}
                        onChange={handleChange}
                        required
                        rows={4}
                        className="w-full p-3 bg-primary border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent placeholder-gray-400 resize-vertical"
                        placeholder="Describe what students will learn in this course..."
                    />
                </div>

                {/* Tags */}
                <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-text-secondary mb-1">
                        Tags
                    </label>
                    <input
                        id="tags"
                        name="tags"
                        type="text"
                        value={course.tags}
                        onChange={handleChange}
                        className="w-full p-3 bg-primary border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent placeholder-gray-400"
                        placeholder="javascript, web development, programming (comma separated)"
                    />
                    <p className="text-xs text-text-secondary mt-1">Separate tags with commas</p>
                </div>

                {/* Difficulty Level */}
                <div>
                    <label htmlFor="difficulty" className="block text-sm font-medium text-text-secondary mb-1">
                        Difficulty Level
                    </label>
                    <select
                        id="difficulty"
                        name="difficulty"
                        value={course.difficulty}
                        onChange={handleChange}
                        className="w-full p-3 bg-primary border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                    </select>
                </div>

                {/* Status */}
                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-text-secondary mb-1">
                        Publication Status
                    </label>
                    <select
                        id="status"
                        name="status"
                        value={course.status}
                        onChange={handleChange}
                        className="w-full p-3 bg-primary border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                        <option value="draft">Draft (not visible to students)</option>
                        <option value="published">Published (visible to students)</option>
                    </select>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="flex-1 py-3 px-4 border border-gray-600 text-text-secondary font-medium rounded-md hover:bg-primary hover:text-white transition-colors"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !course.title.trim() || !course.description.trim()}
                        className="flex-1 py-3 px-4 bg-accent hover:bg-accent-hover text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'Creating Course...' : 'Create Course'}
                    </button>
                </div>
            </form>

            {/* Help Text */}
            <div className="mt-6 p-4 bg-primary-light rounded-md">
                <h3 className="text-white font-medium mb-2">Next Steps:</h3>
                <ul className="text-text-secondary text-sm space-y-1">
                    <li>• After creating, you can add modules and content</li>
                    <li>• Draft courses are only visible to you</li>
                    <li>• Publish when ready for student enrollment</li>
                </ul>
            </div>
        </div>
    );
}