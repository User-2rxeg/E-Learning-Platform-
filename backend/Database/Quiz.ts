// Quiz.ts
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

const CompatProp: any = Prop;

@Schema({ timestamps: true })
export class Quiz extends Document {
    @CompatProp({ type: Types.ObjectId, ref: 'Course', required: true })
    moduleId: Types.ObjectId;

    @CompatProp([{
        questionText: { type: String, required: true },
        choices: [{ type: String }],
        correctAnswer: { type: String, required: true },
        difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' }
    }])
    questions: any[];

    @CompatProp({ type: Boolean, default: false })
    adaptive: boolean;

    @CompatProp({ type: Types.ObjectId, ref: 'User', required: true })
    createdBy: Types.ObjectId;
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);