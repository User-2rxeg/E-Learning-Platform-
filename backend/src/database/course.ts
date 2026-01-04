import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CourseDocument = HydratedDocument<Course>;

// Course status enum
export enum CourseStatus {
    DRAFT = 'draft',
    ACTIVE = 'active',
    ARCHIVED = 'archived',
    UNDER_REVIEW = 'under_review',
}

// Course level enum
export enum CourseLevel {
    BEGINNER = 'beginner',
    INTERMEDIATE = 'intermediate',
    ADVANCED = 'advanced',
    ALL_LEVELS = 'all_levels',
}

// Resource type enum
export enum ResourceType {
    VIDEO = 'video',
    PDF = 'pdf',
    LINK = 'link',
    AUDIO = 'audio',
    DOCUMENT = 'document',
}

@Schema({ timestamps: true })
export class Course {
    @Prop({ required: true, trim: true })
    title!: string;

    @Prop({ required: true })
    description!: string;

    // Short description for cards/previews
    @Prop({ maxlength: 300 })
    shortDescription?: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    instructorId!: Types.ObjectId;

    // Course thumbnail/cover image
    @Prop()
    thumbnailUrl?: string;

    // Course preview video
    @Prop()
    previewVideoUrl?: string;

    // Course level
    @Prop({ enum: Object.values(CourseLevel), default: CourseLevel.ALL_LEVELS })
    level!: CourseLevel;

    // Course category
    @Prop({ required: true })
    category!: string;

    // Subcategory
    @Prop()
    subcategory?: string;

    // Language of the course
    @Prop({ default: 'English' })
    language!: string;

    // Estimated duration in hours
    @Prop({ type: Number, default: 0 })
    estimatedDuration!: number;

    // Prerequisites (text description)
    @Prop({ type: [String], default: [] })
    prerequisites!: string[];

    // Learning objectives
    @Prop({ type: [String], default: [] })
    learningObjectives!: string[];

    // Target audience
    @Prop({ type: [String], default: [] })
    targetAudience!: string[];

    // Modules with resources
    @Prop({
        type: [
            {
                title: { type: String, required: true },
                description: { type: String },
                order: { type: Number },
                estimatedMinutes: { type: Number },
                isPublished: { type: Boolean, default: true },
                resources: [
                    {
                        title: { type: String },
                        resourceType: {
                            type: String,
                            enum: Object.values(ResourceType),
                            required: true,
                        },
                        url: { type: String, required: true },
                        description: { type: String },
                        filename: { type: String },
                        mimeType: { type: String },
                        size: { type: Number },
                        duration: { type: Number }, // For videos in seconds
                        uploadedBy: { type: Types.ObjectId, ref: 'User' },
                        uploadedAt: { type: Date, default: Date.now },
                        order: { type: Number },
                    },
                ],
                quizzes: [{ type: Types.ObjectId, ref: 'Quiz' }],
                notesEnabled: { type: Boolean, default: true },
            },
        ],
        default: [],
    })
    modules!: {
        _id?: Types.ObjectId;
        title: string;
        description?: string;
        order?: number;
        estimatedMinutes?: number;
        isPublished?: boolean;
        resources: {
            _id?: Types.ObjectId;
            title?: string;
            resourceType: ResourceType;
            url: string;
            description?: string;
            filename?: string;
            mimeType?: string;
            size?: number;
            duration?: number;
            uploadedBy?: Types.ObjectId;
            uploadedAt?: Date;
            order?: number;
        }[];
        quizzes?: Types.ObjectId[];
        notesEnabled?: boolean;
    }[];

    @Prop({ type: [String], default: [] })
    tags!: string[];

    // Version history for content updates
    @Prop({
        type: [
            {
                version: { type: String },
                updatedAt: { type: Date, default: Date.now },
                changes: { type: String },
                updatedBy: { type: Types.ObjectId, ref: 'User' },
            },
        ],
        default: [],
    })
    versionHistory!: {
        version: string;
        updatedAt: Date;
        changes: string;
        updatedBy?: Types.ObjectId;
    }[];

    @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
    studentsEnrolled!: Types.ObjectId[];

    // Waitlist for courses with enrollment limits
    @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
    waitlist!: Types.ObjectId[];

    // Maximum enrollment (0 = unlimited)
    @Prop({ type: Number, default: 0 })
    maxEnrollment!: number;

    @Prop({ enum: Object.values(CourseStatus), default: CourseStatus.DRAFT })
    status!: CourseStatus;

    @Prop({ type: Boolean, default: false })
    certificateAvailable!: boolean;

    @Prop({ type: Date })
    archivedAt?: Date;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    archivedBy?: Types.ObjectId;

    // Publishing dates
    @Prop({ type: Date })
    publishedAt?: Date;

    @Prop({ type: Date })
    enrollmentStartDate?: Date;

    @Prop({ type: Date })
    enrollmentEndDate?: Date;

    // Course completion requirements
    @Prop({ type: Number, default: 80 })
    passingScore!: number; // Minimum quiz score to pass

    @Prop({ type: Number, default: 100 })
    completionThreshold!: number; // % of content to view

    // Ratings and reviews
    @Prop({ type: Number, default: 0 })
    averageRating!: number;

    @Prop({ type: Number, default: 0 })
    totalRatings!: number;

    @Prop({
        type: [
            {
                studentId: { type: Types.ObjectId, ref: 'User', required: true },
                rating: { type: Number, min: 1, max: 5, required: true },
                comment: { type: String },
                createdAt: { type: Date, default: Date.now },
                updatedAt: { type: Date },
                isApproved: { type: Boolean, default: true },
                helpfulCount: { type: Number, default: 0 },
            },
        ],
        default: [],
    })
    feedback!: {
        studentId: Types.ObjectId;
        rating: number;
        comment?: string;
        createdAt: Date;
        updatedAt?: Date;
        isApproved?: boolean;
        helpfulCount?: number;
    }[];

    // Featured/promoted status
    @Prop({ type: Boolean, default: false })
    isFeatured!: boolean;

    // SEO metadata
    @Prop()
    metaTitle?: string;

    @Prop()
    metaDescription?: string;
}

export const CourseSchema = SchemaFactory.createForClass(Course);

// Indexes for efficient queries
CourseSchema.index({ title: 'text', description: 'text', tags: 'text' });
CourseSchema.index({ status: 1, createdAt: -1 });
CourseSchema.index({ instructorId: 1 });
CourseSchema.index({ category: 1, level: 1 });
CourseSchema.index({ averageRating: -1 });
CourseSchema.index({ 'studentsEnrolled': 1 });
CourseSchema.index({ isFeatured: 1, status: 1 });

