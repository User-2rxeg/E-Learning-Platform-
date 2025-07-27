// Performance.ts
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

const CompatProp: any = Prop;

@Schema({ timestamps: true })
export class Performance extends Document {
    @CompatProp({ type: Types.ObjectId, ref: 'User', required: true })
    studentId: Types.ObjectId;

    @CompatProp({ type: Types.ObjectId, ref: 'Course', required: true })
    courseId: Types.ObjectId;

    @CompatProp({ type: Number, default: 0 })
    progress: number;

    @CompatProp([{
        moduleId: { type: Types.ObjectId, ref: 'Course' },
        quizId: { type: Types.ObjectId, ref: 'Quiz' },
        score: { type: Number },
        completedAt: { type: Date, default: Date.now }
    }])
    scores: any[];

    @CompatProp([{
        timestamp: { type: Date, default: Date.now },
        duration: { type: Number },
        activity: { type: String }
    }])
    engagementLog: any[];

    @CompatProp({ type: Date, default: Date.now })
    lastUpdated: Date;
}

export const PerformanceSchema = SchemaFactory.createForClass(Performance);