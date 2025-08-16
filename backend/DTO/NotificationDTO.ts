// src/DTO/NotificationDTO.ts
import { IsString, IsMongoId, IsOptional } from 'class-validator';

export class CreateNotificationDto {
    @IsMongoId()
    recipientId!: string;         // string, not Types.ObjectId

    @IsString()
    type!: string;

    @IsString()
    message!: string;

    @IsMongoId()
    @IsOptional()
    courseId?: string;            // optional
}

// For updates, do not allow client to set read/createdAt/sentBy directly
export class UpdateNotificationDto {
    @IsString()
    @IsOptional()
    type?: string;

    @IsString()
    @IsOptional()
    message?: string;

    @IsMongoId()
    @IsOptional()
    courseId?: string;
}