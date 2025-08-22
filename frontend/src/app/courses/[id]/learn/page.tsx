// src/app/courses/[id]/learn/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './learn.module.css';

import {courseService} from "../../../../lib/services/courseApi";
import {useAuth} from "../../../../contexts/AuthContext";

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
    timestamp: string;
    resourceId?: string;
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

    // Navigation State
    const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
    const [currentResourceIndex, setCurrentResourceIndex] = useState(0);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Progress State
    const [completedResources, setCompletedResources] = useState<Set<string>>(new Set());
    const [moduleProgress, setModuleProgress] = useState<Map<number, number>>(new Map());

    // Notes State
    const [notes, setNotes] = useState<Note[]>([]);
    const [showNotes, setShowNotes] = useState(false);
    const [currentNote, setCurrentNote] = useState('');

    // Video State
    const videoRef = useRef<HTMLVideoElement>(null);
    const [videoProgress, setVideoProgress] = useState(0);
    const [videoDuration, setVideoDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        fetchCourseDetails();
        loadProgress();
        loadNotes();
    }, [courseId]);

    const fetchCourseDetails = async () => {
        try {
            const data = await courseService.getCourse(courseId);
            setCourse(data);

            // Check enrollment
            if (user?.role === 'student') {
                const enrolled = data.studentsEnrolled.includes(user.id);
                setIsEnrolled(enrolled);

                if (!enrolled) {
                    router.push(`/courses/${courseId}`);
                    return;
                }
            } else if (user?.role === 'instructor') {
                setIsEnrolled(data.instructorId._id === user.id);
            }
        } catch (error) {
            console.error('Error fetching course:', error);
            router.push('/courses');
        } finally {
            setLoading(false);
        }
    };

    const loadProgress = () => {
        // Load from localStorage or API
        const savedProgress = localStorage.getItem(`course-progress-${courseId}`);
        if (savedProgress) {
            const progress = JSON.parse(savedProgress);
            setCompletedResources(new Set(progress.completed));
            setCurrentModuleIndex(progress.currentModule || 0);
            setCurrentResourceIndex(progress.currentResource || 0);
        }
    };

    const saveProgress = () => {
        const progress = {
            completed: Array.from(completedResources),
            currentModule: currentModuleIndex,
            currentResource: currentResourceIndex,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem(`course-progress-${courseId}`, JSON.stringify(progress));
    };

    const loadNotes = () => {
        const savedNotes = localStorage.getItem(`course-notes-${courseId}`);
        if (savedNotes) {
            setNotes(JSON.parse(savedNotes));
        }
    };

    const saveNotes = (newNotes: Note[]) => {
        setNotes(newNotes);
        localStorage.setItem(`course-notes-${courseId}`, JSON.stringify(newNotes));
    };

    const markAsComplete = () => {
        if (!course) return;

        const currentResource = getCurrentResource();
        if (!currentResource) return;

        const resourceId = `${currentModuleIndex}-${currentResourceIndex}`;
        const newCompleted = new Set(completedResources);
        newCompleted.add(resourceId);
        setCompletedResources(newCompleted);

        // Update module progress
        const moduleResources = course.modules[currentModuleIndex].resources.length;
        const completedInModule = Array.from(newCompleted).filter(
            id => id.startsWith(`${currentModuleIndex}-`)
        ).length;

        const newProgress = new Map(moduleProgress);
        newProgress.set(currentModuleIndex, (completedInModule / moduleResources) * 100);
        setModuleProgress(newProgress);

        saveProgress();
    };

    const navigateToResource = (moduleIndex: number, resourceIndex: number) => {
        setCurrentModuleIndex(moduleIndex);
        setCurrentResourceIndex(resourceIndex);
        saveProgress();
    };

    const goToNext = () => {
        if (!course) return;

        const currentModule = course.modules[currentModuleIndex];
        if (currentResourceIndex < currentModule.resources.length - 1) {
            // Next resource in same module
            navigateToResource(currentModuleIndex, currentResourceIndex + 1);
        } else if (currentModuleIndex < course.modules.length - 1) {
            // First resource of next module
            navigateToResource(currentModuleIndex + 1, 0);
        }
    };

    const goToPrevious = () => {
        if (currentResourceIndex > 0) {
            // Previous resource in same module
            navigateToResource(currentModuleIndex, currentResourceIndex - 1);
        } else if (currentModuleIndex > 0) {
            // Last resource of previous module
            const prevModule = course!.modules[currentModuleIndex - 1];
            navigateToResource(currentModuleIndex - 1, prevModule.resources.length - 1);
        }
    };

    const getCurrentResource = () => {
        if (!course) return null;
        return course.modules[currentModuleIndex]?.resources[currentResourceIndex];
    };

    const addNote = () => {
        if (!currentNote.trim()) return;

        const newNote: Note = {
            id: Date.now().toString(),
            moduleIndex: currentModuleIndex,
            content: currentNote,
            timestamp: new Date().toISOString(),
            resourceId: `${currentModuleIndex}-${currentResourceIndex}`
        };

        const updatedNotes = [...notes, newNote];
        saveNotes(updatedNotes);
        setCurrentNote('');
    };

    const deleteNote = (noteId: string) => {
        const updatedNotes = notes.filter(note => note.id !== noteId);
        saveNotes(updatedNotes);
    };

    const getOverallProgress = () => {
        if (!course) return 0;

        const totalResources = course.modules.reduce(
            (sum, module) => sum + module.resources.length, 0
        );

        if (totalResources === 0) return 0;
        return Math.round((completedResources.size / totalResources) * 100);
    };

    const isResourceCompleted = (moduleIndex: number, resourceIndex: number) => {
        return completedResources.has(`${moduleIndex}-${resourceIndex}`);
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loader}></div>
                <p>Loading course content...</p>
            </div>
        );
    }

    if (!course || !isEnrolled) {
        return (
            <div className={styles.errorContainer}>
                <h2>Access Denied</h2>
                <p>You need to be enrolled in this course to access the content.</p>
                <Link href={`/courses/${courseId}`} className={styles.backButton}>
                    Back to Course Details
                </Link>
            </div>
        );
    }

    const currentResource = getCurrentResource();
    const currentModule = course.modules[currentModuleIndex];

    return (
        <div className={styles.container}>
            {/* Top Bar */}
            <div className={styles.topBar}>
                <button
                    className={styles.menuButton}
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                <div className={styles.courseTitle}>
                    <Link href={`/courses/${courseId}`}>
                        {course.title}
                    </Link>
                </div>

                <div className={styles.progressIndicator}>
                    <div className={styles.progressText}>{getOverallProgress()}% Complete</div>
                    <div className={styles.progressBar}>
                        <div
                            className={styles.progressFill}
                            style={{ width: `${getOverallProgress()}%` }}
                        ></div>
                    </div>
                </div>

                <button
                    className={styles.notesButton}
                    onClick={() => setShowNotes(!showNotes)}
                >
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Notes ({notes.length})</span>
                </button>
            </div>

            <div className={styles.mainContent}>
                {/* Sidebar */}
                <aside className={`${styles.sidebar} ${!sidebarOpen ? styles.sidebarClosed : ''}`}>
                    <div className={styles.sidebarContent}>
                        <h3 className={styles.sidebarTitle}>Course Content</h3>

                        <div className={styles.modulesList}>
                            {course.modules.map((module, moduleIndex) => (
                                <div key={moduleIndex} className={styles.moduleItem}>
                                    <div className={styles.moduleHeader}>
                                        <span className={styles.moduleNumber}>Module {moduleIndex + 1}</span>
                                        <h4 className={styles.moduleName}>{module.title}</h4>
                                        {moduleProgress.get(moduleIndex) ? (
                                            <div className={styles.moduleProgressBadge}>
                                                {Math.round(moduleProgress.get(moduleIndex) || 0)}%
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className={styles.resourcesList}>
                                        {module.resources.map((resource, resourceIndex) => (
                                            <button
                                                key={resourceIndex}
                                                className={`${styles.resourceItem} 
                          ${currentModuleIndex === moduleIndex && currentResourceIndex === resourceIndex ? styles.resourceActive : ''}
                          ${isResourceCompleted(moduleIndex, resourceIndex) ? styles.resourceCompleted : ''}`}
                                                onClick={() => navigateToResource(moduleIndex, resourceIndex)}
                                            >
                                                <div className={styles.resourceIcon}>
                                                    {resource.resourceType === 'video' && (
                                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    )}
                                                    {resource.resourceType === 'pdf' && (
                                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                    )}
                                                    {resource.resourceType === 'link' && (
                                                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <span className={styles.resourceName}>
                          {resource.filename || `${resource.resourceType} ${resourceIndex + 1}`}
                        </span>
                                                {isResourceCompleted(moduleIndex, resourceIndex) && (
                                                    <svg className={styles.checkIcon} fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                                                    </svg>
                                                )}
                                            </button>
                                        ))}

                                        {module.quizzes && module.quizzes.length > 0 && (
                                            <Link
                                                href={`/courses/${courseId}/quiz/${module.quizzes[0]}`}
                                                className={styles.quizLink}
                                            >
                                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
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
                <div className={styles.contentArea}>
                    {currentResource && (
                        <>
                            {/* Resource Header */}
                            <div className={styles.resourceHeader}>
                                <div className={styles.breadcrumb}>
                                    <span>Module {currentModuleIndex + 1}</span>
                                    <span>/</span>
                                    <span>{currentModule.title}</span>
                                </div>
                                <h2 className={styles.resourceTitle}>
                                    {currentResource.filename || `${currentResource.resourceType} Content`}
                                </h2>
                            </div>

                            {/* Resource Content */}
                            <div className={styles.resourceContent}>
                                {currentResource.resourceType === 'video' && (
                                    <div className={styles.videoContainer}>
                                        <video
                                            ref={videoRef}
                                            className={styles.videoPlayer}
                                            src={currentResource.url}
                                            controls
                                            onTimeUpdate={(e) => {
                                                const video = e.target as HTMLVideoElement;
                                                setVideoProgress(video.currentTime);

                                                // Mark as complete when 90% watched
                                                if (video.currentTime / video.duration > 0.9) {
                                                    markAsComplete();
                                                }
                                            }}
                                            onLoadedMetadata={(e) => {
                                                const video = e.target as HTMLVideoElement;
                                                setVideoDuration(video.duration);
                                            }}
                                            onPlay={() => setIsPlaying(true)}
                                            onPause={() => setIsPlaying(false)}
                                        >
                                            Your browser does not support the video tag.
                                        </video>

                                        <div className={styles.videoControls}>
                                            <div className={styles.videoInfo}>
                                                <span>Duration: {Math.floor(videoDuration / 60)}:{String(Math.floor(videoDuration % 60)).padStart(2, '0')}</span>
                                                <span>Progress: {Math.round((videoProgress / videoDuration) * 100)}%</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {currentResource.resourceType === 'pdf' && (
                                    <div className={styles.pdfContainer}>
                                        <iframe
                                            src={`${currentResource.url}#toolbar=0`}
                                            className={styles.pdfViewer}
                                            title="PDF Viewer"
                                        />
                                        <div className={styles.pdfActions}>
                                            <a
                                                href={currentResource.url}
                                                download
                                                className={styles.downloadButton}
                                            >
                                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Download PDF
                                            </a>
                                            <button
                                                onClick={markAsComplete}
                                                className={styles.markCompleteButton}
                                            >
                                                Mark as Complete
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {currentResource.resourceType === 'link' && (
                                    <div className={styles.linkContainer}>
                                        <div className={styles.linkCard}>
                                            <svg className={styles.linkIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                            </svg>
                                            <h3>External Resource</h3>
                                            <p>This resource will open in a new tab</p>
                                            <a
                                                href={currentResource.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={styles.openLinkButton}
                                                onClick={() => setTimeout(markAsComplete, 1000)}
                                            >
                                                Open Resource
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Navigation Controls */}
                            <div className={styles.navigationControls}>
                                <button
                                    className={styles.navButton}
                                    onClick={goToPrevious}
                                    disabled={currentModuleIndex === 0 && currentResourceIndex === 0}
                                >
                                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Previous
                                </button>

                                <button
                                    className={`${styles.completeButton} ${isResourceCompleted(currentModuleIndex, currentResourceIndex) ? styles.completed : ''}`}
                                    onClick={markAsComplete}
                                >
                                    {isResourceCompleted(currentModuleIndex, currentResourceIndex) ? (
                                        <>
                                            <svg fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                                            </svg>
                                            Completed
                                        </>
                                    ) : (
                                        <>
                                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Mark as Complete
                                        </>
                                    )}
                                </button>

                                <button
                                    className={styles.navButton}
                                    onClick={goToNext}
                                    disabled={
                                        currentModuleIndex === course.modules.length - 1 &&
                                        currentResourceIndex === course.modules[currentModuleIndex].resources.length - 1
                                    }
                                >
                                    Next
                                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>

                            {/* Quick Note Section */}
                            {currentModule.notesEnabled !== false && (
                                <div className={styles.quickNote}>
                                    <h3>Add a Note</h3>
                                    <div className={styles.noteInput}>
                    <textarea
                        value={currentNote}
                        onChange={(e) => setCurrentNote(e.target.value)}
                        placeholder="Take notes about this lesson..."
                        rows={3}
                    />
                                        <button onClick={addNote} disabled={!currentNote.trim()}>
                                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                      d="M12 4v16m8-8H4" />
                                            </svg>
                                            Add Note
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Certificate Section */}
                    {getOverallProgress() === 100 && course.certificateAvailable && (
                        <div className={styles.certificateSection}>
                            <div className={styles.certificateCard}>
                                <svg className={styles.certificateIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                </svg>
                                <h2>Congratulations!</h2>
                                <p>You've completed this course</p>
                                <button className={styles.certificateButton}>
                                    Download Certificate
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Notes Panel */}
                {showNotes && (
                    <div className={styles.notesPanel}>
                        <div className={styles.notesPanelHeader}>
                            <h3>Your Notes</h3>
                            <button onClick={() => setShowNotes(false)}>
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className={styles.notesList}>
                            {notes.length === 0 ? (
                                <p className={styles.noNotes}>No notes yet. Start taking notes to see them here!</p>
                            ) : (
                                notes.map(note => (
                                    <div key={note.id} className={styles.noteItem}>
                                        <div className={styles.noteHeader}>
                      <span className={styles.noteModule}>
                        Module {note.moduleIndex + 1}
                      </span>
                                            <span className={styles.noteTime}>
                        {new Date(note.timestamp).toLocaleDateString()}
                      </span>
                                        </div>
                                        <p className={styles.noteContent}>{note.content}</p>
                                        <button
                                            className={styles.deleteNote}
                                            onClick={() => deleteNote(note.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}