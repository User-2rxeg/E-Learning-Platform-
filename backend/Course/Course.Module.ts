//import { Module } from '@nestjs/common';
//import { MongooseModule } from '@nestjs/mongoose';
//import { Course, CourseSchema } from '../Database/Course';
//import { User, UserSchema } from '../Database/User';
//import { CourseService } from './Course.Service';
//import { CourseController } from './Course.Controller';
//import {AuthModule} from "../Authentication/AuthModule";

//@Module({
    //imports: [
       // MongooseModule.forFeature([
            //{ name: Course.name, schema: CourseSchema },
          //  { name: User.name, schema: UserSchema }
        //])
      //  , AuthModule
    //],
    //controllers: [CourseController],
  //  providers: [CourseService],
//})
//export class CourseModule {}


// src/Course/Course.Module.ts  (adjust relative paths as in your project)
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';

import { Course, CourseSchema } from '../Database/Course';
import { User, UserSchema } from '../Database/User'; // <-- add this
import { CourseService } from './Course.Service';
import { CourseController } from './Course.Controller';
import {fileFilter, limits, storage} from "../src/multer.config";
import {AuthModule} from "../Authentication/AuthModule";


@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Course.name, schema: CourseSchema },
            { name: User.name, schema: UserSchema }, // <-- register User model here
        ]),
        MulterModule.register({ storage, fileFilter, limits }),
        AuthModule,
    ],
    controllers: [CourseController],
    providers: [CourseService],
    exports: [CourseService],
})
export class CourseModule {}
