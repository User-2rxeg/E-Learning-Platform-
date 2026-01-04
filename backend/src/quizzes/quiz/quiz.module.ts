import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Quiz, QuizSchema } from '../../database/quiz';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import {UserModule} from "../../user/user.module";
import {AuthModule} from "../../auth/authentication-module";


@Module({
    imports: [
        MongooseModule.forFeature([{ name: Quiz.name, schema: QuizSchema }]),
        UserModule,
AuthModule,
    ],
    providers: [QuizService],
    controllers: [QuizController],
})
export class QuizModule {}
