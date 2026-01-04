import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Performance, PerformanceDocument } from '../../database/performance';
import { CreatePerformanceDto, UpdatePerformanceDto } from '../../dto\'s/performance-dto\'s';

@Injectable()
export class PerformanceService {
    constructor(
        @InjectModel(Performance.name)
        private performanceModel: Model<PerformanceDocument>,
    ) {}

    async create(createDto: CreatePerformanceDto): Promise<Performance> {
        const newPerformance = new this.performanceModel(createDto);
        return await newPerformance.save();
    }

    async findAll(): Promise<Performance[]> {
        return this.performanceModel
            .find()
            .populate('studentId courseId scores.moduleId scores.quizId')
            .exec();
    }

    async findByStudent(studentId: string): Promise<Performance[]> {
        return this.performanceModel
            .find({ studentId })
            .populate('courseId scores.moduleId scores.quizId')
            .exec();
    }

    async findOne(id: string): Promise<Performance> {
        const perf = await this.performanceModel
            .findById(id)
            .populate('studentId courseId scores.moduleId scores.quizId')
            .exec();

        if (!perf) throw new NotFoundException('performance record not found');
        return perf;
    }

    async update(id: string, updateDto: UpdatePerformanceDto): Promise<Performance> {
        const updated = await this.performanceModel
            .findByIdAndUpdate(id, updateDto, { new: true })
            .exec();

        if (!updated) throw new NotFoundException('performance record not found for update');
        return updated;
    }

    async delete(id: string): Promise<void> {
        const result = await this.performanceModel.findByIdAndDelete(id).exec();
        if (!result) throw new NotFoundException('performance record not found for deletion');
    }
}