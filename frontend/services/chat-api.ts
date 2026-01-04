
import apiClient from './api-client';

export interface Message {
    _id: string;
    conversationId: string;
    senderId: string;
    senderName?: string;
    content: string;
    attachmentUrl?: string;
    readBy: string[];
    createdAt: string;
    updatedAt?: string;
}

export interface Participant {
    _id: string;
    name: string;
    profileImage?: string;
}

export interface Conversation {
    _id: string;
    participants: Participant[];
    type: 'direct' | 'group';
    groupName?: string;
    courseId?: string;
    lastMessage?: {
        content: string;
        senderId: string;
        createdAt: string;
    };
    unreadCount?: number;
    createdAt: string;
    updatedAt: string;
}

class ChatService {
    // Get or create direct conversation with another user
    async getOrCreateDirectConversation(userId: string): Promise<Conversation> {
        const response = await apiClient.post(`/chat/direct/${userId}`);
        return response.data;
    }

    // Create a group chat
    async createGroupChat(
        participantIds: string[],
        groupName: string,
        courseId?: string
    ): Promise<Conversation> {
        const response = await apiClient.post('/chat/group', {
            participants: participantIds,
            groupName,
            courseId,
        });
        return response.data;
    }

    // Get user's conversations
    async getMyConversations(
        page: number = 1,
        limit: number = 20
    ): Promise<{ conversations: Conversation[]; total: number; page: number; pages: number }> {
        const response = await apiClient.get(`/chat/conversations?page=${page}&limit=${limit}`);
        return response.data;
    }

    // Get messages in a conversation
    async getConversationMessages(
        conversationId: string,
        page: number = 1,
        limit: number = 50
    ): Promise<{ messages: Message[]; total: number; page: number; pages: number }> {
        const response = await apiClient.get(
            `/chat/conversations/${conversationId}/messages?page=${page}&limit=${limit}`
        );
        return response.data;
    }

    // Send a message
    async sendMessage(
        conversationId: string,
        content: string,
        attachmentUrl?: string
    ): Promise<Message> {
        const response = await apiClient.post(
            `/chat/conversations/${conversationId}/messages`,
            { content, attachmentUrl }
        );
        return response.data;
    }

    // Mark messages as read
    async markAsRead(conversationId: string): Promise<void> {
        await apiClient.patch(`/chat/conversations/${conversationId}/read`);
    }

    // Get total unread message count
    async getUnreadCount(): Promise<number> {
        const response = await apiClient.get('/chat/unread-count');
        return response.data.count || 0;
    }

    // Leave a group conversation
    async leaveGroup(conversationId: string): Promise<void> {
        await apiClient.delete(`/chat/group/${conversationId}/leave`);
    }

    // Add participant to group
    async addParticipant(conversationId: string, userId: string): Promise<Conversation> {
        const response = await apiClient.post(
            `/chat/group/${conversationId}/participants`,
            { userId }
        );
        return response.data;
    }
}

export const chatService = new ChatService();

