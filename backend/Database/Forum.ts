// Forum.ts
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

const CompatProp: any = Prop;

@Schema({ timestamps: true })
export class Forum extends Document {
    @CompatProp({ type: Types.ObjectId, ref: 'Course', required: true })
    courseId: Types.ObjectId;

    @CompatProp([{
        title: { type: String, required: true },
        createdBy: { type: Types.ObjectId, ref: 'User', required: true },
        createdAt: { type: Date, default: Date.now },
        posts: [{
            content: { type: String, required: true },
            author: { type: Types.ObjectId, ref: 'User', required: true },
            timestamp: { type: Date, default: Date.now },
            likes: { type: [Types.ObjectId], ref: 'User', default: [] }
        }]
    }])
    threads: any[];
}

export const ForumSchema = SchemaFactory.createForClass(Forum);