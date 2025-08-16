// src/Analytics/analytics.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {PerformanceSchema} from "../../Database/Performance";
import {QuizAttempt, QuizAttemptSchema} from "../../Database/QuizAttempt";
import {Course, CourseSchema} from "../../Database/Course";
import {User, UserSchema} from "../../Database/User";
import {AuthModule} from "../../Authentication/AuthModule";
import {AnalyticsService} from "./Analytics-Service";
import {AnalyticsController} from "./Analytics-Controller";


@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Performance.name, schema: PerformanceSchema },
            { name: QuizAttempt.name, schema: QuizAttemptSchema },
            { name: Course.name, schema: CourseSchema },
            { name: User.name, schema: UserSchema },
        ]),
        AuthModule,
    ],
    controllers: [AnalyticsController],
    providers: [AnalyticsService],
})
export class AnalyticsModule {}