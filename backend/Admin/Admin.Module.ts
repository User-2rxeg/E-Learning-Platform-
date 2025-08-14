import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { User, UserSchema } from '../Database/User';
import { Course, CourseSchema } from '../Database/Course';
import { AuthModule } from '../Authentication/AuthModule';
import { NotificationModule } from '../Communication/Notifications/Notification.Module';
// ⬇ add this
import { UserModule } from '../User/User.Module';
import {AdminController} from "./Admin.Controller";
import {AdminService} from "./Admin.Service";
import {AuditLogModule} from "../Audit-Log/Audit-Log.Module";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'User', schema: UserSchema },
            { name: 'Course', schema: CourseSchema },
        ]),
        AuthModule,
        NotificationModule,
        UserModule,
        AuditLogModule,// ⬅ this makes UserService available
    ],
    controllers: [AdminController],
    providers: [AdminService],
})
export class AdminModule {}