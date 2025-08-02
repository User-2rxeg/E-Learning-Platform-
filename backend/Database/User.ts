import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export enum UserRole {
    STUDENT = 'student',
    INSTRUCTOR = 'instructor',
    ADMIN = 'admin',
}

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true })
    name!: string;

    @Prop({ required: true, unique: true })
    email!: string;

    @Prop({ required: true })
    password!: string;

    @Prop({ enum: Object.values(UserRole), default: UserRole.STUDENT })  // <-- FIXED Enum Binding
    role!: UserRole;

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

    @Prop({
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
