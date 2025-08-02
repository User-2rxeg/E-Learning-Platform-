// Database/Quiz.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type QuizDocument = HydratedDocument<Quiz>;

@Schema({ timestamps: true })
export class Quiz {
    @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
    moduleId!: Types.ObjectId;

    @Prop({
        type: [
            {
                questionText: { type: String, required: true },
                choices: [{ type: String }],
                correctAnswer: { type: String, required: true },
                difficulty: {
                    type: String,
                    enum: ['easy', 'medium', 'hard'],
                    default: 'medium',
                },
            },
        ],
        default: [],
    })
    questions!: {
        questionText: string;
        choices: string[];
        correctAnswer: string;
        difficulty: 'easy' | 'medium' | 'hard';
    }[];

    @Prop({ default: false })
    adaptive!: boolean;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    createdBy!: Types.ObjectId;
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);
