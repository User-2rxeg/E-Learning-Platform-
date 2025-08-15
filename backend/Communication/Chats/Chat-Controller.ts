import {Body, Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Post, Query} from '@nestjs/common';

import { CreateChatDto } from '../../DTO/ChatDTO';
import { Roles } from '../../Authentication/Decorators/Roles-Decorator';
import { UserRole } from '../../Database/User';
import { JwtAuthGuard } from '../../Authentication/Guards/AuthGuard';
import { RolesGuard } from '../../Authentication/Guards/RolesGuard';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../Authentication/Decorators/Current-User';
import { JwtPayload } from '../../Authentication/Interfaces/JWT-Payload.Interface';
import {ChatService} from "./Chat-Service";

@Controller('chat')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChatController {
    constructor(private readonly svc: ChatService) {}

    // anyone authenticated can create chat (student/instructor/admin)
    @Post('rooms')
    async createRoom(@Body() dto: CreateChatDto, @CurrentUser() me: JwtPayload) {
        return this.svc.createChat(dto, me.sub);
    }

    @Get('rooms')
    async myRooms(
        @CurrentUser() me: JwtPayload,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    ) {
        return this.svc.listMyChats(me.sub, { page, limit });
    }

    @Get(':chatId/history')
    async history(
        @Param('chatId') chatId: string,
        @CurrentUser() me: JwtPayload,
        @Query('page') page = '1',
        @Query('limit') limit = '20',
    ) {
        return this.svc.history(chatId, me.sub, { page: parseInt(page), limit: parseInt(limit) });
    }

    @Post(':chatId/messages')
    async sendMessage(
        @Param('chatId') chatId: string,
        @Body('content') content: string,
        @CurrentUser() me: JwtPayload,
    ) {
        return this.svc.sendMessage(chatId, me.sub, content);
    }

    // controller
    @Post(':chatId/read')
    async markRead(
        @Param('chatId') chatId: string,
        @Body('messageIds') messageIds: string[] | undefined,
        @CurrentUser() me: JwtPayload,
    ) {
        return this.svc.markRead(chatId, me.sub, messageIds);
    }

    // controller
    @Post('dm/:otherUserId')
    async getOrCreateDM(@Param('otherUserId') other: string, @CurrentUser() me: JwtPayload) {
        return this.svc.getOrCreateDirect(me.sub, other);
    }
}