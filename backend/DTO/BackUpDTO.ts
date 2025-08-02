import { IsString, IsDate } from 'class-validator';

export class CreateBackupDto {
    @IsDate()
    backupDate!: Date;

    @IsString()
    dataType!: string;

    @IsString()
    storageLink!: string;
}

export class UpdateBackupDto extends CreateBackupDto {}