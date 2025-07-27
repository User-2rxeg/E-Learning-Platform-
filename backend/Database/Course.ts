import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// Create a compatibility wrapper for Prop decorator
const CompatProp: any = Prop;

@Schema({ timestamps: true })
export class Course extends Document {
    @CompatProp({ required: true })
    title: string;

    @CompatProp({ required: true })
    description: string;

    @CompatProp({ type: Types.ObjectId, ref: 'User', required: true })
    instructorId: Types.ObjectId;

    @CompatProp([
        {
            title: { type: String, required: true },
            resources: [
                {
                    type: {
                        resourceType: { type: String, enum: ['video', 'pdf', 'link'], required: true },
                        url: { type: String, required: true },
                    },
                },
            ],
            quizzes: [{ type: Types.ObjectId, ref: 'Quiz' }],
            notesEnabled: { type: Boolean, default: false },
        },
    ])
    modules: any[];

    @CompatProp({ type: [String], default: [] })
    tags: string[];

    @CompatProp([
        {
            version: { type: String },
            updatedAt: { type: Date, default: Date.now },
            changes: { type: String }, // Optional: summary or JSON diff
        },
    ])
    versionHistory: any[];

    @CompatProp({ type: [Types.ObjectId], ref: 'User', default: [] })
    studentsEnrolled: Types.ObjectId[];

    @CompatProp({ type: String, enum: ['active', 'archived', 'draft'], default: 'draft' })
    status: string;

    @CompatProp({ type: Boolean, default: false })
    certificateAvailable: boolean;

    @CompatProp([
        {
            rating: { type: Number, min: 1, max: 5 },
            comment: { type: String },
            createdAt: { type: Date, default: Date.now },
        },
    ])
    feedback: any[];
}

export const CourseSchema = SchemaFactory.createForClass(Course);