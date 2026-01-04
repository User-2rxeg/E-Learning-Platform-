import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument } from '../database/notification';
import { User, UserRole } from '../database/user';

@Injectable()
export class NotificationService {
    constructor(
        @InjectModel(Notification.name) private readonly notificationModel: Model<Notification>,
        @InjectModel(User.name) private readonly userModel: Model<User>,
    ) {}

    // Create a notification for a single user
    async createNotification(data: {
        recipientId: string;
        type: string;
        message: string;
        courseId?: string;
        sentBy?: string;
    }) {
        const notification = new this.notificationModel({
            recipientId: new Types.ObjectId(data.recipientId),
            type: data.type,
            message: data.message,
            courseId: data.courseId ? new Types.ObjectId(data.courseId) : undefined,
            sentBy: data.sentBy ? new Types.ObjectId(data.sentBy) : undefined,
            read: false,
        });
        return notification.save();
    }

    // Send notification to all users (platform-wide announcement)
    async sendToAllUsers(message: string, type: string, sentBy: string) {
        const users = await this.userModel.find({}, { _id: 1 }).lean();
        const notifications = users.map(user => ({
            recipientId: user._id,
            type,
            message,
            sentBy: new Types.ObjectId(sentBy),
            read: false,
        }));
        return this.notificationModel.insertMany(notifications);
    }

    // Send notification to all users with a specific role
    async sendToRole(role: UserRole, message: string, type: string, sentBy: string) {
        const users = await this.userModel.find({ role }, { _id: 1 }).lean();
        const notifications = users.map(user => ({
            recipientId: user._id,
            type,
            message,
            sentBy: new Types.ObjectId(sentBy),
            read: false,
        }));
        return this.notificationModel.insertMany(notifications);
    }

    // Send notification to all students enrolled in a course
    async sendToCourseStudents(courseId: string, message: string, type: string, sentBy: string) {
        // Assuming Course model has studentsEnrolled field
        const Course = this.notificationModel.db.model('Course');
        const course = await Course.findById(courseId).select('studentsEnrolled').lean();

        if (!course) throw new NotFoundException('Course not found');

        const studentIds = (course as any).studentsEnrolled || [];
        const notifications = studentIds.map((studentId: Types.ObjectId) => ({
            recipientId: studentId,
            type,
            message,
            courseId: new Types.ObjectId(courseId),
            sentBy: new Types.ObjectId(sentBy),
            read: false,
        }));

        if (notifications.length > 0) {
            return this.notificationModel.insertMany(notifications);
        }
        return [];
    }

    // Get notifications for a user
    async getUserNotifications(userId: string, page = 1, limit = 20, unreadOnly = false) {
        const skip = (page - 1) * limit;
        const query: any = { recipientId: new Types.ObjectId(userId) };
        if (unreadOnly) query.read = false;

        const [notifications, total, unreadCount] = await Promise.all([
            this.notificationModel
                .find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('sentBy', 'name email')
                .populate('courseId', 'title')
                .lean(),
            this.notificationModel.countDocuments(query),
            this.notificationModel.countDocuments({ recipientId: new Types.ObjectId(userId), read: false }),
        ]);

        return { notifications, total, unreadCount, page, limit };
    }

    // Mark notification as read
    async markAsRead(notificationId: string, userId: string) {
        const notification = await this.notificationModel.findById(notificationId);
        if (!notification) throw new NotFoundException('Notification not found');
        if (notification.recipientId.toString() !== userId) {
            throw new ForbiddenException('Cannot mark other user\'s notification as read');
        }
        notification.read = true;
        return notification.save();
    }

    // Mark all notifications as read for a user
    async markAllAsRead(userId: string) {
        const result = await this.notificationModel.updateMany(
            { recipientId: new Types.ObjectId(userId), read: false },
            { $set: { read: true } }
        );
        return { markedAsRead: result.modifiedCount };
    }

    // Delete a notification
    async deleteNotification(notificationId: string, userId: string) {
        const notification = await this.notificationModel.findById(notificationId);
        if (!notification) throw new NotFoundException('Notification not found');
        if (notification.recipientId.toString() !== userId) {
            throw new ForbiddenException('Cannot delete other user\'s notification');
        }
        await this.notificationModel.findByIdAndDelete(notificationId);
        return { deleted: true };
    }

    // Send enrollment confirmation notification
    async sendEnrollmentConfirmation(studentId: string, courseId: string, courseTitle: string) {
        return this.createNotification({
            recipientId: studentId,
            type: 'courseUpdate',
            message: `You have successfully enrolled in "${courseTitle}". Start learning now!`,
            courseId,
        });
    }

    // Send course update notification
    async sendCourseUpdateNotification(courseId: string, courseTitle: string, updateMessage: string, sentBy: string) {
        return this.sendToCourseStudents(
            courseId,
            `Course Update for "${courseTitle}": ${updateMessage}`,
            'courseUpdate',
            sentBy
        );
    }
}

