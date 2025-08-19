// src/app/instructor/courses/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {courseService} from "../../../../../services/courseApi";


export default function EditCoursePage() {
    const [course, setCourse] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        tags: [''],
        status: 'draft',
        certificateAvailable: false
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const params = useParams();
    const router = useRouter();
    const courseId = Array.isArray(params.id) ? params.id[0] : params.id;

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const data = await courseService.getCourse(courseId);
                setCourse(data);
                setFormData({
                    title: data.title || '',
                    description: data.description || '',
                    tags: data.tags?.length > 0 ? [...data.tags] : [''],
                    status: data.status || 'draft',
                    certificateAvailable: data.certificateAvailable || false
                });
            } catch (error) {
                console.error('Failed to fetch course:', error);
                setError('Failed to load course details');
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [courseId]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleTagChange = (index, value) => {
        const updatedTags = [...formData.tags];
        updatedTags[index] = value;
        setFormData(prev => ({
            ...prev,
            tags: updatedTags
        }));
    };

    const addTag = () => {
        setFormData(prev => ({
            ...prev,
            tags: [...prev.tags, '']
        }));
    };

    const removeTag = (index) => {
        const updatedTags = [...formData.tags];
        updatedTags.splice(index, 1);
        setFormData(prev => ({
            ...prev,
            tags: updatedTags
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            // Filter out empty tags
            const filteredTags = formData.tags.filter(tag => tag.trim() !== '');

            const courseData = {
                ...formData,
                tags: filteredTags,
            };

            await courseService.updateCourse(courseId, courseData);
            router.push('/instructor/courses');
        } catch (err) {
            console.error('Failed to update course:', err);
            setError('Failed to update course. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center p-10">Loading course details...</div>;
    if (error) return <div className="text-red-500 text-center p-10">{error}</div>;
    if (!course) return <div className="text-center p-10">Course not found</div>;

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Edit Course: {course.title}</h1>
                <div className="flex space-x-2">
                    <button
                        onClick={() => router.push(`/instructor/courses/${courseId}/modules`)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Manage Modules
                    </button>
                    <button
                        onClick={() => router.push('/instructor/courses')}
                        className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                    >
                        Back to Courses
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
                <div className="mb-4">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        Course Title *
                    </label>
                    <input
                        id="title"
                        name="title"
                        type="text"
                        required
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Course Description *
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        required
                        rows={5}
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tags
                    </label>
                    {formData.tags.map((tag, index) => (
                        <div key={index} className="flex mb-2">
                            <input
                                type="text"
                                value={tag}
                                onChange={(e) => handleTagChange(index, e.target.value)}
                                placeholder="Enter tag (e.g., 'programming', 'design')"
                                className="flex-grow p-2 border rounded"
                            />
                            {formData.tags.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeTag(index)}
                                    className="ml-2 px-3 bg-red-100 text-red-600 rounded"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addTag}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                        + Add Another Tag
                    </button>
                </div>

                <div className="mb-4">
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                    </label>
                    <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                    >
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                        <option value="archived">Archived</option>
                    </select>
                </div>

                <div className="mb-4">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            name="certificateAvailable"
                            checked={formData.certificateAvailable}
                            onChange={handleChange}
                            className="mr-2"
                        />
                        <span className="text-sm font-medium text-gray-700">
              Certificate Available upon Completion
            </span>
                    </label>
                </div>

                <div className="flex justify-end mt-6">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="mr-2 px-4 py-2 border rounded"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className={`px-4 py-2 bg-blue-600 text-white rounded ${
                            saving ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
                        }`}
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}