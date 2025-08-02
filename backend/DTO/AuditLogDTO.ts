import { IsString, IsMongoId, IsDate, IsOptional } from 'class-validator';

export class CreateAuditLogDto {
    @IsMongoId()
    @IsOptional()
    userId?: string;

    @IsString()
    event!: string;

    @IsDate()
    timestamp!: Date;

    @IsString()
    @IsOptional()
    details?: string;
}

export class UpdateAuditLogDto extends CreateAuditLogDto {}