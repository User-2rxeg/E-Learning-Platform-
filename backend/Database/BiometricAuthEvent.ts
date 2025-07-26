import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

@Schema({ timestamps: true })
export class BiometricAuthEvent extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  actionType: string; // e.g., 'exam', 'critical-operation'

  @Prop({ required: true })
  biometricHash: string;

  @Prop({ type: Boolean, default: false })
  verified: boolean;

  @Prop({ type: Date, default: Date.now })
  timestamp: Date;
}

export const BiometricAuthEventSchema =
  SchemaFactory.createForClass(BiometricAuthEvent);
