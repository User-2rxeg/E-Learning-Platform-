import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type QuizAttemptDocument = HydratedDocument<QuizAttempt>;


@Schema({ timestamps: true })
export class QuizAttempt {
    @Prop({ type: Types.ObjectId, ref: 'Quiz', required: true })
    quizId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    studentId!: Types.ObjectId;

    @Prop({
        type: [
            {
                questionId: { type: String },  // <-- FIXED: String (UUID)
                selectedAnswer: { type: String },
                isCorrect: { type: Boolean },
            },
        ],
        default: [],
    })
    responses!: {
        questionId: string;
        selectedAnswer: string;
        isCorrect: boolean;
    }[];

    @Prop({ type: Number })
    score!: number;

    @Prop({ type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' })
    currentDifficulty!: 'easy' | 'medium' | 'hard';
}

export const QuizAttemptSchema = SchemaFactory.createForClass(QuizAttempt);
