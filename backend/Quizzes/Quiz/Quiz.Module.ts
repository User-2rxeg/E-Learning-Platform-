import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Quiz, QuizSchema } from '../../Database/Quiz';
import { QuizService } from './Quiz.Service';
import { QuizController } from './Quiz.Controller';
import { UserModule } from '../../User/User.Module';
import {AuthModule} from "../../Authentication/AuthModule"; // <-- Import UserModule

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
