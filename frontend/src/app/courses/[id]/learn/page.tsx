// src/app/courses/[id]/learn/page.tsx - IMPROVED VERSION

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { VideoPlayer } from '../../../../components/VideoPlayer';
import { courseService } from '../../../../lib/services/courseApi';
import { useAuth } from '../../../../contexts/AuthContext';
import {PDFViewer} from "../../../../Components/PDFLoader";
import {certificateService} from "../../../../lib/services/certficateService";


interface Resource {
    _id?: string;
    resourceType: 'video' | 'pdf' | 'link';
    url: string;
    filename?: string;
    mimeType?: string;
    size?: number;
}

interface Module {
    title: string;
    description?: string;
    resources: Resource[];
    quizzes?: string[];
    notesEnabled?: boolean;
}

interface Course {
    _id: string;
    title: string;
    description: string;
    instructorId: {
        _id: string;
        name: string;
        email: string;
    };
    modules: Module[];
    studentsEnrolled: string[];
    certificateAvailable: boolean;
}

interface Note {
    id: string;
    moduleIndex: number;
    content: string;
    timestamp: Date | string;  // <-- Change from just string to Date | string
    resourceId?: string;
}

interface CourseProgress {
    completedResources: string[];
    currentModule: number;
    currentResource: number;
    overallProgress: number;
}

function cn(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(' ');
}

export default function CourseLearnPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const courseId = params.id as string;

    // Course State
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Navigation State
    const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
    const [currentResourceIndex, setCurrentResourceIndex] = useState(0);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const [certificateGenerating, setCertificateGenerating] = useState(false);
    const [certificateId, setCertificateId] = useState<string | null>(null);

    // Progress State
    const [progress, setProgress] = useState<CourseProgress>({
        completedResources: [],
        currentModule: 0,
        currentResource: 0,
        overallProgress: 0
    });

    // Notes State
    const [notes, setNotes] = useState<Note[]>([]);
    const [showNotes, setShowNotes] = useState(false);
    const [currentNote, setCurrentNote] = useState('');
    const [notesSaving, setNotesSaving] = useState(false);

    // Resource State
    const [resourceError, setResourceError] = useState<string | null>(null);

    useEffect(() => {
        fetchCourseDetails();
    }, [courseId]);

    useEffect(() => {
        if (course) {
            loadProgress();
            loadNotes();
        }
    }, [course]);

    useEffect(() => {
        if (getOverallProgress() === 100 && course?.certificateAvailable && !certificateId) {
            generateCertificate();
        }
    }, [progress.overallProgress]);

    const generateCertificate = async () => {
        if (certificateGenerating || certificateId) return;
        setCertificateGenerating(true);
        try {
            const result = await certificateService.generateCertificate(courseId);
            setCertificateId(result.certificateId);
            alert('Certificate generated successfully!');
        } catch (error) {
            console.error('Failed to generate certificate:', error);
        } finally {
            setCertificateGenerating(false);
        }
    };
    const downloadCertificate = async () => {
        if (!certificateId) return;
        await certificateService.downloadCertificate(certificateId);
    };

    const fetchCourseDetails = async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await courseService.getCourse(courseId);
            setCourse(data);

            // Check enrollment
            if (user?.role === 'student') {
                const enrolled = data.studentsEnrolled.includes(user.id || user._id);
                setIsEnrolled(enrolled);

                if (!enrolled) {
                    router.push(`/courses/${courseId}`);
                    return;
                }
            } else if (user?.role === 'instructor') {
                setIsEnrolled(data.instructorId._id === (user.id || user._id));
            }
        } catch (error) {
            console.error('Error fetching course:', error);
            setError('Failed to load course. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const loadProgress = async () => {
        try {
            const savedProgress = await courseService.getProgress(courseId);
            if (savedProgress) {
                setProgress({
                    completedResources: savedProgress.completedResources,
                    currentModule: savedProgress.currentModule,
                    currentResource: savedProgress.currentResource,
                    overallProgress: savedProgress.overallProgress
                });
                setCurrentModuleIndex(savedProgress.currentModule);
                setCurrentResourceIndex(savedProgress.currentResource);
            }
        } catch (error) {
            console.error('Error loading progress:', error);
            // Fallback to localStorage
            const localProgress = localStorage.getItem(`course-progress-${courseId}`);
            if (localProgress) {
                const parsed = JSON.parse(localProgress);
                setProgress({
                    completedResources: parsed.completed || [],
                    currentModule: parsed.currentModule || 0,
                    currentResource: parsed.currentResource || 0,
                    overallProgress: 0
                });
                setCurrentModuleIndex(parsed.currentModule || 0);
                setCurrentResourceIndex(parsed.currentResource || 0);
            }
        }
    };

    const saveProgress = useCallback(async (newProgress: Partial<CourseProgress>) => {
        const updatedProgress = { ...progress, ...newProgress };
        setProgress(updatedProgress);

        try {
            await courseService.saveProgress({
                courseId,
                ...updatedProgress,
                lastAccessed: undefined
            });
        } catch (error) {
            console.error('Error saving progress:', error);
        }
    }, [courseId, progress]);

    // Then update the loadNotes function:
    const loadNotes = async () => {
        try {
            const courseNotes = await courseService.getNotes(courseId);
// Convert Date to string if needed for consistency
            const formattedNotes = courseNotes.map(note => ({
                ...note,
                timestamp: note.timestamp instanceof Date
                    ? note.timestamp.toISOString()
                    : note.timestamp
            }));
            setNotes(formattedNotes);
        } catch (error) {
            console.error('Error loading notes:', error);
        }
    };

    const markAsComplete = useCallback(async () => {
        if (!course) return;

        const resourceId = `${currentModuleIndex}-${currentResourceIndex}`;
        const newCompleted = [...progress.completedResources];

        if (!newCompleted.includes(resourceId)) {
            newCompleted.push(resourceId);

            // Calculate overall progress
            const totalResources = course.modules.reduce((sum, module) => sum + module.resources.length, 0);
            const overallProgress = Math.round((newCompleted.length / totalResources) * 100);

            await saveProgress({
                completedResources: newCompleted,
                overallProgress
            });
        }
    }, [course, currentModuleIndex, currentResourceIndex, progress.completedResources, saveProgress]);

    const navigateToResource = async (moduleIndex: number, resourceIndex: number) => {
        setCurrentModuleIndex(moduleIndex);
        setCurrentResourceIndex(resourceIndex);
        setResourceError(null);

        await saveProgress({
            currentModule: moduleIndex,
            currentResource: resourceIndex
        });
    };

    const goToNext = () => {
        if (!course) return;

        const currentModule = course.modules[currentModuleIndex];
        if (currentResourceIndex < currentModule.resources.length - 1) {
            navigateToResource(currentModuleIndex, currentResourceIndex + 1);
        } else if (currentModuleIndex < course.modules.length - 1) {
            navigateToResource(currentModuleIndex + 1, 0);
        }
    };

    const goToPrevious = () => {
        if (currentResourceIndex > 0) {
            navigateToResource(currentModuleIndex, currentResourceIndex - 1);
        } else if (currentModuleIndex > 0) {
            const prevModule = course!.modules[currentModuleIndex - 1];
            navigateToResource(currentModuleIndex - 1, prevModule.resources.length - 1);
        }
    };

    const getCurrentResource = () => {
        if (!course) return null;
        return course.modules[currentModuleIndex]?.resources[currentResourceIndex];
    };

    // Update the addNote function:
    const addNote = async () => {
        if (!currentNote.trim()) return;
        setNotesSaving(true);
        try {
            const newNote = await courseService.saveNote({
                courseId,
                moduleIndex: currentModuleIndex,
                content: currentNote.trim(),
                timestamp: new Date(),
                resourceId: `${currentModuleIndex}-${currentResourceIndex}`
            });

            // Ensure timestamp is string
            const formattedNote = {
                ...newNote,
                timestamp: newNote.timestamp instanceof Date
                    ? newNote.timestamp.toISOString()
                    : newNote.timestamp
            };

            setNotes(prevNotes => [...prevNotes, formattedNote]);
            setCurrentNote('');
        } catch (error) {
            console.error('Error saving note:', error);
            alert('Failed to save note. Please try again.');
        } finally {
            setNotesSaving(false);
        }
    };

    const deleteNote = async (noteId: string) => {
        try {
            await courseService.deleteNote(noteId, courseId);
            setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
        } catch (error) {
            console.error('Error deleting note:', error);
            alert('Failed to delete note. Please try again.');
        }
    };

    const getOverallProgress = () => {
        return progress.overallProgress;
    };

    const isResourceCompleted = (moduleIndex: number, resourceIndex: number) => {
        return progress.completedResources.includes(`${moduleIndex}-${resourceIndex}`);
    };

    const getResourceUrl = (resource: Resource): string => {
        if (!resource.url) return '';

        // If it's already a full URL, return it
        if (resource.url.startsWith('http')) {
            return resource.url;
        }

        // If it's a relative path, prepend the backend URL
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3555';
        return `${baseUrl}/${resource.url}`;
    };

    if (loading) {
        return (
            <div className="learn-loadingContainer">
                <div className="learn-loader" />
                <p>Loading course content...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="learn-errorContainer">
                <h2>Error Loading Course</h2>
                <p>{error}</p>
                <button onClick={fetchCourseDetails} className="learn-retryButton">
                    Try Again
                </button>
                <Link href={`/courses/${courseId}`} className="learn-backButton">
                    Back to Course Details
                </Link>
            </div>
        );
    }

    if (!course || !isEnrolled) {
        return (
            <div className="learn-errorContainer">
                <h2>Access Denied</h2>
                <p>You need to be enrolled in this course to access the content.</p>
                <Link href={`/courses/${courseId}`} className="learn-backButton">
                    Back to Course Details
                </Link>
            </div>
        );
    }

    const currentResource = getCurrentResource();
    const currentModule = course.modules[currentModuleIndex];

    return (
        <div className="learn-container">
            {/* Top Bar */}
            <div className="learn-topBar">
                <button className="learn-menuButton" onClick={() => setSidebarOpen(!sidebarOpen)}>
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                <div className="learn-courseTitle">
                    <Link href={`/courses/${courseId}`}>{course.title}</Link>
                </div>

                <div className="learn-progressIndicator">
                    <div className="learn-progressText">{getOverallProgress()}% Complete</div>
                    <div className="learn-progressBar">
                        <div className="learn-progressFill" style={{ width: `${getOverallProgress()}%` }} />
                    </div>
                </div>

                <button className="learn-notesButton" onClick={() => setShowNotes(!showNotes)}>
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                    </svg>
                    <span>Notes ({notes.length})</span>
                </button>
            </div>

            <div className="learn-mainContent">
                {/* Sidebar */}
                <aside className={cn('learn-sidebar', !sidebarOpen && 'learn-sidebarClosed')}>
                    <div className="learn-sidebarContent">
                        <h3 className="learn-sidebarTitle">Course Content</h3>

                        <div className="learn-modulesList">
                            {course.modules.map((module, moduleIndex) => (
                                <div key={moduleIndex} className="learn-moduleItem">
                                    <div className="learn-moduleHeader">
                                        <span className="learn-moduleNumber">Module {moduleIndex + 1}</span>
                                        <h4 className="learn-moduleName">{module.title}</h4>
                                    </div>

                                    <div className="learn-resourcesList">
                                        {module.resources.map((resource, resourceIndex) => (
                                            <button
                                                key={resourceIndex}
                                                className={cn(
                                                    'learn-resourceItem',
                                                    currentModuleIndex === moduleIndex &&
                                                    currentResourceIndex === resourceIndex &&
                                                    'learn-resourceActive',
                                                    isResourceCompleted(moduleIndex, resourceIndex) && 'learn-resourceCompleted'
                                                )}
                                                onClick={() => navigateToResource(moduleIndex, resourceIndex)}
                                            >
                                                <div className="learn-resourceIcon">
                                                    {resource.resourceType === 'video' && (
                                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                                                            />
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                            />
                                                        </svg>
                                                    )}
                                                    {resource.resourceType === 'pdf' && (
                                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                            />
                                                        </svg>
                                                    )}
                                                    {resource.resourceType === 'link' && (
                                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                                                            />
                                                        </svg>
                                                    )}
                                                </div>
                                                <span className="learn-resourceName">
                                                {resource.filename || `${resource.resourceType} ${resourceIndex + 1}`}
                                            </span>
                                                {isResourceCompleted(moduleIndex, resourceIndex) && (
                                                    <svg className="learn-checkIcon" fill="currentColor" viewBox="0 0 20 20">
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                        />
                                                    </svg>
                                                )}
                                            </button>
                                        ))}

                                        {module.quizzes && module.quizzes.length > 0 && (
                                            <Link
                                                href={`/courses/${courseId}/quiz/${module.quizzes[0]}`}
                                                className="learn-quizLink"
                                            >
                                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                                                    />
                                                </svg>
                                                <span>Take Quiz</span>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Content Area */}
                <div className="learn-contentArea">
                    {currentResource && (
                        <>
                            {/* Resource Header */}
                            <div className="learn-resourceHeader">
                                <div className="learn-breadcrumb">
                                    <span>Module {currentModuleIndex + 1}</span>
                                    <span>/</span>
                                    <span>{currentModule.title}</span>
                                </div>
                                <h2 className="learn-resourceTitle">
                                    {currentResource.filename || `${currentResource.resourceType} Content`}
                                </h2>
                            </div>

                            {/* Resource Content */}
                            <div className="learn-resourceContent">
                                {resourceError && (
                                    <div className="learn-resourceError">
                                        <p>{resourceError}</p>
                                        <button onClick={() => setResourceError(null)}>Retry</button>
                                    </div>
                                )}

                                {currentResource.resourceType === 'video' && (
                                    <VideoPlayer
                                        src={getResourceUrl(currentResource)}
                                        title={currentResource.filename}
                                        onProgress={(currentTime, duration) => {
                                            // Auto-complete at 90%
                                            if (duration > 0 && currentTime / duration > 0.9) {
                                                markAsComplete();
                                            }
                                        }}
                                        onComplete={markAsComplete}
                                        className="learn-videoPlayer"
                                    />
                                )}

                                {currentResource.resourceType === 'pdf' && (
                                    <div className="learn-pdfContainer">
                                        <iframe
                                            src={`${getResourceUrl(currentResource)}#toolbar=0`}
                                            className="learn-pdfViewer"
                                            title="PDF Viewer"
                                            onLoad={() => setResourceError(null)}
                                            onError={() => setResourceError('Failed to load PDF. Please check your internet connection.')}
                                        />
                                        <div className="learn-pdfActions">
                                            <a href={getResourceUrl(currentResource)} download className="learn-downloadButton">
                                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                    />
                                                </svg>
                                                Download PDF
                                            </a>
                                            <button onClick={markAsComplete} className="learn-markCompleteButton">
                                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    />
                                                </svg>
                                                Mark as Complete
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {currentResource.resourceType === 'link' && (
                                    <div className="learn-linkContainer">
                                        <div className="learn-linkCard">
                                            <svg className="learn-linkIcon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                                                />
                                            </svg>
                                            <h3>External Resource</h3>
                                            <p>This resource will open in a new tab</p>

                                            href={currentResource.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="learn-openLinkButton"
                                            onClick={() => setTimeout(markAsComplete, 1000)}
                                            >
                                            Open Resource
                                        </a>
                                    </div>
                                    </div>
                                    )}
                            </div>


                            <div className="learn-navigationControls">
                                <button
                                    className="learn-navButton"
                                    onClick={goToPrevious}
                                    disabled={currentModuleIndex === 0 && currentResourceIndex === 0}
                                >
                                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Previous
                                </button>

                                <button
                                    className={cn(
                                        'learn-completeButton',
                                        isResourceCompleted(currentModuleIndex, currentResourceIndex) && 'completed'
                                    )}
                                    onClick={markAsComplete}
                                >
                                    {isResourceCompleted(currentModuleIndex, currentResourceIndex) ? (
                                        <>
                                            <svg fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                />
                                            </svg>
                                            Completed
                                        </>
                                    ) : (
                                        <>
                                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                            Mark as Complete
                                        </>
                                    )}
                                </button>

                                <button
                                    className="learn-navButton"
                                    onClick={goToNext}
                                    disabled={
                                        currentModuleIndex === course.modules.length - 1 &&
                                        currentResourceIndex === course.modules[currentModuleIndex].resources.length - 1
                                    }
                                >
                                    Next
                                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>


                            {currentModule.notesEnabled !== false && (
                            <div className="learn-quickNote">
                                <h3>Add a Note</h3>
                                <div className="learn-noteInput">
                                    <textarea
                                        value={currentNote}
                                        onChange={(e) => setCurrentNote(e.target.value)}
                                        placeholder="Take notes about this lesson..."
                                        rows={3}
                                        disabled={notesSaving}
                                    />
                                    <button
                                        onClick={addNote}
                                        disabled={!currentNote.trim() || notesSaving}
                                    >
                                        {notesSaving ? (
                                            <>
                                                <div className="learn-spinner" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                                Add Note
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                            )}
                        </>
                    )}

                    {/* Certificate Section - FIXED */}
                    {getOverallProgress() === 100 && course.certificateAvailable && (
                        <div className="learn-certificateSection">
                            <div className="learn-certificateCard">
                                <svg className="learn-certificateIcon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                                    />
                                </svg>
                                <h2>Congratulations!</h2>
                                <p>You've completed this course</p>
                                {certificateGenerating ? (
                                    <button className="learn-certificateButton" disabled>
                                        Generating Certificate...
                                    </button>
                                ) : certificateId ? (
                                    <button className="learn-certificateButton" onClick={downloadCertificate}>
                                        Download Certificate
                                    </button>
                                ) : (
                                    <button className="learn-certificateButton" onClick={generateCertificate}>
                                        Generate Certificate
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Notes Panel */}
                {showNotes && (
                    <div className="learn-notesPanel">
                        <div className="learn-notesPanelHeader">
                            <h3>Your Notes</h3>
                            <button onClick={() => setShowNotes(false)}>
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="learn-notesList">
                            {notes.length === 0 ? (
                                <p className="learn-noNotes">No notes yet. Start taking notes to see them here!</p>
                            ) : (
                                notes.map((note) => (
                                    <div key={note.id} className="learn-noteItem">
                                        <div className="learn-noteHeader">
                                            <span className="learn-noteModule">Module {note.moduleIndex + 1}</span>
                                            <span className="learn-noteTime">
                                            {new Date(note.timestamp).toLocaleDateString()}
                                        </span>
                                        </div>
                                        <p className="learn-noteContent">{note.content}</p>
                                        <button className="learn-deleteNote" onClick={() => deleteNote(note.id)}>
                                            Delete
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
       // </div>
);}
