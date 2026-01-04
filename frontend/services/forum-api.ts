
import apiClient from './api-client';

export interface Post {
    _id: string;
    content: string;
    author: string;
    authorName?: string;
    likes: string[];
    createdAt: string;
    updatedAt?: string;
}

export interface Thread {
    _id: string;
    title: string;
    createdBy: string;
    creatorName?: string;
    posts: Post[];
    createdAt: string;
    updatedAt?: string;
}

export interface Forum {
    _id: string;
    courseId: string;
    threads: Thread[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateForumDto {
    courseId: string;
    threads?: {
        title: string;
        createdBy: string;
        posts: {
            content: string;
            author: string;
        }[];
    }[];
}

class ForumService {
    // Create a new forum for a course
    async createForum(forumData: CreateForumDto): Promise<Forum> {
        const response = await apiClient.post('/forums', forumData);
        return response.data;
    }

    // Get forum by course ID
    async getForumByCourse(courseId: string): Promise<Forum | null> {
        try {
            const response = await apiClient.get(`/forums/course/${courseId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching forum:', error);
            return null;
        }
    }

    // Add a new thread to a forum
    async addThread(forumId: string, title: string): Promise<Forum> {
        const response = await apiClient.post(`/forums/${forumId}/threads`, { title });
        return response.data;
    }

    // Add a post to a thread
    async addPost(forumId: string, threadId: string, content: string): Promise<Forum> {
        const response = await apiClient.post(
            `/forums/${forumId}/threads/${threadId}/posts`,
            { content }
        );
        return response.data;
    }

    // Like or unlike a post
    async likePost(forumId: string, threadId: string, postId: string): Promise<Forum> {
        const response = await apiClient.patch(
            `/forums/${forumId}/threads/${threadId}/posts/${postId}/like`
        );
        return response.data;
    }

    // Delete a post
    async deletePost(courseId: string, threadId: string, postId: string): Promise<void> {
        await apiClient.delete(`/forums/course/${courseId}/threads/${threadId}/posts/${postId}`);
    }

    // Delete a thread
    async deleteThread(forumId: string, threadId: string): Promise<void> {
        await apiClient.delete(`/forums/${forumId}/threads/${threadId}`);
    }

    // Edit thread title
    async editThreadTitle(forumId: string, threadId: string, newTitle: string): Promise<Forum> {
        const response = await apiClient.patch(
            `/forums/${forumId}/threads/${threadId}/edit-title`,
            { newTitle }
        );
        return response.data;
    }

    // Search threads
    async searchThreads(forumId: string, keyword: string): Promise<Thread[]> {
        const response = await apiClient.get(
            `/forums/${forumId}/threads/search?keyword=${encodeURIComponent(keyword)}`
        );
        return response.data;
    }

    // List threads with pagination
    async listThreads(
        forumId: string,
        params: { page?: number; limit?: number; q?: string }
    ): Promise<{ threads: Thread[]; total: number; page: number; pages: number }> {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.q) queryParams.append('q', params.q);

        const response = await apiClient.get(`/forums/${forumId}/threads?${queryParams.toString()}`);
        return response.data;
    }

    // List posts in a thread with pagination
    async listPosts(
        forumId: string,
        threadId: string,
        params: { page?: number; limit?: number }
    ): Promise<{ posts: Post[]; total: number; page: number; pages: number }> {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());

        const response = await apiClient.get(
            `/forums/${forumId}/threads/${threadId}/posts?${queryParams.toString()}`
        );
        return response.data;
    }
}

export const forumService = new ForumService();

