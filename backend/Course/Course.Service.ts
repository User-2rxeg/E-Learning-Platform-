import {BadRequestException, ForbiddenException, Injectable, NotFoundException} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course, CourseDocument } from '../Database/Course';
import {User, UserDocument, UserRole} from '../Database/User';
import {CourseDTO, FeedbackDto, ModuleDto, UpdateCourseDto} from "../DTO/CourseDTO";
import nodemailer from "nodemailer";


@Injectable()
export class CourseService {
    constructor(
        @InjectModel(Course.name) private readonly courseModel: Model<CourseDocument>,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>
    ) {}

    async create(createCourseDto: CourseDTO): Promise<Course> {
        const course = new this.courseModel(createCourseDto);
        return await course.save();
    }

    async findAll(): Promise<Course[]> {
        return this.courseModel.find().populate('instructorId', 'name email').exec();
    }

    async findOne(id: string): Promise<Course> {
        const course = await this.courseModel.findById(id).populate('instructorId', 'name email').exec();
        if (!course) throw new NotFoundException('Course not found');
        return course;
    }

    async update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
        const updated = await this.courseModel.findByIdAndUpdate(id, updateCourseDto, { new: true }).exec();
        if (!updated) throw new NotFoundException('Course not found');
        return updated;
    }

    async remove(id: string): Promise<void> {
        const deleted = await this.courseModel.findByIdAndDelete(id).exec();
        if (!deleted) throw new NotFoundException('Course not found');
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

    async enrollStudent(courseId: string, studentId: string): Promise<CourseDocument> {
        if (!Types.ObjectId.isValid(courseId)) throw new BadRequestException('Invalid Course ID');
        if (!Types.ObjectId.isValid(studentId)) throw new BadRequestException('Invalid Student ID');

        const student = await this.userModel.findById(studentId).exec();
        if (!student) throw new NotFoundException('Student not found');
        if (student.role !== 'student') throw new ForbiddenException('Only students can enroll in courses');

        const updatedCourse = await this.courseModel.findByIdAndUpdate(
            courseId,
            { $addToSet: { studentsEnrolled: studentId } }, // Add if not exists
            { new: true }
        ).exec();

        if (!updatedCourse) throw new NotFoundException(`Course not found`);

        return updatedCourse;
    }


    async addFeedback(courseId: string, feedbackDto: FeedbackDto, studentId: string): Promise<CourseDocument> {
        if (!Types.ObjectId.isValid(courseId)) throw new BadRequestException('Invalid Course ID');
        if (!Types.ObjectId.isValid(studentId)) throw new BadRequestException('Invalid Student ID');

        const course = await this.courseModel.findById(courseId).exec();
        if (!course) throw new NotFoundException('Course not found');

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

        if (!updatedCourse) throw new NotFoundException('Course not found after feedback update');

        return updatedCourse;
    }

    async addVersionHistory(courseId: string, versionData: { version: string, changes: string }): Promise<CourseDocument> {
        if (!Types.ObjectId.isValid(courseId)) throw new BadRequestException('Invalid Course ID');

        const updatedCourse = await this.courseModel.findByIdAndUpdate(
            courseId,
            { $push: { versionHistory: { ...versionData, updatedAt: new Date() } } },
            { new: true }
        ).exec();

        if (!updatedCourse) throw new NotFoundException(`Course not found`);

        return updatedCourse;
    }

    async addModule(courseId: string, moduleData: ModuleDto): Promise<CourseDocument> {
        if (!Types.ObjectId.isValid(courseId)) throw new BadRequestException('Invalid Course ID');

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
        if (!course) throw new NotFoundException('Course not found');

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
        if (!course) throw new NotFoundException('Course not found');

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
        if (!course) throw new NotFoundException('Course not found');
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
        if (!course) throw new NotFoundException('Course not found');
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
        if (!course) throw new NotFoundException('Course not found');

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
        if (!course) throw new NotFoundException('Course not found');

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
        })
            .populate('instructorId', 'name')
            .lean()
            .exec();

        // Add progress information
        const coursesWithProgress = await Promise.all(courses.map(async course => {
            // You could get this from your Performance collection if available
            return {
                ...course,
                progress: 0 // Replace with actual progress if you have it
            };
        }));

        return coursesWithProgress;}


}
