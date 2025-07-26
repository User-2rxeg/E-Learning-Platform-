import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

@Schema({ timestamps: true })
export class ForumReply extends Document {
  @Prop({ type: Types.ObjectId, ref: 'ForumPost', required: true })
  postId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  content: string;
}

export const ForumReplySchema = SchemaFactory.createForClass(ForumReply);
