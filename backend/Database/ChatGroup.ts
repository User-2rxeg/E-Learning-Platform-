import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

@Schema({ timestamps: true })
export class ChatGroup extends Document {
  @Prop({ required: true })
  name: string;

  @Prop([{ type: Types.ObjectId, ref: 'User' }])
  members: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Course' })
  courseId?: Types.ObjectId;
}

export const ChatGroupSchema = SchemaFactory.createForClass(ChatGroup);
