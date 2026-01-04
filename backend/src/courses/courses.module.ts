import { Module as NestModule } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MulterModule } from "@nestjs/platform-express";
import { AuthModule } from "../auth/authentication-module";
import { CoursesController } from "./courses.controller";
import { CoursesService } from "./courses.service";
import { fileFilter, limits, storage } from "../multer.config";
import { User, UserSchema } from "../database/user";
import { Course, CourseSchema } from "../database/course";
import { Module, ModuleSchema } from "../database/module";
import { AuditLogModule } from "../audit-log/audit-logging.module";
import { NotificationModule } from "../notifications/notification.module";
import { MailModule } from "../auth/email/email-module";


@NestModule({
    imports: [
        MongooseModule.forFeature([
            { name: Course.name, schema: CourseSchema },
            { name: User.name, schema: UserSchema },
            { name: Module.name, schema: ModuleSchema },
        ]),
        MulterModule.register({ storage, fileFilter, limits }),
        AuthModule,
        AuditLogModule,
        NotificationModule,
        MailModule,
    ],
    controllers: [CoursesController],
    providers: [CoursesService],
    exports: [CoursesService],
})
export class CoursesModule {}
