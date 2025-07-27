// Chat.ts
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

const CompatProp: any = Prop;

@Schema({ timestamps: true })
export class Chat extends Document {
    @CompatProp({ type: [Types.ObjectId], ref: 'User', required: true })
    participants: Types.ObjectId[];

    @CompatProp([{
        sender: { type: Types.ObjectId, ref: 'User', required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        read: { type: Boolean, default: false }
    }])
    messages: any[];

    @CompatProp({ type: Boolean, default: false })
    isGroup: boolean;

    @CompatProp({ type: String })
    groupName?: string;

    @CompatProp({ type: Types.ObjectId, ref: 'Course' })
    courseId?: Types.ObjectId;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);