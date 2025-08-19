import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { NotificationService } from './Notification.Service';
import { CreateNotificationDto } from '../../DTO/NotificationDTO';
import { JwtAuthGuard } from '../../Authentication/Guards/AuthGuard';
import { RolesGuard } from '../../Authentication/Guards/RolesGuard';
import { CurrentUser } from '../../Authentication/Decorators/Current-User';
import { JwtPayload } from '../../Authentication/Interfaces/JWT-Payload.Interface';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    @Post()
    create(@Body() dto: CreateNotificationDto, @CurrentUser() user: JwtPayload) {
        return this.notificationService.createNotification(dto, user.sub);
    }

    @Get()
    getMine(@CurrentUser() user: JwtPayload) {
        return this.notificationService.getUserNotifications(user.sub);
    }

    @Patch(':id/read')
    markAsRead(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
        return this.notificationService.markAsRead(id, user.sub);
    }

    @Patch('mark-all-read')
    markAll(@CurrentUser() user: JwtPayload) {
        return this.notificationService.markAllAsRead(user.sub);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
        return this.notificationService.deleteNotification(id, user.sub);
    }
}