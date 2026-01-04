import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { User, UserSchema } from '../database/user';
import { Course, CourseSchema } from '../database/course';
import { AuditLog, AuditLogSchema } from '../database/audit-log';
import { AuthModule } from "../auth/authentication-module";
import { UserModule } from "../user/user.module";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { AuditLogModule } from "../audit-log/audit-logging.module";
import { MailModule } from "../auth/email/email-module";


@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Course.name, schema: CourseSchema },
            { name: AuditLog.name, schema: AuditLogSchema },
        ]),
        AuthModule,
        UserModule,
        AuditLogModule,
        MailModule,
    ],
    controllers: [AdminController],
    providers: [AdminService],
})
export class AdminModule {}