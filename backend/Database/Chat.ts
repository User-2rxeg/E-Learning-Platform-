import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ChatDocument = HydratedDocument<Chat>;

@Schema({ timestamps: true })
export class Chat {
    @Prop({ type: [Types.ObjectId], ref: 'User', required: true })
    participants!: Types.ObjectId[];

    @Prop({
        type: [
            {
                sender: { type: Types.ObjectId, ref: 'User', required: true },
                content: { type: String, required: true },
                timestamp: { type: Date, default: Date.now },
                read: { type: Boolean, default: false },
            },
        ],
        default: [],
    })
    messages!: any[];

    @Prop({ type: Boolean, default: false })
    isGroup: boolean = false;

    @Prop({ type: String })
    groupName?: string;

    @Prop({ type: Types.ObjectId, ref: 'Course' })
    courseId?: Types.ObjectId;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
