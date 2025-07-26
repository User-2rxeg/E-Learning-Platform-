import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface CourseModule {
  moduleId: Types.ObjectId;
  title: string;
  description?: string;
  contentUrl?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseForumThread {
  threadId: Types.ObjectId;
  title: string;
  creator: Types.ObjectId;
  createdAt: Date;
}

@Schema({ timestamps: true })
export class Course extends Document {
  @Prop({ required: true, unique: true })
  title: string;

  @Prop()
  description?: string;

  @Prop()
  thumbnailUrl?: string;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  instructors: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  students: Types.ObjectId[];

  @Prop([
    {
      moduleId: {
        type: Types.ObjectId,
        ref: 'Module',
        default: () => new Types.ObjectId(),
      },
      title: { type: String, required: true },
      description: { type: String },
      contentUrl: { type: String },
      order: { type: Number, required: true },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    },
  ])
  modules: CourseModule[];

  @Prop({ type: [Types.ObjectId], ref: 'ForumThread', default: [] })
  forumThreads: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'ChatGroup', default: [] })
  chatGroups: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  teachingAssistants: Types.ObjectId[];

  @Prop({ type: Number, default: 0 })
  enrollmentCount: number;

  @Prop({ type: Number, default: 0 })
  averageScore: number;

  @Prop({ type: Number, default: 0 })
  completionRate: number; // percent

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const CourseSchema = SchemaFactory.createForClass(Course);

CourseSchema.index({ title: 1 });
