// Notification.ts
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

const CompatProp: any = Prop;

@Schema({ timestamps: true })
export class Notification extends Document {
    @CompatProp({ type: Types.ObjectId, ref: 'User', required: true })
    recipientId: Types.ObjectId;

    @CompatProp({ type: String, required: true })
    type: string;

    @CompatProp({ type: String, required: true })
    message: string;

    @CompatProp({ type: Boolean, default: false })
    read: boolean;

    @CompatProp({ type: Date, default: Date.now })
    createdAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);