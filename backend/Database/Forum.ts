import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { HydratedDocument, Types } from 'mongoose';

export type ForumDocument = HydratedDocument<Forum>;

@Schema({ timestamps: true })
export class Forum {
    @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
    courseId!: Types.ObjectId;

    @Prop({
        type: [
            {
                title: { type: String, required: true },
                createdBy: { type: Types.ObjectId, ref: 'User', required: true },
                createdAt: { type: Date, default: Date.now },
                posts: [
                    {
                        content: { type: String, required: true },
                        author: { type: Types.ObjectId, ref: 'User', required: true },
                        timestamp: { type: Date, default: Date.now },
                        likes: { type: [Types.ObjectId], ref: 'User', default: [] },
                    },
                ],
            },
        ],
        default: [],
    })
    threads!: {
        title: string;
        createdBy: Types.ObjectId;
        createdAt: Date;
        posts: {
            content: string;
            author: Types.ObjectId;
            timestamp: Date;
            likes: Types.ObjectId[];
        }[];
    }[];
}

export const ForumSchema = SchemaFactory.createForClass(Forum);