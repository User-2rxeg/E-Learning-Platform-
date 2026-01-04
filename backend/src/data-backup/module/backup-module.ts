import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BackupService } from './backup-service';
import { CronBackupService } from '../scheduler/backup-cron';
import {BackupController} from "./backup-controller";
import {AuthModule} from "../../auth/authentication-module";
import {AuditLogModule} from "../../audit-log/audit-logging.module";


@Module({
    imports: [ScheduleModule.forRoot(), AuditLogModule,AuthModule],
    providers: [BackupService, CronBackupService],
    controllers: [BackupController],
    exports: [BackupService],
})
export class BackupModule {}

