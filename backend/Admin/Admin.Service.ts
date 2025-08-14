// src/Admin/admin.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { User, UserDocument } from '../Database/User';
import { Course, CourseDocument } from '../Database/Course';
import { NotificationService } from '../Communication/Notifications/Notification.Service';
import { UserRole } from '../Database/User';
import {AuditLogService} from "../Audit-Log/Audit-Log.Service";

@Injectable()
export class AdminService {
    constructor(
        @InjectModel('User')   private readonly userModel: Model<UserDocument>,
        @InjectModel('Course') private readonly courseModel: Model<CourseDocument>,
        private readonly notifications: NotificationService,
        private readonly audit:AuditLogService,
    ) {}

    // ---------- USERS (paginated + filters) ----------
    async listUsers(params: { q?: string; role?: UserRole; verified?: 'true'|'false'; page?: number; limit?: number }) {
        const page  = Math.max(1, Number(params.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(params.limit) || 20));
        const skip  = (page - 1) * limit;

        const q: FilterQuery<UserDocument> = {};
        if (params.role) q.role = params.role;
        if (params.verified) q.isEmailVerified = params.verified === 'true';
        if (params.q) {
            q.$or = [
                { name:  { $regex: params.q, $options: 'i' } },
                { email: { $regex: params.q, $options: 'i' } },
            ];
        }

        const [items, total] = await Promise.all([
            this.userModel.find(q).sort({ createdAt: -1 }).skip(skip).limit(limit).lean().exec(),
            this.userModel.countDocuments(q).exec(),
        ]);
        return { items, total, page, limit, pages: Math.ceil(total/limit) };
    }

    // ---------- COURSES (paginated + filters) ----------
    async listCourses(params: { q?: string; status?: 'active'|'archived'|'draft'; page?: number; limit?: number }) {
        const page  = Math.max(1, Number(params.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(params.limit) || 20));
        const skip  = (page - 1) * limit;

        const q: FilterQuery<CourseDocument> = {};
        if (params.status) q.status = params.status;
        if (params.q) {
            q.$or = [
                { title:       { $regex: params.q, $options: 'i' } },
                { description: { $regex: params.q, $options: 'i' } },
            ];
        }

        const [items, total] = await Promise.all([
            this.courseModel.find(q).sort({ createdAt: -1 }).skip(skip).limit(limit).lean().exec(),
            this.courseModel.countDocuments(q).exec(),
        ]);
        return { items, total, page, limit, pages: Math.ceil(total/limit) };
    }

    // ---------- ENROLLMENTS (derived from Course.studentsEnrolled) ----------
    async listEnrollments(params: { q?: string; courseId?: string; userId?: string; page?: number; limit?: number }) {
        const page  = Math.max(1, Number(params.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(params.limit) || 20));
        const skip  = (page - 1) * limit;

        const match: any = {};
        if (params.courseId) match._id = new Types.ObjectId(params.courseId);

        // aggregate from courses → studentsEnrolled → join users
        const pipeline: any[] = [
            { $match: match },
            { $project: { title: 1, studentsEnrolled: 1 } },
            { $unwind: '$studentsEnrolled' },
            ...(params.userId ? [{ $match: { studentsEnrolled: new Types.ObjectId(params.userId) } }] : []),
            { $lookup: {
                    from: 'users',
                    localField: 'studentsEnrolled',
                    foreignField: '_id',
                    as: 'student'
                }
            },
            { $unwind: '$student' },
            ...(params.q ? [{
                $match: {
                    $or: [
                        { title: { $regex: params.q, $options: 'i' } },
                        { 'student.name': { $regex: params.q, $options: 'i' } },
                        { 'student.email': { $regex: params.q, $options: 'i' } },
                    ]
                }
            }] : []),
            { $sort: { title: 1, 'student.name': 1 } },
            { $facet: {
                    paged: [{ $skip: skip }, { $limit: limit }],
                    count: [{ $count: 'total' }]
                }
            },
        ];

        const res = await this.courseModel.aggregate(pipeline).exec();
        const items = (res?.[0]?.paged ?? []).map((row: any) => ({
            courseId:  row._id,
            courseTitle: row.title,
            userId:    row.student._id,
            name:      row.student.name,
            email:     row.student.email,
        }));
        const total = res?.[0]?.count?.[0]?.total ?? 0;

        return { items, total, page, limit, pages: Math.ceil(total/limit) };
    }

    // ---------- COURSE STATUS ----------
    async updateCourseStatus(courseId: string, status: 'active'|'archived'|'draft') {
        const course = await this.courseModel.findById(courseId).exec();
        if (!course) throw new NotFoundException('Course not found');

        course.status = status;
        if (status === 'archived') (course as any).archivedAt = new Date();
        await course.save();

        return course;
    }

    // ---------- ANNOUNCEMENTS ----------
    async announceAll(adminId: string, message: string) {
        // send to all users (chunked to avoid huge fan-out)
        const cursor = this.userModel.find({}, { _id: 1 }).cursor();
        for await (const u of cursor) {
            await this.notifications.createNotification({ recipientId: String(u._id), type: 'announcement', message }, adminId);
        }
        return { ok: true };
    }

    async announceRole(adminId: string, role: UserRole, message: string) {
        const cursor = this.userModel.find({ role }, { _id: 1 }).cursor();
        for await (const u of cursor) {
            await this.notifications.createNotification({ recipientId: String(u._id), type: 'announcement', message }, adminId);
        }
        return { ok: true };
    }

    async announceCourse(adminId: string, courseId: string, message: string, to: 'students'|'instructor'|'all' = 'all') {
        const course = await this.courseModel.findById(courseId).lean().exec();
        if (!course) throw new NotFoundException('Course not found');

        const tasks: Promise<any>[] = [];

        if (to === 'students' || to === 'all') {
            for (const sid of course.studentsEnrolled ?? []) {
                tasks.push(
                    this.notifications.createNotification(
                        { recipientId: String(sid), type: 'announcement', message, courseId },
                        adminId
                    )
                );
            }
        }
        if (to === 'instructor' || to === 'all') {
            tasks.push(
                this.notifications.createNotification(
                    { recipientId: String(course.instructorId), type: 'announcement', message, courseId },
                    adminId
                )
            );
        }

        await Promise.all(tasks);
        return { ok: true, sent: tasks.length };
    }

    async archiveCourse(courseId: string, adminId: string) {
        const course = await this.courseModel.findById(courseId).exec();
        if (!course) throw new NotFoundException('Course not found');

        // no-op if already archived
        if (course.status !== 'archived') {
            course.status = 'archived';
            (course as any).archivedAt = new Date();
            await course.save();

            await this.audit.log('COURSE_ARCHIVE', adminId, {
                courseId: String(course._id),
                title: course.title,
                archivedAt: course['archivedAt'],
            });
        }

        return course;
    }

    async removeCourse(courseId: string, adminId: string) {
        const course = await this.courseModel.findById(courseId).exec();
        if (!course) throw new NotFoundException('Course not found');

        await this.courseModel.deleteOne({ _id: course._id }).exec();

        await this.audit.log('COURSE_REMOVE', adminId, {
            courseId: String(course._id),
            title: course.title,
        });

        return { deleted: true };
    }

    // (optional) bulk-archive by createdAt threshold
    async archiveOutdated(beforeISO: string, adminId: string) {
        const before = new Date(beforeISO);
        const candidates = await this.courseModel
            .find({ status: { $ne: 'archived' }, createdAt: { $lte: before } })
            .select('_id title')
            .exec();

        if (!candidates.length) return { archived: 0 };

        const ids = candidates.map(c => c._id);
        const now = new Date();

        await this.courseModel.updateMany(
            { _id: { $in: ids } },
            { $set: { status: 'archived', archivedAt: now } },
        );

        // audit each (keeps logs simple to query)
        await Promise.all(
            candidates.map(c =>
                this.audit.log('COURSE_ARCHIVE', adminId, {
                    courseId: String(c._id),
                    title: c.title,
                    archivedAt: now,
                    reason: 'bulk',
                }),
            ),
        );

        return { archived: candidates.length };
    }




}