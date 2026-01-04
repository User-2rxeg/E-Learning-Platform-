import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ModuleDocument = HydratedDocument<Module>;

// Resource type enum
export enum ResourceType {
    VIDEO = 'video',
    PDF = 'pdf',
    LINK = 'link',
    AUDIO = 'audio',
    DOCUMENT = 'document',
}

@Schema({ timestamps: true })
export class Resource {
    @Prop()
    title?: string;

    @Prop({ enum: Object.values(ResourceType), required: true })
    resourceType!: ResourceType;

    @Prop({ required: true })
    url!: string;

    @Prop()
    description?: string;

    @Prop()
    filename?: string;

    @Prop()
    mimeType?: string;

    @Prop()
    size?: number;

    @Prop()
    duration?: number; // For videos in seconds

    @Prop({ type: Types.ObjectId, ref: 'User' })
    uploadedBy?: Types.ObjectId;

    @Prop({ default: 0 })
    order?: number;
}

export const ResourceSchema = SchemaFactory.createForClass(Resource);

@Schema({ timestamps: true })
export class Module {
    @Prop({ required: true })
    title!: string;

    @Prop()
    description?: string;

    @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
    courseId!: Types.ObjectId;

    @Prop({ default: 0 })
    order!: number;

    @Prop({ default: 0 })
    estimatedMinutes?: number;

    @Prop({ default: true })
    isPublished!: boolean;

    @Prop({ type: [ResourceSchema], default: [] })
    resources!: Resource[];

    @Prop({ type: [Types.ObjectId], ref: 'Quiz', default: [] })
    quizzes!: Types.ObjectId[];

    @Prop({ default: true })
    notesEnabled!: boolean;
}

export const ModuleSchema = SchemaFactory.createForClass(Module);

// Indexes
ModuleSchema.index({ courseId: 1, order: 1 });
ModuleSchema.index({ courseId: 1 });

