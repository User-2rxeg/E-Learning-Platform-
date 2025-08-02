import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema({ timestamps: true })
export class Notification {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    recipientId!: Types.ObjectId;

    @Prop({ type: String, required: true })
    type!: string;

    @Prop({ type: String, required: true })
    message!: string;

    @Prop({ type: Boolean, default: false })
    read: boolean = false;

    @Prop({ type: Date, default: Date.now })
    createdAt: Date = new Date();
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);