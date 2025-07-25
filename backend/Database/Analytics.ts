import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

@Schema({ timestamps: true })
export class AnalyticsSnapshot extends Document {
  @Prop({ type: Types.ObjectId, refPath: 'entityType', required: true })
  entityId: Types.ObjectId;

  @Prop({ required: true, enum: ['User', 'Course'] })
  entityType: 'User' | 'Course';

  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ type: Object, required: true })
  metrics: any; // e.g., { progress: number, scores: number, engagement: number }
}

export const AnalyticsSnapshotSchema =
  SchemaFactory.createForClass(AnalyticsSnapshot);
