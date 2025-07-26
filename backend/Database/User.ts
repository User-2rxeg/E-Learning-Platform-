import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// --- User Roles ---
export enum UserRole {
  Student = 'student',
  Instructor = 'instructor',
  Admin = 'admin',
}

// --- Interfaces for Embedded Schemas ---
export interface EnrolledCourse {
  courseId: Types.ObjectId;
  progress: number; // percentage 0-100
  completed: boolean;
  averageScore: number;
}

export interface ChatGroup {
  groupId: Types.ObjectId;
  name: string;
  members: Types.ObjectId[];
  chatHistory: {
    sender: Types.ObjectId;
    message: string;
    timestamp: Date;
  }[];
}

export interface Notification {
  type: 'message' | 'reply' | 'announcement';
  content: string;
  date: Date;
  read: boolean;
}

export interface QuickNote {
  noteId: Types.ObjectId;
  courseId?: Types.ObjectId;
  moduleId?: Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  password: string; // Hashed with bcrypt

  @Prop({ required: true, enum: UserRole })
  role: UserRole;

  @Prop()
  name: string;

  @Prop()
  avatarUrl?: string;

  // Profile and Progress
  @Prop([
    {
      courseId: { type: Types.ObjectId, ref: 'Course' },
      progress: { type: Number, default: 0 },
      completed: { type: Boolean, default: false },
      averageScore: { type: Number, default: 0 },
    },
  ])
  enrolledCourses: EnrolledCourse[];

  // Instructor-specific: list of courses managed
  @Prop([{ type: Types.ObjectId, ref: 'Course' }])
  instructorCourses: Types.ObjectId[];

  // Analytics and dashboard
  @Prop({ type: Number, default: 0 })
  averageScore: number;

  @Prop({ type: Number, default: 0 })
  coursesCompleted: number;

  @Prop({ type: Number, default: 0 })
  engagementScore: number;

  // Chat and Communication
  @Prop([
    {
      groupId: { type: Types.ObjectId, ref: 'ChatGroup' },
      name: String,
      members: [{ type: Types.ObjectId, ref: 'User' }],
      chatHistory: [
        {
          sender: { type: Types.ObjectId, ref: 'User' },
          message: String,
          timestamp: Date,
        },
      ],
    },
  ])
  chatGroups: ChatGroup[];

  // Forums (could expand with post/thread schemas)
  @Prop([{ type: Types.ObjectId, ref: 'ForumThread' }])
  forumThreads: Types.ObjectId[];

  // Notifications
  @Prop([
    {
      type: { type: String, enum: ['message', 'reply', 'announcement'] },
      content: String,
      date: Date,
      read: { type: Boolean, default: false },
    },
  ])
  notifications: Notification[];

  // Saved Conversations (references or integrally stored)
  @Prop([{ type: Types.ObjectId, ref: 'ChatMessage' }])
  savedConversations: Types.ObjectId[];

  // Security features
  @Prop()
  mfaEnabled?: boolean;

  @Prop()
  failedLoginAttempts?: number;

  @Prop()
  biometricHash?: string; // For biometric authentication (optional)

  // --- Additional Features ---
  // Quick Notes
  @Prop([
    {
      noteId: { type: Types.ObjectId, default: () => new Types.ObjectId() },
      courseId: { type: Types.ObjectId, ref: 'Course' },
      moduleId: { type: Types.ObjectId, ref: 'Module' },
      content: String,
      createdAt: { type: Date, default: Date.now },
      updatedAt: Date,
    },
  ])
  quickNotes?: QuickNote[];

  // --- Timestamps & Backup Information handled by Mongoose and backup services ---
}

export const UserSchema = SchemaFactory.createForClass(User);

// Index for searching instructor/student by name/email
UserSchema.index({ name: 1, email: 1, role: 1 });
