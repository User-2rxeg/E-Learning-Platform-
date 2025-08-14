import {BadRequestException, ForbiddenException, Injectable, NotFoundException} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course, CourseDocument } from '../Database/Course';
import { User, UserDocument } from '../Database/User';
import {CourseDTO, FeedbackDto, ModuleDto, UpdateCourseDto} from "../DTO/CourseDTO";


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

    async searchCourses(searchParams: { title?: string; instructorName?: string; tag?: string }): Promise<Course[]> {
        const query: any = {};

        if (searchParams.title) {
            query.title = { $regex: searchParams.title, $options: 'i' };
        }

        if (searchParams.tag) {
            query.tags = searchParams.tag;
        }

        if (searchParams.instructorName) {
            const instructor = await this.userModel.findOne({ name: { $regex: searchParams.instructorName, $options: 'i' } }).exec();
            if (instructor) query.instructorId = instructor._id;
            else return []; // No instructor match found
        }

        return this.courseModel.find(query).populate('instructorId', 'name email').exec();
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


}
