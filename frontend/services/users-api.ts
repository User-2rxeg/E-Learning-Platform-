
import apiClient from './api-client';
import { UserRole, AccountStatus } from './admin-api';

export interface UserProfile {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
    status: AccountStatus;
    isEmailVerified: boolean;
    profileImage?: string;
    learningPreferences?: string[];
    subjectsOfInterest?: string[];
    expertise?: string[];
    enrolledCourses?: string[];
    teachingCourses?: string[];
    completedCourses?: string[];
    mfaEnabled?: boolean;
    lastLoginAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateProfileDto {
    name?: string;
    learningPreferences?: string[];
    subjectsOfInterest?: string[];
    expertise?: string[];
    profileImage?: string;
}

export interface UserSearchParams {
    q?: string;
    role?: UserRole;
    page?: number;
    limit?: number;
}

export interface UserSearchResponse {
    items: UserProfile[];
    total: number;
    page: number;
    pages: number;
    limit: number;
}

class UserService {
    // Get current logged-in user profile
    async getMyProfile(): Promise<UserProfile> {
        const response = await apiClient.get('/users/me');
        return response.data;
    }

    // Update my profile
    async updateMyProfile(profileData: UpdateProfileDto): Promise<UserProfile> {
        const response = await apiClient.patch('/users/me', profileData);
        return response.data;
    }

    // Delete my account
    async deleteMyAccount(): Promise<void> {
        await apiClient.delete('/users/me');
    }

    // Get user by ID
    async getUserById(userId: string): Promise<UserProfile> {
        const response = await apiClient.get(`/users/${userId}`);
        return response.data;
    }

    // Find user by name
    async findByName(name: string): Promise<UserProfile[]> {
        const response = await apiClient.get(`/users/name/${encodeURIComponent(name)}`);
        return response.data;
    }

    // Search users (Admin/Instructor only)
    async searchUsers(params: UserSearchParams): Promise<UserSearchResponse> {
        const queryParams = new URLSearchParams();
        if (params.q) queryParams.append('q', params.q);
        if (params.role) queryParams.append('role', params.role);
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());

        const response = await apiClient.get(`/users/search?${queryParams.toString()}`);
        return response.data;
    }

    // Search instructors
    async searchInstructors(params: { q?: string; page?: number; limit?: number }): Promise<UserSearchResponse> {
        const queryParams = new URLSearchParams();
        if (params.q) queryParams.append('q', params.q);
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());

        const response = await apiClient.get(`/users/search-instructors?${queryParams.toString()}`);
        return response.data;
    }
}

export const userService = new UserService();

