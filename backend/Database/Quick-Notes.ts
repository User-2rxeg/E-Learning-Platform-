import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type QuickNoteDocument = HydratedDocument<QuickNote>;

@Schema({ timestamps: true })
export class QuickNote {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    studentId!: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
    courseId!: Types.ObjectId;

    @Prop({ required: true })
    moduleIndex!: number;

    @Prop({ required: false })
    resourceId?: string;

    @Prop({ required: true })
    content!: string;

    @Prop({ type: Date, default: Date.now })
    timestamp!: Date;
}

export const QuickNoteSchema = SchemaFactory.createForClass(QuickNote);