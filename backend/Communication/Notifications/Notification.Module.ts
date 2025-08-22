import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';

import { Notification, NotificationSchema } from '../../Database/Notification';

import { Course, CourseSchema } from '../../Database/Course';
import { User, UserSchema } from '../../Database/User';

import { NotificationService } from './Notification.Service';
import { NotificationController } from './Notification.Controller';
import { NotificationGateway } from './Notification-Gateway';
import { AuthModule } from '../../Authentication/AuthModule';
import {NotificationAuditLog, NotificationAuditLogSchema} from "../../Database/Notification.AuditLog.";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Notification.name, schema: NotificationSchema },
            { name: NotificationAuditLog.name, schema: NotificationAuditLogSchema },
            { name: Course.name, schema: CourseSchema },
            { name: User.name, schema: UserSchema },
        ]),
        AuthModule,
        JwtModule.register({}), // ensure same secret as HTTP auth via AuthModule or env
    ],
    providers: [NotificationService, NotificationGateway],
    controllers: [NotificationController],
    exports: [NotificationService],
})
export class NotificationModule {}