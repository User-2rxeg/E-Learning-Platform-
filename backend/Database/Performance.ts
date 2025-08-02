// Database/Performance.ts
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
                completedAt: { type: Date, default: Date.now },
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
                timestamp: { type: Date, default: Date.now },
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

    @Prop({ type: Date, default: Date.now })
    lastUpdated: Date = new Date();
}

export const PerformanceSchema = SchemaFactory.createForClass(Performance);
