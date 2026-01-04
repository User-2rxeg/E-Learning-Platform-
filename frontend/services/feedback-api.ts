
import apiClient from "./api-client";

export interface Feedback {
    _id: string;
    userId?: string;
    message: string;
    contactEmail?: string;
    category: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateFeedbackDto {
    message: string;
    contactEmail?: string;
    category?: string;
}

export interface FeedbackListResponse {
    items: Feedback[];
    total: number;
    page: number;
    limit: number;
    pages: number;
}

class FeedbackService {
    // Submit feedback (public endpoint)
    async submitFeedback(feedback: CreateFeedbackDto) {
        const response = await apiClient.post('/feedback', feedback);
        return response.data;
    }

    // admin: List all feedback
    async listFeedback(params: {
        q?: string;
        category?: string;
        page?: number;
        limit?: number;
    }): Promise<FeedbackListResponse> {
        const queryParams = new URLSearchParams();
        if (params.q) queryParams.append('q', params.q);
        if (params.category) queryParams.append('category', params.category);
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());

        const response = await apiClient.get(`/feedback/admin?${queryParams.toString()}`);
        return response.data;
    }

    // Get feedback by ID
    async getFeedbackById(id: string): Promise<Feedback> {
        const response = await apiClient.get(`/feedback/${id}`);
        return response.data;
    }

    // Update feedback status (if backend supports it)
    async updateFeedbackStatus(id: string, status: string) {
        const response = await apiClient.patch(`/feedback/${id}/status`, { status });
        return response.data;
    }

    // Delete feedback
    async deleteFeedback(id: string) {
        const response = await apiClient.delete(`/feedback/${id}`);
        return response.data;
    }

    // Get feedback statistics
    async getFeedbackStats() {
        const response = await apiClient.get('/feedback/admin/stats');
        return response.data;
    }
}

export const feedbackService = new FeedbackService();
