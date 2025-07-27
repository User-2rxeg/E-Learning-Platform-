import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
    STUDENT = 'student',
    INSTRUCTOR = 'instructor',
    ADMIN = 'admin',
}

// Create a compatibility wrapper if needed
const CompatProp: any = Prop;

@Schema({ timestamps: true })
export class User {
    @CompatProp({ required: true })
    name: string;

    @CompatProp({ required: true, unique: true })
    email: string;

    @CompatProp({ required: true })
    password: string; // bcrypt-hashed

    @CompatProp({ enum: UserRole, default: UserRole.STUDENT })
    role: UserRole;

    @CompatProp({ default: false })
    isEmailVerified: boolean;

    @CompatProp()
    profileImage?: string;

    @CompatProp({ type: [String], default: [] })
    learningPreferences?: string[];

    @CompatProp({ type: [String], default: [] })
    subjectsOfInterest?: string[];

    @CompatProp({ type: [String], default: [] })
    expertise?: string[];

    @CompatProp({ type: [Types.ObjectId], ref: 'Course', default: [] })
    teachingCourses?: Types.ObjectId[];

    @CompatProp({ type: [Types.ObjectId], ref: 'Course', default: [] })
    enrolledCourses?: Types.ObjectId[];

    @CompatProp({ type: [Types.ObjectId], ref: 'Course', default: [] })
    completedCourses?: Types.ObjectId[];

    @CompatProp({ default: 0 })
    averageScore?: number;

    @CompatProp({
        type: [
            {
                type: { type: String },
                message: String,
                read: { type: Boolean, default: false },
                date: { type: Date, default: Date.now },
            },
        ],
        default: [],
    })
    notifications?: {
        type: string;
        message: string;
        read: boolean;
        date: Date;
    }[];
}

export const UserSchema = SchemaFactory.createForClass(User);