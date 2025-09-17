// src/app/dashboard/instructor/create-course/page.tsx - ENHANCED VERSION WITH FILE UPLOAD

'use client';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../../contexts/AuthContext';
import { courseService } from '../../../../../lib/services/courseApi';
import { quizService } from '../../../../../lib/services/quizApi';



import {
    ArrowLeft,
    Plus,
    X,
    Upload,
    Video,
    FileText,
    Link2,
    Save,
    Eye,
    Settings,
    BookOpen,
    Clock,
    DollarSign,
    Users,
    Award,
    AlertCircle,
    CheckCircle,
    Trash2,
    ExternalLink, HelpCircle, Edit
} from 'lucide-react';
import {QuizData} from "../../../../../Components/QuizCreater";

interface Resource {
    _id?: string;
    resourceType: 'video' | 'pdf' | 'link';
    url: string;
    filename?: string;
    mimeType?: string;
    size?: number;
    uploading?: boolean;
    uploadProgress?: number;
}

interface Module {
    title: string;
    description: string;
    resources: Resource[];
    quizzes: any[];
    notesEnabled: boolean;
}

export default function CreateCoursePage() {
    const router = useRouter();
    const { user } = useAuth();
    const [activeStep, setActiveStep] = useState(0);
    const [saving, setSaving] = useState(false);

    // Course data
    const [courseData, setCourseData] = useState({
        title: '',
        description: '',
        tags: [] as string[],
        status: 'draft' as 'draft' | 'active',
        modules: [] as Module[],
        certificateAvailable: false,
        price: 0,
        duration: '',
        level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
        prerequisites: [] as string[],
        learningObjectives: [] as string[],
    });

    const [currentTag, setCurrentTag] = useState('');
    const [currentPrerequisite, setCurrentPrerequisite] = useState('');
    const [currentObjective, setCurrentObjective] = useState('');
    const [currentModule, setCurrentModule] = useState<Module>({
        title: '',
        description: '',
        resources: [],
        quizzes: [],
        notesEnabled: true,
    });

    const [showQuizCreator, setShowQuizCreator] = useState(false);
    const [editingQuizModuleIndex, setEditingQuizModuleIndex] = useState<number | null>(null);
    const [moduleQuizzes, setModuleQuizzes] = useState<Record<number, any[]>>({});

    // Resource upload states
    const [showResourceModal, setShowResourceModal] = useState(false);
    const [editingModuleIndex, setEditingModuleIndex] = useState<number | null>(null);
    const [currentResourceType, setCurrentResourceType] = useState<'video' | 'pdf' | 'link'>('video');
    const [linkUrl, setLinkUrl] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);

    const steps = [
        { title: 'Basic Info', icon: BookOpen },
        { title: 'Course Details', icon: Settings },
        { title: 'Modules & Content', icon: FileText },
        { title: 'Review & Publish', icon: Eye },
    ];

    // Existing handlers...
    const handleAddTag = () => {
        if (currentTag && !courseData.tags.includes(currentTag)) {
            setCourseData({ ...courseData, tags: [...courseData.tags, currentTag] });
            setCurrentTag('');
        }
    };

    const handleRemoveTag = (tag: string) => {
        setCourseData({ ...courseData, tags: courseData.tags.filter(t => t !== tag) });
    };

    const handleAddPrerequisite = () => {
        if (currentPrerequisite) {
            setCourseData({
                ...courseData,
                prerequisites: [...courseData.prerequisites, currentPrerequisite]
            });
            setCurrentPrerequisite('');
        }
    };

    const handleAddObjective = () => {
        if (currentObjective) {
            setCourseData({
                ...courseData,
                learningObjectives: [...courseData.learningObjectives, currentObjective]
            });
            setCurrentObjective('');
        }
    };

    const handleAddModule = async () => {
        if (currentModule.title) {
            try {
                setSaving(true);

                // First create/save the course if it doesn't exist
                let courseId = (courseData as any)._id;

                if (!courseId) {
                    const coursePayload = {
                        ...courseData,
                        instructorId: user?.id || user?._id,
                        status: 'draft',
                        modules: [...courseData.modules, currentModule]
                    };
                    const createdCourse = await courseService.createCourse(coursePayload);
                    courseId = createdCourse._id;
                    setCourseData({ ...courseData, ...(createdCourse as any) });
                } else {
                    // Add module to existing course
                    await courseService.addModule(courseId, currentModule);
                    setCourseData({
                        ...courseData,
                        modules: [...courseData.modules, currentModule],
                    });
                }

                setCurrentModule({
                    title: '',
                    description: '',
                    resources: [],
                    quizzes: [],
                    notesEnabled: true,
                });
            } catch (error) {
                console.error('Error adding module:', error);
                alert('Failed to add module. Please try again.');
            } finally {
                setSaving(false);
            }
        }
    };

    // File upload handlers
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validate file type
            const validTypes = {
                video: ['video/mp4', 'video/webm', 'video/quicktime'],
                pdf: ['application/pdf']
            };

            const isValidType = currentResourceType === 'video'
                ? validTypes.video.includes(file.type)
                : validTypes.pdf.includes(file.type);

            if (!isValidType) {
                alert(`Please select a valid ${currentResourceType} file.`);
                return;
            }

            // Check file size (50MB limit)
            if (file.size > 50 * 1024 * 1024) {
                alert('File size must be less than 50MB.');
                return;
            }

            setSelectedFile(file);
        }
    };

    const uploadResource = async () => {
        if (!selectedFile && currentResourceType !== 'link') return;
        if (currentResourceType === 'link' && !linkUrl) return;
        if (editingModuleIndex === null) return;

        const courseId = (courseData as any)._id;
        if (!courseId) {
            alert('Please save the course first by adding a module.');
            return;
        }

        try {
            setIsUploading(true);
            setUploadProgress(0);

            let newResource: Resource;

            if (currentResourceType === 'link') {
                // Add link resource
                const result = await courseService.addLinkResource(courseId, editingModuleIndex, linkUrl);
                newResource = {
                    _id: result.resource.id,
                    resourceType: 'link',
                    url: linkUrl,
                    filename: new URL(linkUrl).hostname
                };
            } else if (selectedFile) {
                // Upload file resource
                const result = await courseService.uploadCourseResource(courseId, editingModuleIndex, selectedFile);
                newResource = {
                    _id: result.resource.id,
                    resourceType: currentResourceType,
                    url: result.resource.url,
                    filename: selectedFile.name,
                    mimeType: selectedFile.type,
                    size: selectedFile.size
                };
            } else {
                return;
            }

            // Update local state
            const updatedModules = [...courseData.modules];
            updatedModules[editingModuleIndex].resources.push(newResource);
            setCourseData({ ...courseData, modules: updatedModules });

            // Reset form
            setSelectedFile(null);
            setLinkUrl('');
            setShowResourceModal(false);

        } catch (error) {
            console.error('Error uploading resource:', error);
            alert('Failed to upload resource. Please try again.');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const deleteResource = async (moduleIndex: number, resourceIndex: number) => {
        const courseId = (courseData as any)._id;
        const resource = courseData.modules[moduleIndex].resources[resourceIndex];

        if (!courseId || !resource._id) return;

        try {
            await courseService.deleteResource(courseId, moduleIndex, resource._id);

            // Update local state
            const updatedModules = [...courseData.modules];
            updatedModules[moduleIndex].resources.splice(resourceIndex, 1);
            setCourseData({ ...courseData, modules: updatedModules });
        } catch (error) {
            console.error('Error deleting resource:', error);
            alert('Failed to delete resource.');
        }
    };

    const openResourceModal = (moduleIndex: number) => {
        setEditingModuleIndex(moduleIndex);
        setShowResourceModal(true);
        setCurrentResourceType('video');
        setSelectedFile(null);
        setLinkUrl('');
    };

    const handleSaveDraft = async () => {
        setSaving(true);
        try {
            const courseId = (courseData as any)._id;
            if (courseId) {
                await courseService.updateCourse(courseId, { ...courseData, status: 'draft' });
            } else {
                const coursePayload = {
                    ...courseData,
                    instructorId: user?.id || user?._id,
                    status: 'draft',
                };
                await courseService.createCourse(coursePayload);
            }
            router.push('/dashboard/instructor');
        } catch (error) {
            console.error('Error saving course:', error);
            alert('Failed to save course. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handlePublish = async () => {
        setSaving(true);
        try {
            const courseId = (courseData as any)._id;
            if (courseId) {
                await courseService.updateCourse(courseId, { ...courseData, status: 'active' });
            } else {
                const coursePayload = {
                    ...courseData,
                    instructorId: user?.id || user?._id,
                    status: 'active',
                };
                await courseService.createCourse(coursePayload);
            }
            router.push('/dashboard/instructor');
        } catch (error) {
            console.error('Error publishing course:', error);
            alert('Failed to publish course. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const isStepValid = () => {
        switch (activeStep) {
            case 0:
                return courseData.title && courseData.description;
            case 1:
                return courseData.tags.length > 0 && courseData.duration;
            case 2:
                return courseData.modules.length > 0 && courseData.modules.some(m => m.resources.length > 0);
            case 3:
                return true;
            default:
                return false;
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };


    const handleCreateQuiz = async (moduleIndex: number) => {
        const courseId = (courseData as any)._id;
        if (!courseId) {
            alert('Please save the course first by adding content to this module.');
            return;
        }

        setEditingQuizModuleIndex(moduleIndex);
        setShowQuizCreator(true);
    };

    const handleSaveQuiz = async (quizData: QuizData) => {
        try {
            const courseId = (courseData as any)._id;

            // Create the quiz
            const createdQuiz = await quizService.createQuiz({
                title: quizData.title,
                moduleId: courseId, // Your backend uses courseId as moduleId
                questions: quizData.questions,
                adaptive: quizData.adaptive,
                timeLimit: quizData.timeLimit,
                passingScore: quizData.passingScore
            });

            // Update local state to show the quiz in the module
            if (editingQuizModuleIndex !== null) {
                const updatedModules = [...courseData.modules];
                if (!updatedModules[editingQuizModuleIndex].quizzes) {
                    updatedModules[editingQuizModuleIndex].quizzes = [];
                }
                updatedModules[editingQuizModuleIndex].quizzes.push(createdQuiz._id);

                setCourseData({ ...courseData, modules: updatedModules });

                // Store quiz data for display
                setModuleQuizzes(prev => ({
                    ...prev,
                    [editingQuizModuleIndex]: [...(prev[editingQuizModuleIndex] || []), createdQuiz]
                }));
            }

            setShowQuizCreator(false);
            setEditingQuizModuleIndex(null);

        } catch (error) {
            throw error; // Let QuizCreator handle the error display
        }
    };
    const loadModuleQuizzes = async (moduleIndex: number) => {
        const courseId = (courseData as any)._id;
        if (!courseId) return;

        try {
            const quizzes = await quizService.getQuizzesByModule(courseId);
            setModuleQuizzes(prev => ({
                ...prev,
                [moduleIndex]: quizzes
            }));
        } catch (error) {
            console.error('Error loading module quizzes:', error);
        }
    };


    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <button
                                onClick={() => router.back()}
                                className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <h1 className="text-xl font-semibold text-gray-900">
                                Create New Course
                            </h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleSaveDraft}
                                disabled={saving}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                            >
                                <Save className="w-4 h-4 mr-2 inline" />
                                {saving ? 'Saving...' : 'Save Draft'}
                            </button>
                            {activeStep === 3 && (
                                <button
                                    onClick={handlePublish}
                                    disabled={saving || !isStepValid()}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {saving ? 'Publishing...' : 'Publish Course'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => (
                            <div key={index} className="flex-1 relative">
                                <div className="flex items-center">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                            index <= activeStep
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200 text-gray-400'
                                        }`}
                                    >
                                        <step.icon className="w-5 h-5" />
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div
                                            className={`flex-1 h-1 mx-2 ${
                                                index < activeStep ? 'bg-blue-600' : 'bg-gray-200'
                                            }`}
                                        />
                                    )}
                                </div>
                                <p className="text-xs mt-2 text-gray-600">{step.title}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step Content */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    {/* Steps 0 and 1 remain the same as your original code */}
                    {activeStep === 0 && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Basic Information
                            </h2>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Course Title *
                                </label>
                                <input
                                    type="text"
                                    value={courseData.title}
                                    onChange={(e) =>
                                        setCourseData({ ...courseData, title: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="e.g., Complete React Developer Course"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Course Description *
                                </label>
                                <textarea
                                    value={courseData.description}
                                    onChange={(e) =>
                                        setCourseData({ ...courseData, description: e.target.value })
                                    }
                                    rows={6}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Describe what students will learn in this course..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Course Level
                                </label>
                                <select
                                    value={courseData.level}
                                    onChange={(e) =>
                                        setCourseData({
                                            ...courseData,
                                            level: e.target.value as any,
                                        })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {activeStep === 1 && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Course Details
                            </h2>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tags (Add at least one)
                                </label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={currentTag}
                                        onChange={(e) => setCurrentTag(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                                        placeholder="e.g., React, JavaScript, Web Development"
                                    />
                                    <button
                                        onClick={handleAddTag}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {courseData.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center"
                                        >
                      {tag}
                                            <button
                                                onClick={() => handleRemoveTag(tag)}
                                                className="ml-2 hover:text-blue-900"
                                            >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Duration *
                                    </label>
                                    <input
                                        type="text"
                                        value={courseData.duration}
                                        onChange={(e) =>
                                            setCourseData({ ...courseData, duration: e.target.value })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        placeholder="e.g., 8 weeks"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Price ($)
                                    </label>
                                    <input
                                        type="number"
                                        value={courseData.price}
                                        onChange={(e) =>
                                            setCourseData({
                                                ...courseData,
                                                price: Number(e.target.value),
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        placeholder="49.99"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Prerequisites
                                </label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={currentPrerequisite}
                                        onChange={(e) => setCurrentPrerequisite(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddPrerequisite()}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                                        placeholder="e.g., Basic JavaScript knowledge"
                                    />
                                    <button
                                        onClick={handleAddPrerequisite}
                                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                    >
                                        Add
                                    </button>
                                </div>
                                <ul className="space-y-1">
                                    {courseData.prerequisites.map((prereq, index) => (
                                        <li key={index} className="flex items-center text-sm text-gray-600">
                                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                            {prereq}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Learning Objectives
                                </label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={currentObjective}
                                        onChange={(e) => setCurrentObjective(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddObjective()}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                                        placeholder="What will students achieve?"
                                    />
                                    <button
                                        onClick={handleAddObjective}
                                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                    >
                                        Add
                                    </button>
                                </div>
                                <ul className="space-y-1">
                                    {courseData.learningObjectives.map((objective, index) => (
                                        <li key={index} className="flex items-center text-sm text-gray-600">
                                            <Award className="w-4 h-4 text-yellow-500 mr-2" />
                                            {objective}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="certificate"
                                    checked={courseData.certificateAvailable}
                                    onChange={(e) =>
                                        setCourseData({
                                            ...courseData,
                                            certificateAvailable: e.target.checked,
                                        })
                                    }
                                    className="mr-2"
                                />
                                <label htmlFor="certificate" className="text-sm text-gray-700">
                                    Offer certificate of completion
                                </label>
                            </div>
                        </div>
                    )}

                    {/* ENHANCED STEP 2 - Modules & Content */}
                    {activeStep === 2 && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-gray-900">Modules & Content</h2>

                            <div className="border border-gray-200 rounded-lg p-4">
                                <h3 className="font-medium text-gray-900 mb-4">Add New Module</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Module Title
                                        </label>
                                        <input
                                            type="text"
                                            value={currentModule.title}
                                            onChange={(e) =>
                                                setCurrentModule({ ...currentModule, title: e.target.value })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                            placeholder="e.g., Introduction to React"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Module Description
                                        </label>
                                        <textarea
                                            value={currentModule.description}
                                            onChange={(e) =>
                                                setCurrentModule({
                                                    ...currentModule,
                                                    description: e.target.value,
                                                })
                                            }
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                            placeholder="Brief description of what this module covers..."
                                        />
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="notes"
                                            checked={currentModule.notesEnabled}
                                            onChange={(e) =>
                                                setCurrentModule({
                                                    ...currentModule,
                                                    notesEnabled: e.target.checked,
                                                })
                                            }
                                            className="mr-2"
                                        />
                                        <label htmlFor="notes" className="text-sm text-gray-700">
                                            Enable note-taking for this module
                                        </label>
                                    </div>

                                    <button
                                        onClick={handleAddModule}
                                        disabled={saving}
                                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center disabled:opacity-50"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        {saving ? 'Adding Module...' : 'Add Module'}
                                    </button>
                                </div>
                            </div>

                            {/* Enhanced Module Display with Quiz Management */}
                            {courseData.modules.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="font-medium text-gray-900">Course Modules</h3>
                                    {courseData.modules.map((module, moduleIndex) => (
                                        <div
                                            key={moduleIndex}
                                            className="border border-gray-200 rounded-lg p-4"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <h4 className="font-medium text-gray-900">
                                                        Module {moduleIndex + 1}: {module.title}
                                                    </h4>
                                                    {module.description && (
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {module.description}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => openResourceModal(moduleIndex)}
                                                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center"
                                                    >
                                                        <Plus className="w-4 h-4 mr-1" />
                                                        Add Content
                                                    </button>
                                                    <button
                                                        onClick={() => handleCreateQuiz(moduleIndex)}
                                                        className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm flex items-center"
                                                    >
                                                        <HelpCircle className="w-4 h-4 mr-1" />
                                                        Add Quiz
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Module Resources */}
                                            <div className="space-y-3">
                                                <div>
                                                    <h5 className="text-sm font-medium text-gray-700 mb-2">
                                                        Resources ({module.resources.length})
                                                    </h5>
                                                    {module.resources.length === 0 ? (
                                                        <div className="text-sm text-gray-500 italic p-3 border border-dashed border-gray-300 rounded-lg text-center">
                                                            No content added yet. Click "Add Content" to upload
                                                            videos, PDFs, or add links.
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                            {module.resources.map((resource, resourceIndex) => (
                                                                <div
                                                                    key={resourceIndex}
                                                                    className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                                                                >
                                                                    <div className="flex items-center">
                                                                        <div className="mr-3">
                                                                            {resource.resourceType === 'video' && (
                                                                                <Video className="w-5 h-5 text-blue-600" />
                                                                            )}
                                                                            {resource.resourceType === 'pdf' && (
                                                                                <FileText className="w-5 h-5 text-red-600" />
                                                                            )}
                                                                            {resource.resourceType === 'link' && (
                                                                                <ExternalLink className="w-5 h-5 text-green-600" />
                                                                            )}
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-sm font-medium text-gray-900">
                                                                                {resource.filename || 'External Link'}
                                                                            </p>
                                                                            <p className="text-xs text-gray-500">
                                                                                {resource.size
                                                                                    ? formatFileSize(resource.size)
                                                                                    : resource.resourceType}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <button
                                                                        onClick={() =>
                                                                            deleteResource(moduleIndex, resourceIndex)
                                                                        }
                                                                        className="text-red-600 hover:text-red-800 p-1"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Module Quizzes */}
                                                <div>
                                                    <h5 className="text-sm font-medium text-gray-700 mb-2">
                                                        Quizzes ({moduleQuizzes[moduleIndex]?.length || 0})
                                                    </h5>
                                                    {!moduleQuizzes[moduleIndex] ||
                                                    moduleQuizzes[moduleIndex].length === 0 ? (
                                                        <div className="text-sm text-gray-500 italic p-3 border border-dashed border-gray-300 rounded-lg text-center">
                                                            No quizzes added yet. Click "Add Quiz" to create
                                                            assessments for this module.
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            {moduleQuizzes[moduleIndex].map((quiz, quizIndex) => (
                                                                <div
                                                                    key={quiz._id}
                                                                    className="bg-purple-50 border border-purple-200 p-3 rounded-lg"
                                                                >
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center">
                                                                            <HelpCircle className="w-5 h-5 text-purple-600 mr-3" />
                                                                            <div>
                                                                                <p className="text-sm font-medium text-gray-900">
                                                                                    {quiz.title || `Quiz ${quizIndex + 1}`}
                                                                                </p>
                                                                                <p className="text-xs text-gray-500">
                                                                                    {quiz.questions?.length || 0} questions
                                                                                    {quiz.adaptive && ' • Adaptive'}
                                                                                    {quiz.timeLimit &&
                                                                                        ` • ${Math.round(quiz.timeLimit / 60)} min`}
                                                                                    {quiz.passingScore &&
                                                                                        ` • ${quiz.passingScore}% to pass`}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <button
                                                                                onClick={() => {
                                                                                    // Handle edit quiz - implement later
                                                                                    console.log('Edit quiz:', quiz._id);
                                                                                }}
                                                                                className="text-purple-600 hover:text-purple-800 p-1"
                                                                                title="Edit Quiz"
                                                                            >
                                                                                <Edit className="w-4 h-4" />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => {
                                                                                    // Preview quiz
                                                                                    window.open(
                                                                                        `/courses/${(courseData as any)._id}/quiz/${quiz._id}`,
                                                                                        '_blank',
                                                                                    );
                                                                                }}
                                                                                className="text-blue-600 hover:text-blue-800 p-1"
                                                                                title="Preview Quiz"
                                                                            >
                                                                                <Eye className="w-4 h-4" />
                                                                            </button>
                                                                            <button
                                                                                onClick={async () => {
                                                                                    if (
                                                                                        confirm(
                                                                                            'Are you sure you want to delete this quiz?',
                                                                                        )
                                                                                    ) {
                                                                                        try {
                                                                                            await quizService.deleteQuiz(quiz._id);
                                                                                            // Update local state
                                                                                            setModuleQuizzes((prev) => ({
                                                                                                ...prev,
                                                                                                [moduleIndex]: prev[moduleIndex].filter(
                                                                                                    (q) => q._id !== quiz._id,
                                                                                                ),
                                                                                            }));
                                                                                        } catch (error) {
                                                                                            console.error('Error deleting quiz:', error);
                                                                                            alert('Failed to delete quiz');
                                                                                        }
                                                                                    }
                                                                                }}
                                                                                className="text-red-600 hover:text-red-800 p-1"
                                                                                title="Delete Quiz"
                                                                            >
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Module Summary */}
                                            <div className="mt-4 pt-3 border-t border-gray-200">
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <FileText className="w-4 h-4 mr-1" />
                              {module.resources.length} resources
                          </span>
                                                    <span className="flex items-center">
                            <HelpCircle className="w-4 h-4 mr-1" />
                                                        {moduleQuizzes[moduleIndex]?.length || 0} quizzes
                          </span>
                                                    {module.notesEnabled && (
                                                        <span className="flex items-center">
                              <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                              Notes enabled
                            </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div> // ✅ close inner container
                            )}          // ✅ close conditional block
                        </div>
                    )}

                    {/* STEP 3 - Review & Publish */}
                    {activeStep === 3 && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-gray-900">Review & Publish</h2>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start">
                                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                                    <div>
                                        <p className="text-sm text-blue-800">
                                            Please review your course details before publishing. Once published,
                                            students can enroll immediately.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Validation Messages */}
                            {courseData.modules.length === 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-start">
                                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
                                        <div>
                                            <p className="text-sm text-red-800">
                                                Your course needs at least one module with content before it can
                                                be published.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {courseData.modules.some((m) => m.resources.length === 0) && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <div className="flex items-start">
                                        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                                        <div>
                                            <p className="text-sm text-yellow-800">
                                                Some modules don't have any content. Consider adding videos,
                                                documents, or links.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <h3 className="font-medium text-gray-900 mb-3">Course Summary</h3>
                                    <dl className="space-y-2">
                                        <div className="flex justify-between">
                                            <dt className="text-sm text-gray-600">Title:</dt>
                                            <dd className="text-sm font-medium text-gray-900">
                                                {courseData.title}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-sm text-gray-600">Level:</dt>
                                            <dd className="text-sm font-medium text-gray-900 capitalize">
                                                {courseData.level}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-sm text-gray-600">Duration:</dt>
                                            <dd className="text-sm font-medium text-gray-900">
                                                {courseData.duration}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-sm text-gray-600">Price:</dt>
                                            <dd className="text-sm font-medium text-gray-900">
                                                ${courseData.price || 'Free'}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-sm text-gray-600">Modules:</dt>
                                            <dd className="text-sm font-medium text-gray-900">
                                                {courseData.modules.length}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-sm text-gray-600">Total Resources:</dt>
                                            <dd className="text-sm font-medium text-gray-900">
                                                {courseData.modules.reduce(
                                                    (sum, m) => sum + m.resources.length,
                                                    0,
                                                )}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-sm text-gray-600">Certificate:</dt>
                                            <dd className="text-sm font-medium text-gray-900">
                                                {courseData.certificateAvailable ? 'Yes' : 'No'}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>

                                <div className="border border-gray-200 rounded-lg p-4">
                                    <h3 className="font-medium text-gray-900 mb-3">Tags</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {courseData.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                                            >
                        {tag}
                      </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Module Review */}
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <h3 className="font-medium text-gray-900 mb-3">Course Content</h3>
                                    <div className="space-y-3">
                                        {courseData.modules.map((module, index) => (
                                            <div key={index} className="bg-gray-50 p-3 rounded-lg">
                                                <h4 className="font-medium text-sm text-gray-900">
                                                    Module {index + 1}: {module.title}
                                                </h4>
                                                <div className="mt-2 flex items-center gap-4 text-xs text-gray-600">
                          <span className="flex items-center">
                            <Video className="w-3 h-3 mr-1" />
                              {
                                  module.resources.filter(
                                      (r) => r.resourceType === 'video',
                                  ).length
                              }{' '}
                              videos
                          </span>
                                                    <span className="flex items-center">
                            <FileText className="w-3 h-3 mr-1" />
                                                        {
                                                            module.resources.filter(
                                                                (r) => r.resourceType === 'pdf',
                                                            ).length
                                                        }{' '}
                                                        documents
                          </span>
                                                    <span className="flex items-center">
                            <ExternalLink className="w-3 h-3 mr-1" />
                                                        {
                                                            module.resources.filter(
                                                                (r) => r.resourceType === 'link',
                                                            ).length
                                                        }{' '}
                                                        links
                          </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {courseData.prerequisites.length > 0 && (
                                    <div className="border border-gray-200 rounded-lg p-4">
                                        <h3 className="font-medium text-gray-900 mb-3">Prerequisites</h3>
                                        <ul className="space-y-1">
                                            {courseData.prerequisites.map((prereq, index) => (
                                                <li
                                                    key={index}
                                                    className="flex items-center text-sm text-gray-600"
                                                >
                                                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                                    {prereq}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {courseData.learningObjectives.length > 0 && (
                                    <div className="border border-gray-200 rounded-lg p-4">
                                        <h3 className="font-medium text-gray-900 mb-3">Learning Objectives</h3>
                                        <ul className="space-y-1">
                                            {courseData.learningObjectives.map((objective, index) => (
                                                <li
                                                    key={index}
                                                    className="flex items-center text-sm text-gray-600"
                                                >
                                                    <Award className="w-4 h-4 text-yellow-500 mr-2" />
                                                    {objective}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-6">
                    <button
                        onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                        disabled={activeStep === 0}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                        Previous
                    </button>

                    {activeStep < 3 ? (
                        <button
                            onClick={() => setActiveStep(Math.min(3, activeStep + 1))}
                            disabled={!isStepValid()}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            onClick={handlePublish}
                            disabled={saving || !isStepValid()}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
                        >
                            {saving ? (
                                <>Publishing...</>
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Publish Course
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Resource Upload Modal */}
            {showResourceModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Add Content</h3>
                            <button
                                onClick={() => setShowResourceModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Content Type Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Content Type
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    <button
                                        onClick={() => setCurrentResourceType('video')}
                                        className={`p-3 border rounded-lg text-center ${
                                            currentResourceType === 'video'
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-gray-300 text-gray-700'
                                        }`}
                                    >
                                        <Video className="w-6 h-6 mx-auto mb-2" />
                                        <div className="text-xs">Video</div>
                                    </button>
                                    <button
                                        onClick={() => setCurrentResourceType('pdf')}
                                        className={`p-3 border rounded-lg text-center ${
                                            currentResourceType === 'pdf'
                                                ? 'border-red-500 bg-red-50 text-red-700'
                                                : 'border-gray-300 text-gray-700'
                                        }`}
                                    >
                                        <FileText className="w-6 h-6 mx-auto mb-2" />
                                        <div className="text-xs">PDF</div>
                                    </button>
                                    <button
                                        onClick={() => setCurrentResourceType('link')}
                                        className={`p-3 border rounded-lg text-center ${
                                            currentResourceType === 'link'
                                                ? 'border-green-500 bg-green-50 text-green-700'
                                                : 'border-gray-300 text-gray-700'
                                        }`}
                                    >
                                        <Link2 className="w-6 h-6 mx-auto mb-2" />
                                        <div className="text-xs">Link</div>
                                    </button>
                                </div>
                            </div>

                            {/* File Upload for Video/PDF */}
                            {currentResourceType !== 'link' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Upload {currentResourceType === 'video' ? 'Video' : 'PDF'} File
                                    </label>
                                    <input
                                        type="file"
                                        accept={currentResourceType === 'video' ? 'video/*' : '.pdf'}
                                        onChange={handleFileSelect}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                    {selectedFile && (
                                        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center">
                                                <div className="mr-3">
                                                    {currentResourceType === 'video' ? (
                                                        <Video className="w-5 h-5 text-blue-600" />
                                                    ) : (
                                                        <FileText className="w-5 h-5 text-red-600" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {selectedFile.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {formatFileSize(selectedFile.size)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* URL Input for Link */}
                            {currentResourceType === 'link' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        External Link URL
                                    </label>
                                    <input
                                        type="url"
                                        value={linkUrl}
                                        onChange={(e) => setLinkUrl(e.target.value)}
                                        placeholder="https://example.com"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                            )}

                            {/* Upload Progress */}
                            {isUploading && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Uploading...</span>
                                        <span>{Math.round(uploadProgress)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowResourceModal(false)}
                                    disabled={isUploading}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={uploadResource}
                                    disabled={
                                        isUploading ||
                                        (currentResourceType !== 'link' && !selectedFile) ||
                                        (currentResourceType === 'link' && !linkUrl)
                                    }
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                                >
                                    {isUploading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-4 h-4 mr-2" />
                                            Add Content
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}