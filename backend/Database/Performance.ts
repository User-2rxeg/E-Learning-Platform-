import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PerformanceDocument = HydratedDocument<Performance>;

@Schema({ timestamps: true })
export class Performance {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    studentId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
    courseId!: Types.ObjectId;

    @Prop({ type: Number, default: 0 })
    progress: number = 0;

    @Prop({
        type: [
            {
                moduleId: { type: Types.ObjectId, ref: 'Course' },
                quizId: { type: Types.ObjectId, ref: 'Quiz' },
                score: { type: Number },
                completedAt: { type: Date, default: () => new Date() },
            },
        ],
        default: [],
    })
    scores!: {
        moduleId: Types.ObjectId;
        quizId: Types.ObjectId;
        score: number;
        completedAt: Date;
    }[];

    @Prop({
        type: [
            {
                timestamp: { type: Date, default: () => new Date() },
                duration: { type: Number },
                activity: { type: String },
            },
        ],
        default: [],
    })
    engagementLog!: {
        timestamp: Date;
        duration: number;
        activity: string;
    }[];

    @Prop({ type: Date, default: () => new Date() })
    lastUpdated: Date = new Date();

    @Prop({
        type: [
            {
                quizId: { type: Types.ObjectId, ref: 'Quiz', required: true },
                recentScores: { type: [Number], default: [] },
                lastDifficulty: { type: String, enum: ['easy','medium','hard'], default: 'medium' },
                seenQuestionIds: { type: [String], default: [] }, // <-- from your Quiz.questions[].questionId
            },
        ],
        default: [],
    })
    quizStats!: Array<{
        quizId: Types.ObjectId;
        recentScores: number[];
        lastDifficulty: 'easy'|'medium'|'hard';
        seenQuestionIds: string[];
    }>;
}

export const PerformanceSchema = SchemaFactory.createForClass(Performance);
// (optional helpful index)
//PerformanceSchema.index({ studentId: 1, courseId: 1 });


