// src/Backup/Backup.Module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Backup, BackupSchema } from '../Database/Backup';
import { BackupService } from './Backup.Service';
import { BackupController } from './Backup.Controller';
import { User, UserSchema } from '../Database/User';
import { Course, CourseSchema } from '../Database/Course';
import { Performance, PerformanceSchema } from '../Database/Performance';
import {AuthModule} from "../Authentication/AuthModule";
import {BackupCron} from "./Backup-Cron";



@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Backup.name, schema: BackupSchema },
            { name: User.name, schema: UserSchema },
            { name: Course.name, schema: CourseSchema },
            { name: Performance.name, schema: PerformanceSchema },
        ]),
        AuthModule,
    ],
    providers: [BackupService, BackupCron],
    controllers: [BackupController],
})
export class BackupModule {}