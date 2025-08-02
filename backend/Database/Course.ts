// Course.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CourseDocument = HydratedDocument<Course>;

@Schema({ timestamps: true })
export class Course {
    @Prop({ required: true })
    title!: string;

    @Prop({ required: true })
    description!: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    instructorId!: Types.ObjectId;

    @Prop({
        type: [
            {
                title: { type: String, required: true },
                resources: [
                    {
                        type: {
                            resourceType: {
                                type: String,
                                enum: ['video', 'pdf', 'link'],
                                required: true,
                            },
                            url: { type: String, required: true },
                        },
                    },
                ],
                quizzes: [{ type: Types.ObjectId, ref: 'Quiz' }],
                notesEnabled: { type: Boolean, default: false },
            },
        ],
        default: [],
    })
    modules!: any[];

    @Prop({ type: [String], default: [] })
    tags: string[] = [];

    @Prop({
        type: [
            {
                version: { type: String },
                updatedAt: { type: Date, default: Date.now },
                changes: { type: String },
            },
        ],
        default: [],
    })
    versionHistory!: any[];

    @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
    studentsEnrolled: Types.ObjectId[] = [];

    @Prop({ type: String, enum: ['active', 'archived', 'draft'], default: 'draft' })
    status: string = 'draft';

    @Prop({ type: Boolean, default: false })
    certificateAvailable: boolean = false;

    @Prop({
        type: [
            {
                rating: { type: Number, min: 1, max: 5 },
                comment: { type: String },
                createdAt: { type: Date, default: Date.now },
            },
        ],
        default: [],
    })
    feedback!: any[];
}

export const CourseSchema = SchemaFactory.createForClass(Course);
