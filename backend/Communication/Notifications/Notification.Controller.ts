import {
    Controller,
    Post,
    Get,
    Body,
    Param,
    Delete,
    Patch,
    UseGuards,
    Req
} from '@nestjs/common';

import { User } from '../../Database/User';
import {JwtAuthGuard} from "../../Authentication/Guards/AuthGuard";
import {NotificationService} from "./Notification.Service";
import {CreateNotificationDto} from "../../DTO/NotificationDTO";
import {CurrentUser} from "../../Authentication/Decorators/Current-User";
import {JwtPayload} from "../../Authentication/Interfaces/JWT-Payload.Interface";
import {RolesGuard} from "../../Authentication/Guards/RolesGuard";

@Controller('notifications')
@UseGuards(JwtAuthGuard,RolesGuard) // Apply JWT Auth Guard to all routes in this controller
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    // Create Notification
    @Post()
    async create(
        @Body() dto: CreateNotificationDto,
        @CurrentUser() user: JwtPayload
    ) {
        return this.notificationService.createNotification(dto, user.sub);
    }

    // Get All Notifications for User
    @Get()
    async getUserNotifications(@CurrentUser() user: JwtPayload) {
        return this.notificationService.getUserNotifications(user.sub);
    }

    // Mark Notification as Read
    @Patch(':id/read')
    async markAsRead(
        @Param('id') notificationId: string,
        @CurrentUser() user: JwtPayload
    ) {
        return this.notificationService.markAsRead(notificationId, user.sub);
    }

    // Mark All as Read
    @Patch('mark-all-read')
    async markAllAsRead(@CurrentUser() user: JwtPayload) {
        return this.notificationService.markAllAsRead(user.sub);
    }

    // Delete Notification
    @Delete(':id')
    async deleteNotification(
        @Param('id') notificationId: string,
        @CurrentUser() user: JwtPayload
    ) {
        return this.notificationService.deleteNotification(notificationId, user.sub);
    }
}