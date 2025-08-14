import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';

import { NotificationSchema } from '../../Database/Notification';

import { CourseSchema } from '../../Database/Course';
import { UserSchema } from '../../Database/User';

import { NotificationService } from './Notification.Service';
import { NotificationController } from './Notification.Controller';

import { AuthModule } from '../../Authentication/AuthModule';
import {NotificationAuditLogSchema} from "../../Database/Notification.AuditLog.";
import {NotificationAuditController} from "./Notification-AuditLog/Notification-Audit.Controller";
import {NotificationAuditService} from "./Notification-AuditLog/Notification-Audit.Service";
import {NotificationGateway} from "./Notification-Gateway";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'Notification',         schema: NotificationSchema },
            { name: 'NotificationAuditLog', schema: NotificationAuditLogSchema },
            { name: 'Course',               schema: CourseSchema },
            { name: 'User',                 schema: UserSchema },
        ]),
        AuthModule,
        JwtModule.register({}), // for Gateway
    ],
    controllers: [NotificationController, NotificationAuditController],
    providers: [NotificationService, NotificationAuditService, NotificationGateway],
    exports: [NotificationService, NotificationAuditService],
})
export class NotificationModule {}