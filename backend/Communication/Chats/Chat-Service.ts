import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Chat, ChatDocument } from '../../Database/Chat';
import { User, UserDocument } from '../../Database/User';
import { CreateChatDto } from '../../DTO/ChatDTO';
import {ChatGateway} from "./Chat-Gateway";

// optional: notify/audit if you want
// import { NotificationService } from '../../Communication/Notifications/Notification.Service';
// import { AuditLogService } from '../../Audit-Log/Audit-Log.Service';

type PageOpts = { page?: number; limit?: number };

@Injectable()
export class ChatService {
    constructor(
        @InjectModel(Chat.name) private readonly chatModel: Model<ChatDocument>,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        private readonly gateway: ChatGateway,
        // private readonly notifications: NotificationService,
        // private readonly audit: AuditLogService,
    ) {}

    async createChat(dto: CreateChatDto, creatorId: string) {
        const creatorObjId = new Types.ObjectId(creatorId);
        const memberIds = (dto.participants ?? []).map((id) => new Types.ObjectId(id));

        // ensure creator is part of the room
        if (!memberIds.some((id) => id.equals(creatorObjId))) {
            memberIds.push(creatorObjId);
        }

        // basic sanity: all users exist
        const count = await this.userModel.countDocuments({ _id: { $in: memberIds } });
        if (count !== memberIds.length) {
            throw new NotFoundException('One or more participants not found');
        }

        const chat = await this.chatModel.create({
            participants: memberIds,
            messages: dto.messages?.map((m) => ({
                sender: new Types.ObjectId(m.sender),
                content: m.content,
                timestamp: new Date(),
                read: false,
            })) ?? [],
            isGroup: !!dto.isGroup,
            groupName: dto.groupName,
            courseId: dto.courseId ? new Types.ObjectId(dto.courseId) : undefined,
        });

        return chat;
    }

    async listMyChats(userId: string, { page = 1, limit = 20 }: PageOpts) {
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            this.chatModel
                .find({ participants: new Types.ObjectId(userId) })
                .sort({ updatedAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('participants', 'name email role')
                .exec(),
            this.chatModel.countDocuments({ participants: new Types.ObjectId(userId) }),
        ]);
        return { items, total, page, limit };
    }

    private async ensureMembership(chatId: string, userId: string) {
        const chat = await this.chatModel.findById(chatId).exec();
        if (!chat) throw new NotFoundException('Chat not found');
        const isMember = chat.participants.some((p) => String(p) === userId);
        if (!isMember) throw new ForbiddenException('Not a member of this chat');
        return chat;
    }

    async sendMessage(chatId: string, senderId: string, content: string) {
        if (!content || !content.trim()) {
            throw new ForbiddenException('Empty message');
        }
        const chat = await this.ensureMembership(chatId, senderId);

        const message = {
            sender: new Types.ObjectId(senderId),
            content: content.trim(),
            timestamp: new Date(),
            read: false,
        };

        chat.messages.push(message as any);
        await chat.save();

        const saved = chat.messages[chat.messages.length - 1] as any;
        const payload = { chatId: String(chat._id), message: { id: String(saved._id), sender: senderId, content: saved.content, timestamp: saved.timestamp } };

        // realtime
        this.gateway.emitToChat(chat._id.toString(), 'chat:newMessage', payload);

        // optional: notify other participants
        // for (const p of chat.participants) {
        //   const uid = String(p);
        //   if (uid !== senderId) {
        //     this.gateway.emitToUser(uid, 'notification:new', { type: 'message', chatId: chat._id });
        //   }
        // }

        return payload;
    }

    // simple in-memory slice pagination of embedded messages
    async history(chatId: string, userId: string, { page = 1, limit = 20 }: PageOpts) {
        const chat = await this.ensureMembership(chatId, userId);
        const total = chat.messages.length;

        const start = Math.max(0, total - page * limit);
        const end = Math.max(0, total - (page - 1) * limit);
        const slice = chat.messages.slice(start, end);

        // return in chronological order (oldest -> newest)
        return {
            items: slice,
            total,
            page,
            limit,
        };
    }

    // service
    async markRead(chatId: string, me: string, messageIds?: string[]) {
        const chat = await this.ensureMembership(chatId, me);
        const ids = new Set((messageIds ?? []).map(String));
        chat.messages.forEach((m: any) => {
            const mine = String(m.sender) !== me; // only mark others’ messages as read
            const targeted = !ids.size || ids.has(String(m._id));
            if (mine && targeted) m.read = true;
        });
        await chat.save();
        this.gateway.emitToChat(chatId, 'chat:read', { chatId, reader: me, messageIds: [...ids] });
        return { ok: true };
    }
    // service
    async getOrCreateDirect(me: string, other: string) {
        const [a,b] = [new Types.ObjectId(me), new Types.ObjectId(other)];
        let chat = await this.chatModel.findOne({ isGroup: false, participants: { $all: [a,b], $size: 2 } });
        if (!chat) chat = await this.chatModel.create({ participants: [a,b], isGroup: false, messages: [] });
        return chat;
    }
}