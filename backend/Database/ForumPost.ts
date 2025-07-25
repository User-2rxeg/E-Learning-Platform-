import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

@Schema({ timestamps: true })
export class ForumPost extends Document {
  @Prop({ type: Types.ObjectId, ref: 'ForumThread', required: true })
  threadId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  content: string;
}

export const ForumPostSchema = SchemaFactory.createForClass(ForumPost);
