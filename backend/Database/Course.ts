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
                        resourceType: {
                            type: String,
                            enum: ['video', 'pdf', 'link'],
                            required: true,
                        },
                        url: { type: String, required: true },
                    },
                ],
                quizzes: [{ type: Types.ObjectId, ref: 'Quiz' }],
                notesEnabled: { type: Boolean, default: false },
            },
        ],
        default: [],
    })
    modules!: {
        title: string;
        resources: {
            resourceType: 'video' | 'pdf' | 'link';
            url: string;
        }[];
        quizzes?: Types.ObjectId[];
        notesEnabled?: boolean;
    }[];

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
    versionHistory!: {
        version: string;
        updatedAt: Date;
        changes: string;
    }[];

    @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
    studentsEnrolled: Types.ObjectId[] = [];

    @Prop({ type: String, enum: ['active', 'archived', 'draft'], default: 'draft' })
    status: 'active' | 'archived' | 'draft' = 'draft';

    @Prop({ type: Boolean, default: false })
    certificateAvailable: boolean = false;
    @Prop({ type: Date, required: false }) archivedAt?: Date;

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
    feedback!: {
        rating: number;
        comment?: string;
        createdAt: Date;
    }[];
}

export const CourseSchema = SchemaFactory.createForClass(Course);

// inside Course class (you already added status; add archivedAt if you want)


// after SchemaFactory
//CourseSchema.index({ title: 'text', description: 'text' });
//CourseSchema.index({ status: 1, createdAt: -1 });