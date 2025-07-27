// BackupDto.ts
import { IsString, IsDate } from 'class-validator';

const CompatIsString: any = IsString;
const CompatIsDate: any = IsDate;

export class CreateBackupDto {
    @CompatIsDate()
    backupDate: Date;

    @CompatIsString()
    dataType: string;

    @CompatIsString()
    storageLink: string;
}

export class UpdateBackupDto extends CreateBackupDto {}