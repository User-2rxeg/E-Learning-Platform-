// src/app/courses/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {courseService} from "../../../services/courseApi";


export default function CourseDetailPage() {
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const [error, setError] = useState('');
    const [activeModule, setActiveModule] = useState(0);
    const params = useParams();
    const router = useRouter();

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                // Convert params.id to string regardless of whether it's a string or array
                const courseId = Array.isArray(params.id) ? params.id[0] : params.id;

                const data = await courseService.getCourse(courseId);
                setCourse(data);
            } catch (error) {
                console.error('Failed to fetch course:', error);
                setError('Failed to load course details');
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [params.id]);

    const handleEnroll = async () => {
        setEnrolling(true);
        try {
            // Convert params.id to string regardless of whether it's a string or array
            const courseId = Array.isArray(params.id) ? params.id[0] : params.id;

            const data = await courseService.getCourse(courseId);
            // Show success message
            alert('Successfully enrolled in the course!');
            // Redirect to dashboard or refresh
            router.push('/dashboard/my-courses');
        } catch (error) {
            console.error('Failed to enroll:', error);
            setError('Failed to enroll in the course');
        } finally {
            setEnrolling(false);
        }
    };

    if (loading) return <div className="flex justify-center p-10">Loading course details...</div>;
    if (error) return <div className="text-red-500 text-center p-10">{error}</div>;
    if (!course) return <div className="text-center p-10">Course not found</div>;

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Course Header */}
                <div className="bg-gradient-to-r from-blue-800 to-blue-600 p-8 text-white">
                    <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
                    <p className="mb-4">{course.description}</p>
                    <div className="flex items-center mb-4">
                        <span className="mr-2">Created by:</span>
                        <span className="font-medium">{course.instructorId?.name || 'Unknown Instructor'}</span>
                    </div>

                    <button
                        onClick={handleEnroll}
                        disabled={enrolling}
                        className={`px-6 py-2 bg-white text-blue-700 rounded font-medium hover:bg-blue-50 ${
                            enrolling ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                    >
                        {enrolling ? 'Processing...' : 'Enroll in Course'}
                    </button>
                </div>

                {/* Course Content */}
                <div className="p-6">
                    <h2 className="text-xl font-bold mb-4">Course Content</h2>

                    {course.modules?.length > 0 ? (
                        <div className="flex flex-col md:flex-row gap-6">
                            {/* Module List */}
                            <div className="w-full md:w-1/3 bg-gray-50 rounded-lg p-4">
                                <h3 className="font-medium text-lg mb-3">Modules</h3>
                                <div className="space-y-2">
                                    {course.modules.map((module, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setActiveModule(index)}
                                            className={`w-full text-left p-3 rounded ${
                                                activeModule === index
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'hover:bg-gray-100'
                                            }`}
                                        >
                                            <p className="font-medium">{module.title}</p>
                                            <p className="text-sm text-gray-500">
                                                {module.resources?.length || 0} resources
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Module Content */}
                            <div className="w-full md:w-2/3">
                                {course.modules[activeModule] && (
                                    <div>
                                        <h3 className="text-xl font-semibold mb-4">
                                            {course.modules[activeModule].title}
                                        </h3>

                                        {course.modules[activeModule].resources?.length > 0 ? (
                                            <div className="space-y-3">
                                                {course.modules[activeModule].resources.map((resource, idx) => (
                                                    <div key={idx} className="border p-4 rounded-lg">
                                                        <div className="flex items-center">
                              <span className="mr-2">
                                {resource.resourceType === 'video' && '🎥'}
                                  {resource.resourceType === 'pdf' && '📄'}
                                  {resource.resourceType === 'link' && '🔗'}
                              </span>
                                                            <a
                                                                href={resource.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:underline"
                                                            >
                                                                {resource.filename || 'View Resource'}
                                                            </a>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500">No resources available in this module.</p>
                                        )}

                                        {course.modules[activeModule].notesEnabled && (
                                            <div className="mt-6">
                                                <h4 className="font-medium mb-2">Quick Notes</h4>
                                                <textarea
                                                    className="w-full border rounded p-2"
                                                    rows={4}
                                                    placeholder="Take notes for this module..."
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500">This course doesn't have any content yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
}