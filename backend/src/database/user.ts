import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;


export enum UserRole {
    STUDENT = 'student',
    INSTRUCTOR = 'instructor',
    ADMIN = 'admin',
}

// Account status for security management
export enum AccountStatus {
    ACTIVE = 'active',           // Normal active account
    INACTIVE = 'inactive',       // Manually deactivated by user or admin
    LOCKED = 'locked',           // Locked due to security (failed login attempts)
    SUSPENDED = 'suspended',     // Temporarily suspended by admin
    TERMINATED = 'terminated',   // Permanently terminated
}

// Notification types enum
export enum NotificationType {
    ANNOUNCEMENT = 'announcement',
    COURSE_UPDATE = 'courseUpdate',
    ASSIGNMENT_DUE = 'assignmentDue',
    NEW_MESSAGE = 'newMessage',
    ENROLLMENT = 'enrollment',
    SYSTEM_ALERT = 'systemAlert',
    QUIZ_RESULT = 'quizResult',
}

@Schema({ timestamps: true })
export class User {

    @Prop({ required: true })
    name!: string;

    @Prop({ required: true, unique: true, lowercase: true, trim: true })
    email!: string;

    @Prop({ required: true, select: false })
    passwordHash!: string;

    @Prop({ enum: Object.values(UserRole), default: UserRole.STUDENT })
    role!: UserRole;

    @Prop({ enum: Object.values(AccountStatus), default: AccountStatus.ACTIVE })
    status!: AccountStatus;

    @Prop({ default: false })
    isEmailVerified!: boolean;

    @Prop()
    profileImage?: string;

    @Prop({ type: [String], default: [] })
    learningPreferences?: string[];

    @Prop({ type: [String], default: [] })
    subjectsOfInterest?: string[];

    @Prop({ type: [String], default: [] })
    expertise?: string[];

    @Prop({ type: [Types.ObjectId], ref: 'Course', default: [] })
    teachingCourses?: Types.ObjectId[];

    @Prop({ type: [Types.ObjectId], ref: 'Course', default: [] })
    enrolledCourses?: Types.ObjectId[];

    @Prop({ type: [Types.ObjectId], ref: 'Course', default: [] })
    completedCourses?: Types.ObjectId[];

    @Prop({ default: 0 })
    averageScore?: number;

    // OTP for email verification
    @Prop({ type: String, required: false, select: false })
    otpCode?: string | null;

    @Prop({ type: Date, required: false })
    otpExpiresAt?: Date | null;

    // OTP for password reset
    @Prop({ type: String, required: false, select: false })
    passwordResetOtpCode?: string | null;

    @Prop({ type: Date, required: false })
    passwordResetOtpExpiresAt?: Date | null;

    // MFA fields
    @Prop({ default: false })
    mfaEnabled?: boolean;

    @Prop({ type: String, default: null, select: false })
    mfaSecret?: string | null;

    @Prop({ type: [String], default: [], select: false })
    mfaBackupCodes?: string[];

    // Security tracking fields
    @Prop({ default: 0 })
    failedLoginAttempts?: number;

    @Prop({ type: Date })
    lockedUntil?: Date | null;

    @Prop({ type: Date })
    lastLoginAt?: Date;

    @Prop({ type: String })
    lastLoginIp?: string;

    @Prop({ type: Date })
    passwordChangedAt?: Date;

    // Account suspension/termination details
    @Prop({ type: String })
    statusReason?: string;

    @Prop({ type: Date })
    statusChangedAt?: Date;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    statusChangedBy?: Types.ObjectId;

    // Embedded notifications (for quick access)
    @Prop({
        type: [
            {
                type: { type: String, enum: Object.values(NotificationType) },
                message: String,
                read: { type: Boolean, default: false },
                date: { type: Date, default: Date.now },
            },
        ],
        default: [],
    })
    notifications?: {
        type: NotificationType;
        message: string;
        read: boolean;
        date: Date;
    }[];
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes - email index already created by unique: true in @Prop
UserSchema.index({ name: 1 });
UserSchema.index({ name: 'text', email: 'text' });
UserSchema.index({ role: 1, createdAt: -1 });
UserSchema.index({ status: 1 });
UserSchema.index({ isEmailVerified: 1 });


UserSchema.set('toJSON', {
    versionKey: false,
    transform: (_doc, ret: any) => {
        if (ret?.password) {
            delete ret.password;
        }
        return ret;
    },
});

UserSchema.set('toObject', {
    versionKey: false,
    transform: (_doc, ret: any) => {
        if (ret?.password) {
            delete ret.password;
        }
        return ret;
    },
});
