import { IsString, IsMongoId, IsBoolean, IsDate } from 'class-validator';

export class CreateNotificationDto {
    @IsMongoId()
    recipientId!: string;

    @IsString()
    type!: string;

    @IsString()
    message!: string;

    @IsBoolean()
    read!: boolean;

    @IsDate()
    createdAt!: Date;
}

export class UpdateNotificationDto extends CreateNotificationDto {}
