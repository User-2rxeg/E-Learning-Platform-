// AuditLog.ts
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

const CompatProp: any = Prop;

@Schema()
export class AuditLog extends Document {
    @CompatProp({ type: Types.ObjectId, ref: 'User' })
    userId: Types.ObjectId;

    @CompatProp({ type: String, required: true })
    event: string;

    @CompatProp({ type: Date, default: Date.now })
    timestamp: Date;

    @CompatProp({ type: Object, default: {} })
    details: Record<string, any>;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);