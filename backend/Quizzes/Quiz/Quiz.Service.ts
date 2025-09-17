import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Quiz, QuizDocument } from '../../Database/Quiz';
import { User, UserDocument } from '../../Database/User';
import { CreateQuizDto, UpdateQuizDto } from '../../DTO/QuizDTO';

@Injectable()
export class QuizService {
    constructor(
        @InjectModel(Quiz.name) private readonly quizModel: Model<QuizDocument>,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>
    ) {}

    async create(createQuizDto: CreateQuizDto): Promise<Quiz> {
        const questions = (createQuizDto.questions || []).map(q => ({
            ...q,
            questionId: q.questionId ?? new Types.ObjectId().toString(),
        }));

        const quiz = new this.quizModel({
            ...createQuizDto,
            questions,
        });
        return await quiz.save();
    }


    async findAll(): Promise<Quiz[]> {
        return this.quizModel.find().populate('createdBy', 'name email').exec();
    }

    async findOne(id: string): Promise<Quiz> {
        const quiz = await this.quizModel.findById(id).populate('createdBy', 'name email').exec();
        if (!quiz) throw new NotFoundException('Quiz not found');
        return quiz;
    }

    async update(id: string, updateQuizDto: UpdateQuizDto, userId: string): Promise<Quiz> {
        const quiz = await this.quizModel.findById(id).exec();
        if (!quiz) throw new NotFoundException('Quiz not found');

        // if createdBy is an ObjectId, compare properly
        if (!quiz.createdBy?.equals?.(new Types.ObjectId(userId))) {
            throw new ForbiddenException('Unauthorized');
        }

        const next: any = { ...updateQuizDto };
        if (next.questions) {
            next.questions = next.questions.map((q: any) => ({
                ...q,
                questionId: q.questionId ?? new Types.ObjectId().toString(),
            }));
        }

        Object.assign(quiz, next);
        return await quiz.save();
    }

    async remove(id: string, userId: string): Promise<void> {
        const quiz = await this.quizModel.findById(id).exec();
        if (!quiz) throw new NotFoundException('Quiz not found');
        if (!quiz.createdBy.equals(userId)) throw new ForbiddenException('Unauthorized');

        await this.quizModel.findByIdAndDelete(id).exec();
    }

    async findByModuleId(moduleId: string): Promise<Quiz[]> {
        return this.quizModel
            .find({ moduleId: new Types.ObjectId(moduleId) })
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .exec();
    }
}
