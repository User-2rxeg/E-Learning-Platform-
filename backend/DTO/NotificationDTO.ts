// NotificationDto.ts
import { IsString, IsMongoId, IsBoolean, IsDate } from 'class-validator';

const CompatIsString: any = IsString;
const CompatIsMongoId: any = IsMongoId;
const CompatIsBoolean: any = IsBoolean;
const CompatIsDate: any = IsDate;

export class CreateNotificationDto {
    @CompatIsMongoId()
    recipientId: string;

    @CompatIsString()
    type: string;

    @CompatIsString()
    message: string;

    @CompatIsBoolean()
    read: boolean;

    @CompatIsDate()
    createdAt: Date;
}

export class UpdateNotificationDto extends CreateNotificationDto {}