// src/lib/types.ts
export enum UserRole {
    STUDENT = 'student',
    INSTRUCTOR = 'instructor',
    ADMIN = 'admin'
}

export interface User {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
    isEmailVerified: boolean;
    profileImage?: string;
    learningPreferences?: string[];
    subjectsOfInterest?: string[];
    expertise?: string[];
    teachingCourses?: string[];
    enrolledCourses?: string[];
    completedCourses?: string[];
    averageScore?: number;
    mfaEnabled?: boolean;
    notifications?: Array<{
        type: string;
        message: string;
        read: boolean;
        date: Date;
    }>;
    createdAt?: string;
    updatedAt?: string;
}

export interface Course {
    _id: string;
    title: string;
    description: string;
    instructorId: string;
    modules: CourseModule[];
    tags: string[];
    versionHistory: VersionHistory[];
    studentsEnrolled: string[];
    status: 'active' | 'archived' | 'draft';
    certificateAvailable: boolean;
    archivedAt?: Date;
    feedback: CourseFeedback[];
    createdAt?: string;
    updatedAt?: string;
}

export interface CourseModule {
    title: string;
    resources: Resource[];
    quizzes?: string[];
    notesEnabled?: boolean;
}

export interface Resource {
    _id?: string;
    resourceType: 'video' | 'pdf' | 'link';
    url: string;
    filename?: string;
    mimeType?: string;
    size?: number;
    uploadedBy?: string;
    uploadedAt?: Date;
}

export interface VersionHistory {
    version: string;
    updatedAt: Date;
    changes: string;
}

export interface CourseFeedback {
    rating: number;
    comment?: string;
    createdAt: Date;
}

export interface Quiz {
    _id: string;
    moduleId: string;
    questions: QuizQuestion[];
    adaptive: boolean;
    createdBy: string;
}

export interface QuizQuestion {
    questionId: string;
    questionText: string;
    choices: string[];
    correctAnswer: string;
    difficulty: 'easy' | 'medium' | 'hard';
}

export interface Performance {
    _id: string;
    studentId: string;
    courseId: string;
    progress: number;
    scores: Score[];
    engagementLog: EngagementLog[];
    lastUpdated: Date;
    quizStats: QuizStat[];
}

export interface Score {
    moduleId: string;
    quizId: string;
    score: number;
    completedAt: Date;
}

export interface EngagementLog {
    timestamp: Date;
    duration: number;
    activity: string;
}

export interface QuizStat {
    quizId: string;
    recentScores: number[];
    lastDifficulty: 'easy' | 'medium' | 'hard';
    seenQuestionIds: string[];
}

export interface Notification {
    _id: string;
    recipientId: string;
    type: 'announcement' | 'courseUpdate' | 'assignmentDue' | 'newMessage' | 'systemAlert' | 'other';
    message: string;
    read: boolean;
    courseId?: string;
    sentBy?: string;
    createdAt?: string;
}

export interface AuditLog {
    _id: string;
    userId?: string;
    event: string;
    timestamp: Date;
    details: Record<string, any>;
}

export interface Backup {
    _id: string;
    backupDate: Date;
    dataType: string;
    storageLink: string;
}

export interface SystemStats {
    totalUsers: number;
    activeUsers: number;
    totalCourses: number;
    totalEnrollments: number;
    storageUsed: number;
    serverUptime: number;
    securityAlerts: number;
}

export interface SystemHealth {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    activeConnections: number;
    apiResponseTime: number;
    errorRate: number;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    pages?: number;
}