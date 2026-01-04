import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

import { UserModule } from './user/user.module';
import { QuizModule } from './quizzes/quiz/quiz.module';
import { QuizAttemptModule } from './quizzes/quiz-attempt/quiz-attempt.module';
import { CoursesModule } from './courses/courses.module';
import { ForumModule } from './forum/forum.module';
import { PerformanceModule } from './performance/performance/performance.module';
import { AuditLogModule } from './audit-log/audit-logging.module';
import { AdminModule } from "./admin/admin.module";
import { AnalyticsModule } from "./performance/analytics/analytics.module";
import { QuickNotesModule } from "./quick-notes/quick-notes.module";
import { ProgressTrackingModule } from "./progress-tracking/progress-tracking.module";
import { BackupModule } from "./data-backup/module/backup-module";
import { AuthenticationGuard } from "./auth/guards/authentication-guard";
import { AuthorizationGuard } from "./auth/guards/authorization-guard";
import { AuthModule } from "./auth/authentication-module";
import { NotificationModule } from "./notifications/notification.module";
import { ChatModule } from "./chat/chat.module";
import { SecurityModule } from "./security/security.module";

@Module({
    imports: [
        // Configuration
        ConfigModule.forRoot({ isGlobal: true }),
        ScheduleModule.forRoot(),

        // Rate limiting (global throttler)
        ThrottlerModule.forRoot([{
            ttl: 60000,    // 1 minute
            limit: 100,    // 100 requests per minute per IP
        }]),

        // Database
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                uri: configService.get<string>('DATABASE_CONNECTION'),
            }),
            inject: [ConfigService],
        }),

        // Security
        SecurityModule,

        // Core modules
        AuthModule,
        AuditLogModule,
        UserModule,

        // Feature modules
        CoursesModule,
        QuizModule,
        QuizAttemptModule,
        ForumModule,
        PerformanceModule,
        AnalyticsModule,
        QuickNotesModule,
        ProgressTrackingModule,

        // Communication
        NotificationModule,
        ChatModule,

        // Admin
        AdminModule,
        BackupModule,
    ],
    providers: [

        { provide: APP_GUARD, useClass: AuthenticationGuard },
        { provide: APP_GUARD, useClass: AuthorizationGuard },
        { provide: APP_GUARD, useClass: ThrottlerGuard },
    ],
})
export class AppModule {}

