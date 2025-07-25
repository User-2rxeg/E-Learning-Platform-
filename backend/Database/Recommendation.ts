import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

export type NotificationType =
  | 'message'
  | 'reply'
  | 'announcement'
  | 'forum'
  | 'quiz'
  | 'system';

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['message', 'reply', 'announcement', 'forum', 'quiz', 'system'],
    required: true,
  })
  type: NotificationType;

  @Prop({ required: true })
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'Course' })
  courseId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ForumThread' })
  threadId?: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  date: Date;

  @Prop({ type: Boolean, default: false })
  read: boolean;

  @Prop()
  link?: string; // For deep linking to resource (optional)
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

NotificationSchema.index({ userId: 1, read: 1, date: -1 });
