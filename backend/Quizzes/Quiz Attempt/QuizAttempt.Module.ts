// QuizAttempt/QuizAttempt.Module.ts
import { Performance, PerformanceSchema } from '../../Database/Performance';
import {QuizAttemptController} from "./Quiz-Attempt.Controller";
import {QuizAttemptService} from "./Quiz-Attempt.Service";
import {AuthModule} from "../../Authentication/AuthModule";
import {Quiz, QuizSchema} from "../../Database/Quiz";
import {QuizAttempt, QuizAttemptSchema} from "../../Database/QuizAttempt";
import {MongooseModule} from "@nestjs/mongoose";
import {Module} from "@nestjs/common";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: QuizAttempt.name, schema: QuizAttemptSchema },
            { name: Quiz.name, schema: QuizSchema },
            { name: Performance.name, schema: PerformanceSchema }, // <-- add
        ]),
        AuthModule,
    ],
    providers: [QuizAttemptService],
    controllers: [QuizAttemptController],
})
export class QuizAttemptModule {}