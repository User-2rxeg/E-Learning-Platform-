
export { apiClient, getErrorMessage, isNetworkError, isAuthError } from './api-client';

// Session Management
export { sessionManager } from '../server/session-manager';

// Domain Services
export { adminService } from './admin-api';
export { courseService } from './courses-api';
export { feedbackService } from './feedback-api';
export { quizService } from './quizzes-api';
export { certificateService } from './certificate-api';
export { socketService } from './websocket-service';
export { forumService } from './forum-api';
export { chatService } from './chat-api';
export { notificationService } from './notifications-api';
export { userService } from './users-api';
export { progressTrackingService } from './progress-tracking.service';

// Re-export types from courses-api
export type {
    Course,
    CourseResponse,
    Module,
    Resource,
    SearchParams,
    CourseProgress,
    Note,
} from './courses-api';

// Re-export types from feedback-api
export type {
    Feedback,
    CreateFeedbackDto,
    FeedbackListResponse,
} from './feedback-api';

// Re-export types from quizzes-api
export type {
    CreateQuizRequest,
    QuizAttemptRequest,
    QuizResult,
} from './quizzes-api';

// Re-export types from admin-api
export type {
    SystemUser,
    SystemCourse,
    Enrollment,
    BackupData,
    AuditLog,
    ListUsersParams,
    ListCoursesParams,
    CreateUserDto,
    UpdateUserDto,
} from './admin-api';

// Re-export enums from admin-api
export { UserRole, AccountStatus, CourseStatus } from './admin-api';

// Re-export types from forum-api
export type {
    Forum,
    Thread,
    Post,
    CreateForumDto,
} from './forum-api';

// Re-export types from chat-api
export type {
    Conversation,
    Message,
    Participant,
} from './chat-api';

// Re-export types from notifications-api
export type {
    Notification,
    NotificationType,
    NotificationListResponse,
} from './notifications-api';

// Re-export types from users-api
export type {
    UserProfile,
    UpdateProfileDto,
    UserSearchParams,
    UserSearchResponse,
} from './users-api';

// Re-export types from progress-tracking.service
export type {
    ProgressData,
    CourseProgressSummary,
} from './progress-tracking.service';
