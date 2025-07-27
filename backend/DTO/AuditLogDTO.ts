// AuditLogDto.ts
import { IsString, IsMongoId, IsDate, IsOptional } from 'class-validator';

const CompatIsString: any = IsString;
const CompatIsMongoId: any = IsMongoId;
const CompatIsDate: any = IsDate;
const CompatIsOptional: any = IsOptional;

export class CreateAuditLogDto {
    @CompatIsMongoId()
    @CompatIsOptional()
    userId?: string;

    @CompatIsString()
    event: string;

    @CompatIsDate()
    timestamp: Date;

    @CompatIsString()
    @CompatIsOptional()
    details?: string;
}

export class UpdateAuditLogDto extends CreateAuditLogDto {}