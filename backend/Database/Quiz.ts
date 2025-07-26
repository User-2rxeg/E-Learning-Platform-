import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface QuizQuestion {
  questionId: Types.ObjectId;
  text: string;
  options: string[];
  correctOption: number; // Index in the option array
  explanation?: string;
  points: number;
}

export interface QuizSubmission {
  submissionId: Types.ObjectId;
  userId: Types.ObjectId; // ref to User
  answers: number[]; // Each is the chosen option index per question
  score: number;
  submittedAt: Date;
  passed: boolean;
}

@Schema({ timestamps: true })
export class Quiz extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'Module', required: true })
  moduleId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  courseId: Types.ObjectId;

  @Prop([
    {
      questionId: { type: Types.ObjectId, default: () => new Types.ObjectId() },
      text: { type: String, required: true },
      options: { type: [String], required: true },
      correctOption: { type: Number, required: true },
      explanation: String,
      points: { type: Number, required: true, default: 1 },
    },
  ])
  questions: QuizQuestion[];

  @Prop({ type: Number, default: 0 })
  totalPoints: number;

  @Prop({ type: Number, default: 0 })
  passingScore: number;

  @Prop([
    {
      submissionId: {
        type: Types.ObjectId,
        default: () => new Types.ObjectId(),
      },
      userId: { type: Types.ObjectId, ref: 'User', required: true },
      answers: [{ type: Number, required: true }],
      score: { type: Number, default: 0 },
      submittedAt: { type: Date, default: Date.now },
      passed: { type: Boolean, default: false },
    },
  ])
  submissions: QuizSubmission[];

  @Prop({ default: true })
  isActive: boolean;
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);

QuizSchema.index({ moduleId: 1, courseId: 1 });
