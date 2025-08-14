import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Course, CourseSchema } from '../Database/Course';
import { User, UserSchema } from '../Database/User';
import { CourseService } from './Course.Service';
import { CourseController } from './Course.Controller';
import {AuthModule} from "../Authentication/AuthModule";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Course.name, schema: CourseSchema },
            { name: User.name, schema: UserSchema }
        ])
        , AuthModule
    ],
    controllers: [CourseController],
    providers: [CourseService],
})
export class CourseModule {}
