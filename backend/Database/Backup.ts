// Backup.ts
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

const CompatProp: any = Prop;

@Schema()
export class Backup extends Document {
    @CompatProp({ type: Date, default: Date.now, required: true })
    backupDate: Date;

    @CompatProp({ type: String, required: true })
    dataType: string;

    @CompatProp({ type: String, required: true })
    storageLink: string;
}

export const BackupSchema = SchemaFactory.createForClass(Backup);