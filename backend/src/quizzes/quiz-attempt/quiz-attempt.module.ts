import { Performance, PerformanceSchema } from '../../database/performance';
import { QuizAttemptController } from "./quiz-attempt.controller";
import { QuizAttemptService } from "./quiz-attempt.service";
import { Quiz, QuizSchema } from "../../database/quiz";
import { QuizAttempt, QuizAttemptSchema } from "../../database/quiz-attempt";
import { User, UserSchema } from "../../database/user";
import { MongooseModule } from "@nestjs/mongoose";
import { Module } from "@nestjs/common";
import { AuthModule } from "../../auth/authentication-module";
import { AuditLogModule } from "../../audit-log/audit-logging.module";
import { MailModule } from "../../auth/email/email-module";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: QuizAttempt.name, schema: QuizAttemptSchema },
            { name: Quiz.name, schema: QuizSchema },
            { name: Performance.name, schema: PerformanceSchema },
            { name: User.name, schema: UserSchema },
        ]),
        AuthModule,
        AuditLogModule,
        MailModule,
    ],
    providers: [QuizAttemptService],
    controllers: [QuizAttemptController],
})
export class QuizAttemptModule {}