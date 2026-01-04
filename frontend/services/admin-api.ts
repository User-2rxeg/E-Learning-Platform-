import apiClient from "./api-client";

// Match backend UserRole and AccountStatus enums
export enum UserRole {
    STUDENT = 'student',
    INSTRUCTOR = 'instructor',
    ADMIN = 'admin',
}

export enum AccountStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    LOCKED = 'locked',
    SUSPENDED = 'suspended',
    TERMINATED = 'terminated',
}

export enum CourseStatus {
    DRAFT = 'draft',
    ACTIVE = 'active',
    ARCHIVED = 'archived',
    UNDER_REVIEW = 'under_review',
}

export interface SystemUser {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
    status: AccountStatus;
    isEmailVerified: boolean;
    mfaEnabled?: boolean;
    profileImage?: string;
    learningPreferences?: string[];
    subjectsOfInterest?: string[];
    expertise?: string[];
    enrolledCourses?: string[];
    teachingCourses?: string[];
    completedCourses?: string[];
    failedLoginAttempts?: number;
    lockedUntil?: string;
    lastLoginAt?: string;
    lastLoginIp?: string;
    statusReason?: string;
    statusChangedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface SystemCourse {
    _id: string;
    title: string;
    description: string;
    shortDescription?: string;
    instructorId: string;
    thumbnailUrl?: string;
    level: string;
    category: string;
    language: string;
    status: CourseStatus;
    studentsEnrolled: string[];
    averageRating: number;
    totalRatings: number;
    certificateAvailable: boolean;
    isFeatured: boolean;
    createdAt: string;
    updatedAt: string;
    archivedAt?: string;
    publishedAt?: string;
}

export interface Enrollment {
    courseId: string;
    courseTitle: string;
    userId: string;
    name: string;
    email: string;
}

export interface BackupData {
    _id: string;
    backupDate: string;
    dataType: string;
    storageLink: string;
}

export interface AuditLog {
    _id: string;
    userId?: string;
    event: string;
    timestamp: string;
    details: Record<string, unknown>;
}

export interface ListUsersParams {
    q?: string;
    role?: UserRole;
    status?: AccountStatus;
    verified?: string;
    page?: number;
    limit?: number;
}

export interface ListCoursesParams {
    q?: string;
    status?: CourseStatus;
    page?: number;
    limit?: number;
}

export interface CreateUserDto {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
    learningPreferences?: string[];
    subjectsOfInterest?: string[];
    expertise?: string[];
    profileImage?: string;
}

export interface UpdateUserDto {
    name?: string;
    email?: string;
    learningPreferences?: string[];
    subjectsOfInterest?: string[];
    expertise?: string[];
    profileImage?: string;
}

class AdminService {
    // User Management
    async listUsers(params: ListUsersParams) {
        const queryParams = new URLSearchParams();
        if (params.q) queryParams.append('q', params.q);
        if (params.role) queryParams.append('role', params.role);
        if (params.status) queryParams.append('status', params.status);
        if (params.verified) queryParams.append('verified', params.verified);
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());

        const response = await apiClient.get(`/admin/users?${queryParams.toString()}`);
        return response.data;
    }

    async createUser(userData: CreateUserDto) {
        const response = await apiClient.post('/admin/create-user', userData);
        return response.data;
    }

    async updateUser(userId: string, userData: UpdateUserDto) {
        const response = await apiClient.patch(`/admin/${userId}`, userData);
        return response.data;
    }

    async deleteUser(userId: string) {
        const response = await apiClient.delete(`/admin/${userId}`);
        return response.data;
    }

    // Course Management
    async listCourses(params: ListCoursesParams) {
        const queryParams = new URLSearchParams();
        if (params.q) queryParams.append('q', params.q);
        if (params.status) queryParams.append('status', params.status);
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());

        const response = await apiClient.get(`/courses?${queryParams.toString()}`);
        return response.data;
    }

    async updateCourseStatus(courseId: string, status: 'active' | 'draft' | 'archived') {
        const response = await apiClient.patch(`/courses/${courseId}`, { status });
        return response.data;
    }

    async deleteCourse(courseId: string) {
        const response = await apiClient.delete(`/courses/${courseId}`);
        return response.data;
    }

    async updateUserRole(userId: string, role: UserRole) {
        const response = await apiClient.patch(`/admin/users/${userId}/role`, { role });
        return response.data;
    }

    async lockUser(userId: string, reason?: string) {
        const response = await apiClient.patch(`/admin/users/${userId}/lock`, { reason });
        return response.data;
    }

    async unlockUser(userId: string) {
        const response = await apiClient.patch(`/admin/users/${userId}/unlock`);
        return response.data;
    }

    async suspendUser(userId: string, reason: string) {
        const response = await apiClient.patch(`/admin/users/${userId}/suspend`, { reason });
        return response.data;
    }

    async terminateUser(userId: string, reason: string) {
        const response = await apiClient.patch(`/admin/users/${userId}/terminate`, { reason });
        return response.data;
    }

    async reactivateUser(userId: string) {
        const response = await apiClient.patch(`/admin/users/${userId}/reactivate`);
        return response.data;
    }

    async changeUserStatus(userId: string, status: AccountStatus, reason?: string) {
        const response = await apiClient.patch(`/admin/users/${userId}/status`, { status, reason });
        return response.data;
    }

    async getMetrics() {
        const response = await apiClient.get('/admin/metrics');
        return response.data;
    }

    async getSecurityOverview(params?: { limit?: number; from?: string; to?: string }) {
        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.from) queryParams.append('from', params.from);
        if (params?.to) queryParams.append('to', params.to);

        const response = await apiClient.get(`/admin/security?${queryParams.toString()}`);
        return response.data;
    }

    // Export users to CSV
    async exportUsersCSV(): Promise<string> {
        const response = await apiClient.get('/admin/users/export?format=csv', {
            responseType: 'blob'
        });
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        return a.download;
    }

    // Audit Logs
    async getAuditLogs(params: {
        page?: number;
        limit?: number;
        userId?: string;
        event?: string;
        from?: string;
        to?: string;
    }) {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.userId) queryParams.append('userId', params.userId);
        if (params.event) queryParams.append('event', params.event);
        if (params.from) queryParams.append('from', params.from);
        if (params.to) queryParams.append('to', params.to);

        const response = await apiClient.get(`/audit?${queryParams.toString()}`);
        return response.data;
    }

    async getFailedLogins(page: number = 1, limit: number = 20) {
        const response = await apiClient.get(`/audit/security/failed-logins?page=${page}&limit=${limit}`);
        return response.data;
    }

    async getUnauthorizedAccess(page: number = 1, limit: number = 20) {
        const response = await apiClient.get(`/audit/security/unauthorized?page=${page}&limit=${limit}`);
        return response.data;
    }

    async purgeOldAuditLogs(days: number) {
        const response = await apiClient.delete(`/audit/purge/older-than/${days}`);
        return response.data;
    }

    // Analytics
    async getInstructorDashboard(instructorId: string) {
        const response = await apiClient.get(`/analytics/instructor/${instructorId}/dashboard`);
        return response.data;
    }

    async getStudentSummary(studentId: string) {
        const response = await apiClient.get(`/analytics/student/${studentId}/summary`);
        return response.data;
    }

    async getInstructorCourseReport(instructorId: string, courseId: string) {
        const response = await apiClient.get(`/analytics/instructor/${instructorId}/course/${courseId}/report`);
        return response.data;
    }

    // Notification Management (Admin/Instructor only)
    async announceToAll(message: string) {
        const response = await apiClient.post('/notifications/announce/all', { message });
        return response.data;
    }

    async announceToRole(role: UserRole, message: string) {
        const response = await apiClient.post(`/notifications/announce/role/${role}`, { message });
        return response.data;
    }

    async announceToCourse(courseId: string, message: string) {
        const response = await apiClient.post(`/notifications/course/${courseId}`, { message });
        return response.data;
    }

    // Backups
    async runBackup(dataType: 'users' | 'courses' | 'performances' | 'all') {
        const response = await apiClient.post('/backups/run', { dataType });
        return response.data;
    }

    async listBackups(page: number = 1, limit: number = 20) {
        const response = await apiClient.get(`/backups?page=${page}&limit=${limit}`);
        return response.data;
    }

    async deleteBackup(backupId: string) {
        const response = await apiClient.delete(`/backups/${backupId}`);
        return response.data;
    }
}

export const adminService = new AdminService();
