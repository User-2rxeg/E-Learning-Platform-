import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Performance, PerformanceDocument } from '../Database/Performance';

interface ProgressUpdate {
    courseId: string;
    completedResources: string[];
    currentModule: number;
    currentResource: number;
    overallProgress: number;
}

@Injectable()
export class ProgressService {
    constructor(
        @InjectModel(Performance.name) private readonly performanceModel: Model<PerformanceDocument>
    ) {}

    async saveProgress(studentId: string, progressData: ProgressUpdate): Promise<void> {
        if (!Types.ObjectId.isValid(progressData.courseId)) {
            throw new BadRequestException('Invalid course ID');
        }
        if (!Types.ObjectId.isValid(studentId)) {
            throw new BadRequestException('Invalid student ID');
        }

        const courseObjectId = new Types.ObjectId(progressData.courseId);
        const studentObjectId = new Types.ObjectId(studentId);

        // Find existing performance record or create new one
        let performance = await this.performanceModel.findOne({
            studentId: studentObjectId,
            courseId: courseObjectId
        }).exec();

        if (!performance) {
            performance = new this.performanceModel({
                studentId: studentObjectId,
                courseId: courseObjectId,
                progress: 0,
                scores: [],
                engagementLog: [],
                quizStats: []
            });
        }

        // Update progress data
        performance.progress = progressData.overallProgress;
        performance.completedResources = progressData.completedResources;
        performance.currentModule = progressData.currentModule;
        performance.currentResource = progressData.currentResource;
        performance.lastAccessed = new Date();

        // Add engagement log entry
        if (!performance.engagementLog) performance.engagementLog = [];
        performance.engagementLog.push({
            activity: "", duration: 0,
            timestamp: new Date(),

        });

        await performance.save();
    }

    async getProgress(studentId: string, courseId: string): Promise<any> {
        if (!Types.ObjectId.isValid(courseId) || !Types.ObjectId.isValid(studentId)) {
            throw new BadRequestException('Invalid IDs');
        }

        const performance = await this.performanceModel.findOne({
            studentId: new Types.ObjectId(studentId),
            courseId: new Types.ObjectId(courseId)
        }).exec();

        if (!performance) {
            // Return default progress if none exists
            return {
                courseId,
                studentId,
                completedResources: [],
                currentModule: 0,
                currentResource: 0,
                overallProgress: 0,
                lastAccessed: new Date()
            };
        }

        return {
            courseId: courseId,
            studentId: studentId,
            completedResources: performance.completedResources || [],
            currentModule: performance.currentModule || 0,
            currentResource: performance.currentResource || 0,
            overallProgress: performance.progress || 0,
            lastAccessed: performance.lastAccessed
        };
    }

    async getStudentProgressSummary(studentId: string): Promise<any[]> {
        if (!Types.ObjectId.isValid(studentId)) {
            throw new BadRequestException('Invalid student ID');
        }

        const progressRecords = await this.performanceModel
            .find({ studentId: new Types.ObjectId(studentId) })
            .populate('courseId', 'title description')
            .exec();

        return progressRecords.map(record => ({
            courseId: record.courseId,
            progress: record.progress || 0,
            completedResources: record.completedResources?.length || 0,
            lastAccessed: record.lastAccessed,
            averageScore: record.scores?.length
                ? record.scores.reduce((a, b) => a , 0) / record.scores.length
                : 0
        }));
    }
}