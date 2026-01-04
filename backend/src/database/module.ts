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
    @Prop({ required: true, trim: true })
    title!: string;

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

    @Prop({ type: Number })
    size?: number;

    @Prop({ type: Number })
    duration?: number; // For videos in seconds

    @Prop({ type: Types.ObjectId, ref: 'User' })
    uploadedBy?: Types.ObjectId;

    @Prop({ type: Date, default: Date.now })
    uploadedAt!: Date;

    @Prop({ type: Number, default: 0 })
    order!: number;

    @Prop({ type: Boolean, default: true })
    isPublished!: boolean;
}

export const ResourceSchema = SchemaFactory.createForClass(Resource);

@Schema({ timestamps: true })
export class Module {
    @Prop({ required: true, trim: true })
    title!: string;

    @Prop()
    description?: string;

    @Prop({ type: Types.ObjectId, ref: 'Course', required: true, index: true })
    courseId!: Types.ObjectId;

    @Prop({ type: Number, default: 0 })
    order!: number;

    @Prop({ type: Number, default: 0 })
    estimatedMinutes!: number;

    @Prop({ type: Boolean, default: false })
    isPublished!: boolean;

    // Embedded resources within the module
    @Prop({ type: [ResourceSchema], default: [] })
    resources!: Resource[];

    // References to quizzes for this module
    @Prop({ type: [Types.ObjectId], ref: 'Quiz', default: [] })
    quizzes!: Types.ObjectId[];

    @Prop({ type: Boolean, default: true })
    notesEnabled!: boolean;

    // Learning objectives specific to this module
    @Prop({ type: [String], default: [] })
    learningObjectives!: string[];

    // Prerequisites (other module IDs that must be completed first)
    @Prop({ type: [Types.ObjectId], ref: 'Module', default: [] })
    prerequisites!: Types.ObjectId[];

    // Completion tracking
    @Prop({ type: Number, default: 100 })
    completionThreshold!: number; // % of resources to view to complete module
}

export const ModuleSchema = SchemaFactory.createForClass(Module);

// Indexes
ModuleSchema.index({ courseId: 1, order: 1 });
ModuleSchema.index({ courseId: 1, isPublished: 1 });

