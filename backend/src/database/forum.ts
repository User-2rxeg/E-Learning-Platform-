import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PostDocument = HydratedDocument<Post>;

@Schema()
export class Post {
    @Prop({ required: true })
    content!: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    author!: Types.ObjectId;

    @Prop({ type: Date, default: Date.now })
    timestamp!: Date;

    @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
    likes!: Types.ObjectId[];
}

export const PostSchema = SchemaFactory.createForClass(Post);

export type ThreadDocument = HydratedDocument<Thread>;

// Interface for typed thread subdocument
export interface IPost {
    _id?: Types.ObjectId;
    content: string;
    author: Types.ObjectId;
    timestamp: Date;
    likes: Types.ObjectId[];
}

// Interface for typed thread subdocument
export interface IThread {
    _id?: Types.ObjectId;
    title: string;
    createdBy: Types.ObjectId;
    createdAt: Date;
    posts: IPost[];
}

@Schema()
export class Thread {
    @Prop({ required: true })
    title!: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    createdBy!: Types.ObjectId;

    @Prop({ type: Date, default: Date.now })
    createdAt!: Date;

    @Prop({ type: [PostSchema], default: [] })
    posts!: IPost[];
}

export const ThreadSchema = SchemaFactory.createForClass(Thread);

export type ForumDocument = HydratedDocument<Forum>;

@Schema({ timestamps: true })
export class Forum {
    @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
    courseId!: Types.ObjectId;

    @Prop({ type: [ThreadSchema], default: [] })
    threads!: IThread[];
}

export const ForumSchema = SchemaFactory.createForClass(Forum);

