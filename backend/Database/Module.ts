import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface ModuleResource {
  resourceId: Types.ObjectId;
  title: string;
  url: string;
  type: 'video' | 'pdf' | 'link' | 'assignment' | 'other';
}

export interface ModuleQuiz {
  quizId: Types.ObjectId;
  title: string;
  totalQuestions: number;
  passingScore: number;
}

@Schema({ timestamps: true })
export class Module extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  courseId: Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  order: number;

  @Prop([
    {
      resourceId: { type: Types.ObjectId, default: () => new Types.ObjectId() },
      title: { type: String, required: true },
      url: { type: String, required: true },
      type: {
        type: String,
        enum: ['video', 'pdf', 'link', 'assignment', 'other'],
        default: 'other',
      },
    },
  ])
  resources: ModuleResource[];

  @Prop([
    {
      quizId: { type: Types.ObjectId, ref: 'Quiz' },
      title: { type: String, required: true },
      totalQuestions: { type: Number, default: 0 },
      passingScore: { type: Number, default: 0 },
    },
  ])
  quizzes: ModuleQuiz[];

  @Prop()
  estimatedTimeMinutes?: number;
}

export const ModuleSchema = SchemaFactory.createForClass(Module);

ModuleSchema.index({ courseId: 1, order: 1 });
