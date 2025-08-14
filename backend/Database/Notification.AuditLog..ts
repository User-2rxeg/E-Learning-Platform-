import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type NotificationAuditLogDocument = HydratedDocument<NotificationAuditLog>;

@Schema({ timestamps: true })
export class NotificationAuditLog {
    @Prop({ type: Types.ObjectId, ref: 'Notification', required: true })
    notificationId!: Types.ObjectId;

    @Prop({ type: String, enum: ['SENT', 'READ', 'DELETED'], required: true })
    eventType!: 'SENT' | 'READ' | 'DELETED';

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId!: Types.ObjectId;

    @Prop({ type: Date, default: Date.now })
    timestamp!: Date;
}

export const NotificationAuditLogSchema = SchemaFactory.createForClass(NotificationAuditLog);

//NotificationAuditLogSchema.index({ notificationId: 1, eventType: 1, timestamp: -1 });
//NotificationAuditLogSchema.index({ userId: 1, eventType: 1, timestamp: -1 });
//NotificationAuditLogSchema.index({ timestamp:-1});