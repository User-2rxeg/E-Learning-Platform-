import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {Course, CourseDocument, CourseStatus} from '../database/course';
import { Module as CourseModule } from '../database/module';
import { User, UserRole } from '../database/user';
import { FeedbackDto, ModuleDto, UpdateCourseDto, CourseDTO } from "../dto's/courses-dtos's";
import { AuditLogService } from '../audit-log/audit-logging.service';
import { Logs } from '../audit-log/Logs';
import { NotificationService } from '../notifications/notification.service';
import { MailService } from '../auth/email/email-service';


@Injectable()
export class CoursesService {
    constructor(
        @InjectModel(Course.name) private readonly courseModel: Model<Course>,
        @InjectModel(CourseModule.name) private readonly moduleModel: Model<CourseModule>,
        @InjectModel(User.name) private readonly userModel: Model<User>,
        private readonly audit: AuditLogService,
        private readonly notificationService: NotificationService,
        private readonly mailService: MailService,
    ) {}

    async create(createCourseDto: CourseDTO): Promise<Course> {
        const course = new this.courseModel(createCourseDto);
        return await course.save();
    }

    async findAll(): Promise<any[]> {
        return this.courseModel.find().populate('instructorId', 'name email').populate('modules').lean();
    }

    async findOne(id: string): Promise<any> {
        const course = await this.courseModel.findById(id)
            .populate('instructorId', 'name email')
            .populate('modules')
            .lean();
        if (!course) throw new NotFoundException('Course not found');
        return course;
    }

    async update(id: string, updateCourseDto: UpdateCourseDto): Promise<any> {
        const updated = await this.courseModel.findByIdAndUpdate(id, updateCourseDto, { new: true }).lean();
        if (!updated) throw new NotFoundException('Course not found');
        return updated;
    }

    async remove(id: string): Promise<void> {
        const course = await this.courseModel.findById(id);
        if (!course) throw new NotFoundException('Course not found');

        // Also delete associated modules
        await this.moduleModel.deleteMany({ courseId: new Types.ObjectId(id) });
        await this.courseModel.findByIdAndDelete(id);
    }

    // Module management methods
    async createModule(courseId: string, moduleDto: ModuleDto, userId: string): Promise<any> {
        const course = await this.courseModel.findById(courseId);
        if (!course) throw new NotFoundException('Course not found');

        // Get max order
        const maxOrderModule = await this.moduleModel
            .findOne({ courseId: new Types.ObjectId(courseId) })
            .sort({ order: -1 })
            .lean();

        const order = maxOrderModule ? (maxOrderModule.order || 0) + 1 : 0;

        const module = await this.moduleModel.create({
            ...moduleDto,
            courseId: new Types.ObjectId(courseId),
            order,
        });

        // Add module reference to course
        await this.courseModel.findByIdAndUpdate(courseId, {
            $push: { modules: module._id },
        });

        return module;
    }

    async getModules(courseId: string): Promise<any[]> {
        return this.moduleModel.find({ courseId: new Types.ObjectId(courseId) })
            .sort({ order: 1 })
            .lean();
    }

    async getModule(moduleId: string): Promise<any> {
        const module = await this.moduleModel.findById(moduleId).lean();
        if (!module) throw new NotFoundException('Module not found');
        return module;
    }

    async updateModule(moduleId: string, moduleDto: Partial<ModuleDto>): Promise<any> {
        const module = await this.moduleModel.findByIdAndUpdate(moduleId, moduleDto, { new: true }).lean();
        if (!module) throw new NotFoundException('Module not found');
        return module;
    }

    async deleteModule(courseId: string, moduleId: string): Promise<void> {
        const module = await this.moduleModel.findById(moduleId);
        if (!module) throw new NotFoundException('Module not found');

        // Remove module reference from course
        await this.courseModel.findByIdAndUpdate(courseId, {
            $pull: { modules: new Types.ObjectId(moduleId) },
        });

        // Delete the module
        await this.moduleModel.findByIdAndDelete(moduleId);
    }


    async searchCourses(searchParams: {
        title?: string;
        instructorName?: string;
        tag?: string;
        page?: number;
        limit?: number;
    }) {
        const { title, instructorName, tag } = searchParams;
        const page = Math.max(1, searchParams.page ?? 1);
        const limit = Math.min(100, Math.max(1, searchParams.limit ?? 10));
        const skip = (page - 1) * limit;

        const match: any = {};
        if (title?.trim()) {
            // prefer text search if you added the text index; otherwise fallback to regex
            match.$or = [
                { title: { $regex: title.trim(), $options: 'i' } },
                { description: { $regex: title.trim(), $options: 'i' } },
                { tags: { $regex: title.trim(), $options: 'i' } },
            ];
            // If you prefer text search:
            // match.$text = { $search: title.trim() };
        }
        if (tag?.trim()) {
            match.tags = { $in: [tag.trim()] };
        }

        const pipeline: any[] = [
            { $match: match },
            {
                $lookup: {
                    from: 'users',
                    localField: 'instructorId',
                    foreignField: '_id',
                    as: 'instructor',
                },
            },
            { $unwind: '$instructor' },
        ];

        if (instructorName?.trim()) {
            pipeline.push({
                $match: { 'instructor.name': { $regex: instructorName.trim(), $options: 'i' } },
            });
        }

        const countPipeline = [...pipeline, { $count: 'total' }];
        const totalAgg = await this.courseModel.aggregate(countPipeline).exec();
        const total = totalAgg.length ? totalAgg[0].total : 0;

        pipeline.push({ $sort: { createdAt: -1 } }, { $skip: skip }, { $limit: limit });
        pipeline.push({
            $project: {
                title: 1,
                description: 1,
                tags: 1,
                status: 1,
                createdAt: 1,
                updatedAt: 1,
                instructor: { _id: 1, name: 1, email: 1 },
            },
        });

        const items = await this.courseModel.aggregate(pipeline).exec();
        return { items, total, page, limit };
    }

    async enrollStudent(courseId: string, studentId: string): Promise<{ course: any; enrolled: boolean }> {
        if (!Types.ObjectId.isValid(courseId)) throw new BadRequestException('Invalid course ID');
        if (!Types.ObjectId.isValid(studentId)) throw new BadRequestException('Invalid Student ID');

        const student = await this.userModel.findById(studentId);
        if (!student) throw new NotFoundException('Student not found');
        if (student.role !== UserRole.STUDENT) throw new ForbiddenException('Only students can enroll in courses');

        const course = await this.courseModel.findById(courseId).populate('instructorId', 'name email');
        if (!course) throw new NotFoundException('Course not found');

        // Edge case: Check if course is active
        if (course.status !== CourseStatus.ACTIVE) {
            throw new BadRequestException('Cannot enroll in a course that is not active');
        }

        // Edge case: Check enrollment dates
        const now = new Date();
        if (course.enrollmentStartDate && now < course.enrollmentStartDate) {
            throw new BadRequestException('Enrollment has not started yet');
        }
        if (course.enrollmentEndDate && now > course.enrollmentEndDate) {
            throw new BadRequestException('Enrollment period has ended');
        }

        // Edge case: Check max enrollment
        if (course.maxEnrollment > 0 && course.studentsEnrolled.length >= course.maxEnrollment) {
            // Add to waitlist instead
            const alreadyOnWaitlist = course.waitlist?.some(id => id.toString() === studentId);
            if (!alreadyOnWaitlist) {
                await this.courseModel.findByIdAndUpdate(courseId, {
                    $addToSet: { waitlist: studentId }
                });
            }
            throw new BadRequestException('Course is full. You have been added to the waitlist.');
        }

        // Check if already enrolled
        const alreadyEnrolled = course.studentsEnrolled.some(
            id => id.toString() === studentId
        );
        if (alreadyEnrolled) {
            throw new BadRequestException('Student is already enrolled in this course');
        }

        // Add student to course
        const updatedCourse = await this.courseModel.findByIdAndUpdate(
            courseId,
            { $addToSet: { studentsEnrolled: studentId } },
            { new: true }
        );

        // Add course to student's enrolledCourses
        await this.userModel.findByIdAndUpdate(
            studentId,
            { $addToSet: { enrolledCourses: courseId } }
        );

        // Audit log
        await this.audit.log(Logs.COURSE_ENROLLED, studentId, {
            courseId,
            courseTitle: course.title,
            instructorId: course.instructorId.toString(),
        });

        // Send notification
        await this.notificationService.sendEnrollmentConfirmation(studentId, courseId, course.title);

        // Send email notification
        const instructor = course.instructorId as any;
        try {
            await this.mailService.sendEnrollmentConfirmation(
                student.email,
                student.name,
                course.title,
                instructor?.name || 'Instructor'
            );
        } catch (e) {
            console.error('Failed to send enrollment email:', e);
        }

        return { course: updatedCourse!, enrolled: true };
    }

    // Archive a course (Admin/Instructor)
    async archiveCourse(courseId: string, requesterId: string, requesterRole: UserRole) {
        const course = await this.courseModel.findById(courseId);
        if (!course) throw new NotFoundException('Course not found');

        // Check authorization
        const isOwner = course.instructorId.toString() === requesterId;
        if (!isOwner && requesterRole !== UserRole.ADMIN) {
            throw new ForbiddenException('Only course owner or admin can archive');
        }

        // Edge case: Already archived
        if (course.status === CourseStatus.ARCHIVED) {
            throw new BadRequestException('Course is already archived');
        }

        const updatedCourse = await this.courseModel.findByIdAndUpdate(
            courseId,
            {
                status: CourseStatus.ARCHIVED,
                archivedAt: new Date(),
                archivedBy: new Types.ObjectId(requesterId),
            },
            { new: true }
        );

        // Audit log
        await this.audit.log(Logs.COURSE_ARCHIVED, requesterId, {
            courseId,
            courseTitle: course.title,
        });

        // Notify enrolled students
        for (const studentId of course.studentsEnrolled) {
            await this.notificationService.createNotification({
                recipientId: studentId.toString(),
                type: 'courseUpdate',
                message: `The course "${course.title}" has been archived and is no longer available for new content.`,
                courseId,
            });
        }

        return updatedCourse;
    }

    // Complete a course (mark as completed for a student)
    async completeCourse(courseId: string, studentId: string) {
        const course = await this.courseModel.findById(courseId);
        if (!course) throw new NotFoundException('Course not found');

        const student = await this.userModel.findById(studentId);
        if (!student) throw new NotFoundException('Student not found');

        // Check if enrolled
        const isEnrolled = course.studentsEnrolled.some(
            id => id.toString() === studentId
        );
        if (!isEnrolled) {
            throw new ForbiddenException('Student is not enrolled in this course');
        }

        // Edge case: Already completed
        const alreadyCompleted = student.completedCourses?.some(
            id => id.toString() === courseId
        );
        if (alreadyCompleted) {
            throw new BadRequestException('Course already completed');
        }

        // Move course from enrolled to completed
        await this.userModel.findByIdAndUpdate(
            studentId,
            {
                $pull: { enrolledCourses: courseId },
                $addToSet: { completedCourses: courseId },
            }
        );

        // Audit log
        await this.audit.log(Logs.COURSE_COMPLETED, studentId, {
            courseId,
            courseTitle: course.title,
            certificateAvailable: course.certificateAvailable,
        });

        // Send notification
        await this.notificationService.createNotification({
            recipientId: studentId,
            type: 'courseUpdate',
            message: `🎓 Congratulations! You have completed "${course.title}"!`,
            courseId,
        });

        // Send email
        try {
            await this.mailService.sendCourseCompletedEmail(
                student.email,
                student.name,
                course.title,
                new Date(),
                course.certificateAvailable
            );
        } catch (e) {
            console.error('Failed to send course completion email:', e);
        }

        return {
            completed: true,
            courseId,
            courseTitle: course.title,
            certificateAvailable: course.certificateAvailable,
        };
    }


    async addFeedback(courseId: string, feedbackDto: FeedbackDto, studentId: string): Promise<CourseDocument> {
        if (!Types.ObjectId.isValid(courseId)) throw new BadRequestException('Invalid courses ID');
        if (!Types.ObjectId.isValid(studentId)) throw new BadRequestException('Invalid Student ID');

        const course = await this.courseModel.findById(courseId).exec();
        if (!course) throw new NotFoundException('courses not found');

        // Check if student is enrolled in this course
        if (!course.studentsEnrolled.some(id => id.toString() === studentId)) {
            throw new ForbiddenException('Student is not enrolled in this course');
        }

        const feedback = {
            rating: feedbackDto.rating,
            comment: feedbackDto.comment,
            createdAt: new Date(),
        };

        const updatedCourse = await this.courseModel.findByIdAndUpdate(
            courseId,
            { $push: { feedback } },
            { new: true }
        ).exec();

        if (!updatedCourse) throw new NotFoundException('courses not found after feedback update');

        return updatedCourse;
    }

    async addVersionHistory(courseId: string, versionData: { version: string, changes: string }): Promise<CourseDocument> {
        if (!Types.ObjectId.isValid(courseId)) throw new BadRequestException('Invalid courses ID');

        const updatedCourse = await this.courseModel.findByIdAndUpdate(
            courseId,
            { $push: { versionHistory: { ...versionData, updatedAt: new Date() } } },
            { new: true }
        ).exec();

        if (!updatedCourse) throw new NotFoundException(`Course not found`);

        return updatedCourse;
    }

    async addModule(courseId: string, moduleData: ModuleDto): Promise<CourseDocument> {
        if (!Types.ObjectId.isValid(courseId)) throw new BadRequestException('Invalid courses ID');

        const updatedCourse = await this.courseModel.findByIdAndUpdate(
            courseId,
            { $push: { modules: moduleData } },
            { new: true }
        ).exec();

        if (!updatedCourse) throw new NotFoundException(`Course not found`);

        return updatedCourse;
    }

    async findAllPaginated(page: number, limit: number): Promise<{ courses: Course[], total: number }> {
        const skip = (page - 1) * limit;
        const [courses, total] = await Promise.all([
            this.courseModel.find().populate('instructorId', 'name email').skip(skip).limit(limit).exec(),
            this.courseModel.countDocuments().exec()
        ]);
        return { courses, total };
    }

    private inferResourceType(mime: string): 'video' | 'pdf' | 'link' {
        if (mime === 'application/pdf') return 'pdf';
        if (mime?.startsWith?.('video/')) return 'video';
        return 'link';
    }

    private ensureAuthOnCourse(course: CourseDocument, requester: { sub: string; role: UserRole }) {
        const isOwner = String(course.instructorId) === requester.sub;
        if (!(isOwner || requester.role === UserRole.ADMIN)) {
            throw new ForbiddenException('Not allowed to modify this course');
        }
    }

    async addUploadedResource(opts: {
        courseId: string;
        moduleIndex: number;
        fileUrl: string;
        mimetype: string;
        filename: string;
        size: number;
        requester: { sub: string; role: UserRole };
    }) {
        const { courseId, moduleIndex, fileUrl, mimetype, filename, size, requester } = opts;

        const course = await this.courseModel.findById(courseId).exec();
        if (!course) throw new NotFoundException('courses not found');

        this.ensureAuthOnCourse(course, requester);

        if (!course.modules?.[moduleIndex]) {
            throw new BadRequestException('Invalid module index');
        }

        const resourceType = this.inferResourceType(mimetype);
        const resource = {
            resourceType,
            url: fileUrl,
            filename,
            mimeType: mimetype,
            size,
            uploadedBy: new Types.ObjectId(requester.sub),
            uploadedAt: new Date(),
        };

        course.modules[moduleIndex].resources.push(resource as any);
        await course.save();

        // Return the document we just added (last element)
        const added = course.modules[moduleIndex].resources[course.modules[moduleIndex].resources.length - 1];
        return {
            courseId: String(course._id),
            moduleIndex,
            resource: {
                id: String((added as any)._id),
                ...resource,
            },
        };
    }

    async addLinkResource(opts: {
        courseId: string;
        moduleIndex: number;
        url: string;
        requester: { sub: string; role: UserRole };
    }) {
        const { courseId, moduleIndex, url, requester } = opts;
        const course = await this.courseModel.findById(courseId).exec();
        if (!course) throw new NotFoundException('courses not found');

        this.ensureAuthOnCourse(course, requester);

        if (!course.modules?.[moduleIndex]) {
            throw new BadRequestException('Invalid module index');
        }

        const resource = {
            resourceType: 'link' as const,
            url,
            filename: undefined,
            mimeType: 'text/uri-list',
            size: undefined,
            uploadedBy: new Types.ObjectId(requester.sub),
            uploadedAt: new Date(),
        };

        course.modules[moduleIndex].resources.push(resource as any);
        await course.save();

        const added = course.modules[moduleIndex].resources[course.modules[moduleIndex].resources.length - 1];
        return {
            courseId: String(course._id),
            moduleIndex,
            resource: {
                id: String((added as any)._id),
                ...resource,
            },
        };
    }

    async listResources(courseId: string, moduleIndex: number) {
        const course = await this.courseModel
            .findById(courseId)
            .select({ modules: 1, title: 1 })
            .exec();
        if (!course) throw new NotFoundException('courses not found');
        if (!course.modules?.[moduleIndex]) {
            throw new NotFoundException('Module not found');
        }

        const resources = course.modules[moduleIndex].resources.map((r: any) => ({
            id: String(r._id),
            resourceType: r.resourceType,
            url: r.url,
            filename: r.filename,
            mimeType: r.mimeType,
            size: r.size,
            uploadedBy: r.uploadedBy ? String(r.uploadedBy) : undefined,
            uploadedAt: r.uploadedAt,
        }));

        return {
            courseId: String(course._id),
            moduleIndex,
            count: resources.length,
            resources,
        };
    }

    async getResource(courseId: string, moduleIndex: number, resourceId: string) {
        const course = await this.courseModel.findById(courseId).exec();
        if (!course) throw new NotFoundException('courses not found');
        const mod = course.modules?.[moduleIndex];
        if (!mod) throw new NotFoundException('Module not found');

        const res = mod.resources.find((r: any) => String(r._id) === resourceId);
        if (!res) throw new NotFoundException('Resource not found');

        return {
            id: String((res as any)._id),
            resourceType: res.resourceType,
            url: res.url,
            filename: res.filename,
            mimeType: res.mimeType,
            size: res.size,
            uploadedBy: res.uploadedBy ? String(res.uploadedBy) : undefined,
            uploadedAt: res.uploadedAt,
        };
    }

    async deleteResource(opts: {
        courseId: string;
        moduleIndex: number;
        resourceId: string;
        requester: { sub: string; role: UserRole };
    }) {
        const { courseId, moduleIndex, resourceId, requester } = opts;
        const course = await this.courseModel.findById(courseId).exec();
        if (!course) throw new NotFoundException('courses not found');

        this.ensureAuthOnCourse(course, requester);

        const mod = course.modules?.[moduleIndex];
        if (!mod) throw new NotFoundException('Module not found');

        const idx = mod.resources.findIndex((r: any) => String(r._id) === resourceId);
        if (idx === -1) throw new NotFoundException('Resource not found');

        // optionally capture the removed doc for audit
        const removed = mod.resources[idx] as any;
        mod.resources.splice(idx, 1);
        await course.save();

        return {
            removed: true,
            resourceId,
            filename: removed?.filename,
            url: removed?.url,
        };
    }
    async findByInstructor(instructorId: string) {
        return this.courseModel.find({
            instructorId: new Types.ObjectId(instructorId)
        }).lean().exec();
    }



    async listModuleResources(courseId: string, moduleIndex: number) {
        const course = await this.courseModel.findById(courseId);
        if (!course) throw new NotFoundException('courses not found');

        if (moduleIndex < 0 || moduleIndex >= course.modules.length) {
            throw new BadRequestException('Invalid module index');
        }

        return {
            resources: course.modules[moduleIndex].resources || []
        };
    }

    async getEnrolledCourses(studentId: string) {
        const courses = await this.courseModel.find({
            studentsEnrolled: { $elemMatch: { $eq: new Types.ObjectId(studentId) } }
        }).populate('instructorId', 'name').lean();

        return courses.map(course => ({
            ...course,
            progress: 0
        }));
    }


}
