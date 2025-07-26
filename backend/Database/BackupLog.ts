import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

@Schema({ timestamps: true })
export class BackupLog extends Document {
  @Prop({ required: true })
  resourceType: string; // e.g., 'User', 'Course'

  @Prop({ type: Types.ObjectId })
  resourceId: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  backupDate: Date;

  @Prop({ required: true, enum: ['success', 'failed'] })
  status: 'success' | 'failed';

  @Prop()
  details?: string;
}

export const BackupLogSchema = SchemaFactory.createForClass(BackupLog);
