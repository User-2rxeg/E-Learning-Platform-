import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Performance } from '../database/performance';

interface ProgressUpdate {
    courseId: string;
    completedResources: string[];
    currentModule: number;
    currentResource: number;
    overallProgress: number;
}

@Injectable()
export class ProgressTrackingService {
    constructor(
        @InjectModel(Performance.name) private readonly performanceModel: Model<Performance>
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
        let performance: any = await this.performanceModel.findOne({
            studentId: studentObjectId,
            courseId: courseObjectId
        });

        if (!performance) {
            performance = await this.performanceModel.create({
                studentId: studentObjectId,
                courseId: courseObjectId,
                progress: progressData.overallProgress,
                completedResources: progressData.completedResources,
                currentModule: progressData.currentModule,
                currentResource: progressData.currentResource,
                lastAccessed: new Date(),
                scores: [],
                engagementLog: [{
                    activity: 'progress_update',
                    duration: 0,
                    timestamp: new Date(),
                }],
                quizStats: []
            });
            return;
        }

        // Update progress data
        await this.performanceModel.findByIdAndUpdate(performance._id, {
            progress: progressData.overallProgress,
            completedResources: progressData.completedResources,
            currentModule: progressData.currentModule,
            currentResource: progressData.currentResource,
            lastAccessed: new Date(),
            $push: {
                engagementLog: {
                    activity: 'progress_update',
                    duration: 0,
                    timestamp: new Date(),
                }
            }
        });
    }

    async getProgress(studentId: string, courseId: string): Promise<any> {
        if (!Types.ObjectId.isValid(courseId) || !Types.ObjectId.isValid(studentId)) {
            throw new BadRequestException('Invalid IDs');
        }

        const performance: any = await this.performanceModel.findOne({
            studentId: new Types.ObjectId(studentId),
            courseId: new Types.ObjectId(courseId)
        }).lean();

        if (!performance) {
            // Return default progress if none exists
            return {
                courseId,
                studentId,
                completedResources: [],
                currentModule: 0,
                currentResource: 0,
                overallProgress: 0,
                lastAccessed: null
            };
        }

        return {
            courseId,
            studentId,
            completedResources: performance.completedResources || [],
            currentModule: performance.currentModule || 0,
            currentResource: performance.currentResource || 0,
            overallProgress: performance.progress || 0,
            lastAccessed: performance.lastAccessed
        };
    }

    async getProgressSummary(studentId: string): Promise<any[]> {
        if (!Types.ObjectId.isValid(studentId)) {
            throw new BadRequestException('Invalid student ID');
        }

        const performances: any[] = await this.performanceModel.find({
            studentId: new Types.ObjectId(studentId)
        }).lean();

        return performances.map(p => ({
            courseId: String(p.courseId),
            progress: p.progress || 0,
            completedResources: p.completedResources?.length || 0,
            lastAccessed: p.lastAccessed
        }));
    }
}