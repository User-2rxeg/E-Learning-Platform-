import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Query,
    Body,
    Req,
    UseGuards,
    ParseIntPipe,
    DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { AuthenticationGuard } from '../auth/guards/authentication-guard';
import { AuthorizationGuard } from '../auth/guards/authorization-guard';
import { Roles } from '../auth/decorators/roles-decorator';
import { CurrentUser } from '../auth/decorators/current-user';
import { UserRole } from '../database/user';
import { Request } from 'express';

@ApiTags('notifications')
@ApiBearerAuth('access-token')
@Controller('notifications')
@UseGuards(AuthenticationGuard, AuthorizationGuard)
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    // Get current user's notifications
    @Get()
    @ApiOperation({ summary: 'Get my notifications' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'unreadOnly', required: false })
    async getMyNotifications(
        @CurrentUser() user: any,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
        @Query('unreadOnly') unreadOnly?: string,
    ) {
        return this.notificationService.getUserNotifications(
            user.sub,
            page,
            limit,
            unreadOnly === 'true'
        );
    }

    // Mark a notification as read
    @Patch(':id/read')
    @ApiOperation({ summary: 'Mark notification as read' })
    async markAsRead(@Param('id') id: string, @CurrentUser() user: any) {
        return this.notificationService.markAsRead(id, user.sub);
    }

    // Mark all notifications as read
    @Patch('read-all')
    @ApiOperation({ summary: 'Mark all notifications as read' })
    async markAllAsRead(@CurrentUser() user: any) {
        return this.notificationService.markAllAsRead(user.sub);
    }

    // Delete a notification
    @Delete(':id')
    @ApiOperation({ summary: 'Delete a notification' })
    async deleteNotification(@Param('id') id: string, @CurrentUser() user: any) {
        return this.notificationService.deleteNotification(id, user.sub);
    }

    // Admin: Send platform-wide announcement
    @Post('announce/all')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Send announcement to all users (Admin only)' })
    async announceToAll(
        @Body('message') message: string,
        @CurrentUser() user: any,
    ) {
        return this.notificationService.sendToAllUsers(message, 'announcement', user.sub);
    }

    // Admin: Send announcement to a specific role
    @Post('announce/role/:role')
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Send announcement to users with specific role (Admin only)' })
    async announceToRole(
        @Param('role') role: UserRole,
        @Body('message') message: string,
        @CurrentUser() user: any,
    ) {
        return this.notificationService.sendToRole(role, message, 'announcement', user.sub);
    }

    // Instructor: Send notification to course students
    @Post('course/:courseId')
    @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
    @ApiOperation({ summary: 'Send notification to course students (Instructor/Admin)' })
    async notifyCourseStudents(
        @Param('courseId') courseId: string,
        @Body('message') message: string,
        @CurrentUser() user: any,
    ) {
        return this.notificationService.sendToCourseStudents(courseId, message, 'courseUpdate', user.sub);
    }
}

