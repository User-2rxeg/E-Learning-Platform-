import {Performance, PerformanceSchema} from "../../database/performance";
import {QuizAttempt, QuizAttemptSchema} from "../../database/quiz-attempt";
import {AuthModule} from "../../auth/authentication-module";
import {AnalyticsController} from "./analytics.controller";
import {AnalyticsService} from "./analytics.service";
import {User, UserSchema} from "../../database/user";
import {Course, CourseSchema} from "../../database/course";
import {MongooseModule} from "@nestjs/mongoose";
import {Module} from "@nestjs/common";


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