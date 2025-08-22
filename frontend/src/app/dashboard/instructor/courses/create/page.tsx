// src/app/dashboard/instructor/courses/create/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import styles from './courseBuilder.module.css';

interface Module {
    id: string;
    title: string;
    description: string;
    resources: Resource[];
    quiz?: Quiz;
    order: number;
}

interface Resource {
    id: string;
    type: 'video' | 'pdf' | 'link';
    title: string;
    url?: string;
    file?: File;
    duration?: string;
}

interface Quiz {
    id: string;
    title: string;
    questions: Question[];
    isAdaptive: boolean;
    passingScore: number;
}

interface Question {
    id: string;
    questionText: string;
    choices: string[];
    correctAnswer: string;
    difficulty: 'easy' | 'medium' | 'hard';
    explanation?: string;
}

interface CourseData {
    title: string;
    description: string;
    thumbnail?: File | string;
    tags: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    duration: string;
    prerequisites: string[];
    learningObjectives: string[];
    status: 'draft' | 'published';
    modules: Module[];
}

const initialCourseData: CourseData = {
    title: '',
    description: '',
    tags: [],
    difficulty: 'beginner',
    duration: '',
    prerequisites: [],
    learningObjectives: [],
    status: 'draft',
    modules: []
};

export default function CourseBuilderPage() {
    const router = useRouter();
    const { user, token } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [courseData, setCourseData] = useState<CourseData>(initialCourseData);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [draggedModule, setDraggedModule] = useState<string | null>(null);
    const [expandedModules, setExpandedModules] = useState<string[]>([]);
    const [showQuizBuilder, setShowQuizBuilder] = useState<string | null>(null);
    const [currentTag, setCurrentTag] = useState('');
    const [currentPrerequisite, setCurrentPrerequisite] = useState('');
    const [currentObjective, setCurrentObjective] = useState('');
    const [thumbnailPreview, setThumbnailPreview] = useState<string>('');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const resourceFileRef = useRef<HTMLInputElement>(null);

    const steps = [
        { number: 1, title: 'Basic Information', icon: '📝' },
        { number: 2, title: 'Course Content', icon: '📚' },
        { number: 3, title: 'Resources & Quizzes', icon: '📁' },
        { number: 4, title: 'Review & Publish', icon: '🚀' }
    ];

    useEffect(() => {
        // Auto-save draft every 30 seconds
        const autoSaveInterval = setInterval(() => {
            if (courseData.title) {
                saveDraft();
            }
        }, 30000);

        return () => clearInterval(autoSaveInterval);
    }, [courseData]);

    const saveDraft = () => {
        localStorage.setItem('course-draft', JSON.stringify(courseData));
        // Show toast notification
    };

    const loadDraft = () => {
        const draft = localStorage.getItem('course-draft');
        if (draft) {
            setCourseData(JSON.parse(draft));
        }
    };

    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {};

        switch (step) {
            case 1:
                if (!courseData.title) newErrors.title = 'Course title is required';
                if (!courseData.description) newErrors.description = 'Description is required';
                if (courseData.tags.length === 0) newErrors.tags = 'Add at least one tag';
                if (!courseData.duration) newErrors.duration = 'Duration is required';
                break;
            case 2:
                if (courseData.modules.length === 0) newErrors.modules = 'Add at least one module';
                courseData.modules.forEach((module, index) => {
                    if (!module.title) newErrors[`module-${index}`] = 'Module title is required';
                });
                break;
            case 3:
                courseData.modules.forEach((module, index) => {
                    if (module.resources.length === 0 && !module.quiz) {
                        newErrors[`module-resources-${index}`] = 'Add at least one resource or quiz';
                    }
                });
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(currentStep + 1);
            saveDraft();
        }
    };

    const handlePreviousStep = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCourseData({ ...courseData, thumbnail: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setThumbnailPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const addModule = () => {
        const newModule: Module = {
            id: Date.now().toString(),
            title: '',
            description: '',
            resources: [],
            order: courseData.modules.length
        };
        setCourseData({
            ...courseData,
            modules: [...courseData.modules, newModule]
        });
        setExpandedModules([...expandedModules, newModule.id]);
    };

    const updateModule = (moduleId: string, updates: Partial<Module>) => {
        setCourseData({
            ...courseData,
            modules: courseData.modules.map(m =>
                m.id === moduleId ? { ...m, ...updates } : m
            )
        });
    };

    const deleteModule = (moduleId: string) => {
        setCourseData({
            ...courseData,
            modules: courseData.modules.filter(m => m.id !== moduleId)
        });
    };

    const handleModuleDragStart = (moduleId: string) => {
        setDraggedModule(moduleId);
    };

    const handleModuleDragOver = (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        if (draggedModule && draggedModule !== targetId) {
            const draggedIndex = courseData.modules.findIndex(m => m.id === draggedModule);
            const targetIndex = courseData.modules.findIndex(m => m.id === targetId);

            const newModules = [...courseData.modules];
            const [removed] = newModules.splice(draggedIndex, 1);
            newModules.splice(targetIndex, 0, removed);

            setCourseData({ ...courseData, modules: newModules });
        }
    };

    const handleModuleDragEnd = () => {
        setDraggedModule(null);
    };

    const addResource = (moduleId: string, resource: Resource) => {
        const module = courseData.modules.find(m => m.id === moduleId);
        if (module) {
            updateModule(moduleId, {
                resources: [...module.resources, resource]
            });
        }
    };

    const handleResourceUpload = async (moduleId: string, files: FileList) => {
        const module = courseData.modules.find(m => m.id === moduleId);
        if (!module) return;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const resource: Resource = {
                id: Date.now().toString() + i,
                type: file.type.includes('pdf') ? 'pdf' : 'video',
                title: file.name.replace(/\.[^/.]+$/, ''),
                file: file
            };
            addResource(moduleId, resource);
        }
    };

    const addQuiz = (moduleId: string) => {
        setShowQuizBuilder(moduleId);
    };

    const saveQuiz = (moduleId: string, quiz: Quiz) => {
        updateModule(moduleId, { quiz });
        setShowQuizBuilder(null);
    };

    const handlePublish = async () => {
        if (!validateStep(4)) return;

        setSaving(true);
        try {
            // Create course first
            const formData = new FormData();
            formData.append('title', courseData.title);
            formData.append('description', courseData.description);
            formData.append('tags', JSON.stringify(courseData.tags));
            formData.append('difficulty', courseData.difficulty);
            formData.append('duration', courseData.duration);
            formData.append('prerequisites', JSON.stringify(courseData.prerequisites));
            formData.append('status', courseData.status);

            if (courseData.thumbnail instanceof File) {
                formData.append('thumbnail', courseData.thumbnail);
            }

            // API call to create course
            // const courseResponse = await courseService.createCourse(formData);
            // const courseId = courseResponse.id;

            // Then add modules, resources, and quizzes
            // for (const module of courseData.modules) {
            //   await courseService.addModule(courseId, module);
            //   for (const resource of module.resources) {
            //     if (resource.file) {
            //       await courseService.uploadResource(courseId, module.order, resource.file);
            //     }
            //   }
            //   if (module.quiz) {
            //     await quizService.createQuiz(courseId, module.quiz);
            //   }
            // }

            // Clear draft
            localStorage.removeItem('course-draft');

            // Redirect to course management
            router.push('/dashboard/instructor/courses');
        } catch (error) {
            console.error('Error publishing course:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <button onClick={() => router.back()} className={styles.backButton}>
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>

                <div className={styles.headerTitle}>
                    <h1>Create New Course</h1>
                    <p>Build an engaging learning experience</p>
                </div>

                <div className={styles.headerActions}>
                    <button onClick={saveDraft} className={styles.saveDraftButton}>
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V2" />
                        </svg>
                        Save Draft
                    </button>
                </div>
            </div>

            {/* Progress Steps */}
            <div className={styles.progressContainer}>
                <div className={styles.progressSteps}>
                    {steps.map((step, index) => (
                        <div
                            key={step.number}
                            className={`${styles.step} ${currentStep === step.number ? styles.stepActive : ''} 
                ${currentStep > step.number ? styles.stepCompleted : ''}`}
                        >
                            <div className={styles.stepIcon}>
                                {currentStep > step.number ? '✓' : step.icon}
                            </div>
                            <span className={styles.stepTitle}>{step.title}</span>
                            {index < steps.length - 1 && <div className={styles.stepLine} />}
                        </div>
                    ))}
                </div>
            </div>

            {/* Step Content */}
            <div className={styles.content}>
                {/* Step 1: Basic Information */}
                {currentStep === 1 && (
                    <div className={styles.stepContent}>
                        <div className={styles.formSection}>
                            <h2>Course Information</h2>

                            {/* Thumbnail Upload */}
                            <div className={styles.thumbnailSection}>
                                <label>Course Thumbnail</label>
                                <div className={styles.thumbnailUpload}>
                                    {thumbnailPreview ? (
                                        <div className={styles.thumbnailPreview}>
                                            <img src={thumbnailPreview} alt="Thumbnail" />
                                            <button
                                                onClick={() => {
                                                    setThumbnailPreview('');
                                                    setCourseData({ ...courseData, thumbnail: undefined });
                                                }}
                                                className={styles.removeThumbnail}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className={styles.uploadButton}
                                        >
                                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span>Upload Thumbnail</span>
                                            <small>Recommended: 1280x720px</small>
                                        </button>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleThumbnailUpload}
                                        style={{ display: 'none' }}
                                    />
                                </div>
                            </div>

                            {/* Title */}
                            <div className={styles.formGroup}>
                                <label htmlFor="title">Course Title *</label>
                                <input
                                    id="title"
                                    type="text"
                                    value={courseData.title}
                                    onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                                    placeholder="e.g., Complete Web Development Bootcamp"
                                    className={errors.title ? styles.inputError : ''}
                                />
                                {errors.title && <span className={styles.errorText}>{errors.title}</span>}
                            </div>

                            {/* Description */}
                            <div className={styles.formGroup}>
                                <label htmlFor="description">Description *</label>
                                <textarea
                                    id="description"
                                    value={courseData.description}
                                    onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                                    placeholder="Describe what students will learn in this course..."
                                    rows={4}
                                    className={errors.description ? styles.inputError : ''}
                                />
                                {errors.description && <span className={styles.errorText}>{errors.description}</span>}
                            </div>

                            <div className={styles.formRow}>
                                {/* Difficulty */}
                                <div className={styles.formGroup}>
                                    <label htmlFor="difficulty">Difficulty Level</label>
                                    <select
                                        id="difficulty"
                                        value={courseData.difficulty}
                                        onChange={(e) => setCourseData({
                                            ...courseData,
                                            difficulty: e.target.value as 'beginner' | 'intermediate' | 'advanced'
                                        })}
                                    >
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                    </select>
                                </div>

                                {/* Duration */}
                                <div className={styles.formGroup}>
                                    <label htmlFor="duration">Estimated Duration *</label>
                                    <input
                                        id="duration"
                                        type="text"
                                        value={courseData.duration}
                                        onChange={(e) => setCourseData({ ...courseData, duration: e.target.value })}
                                        placeholder="e.g., 40 hours"
                                        className={errors.duration ? styles.inputError : ''}
                                    />
                                    {errors.duration && <span className={styles.errorText}>{errors.duration}</span>}
                                </div>
                            </div>

                            {/* Tags */}
                            <div className={styles.formGroup}>
                                <label>Tags *</label>
                                <div className={styles.tagInput}>
                                    <input
                                        type="text"
                                        value={currentTag}
                                        onChange={(e) => setCurrentTag(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                if (currentTag.trim()) {
                                                    setCourseData({
                                                        ...courseData,
                                                        tags: [...courseData.tags, currentTag.trim()]
                                                    });
                                                    setCurrentTag('');
                                                }
                                            }
                                        }}
                                        placeholder="Add tags (press Enter)"
                                    />
                                </div>
                                <div className={styles.tags}>
                                    {courseData.tags.map((tag, index) => (
                                        <span key={index} className={styles.tag}>
                      {tag}
                                            <button
                                                onClick={() => setCourseData({
                                                    ...courseData,
                                                    tags: courseData.tags.filter((_, i) => i !== index)
                                                })}
                                            >
                        ×
                      </button>
                    </span>
                                    ))}
                                </div>
                                {errors.tags && <span className={styles.errorText}>{errors.tags}</span>}
                            </div>

                            {/* Prerequisites */}
                            <div className={styles.formGroup}>
                                <label>Prerequisites</label>
                                <div className={styles.listInput}>
                                    <input
                                        type="text"
                                        value={currentPrerequisite}
                                        onChange={(e) => setCurrentPrerequisite(e.target.value)}
                                        placeholder="Add prerequisite"
                                    />
                                    <button
                                        onClick={() => {
                                            if (currentPrerequisite.trim()) {
                                                setCourseData({
                                                    ...courseData,
                                                    prerequisites: [...courseData.prerequisites, currentPrerequisite.trim()]
                                                });
                                                setCurrentPrerequisite('');
                                            }
                                        }}
                                        className={styles.addButton}
                                    >
                                        Add
                                    </button>
                                </div>
                                <ul className={styles.list}>
                                    {courseData.prerequisites.map((prereq, index) => (
                                        <li key={index}>
                                            {prereq}
                                            <button
                                                onClick={() => setCourseData({
                                                    ...courseData,
                                                    prerequisites: courseData.prerequisites.filter((_, i) => i !== index)
                                                })}
                                            >
                                                ×
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Learning Objectives */}
                            <div className={styles.formGroup}>
                                <label>Learning Objectives</label>
                                <div className={styles.listInput}>
                                    <input
                                        type="text"
                                        value={currentObjective}
                                        onChange={(e) => setCurrentObjective(e.target.value)}
                                        placeholder="What will students learn?"
                                    />
                                    <button
                                        onClick={() => {
                                            if (currentObjective.trim()) {
                                                setCourseData({
                                                    ...courseData,
                                                    learningObjectives: [...courseData.learningObjectives, currentObjective.trim()]
                                                });
                                                setCurrentObjective('');
                                            }
                                        }}
                                        className={styles.addButton}
                                    >
                                        Add
                                    </button>
                                </div>
                                <ul className={styles.list}>
                                    {courseData.learningObjectives.map((objective, index) => (
                                        <li key={index}>
                                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {objective}
                                            <button
                                                onClick={() => setCourseData({
                                                    ...courseData,
                                                    learningObjectives: courseData.learningObjectives.filter((_, i) => i !== index)
                                                })}
                                            >
                                                ×
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Course Content (Modules) */}
                {currentStep === 2 && (
                    <div className={styles.stepContent}>
                        <div className={styles.moduleSection}>
                            <div className={styles.sectionHeader}>
                                <h2>Course Modules</h2>
                                <button onClick={addModule} className={styles.addModuleButton}>
                                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add Module
                                </button>
                            </div>

                            {errors.modules && (
                                <div className={styles.errorBox}>{errors.modules}</div>
                            )}

                            <div className={styles.modulesList}>
                                {courseData.modules.length === 0 ? (
                                    <div className={styles.emptyState}>
                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p>No modules yet</p>
                                        <button onClick={addModule}>Add your first module</button>
                                    </div>
                                ) : (
                                    courseData.modules.map((module, index) => (
                                        <div
                                            key={module.id}
                                            className={styles.moduleCard}
                                            draggable
                                            onDragStart={() => handleModuleDragStart(module.id)}
                                            onDragOver={(e) => handleModuleDragOver(e, module.id)}
                                            onDragEnd={handleModuleDragEnd}
                                        >
                                            <div className={styles.moduleHeader}>
                                                <div className={styles.dragHandle}>
                                                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                              d="M4 6h16M4 12h16M4 18h16" />
                                                    </svg>
                                                </div>

                                                <div className={styles.moduleNumber}>Module {index + 1}</div>

                                                <input
                                                    type="text"
                                                    value={module.title}
                                                    onChange={(e) => updateModule(module.id, { title: e.target.value })}
                                                    placeholder="Module title"
                                                    className={`${styles.moduleTitle} ${errors[`module-${index}`] ? styles.inputError : ''}`}
                                                />

                                                <button
                                                    onClick={() => {
                                                        const isExpanded = expandedModules.includes(module.id);
                                                        if (isExpanded) {
                                                            setExpandedModules(expandedModules.filter(id => id !== module.id));
                                                        } else {
                                                            setExpandedModules([...expandedModules, module.id]);
                                                        }
                                                    }}
                                                    className={styles.expandButton}
                                                >
                                                    <svg
                                                        className={expandedModules.includes(module.id) ? styles.rotated : ''}
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </button>

                                                <button
                                                    onClick={() => deleteModule(module.id)}
                                                    className={styles.deleteButton}
                                                >
                                                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>

                                            {expandedModules.includes(module.id) && (
                                                <div className={styles.moduleContent}>
                          <textarea
                              value={module.description}
                              onChange={(e) => updateModule(module.id, { description: e.target.value })}
                              placeholder="Module description (optional)"
                              rows={3}
                          />

                                                    {errors[`module-${index}`] && (
                                                        <span className={styles.errorText}>{errors[`module-${index}`]}</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Resources & Quizzes */}
                {currentStep === 3 && (
                    <div className={styles.stepContent}>
                        <h2>Add Resources & Quizzes</h2>

                        <div className={styles.moduleResourcesList}>
                            {courseData.modules.map((module, moduleIndex) => (
                                <div key={module.id} className={styles.moduleResourceCard}>
                                    <div className={styles.moduleResourceHeader}>
                                        <h3>Module {moduleIndex + 1}: {module.title || 'Untitled'}</h3>
                                        <div className={styles.resourceCount}>
                                            {module.resources.length} resources, {module.quiz ? '1 quiz' : 'no quiz'}
                                        </div>
                                    </div>

                                    {errors[`module-resources-${moduleIndex}`] && (
                                        <div className={styles.errorBox}>
                                            {errors[`module-resources-${moduleIndex}`]}
                                        </div>
                                    )}

                                    <div className={styles.resourcesSection}>
                                        {/* Resources List */}
                                        <div className={styles.resourcesList}>
                                            {module.resources.map((resource, resourceIndex) => (
                                                <div key={resource.id} className={styles.resourceItem}>
                                                    <div className={styles.resourceIcon}>
                                                        {resource.type === 'video' && '🎥'}
                                                        {resource.type === 'pdf' && '📄'}
                                                        {resource.type === 'link' && '🔗'}
                                                    </div>
                                                    <div className={styles.resourceInfo}>
                                                        <input
                                                            type="text"
                                                            value={resource.title}
                                                            onChange={(e) => {
                                                                const updatedResources = [...module.resources];
                                                                updatedResources[resourceIndex].title = e.target.value;
                                                                updateModule(module.id, { resources: updatedResources });
                                                            }}
                                                            placeholder="Resource title"
                                                        />
                                                        {resource.type === 'link' && (
                                                            <input
                                                                type="url"
                                                                value={resource.url || ''}
                                                                onChange={(e) => {
                                                                    const updatedResources = [...module.resources];
                                                                    updatedResources[resourceIndex].url = e.target.value;
                                                                    updateModule(module.id, { resources: updatedResources });
                                                                }}
                                                                placeholder="https://..."
                                                                className={styles.urlInput}
                                                            />
                                                        )}
                                                        {resource.file && (
                                                            <span className={styles.fileName}>{resource.file.name}</span>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            updateModule(module.id, {
                                                                resources: module.resources.filter(r => r.id !== resource.id)
                                                            });
                                                        }}
                                                        className={styles.removeResource}
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Add Resource Buttons */}
                                        <div className={styles.resourceActions}>
                                            <button
                                                onClick={() => resourceFileRef.current?.click()}
                                                className={styles.uploadResourceButton}
                                            >
                                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                                Upload Files
                                            </button>

                                            <input
                                                ref={resourceFileRef}
                                                type="file"
                                                multiple
                                                accept="video/*,application/pdf"
                                                onChange={(e) => {
                                                    if (e.target.files) {
                                                        handleResourceUpload(module.id, e.target.files);
                                                    }
                                                }}
                                                style={{ display: 'none' }}
                                            />