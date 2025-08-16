import {ForbiddenException, Injectable, NotFoundException} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import {Model, Types} from "mongoose";
import { NotificationDocument } from "../../Database/Notification";

import {Course, CourseDocument} from "../../Database/Course";
import {User, UserDocument, UserRole} from "../../Database/User";
import {NotificationGateway} from "./Notification-Gateway";
import {CreateNotificationDto} from "../../DTO/NotificationDTO";
import {NotificationAuditLogDocument} from "../../Database/Notification.AuditLog.";


@Injectable()
export class NotificationService {
    constructor(
        @InjectModel('Notification') private readonly notificationModel: Model<NotificationDocument>,
        @InjectModel('NotificationAuditLog') private readonly auditModel: Model<NotificationAuditLogDocument>,
        @InjectModel('Course') private readonly courseModel: Model<CourseDocument>,
        @InjectModel('User') private readonly userModel: Model<UserDocument>,
        // If you added the gateway:
        private readonly gateway: NotificationGateway,
    ){}

    async createNotification(dto: CreateNotificationDto, senderId: string) {
        const sender = await this.userModel.findById(senderId);
        if (!sender) throw new NotFoundException('Sender not found');

        if (dto.courseId) {
            const courseExists = await this.courseModel.exists({ _id: dto.courseId });
            if (!courseExists) throw new NotFoundException('Course not found');
        }

        if (dto.type === 'announcement' && !(sender.role === UserRole.ADMIN || sender.role === UserRole.INSTRUCTOR)) {
            throw new ForbiddenException('You are not allowed to send announcements');
        }
        if (sender.role === UserRole.STUDENT && dto.recipientId !== senderId) {
            throw new ForbiddenException('Students cannot send notifications to others');
        }

        const notification = await this.notificationModel.create({
            recipientId: new Types.ObjectId(dto.recipientId),
            type: dto.type,
            message: dto.message,
            courseId: dto.courseId ? new Types.ObjectId(dto.courseId) : undefined,
            sentBy: sender._id,
        });

        await this.auditModel.create({
            notificationId: notification._id,
            eventType: 'SENT',
            userId: sender._id,
        });

        // ▶ realtime push
        this.gateway.emitToUser(String(notification.recipientId), 'notification:new', {
            id: String(notification._id),
            type: notification.type,
            message: notification.message,
            createdAt: notification.createdAt,
            read: notification.read,
            courseId: notification.courseId ? String(notification.courseId) : undefined,
            sentBy: String(notification.sentBy),
        });

        return notification;
    }

    async markAsRead(notificationId: string, userId: string) {
        const notification = await this.notificationModel.findById(notificationId);
        if (!notification) throw new NotFoundException('Notification not found');
        if (String(notification.recipientId) !== userId) {
            throw new ForbiddenException('You are not allowed to mark this notification');
        }

        if (!notification.read) {
            notification.read = true;
            await notification.save();

            await this.auditModel.create({
                notificationId: notification._id,
                eventType: 'READ',
                userId: new Types.ObjectId(userId),
            });

            // ▶ realtime push
            this.gateway.emitToUser(userId, 'notification:read', { id: String(notification._id) });
        }

        return notification;
    }

    async deleteNotification(notificationId: string, userId: string) {
        const notification = await this.notificationModel.findById(notificationId);
        if (!notification) throw new NotFoundException('Notification not found');

        if (String(notification.recipientId) !== userId) {
            const sender = await this.userModel.findById(userId);
            if (!sender || sender.role !== UserRole.ADMIN) {
                throw new ForbiddenException('You are not allowed to delete this notification');
            }
        }

        await this.notificationModel.findByIdAndDelete(notificationId);
        await this.auditModel.create({
            notificationId: notification._id,
            eventType: 'DELETED',
            userId: new Types.ObjectId(notification.recipientId),
        });

        // ▶ realtime push
        this.gateway.emitToUser(String(notification.recipientId), 'notification:deleted', { id: String(notification._id) });
    }

    async markAllAsRead(userId: string) {
        await this.notificationModel.updateMany(
            { recipientId: userId, read: false },
            { $set: { read: true } },
        );

        const updated = await this.notificationModel
            .find({ recipientId: userId, read: true })
            .select('_id')
            .exec();

        const auditLogs = updated.map((notif) => ({
            notificationId: notif._id,
            eventType: 'READ',
            userId: new Types.ObjectId(userId),
        }));
        if (auditLogs.length) await this.auditModel.insertMany(auditLogs);

        // ▶ realtime push (bulk)
        this.gateway.emitToUser(userId, 'notification:readAll', {
            ids: updated.map((n) => String(n._id)),
        });
    }
    async getUserNotifications(userId: string): Promise<NotificationDocument[]> {
        const userExists = await this.userModel.exists({ _id: userId });
        if (!userExists) throw new NotFoundException('User not found');

        return this.notificationModel.find({ recipientId: userId }).sort({ createdAt: -1 }).exec();
    }

}