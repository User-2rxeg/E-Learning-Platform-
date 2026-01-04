import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Conversation } from '../database/conversation';
import { Message } from '../database/message';
import { User } from '../database/user';
import { AuditLogService } from '../audit-log/audit-logging.service';
import { Logs } from '../audit-log/Logs';
import { MailService } from '../auth/email/email-service';

@Injectable()
export class ChatService {
    constructor(
        @InjectModel(Conversation.name) private readonly conversationModel: Model<Conversation>,
        @InjectModel(Message.name) private readonly messageModel: Model<Message>,
        @InjectModel(User.name) private readonly userModel: Model<User>,
        private readonly audit: AuditLogService,
        private readonly mail: MailService,
    ) {}

    // Create or get existing 1-on-1 conversation
    async getOrCreateDirectConversation(userId1: string, userId2: string) {
        const participants = [new Types.ObjectId(userId1), new Types.ObjectId(userId2)].sort();

        let conversation = await this.conversationModel.findOne({
            participants: { $all: participants, $size: 2 },
            isGroup: false,
        });

        if (!conversation) {
            conversation = await this.conversationModel.create({
                participants,
                isGroup: false,
            });
        }

        return conversation;
    }

    // Create a group chat (study group)
    async createGroupChat(creatorId: string, participantIds: string[], groupName: string, courseId?: string) {
        if (participantIds.length < 2) {
            throw new BadRequestException('Group must have at least 2 participants');
        }

        const allParticipants = [...new Set([creatorId, ...participantIds])];

        const conversation = await this.conversationModel.create({
            participants: allParticipants.map(id => new Types.ObjectId(id)),
            isGroup: true,
            groupName,
            courseId: courseId ? new Types.ObjectId(courseId) : undefined,
        });

        return conversation;
    }

    // Send a message
    async sendMessage(conversationId: string, senderId: string, content: string, attachmentUrl?: string) {
        const conversation = await this.conversationModel.findById(conversationId);
        if (!conversation) throw new NotFoundException('Conversation not found');

        // Check if sender is a participant
        const isParticipant = conversation.participants.some(
            p => p.toString() === senderId
        );
        if (!isParticipant) {
            throw new ForbiddenException('You are not a participant in this conversation');
        }

        // Edge case: Content validation
        if (!content || content.trim().length === 0) {
            throw new BadRequestException('Message content cannot be empty');
        }

        // Edge case: Max message length
        if (content.length > 5000) {
            throw new BadRequestException('Message is too long (max 5000 characters)');
        }

        const message = await this.messageModel.create({
            conversation: new Types.ObjectId(conversationId),
            sender: new Types.ObjectId(senderId),
            content: content.trim(),
            attachmentUrl,
            readBy: [new Types.ObjectId(senderId)], // Mark as read by sender
        });

        // Update conversation's last message
        await this.conversationModel.findByIdAndUpdate(conversationId, {
            lastMessage: message._id,
            lastMessageAt: new Date(),
        });

        // Audit log
        await this.audit.log(Logs.CHAT_MESSAGE_SENT, senderId, {
            conversationId,
            messageId: message._id.toString(),
            isGroup: conversation.isGroup,
        });

        // Send email notification to other participants (if not a group or small group)
        if (!conversation.isGroup || conversation.participants.length <= 5) {
            const sender = await this.userModel.findById(senderId).select('name email');
            const otherParticipants = conversation.participants.filter(p => p.toString() !== senderId);

            for (const participantId of otherParticipants) {
                const recipient = await this.userModel.findById(participantId).select('name email');
                if (recipient) {
                    try {
                        await this.mail.sendNewMessageNotification(
                            recipient.email,
                            recipient.name || 'User',
                            sender?.name || 'Someone',
                            content.substring(0, 200)
                        );
                    } catch (e) {
                        // Don't fail the message send if email fails
                        console.error('Failed to send message notification email:', e);
                    }
                }
            }
        }

        return message;
    }

    // Get user's conversations
    async getUserConversations(userId: string, page = 1, limit = 20) {
        const skip = (page - 1) * limit;

        const conversations = await this.conversationModel
            .find({ participants: new Types.ObjectId(userId) })
            .sort({ lastMessageAt: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('participants', 'name email profileImage')
            .populate('lastMessage')
            .lean();

        // Get unread counts for each conversation
        const conversationsWithUnread = await Promise.all(
            conversations.map(async (conv) => {
                const unreadCount = await this.messageModel.countDocuments({
                    conversation: conv._id,
                    readBy: { $ne: new Types.ObjectId(userId) },
                });
                return { ...conv, unreadCount };
            })
        );

        const total = await this.conversationModel.countDocuments({
            participants: new Types.ObjectId(userId),
        });

        return { conversations: conversationsWithUnread, total, page, limit };
    }

    // Get messages in a conversation
    async getConversationMessages(conversationId: string, userId: string, page = 1, limit = 50) {
        const conversation = await this.conversationModel.findById(conversationId);
        if (!conversation) throw new NotFoundException('Conversation not found');

        const isParticipant = conversation.participants.some(
            p => p.toString() === userId
        );
        if (!isParticipant) {
            throw new ForbiddenException('You are not a participant in this conversation');
        }

        const skip = (page - 1) * limit;

        const messages = await this.messageModel
            .find({ conversation: new Types.ObjectId(conversationId) })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('sender', 'name email profileImage')
            .lean();

        const total = await this.messageModel.countDocuments({
            conversation: new Types.ObjectId(conversationId),
        });

        return { messages: messages.reverse(), total, page, limit };
    }

    // Mark messages as read
    async markMessagesAsRead(conversationId: string, userId: string) {
        const conversation = await this.conversationModel.findById(conversationId);
        if (!conversation) throw new NotFoundException('Conversation not found');

        const isParticipant = conversation.participants.some(
            p => p.toString() === userId
        );
        if (!isParticipant) {
            throw new ForbiddenException('You are not a participant in this conversation');
        }

        const result = await this.messageModel.updateMany(
            {
                conversation: new Types.ObjectId(conversationId),
                readBy: { $ne: new Types.ObjectId(userId) },
            },
            { $addToSet: { readBy: new Types.ObjectId(userId) } }
        );

        // Update lastReadBy in conversation
        await this.conversationModel.findByIdAndUpdate(conversationId, {
            [`lastReadBy.${userId}`]: await this.messageModel
                .findOne({ conversation: new Types.ObjectId(conversationId) })
                .sort({ createdAt: -1 })
                .select('_id'),
        });

        return { markedAsRead: result.modifiedCount };
    }

    // Get unread message count for user
    async getUnreadCount(userId: string) {
        const userConversations = await this.conversationModel
            .find({ participants: new Types.ObjectId(userId) })
            .select('_id');

        const conversationIds = userConversations.map(c => c._id);

        const unreadCount = await this.messageModel.countDocuments({
            conversation: { $in: conversationIds },
            readBy: { $ne: new Types.ObjectId(userId) },
        });

        return { unreadCount };
    }

    // Leave a group conversation
    async leaveGroupConversation(conversationId: string, userId: string) {
        const conversation = await this.conversationModel.findById(conversationId);
        if (!conversation) throw new NotFoundException('Conversation not found');
        if (!conversation.isGroup) {
            throw new BadRequestException('Cannot leave a direct conversation');
        }

        const isParticipant = conversation.participants.some(
            p => p.toString() === userId
        );
        if (!isParticipant) {
            throw new ForbiddenException('You are not a participant in this conversation');
        }

        await this.conversationModel.findByIdAndUpdate(conversationId, {
            $pull: { participants: new Types.ObjectId(userId) },
        });

        return { left: true };
    }

    // Add participant to group
    async addParticipantToGroup(conversationId: string, requesterId: string, newParticipantId: string) {
        const conversation = await this.conversationModel.findById(conversationId);
        if (!conversation) throw new NotFoundException('Conversation not found');
        if (!conversation.isGroup) {
            throw new BadRequestException('Cannot add participants to a direct conversation');
        }

        const isParticipant = conversation.participants.some(
            p => p.toString() === requesterId
        );
        if (!isParticipant) {
            throw new ForbiddenException('You are not a participant in this conversation');
        }

        await this.conversationModel.findByIdAndUpdate(conversationId, {
            $addToSet: { participants: new Types.ObjectId(newParticipantId) },
        });

        return { added: true };
    }
}

