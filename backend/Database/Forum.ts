import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {HydratedDocument, Types} from 'mongoose';

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

@Schema()
export class Thread {
    @Prop({ required: true })
    title!: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    createdBy!: Types.ObjectId;

    @Prop({ type: Date, default: Date.now })
    createdAt!: Date;

    @Prop({ type: [PostSchema], default: [] })
    posts!: Types.DocumentArray<Post>;
}

export const ThreadSchema = SchemaFactory.createForClass(Thread);






export type ForumDocument = HydratedDocument<Forum>;

@Schema({ timestamps: true })
export class Forum {
    @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
    courseId!: Types.ObjectId;

    @Prop({ type: [ThreadSchema], default: [] })
    threads!: Types.DocumentArray<Thread>;
}

export const ForumSchema = SchemaFactory.createForClass(Forum);


