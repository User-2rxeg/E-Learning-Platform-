// src/App.Module.ts
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { JwtAuthGuard } from '../Authentication/Guards/AuthGuard';
import { RolesGuard } from '../Authentication/Guards/RolesGuard';

import { UserModule } from '../User/User.Module';
import { AuthModule } from '../Authentication/AuthModule';
import { QuizModule } from '../Quizzes/Quiz/Quiz.Module';
import { QuizAttemptModule } from '../Quizzes/Quiz Attempt/QuizAttempt.Module';
import { CourseModule } from '../Course/Course.Module';
import { ForumModule } from '../Communication/Forum/Forum.Module';
import { NotificationModule } from '../Communication/Notifications/Notification.Module';
import { PerformanceModule } from '../Performance/Performance/Performance.Module';
import { AuditLogModule } from '../Audit-Log/Audit-Log.Module';
import { BackupModule } from '../Backup/Backup.Module';
import {AdminModule} from "../Admin/Admin.Module";
import {AnalyticsModule} from "../Performance/Analytics/Analytics-Module";
import {ChatModule} from "../Communication/Chats/Chat-Module";
import { ScheduleModule } from '@nestjs/schedule';
@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        ScheduleModule.forRoot(),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
useFactory: async (configService: ConfigService) => ({
                uri: configService.get<string>('MONGODB_URI'),
            }),
           inject: [ConfigService],
        }),
        AuditLogModule,
        AuthModule, // <-- make sure this is imported so JwtAuthGuard can inject AuthService
        UserModule,
        QuizModule,
        QuizAttemptModule,
        CourseModule,
       ForumModule,
       NotificationModule,
        PerformanceModule,
        BackupModule,
        AdminModule,
        AnalyticsModule,
        ChatModule,
    ],
    providers: [
       { provide: APP_GUARD, useClass: JwtAuthGuard }, // global JWT guard
        { provide: APP_GUARD, useClass: RolesGuard },   // global Roles guard (optional but handy)
   ],
})
export class AppModule {}



