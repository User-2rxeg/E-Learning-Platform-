import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Query,
    Body,
    UseGuards,
    ParseIntPipe,
    DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { AuthenticationGuard } from '../auth/guards/authentication-guard';
import { AuthorizationGuard } from '../auth/guards/authorization-guard';
import { CurrentUser } from '../auth/decorators/current-user';

@ApiTags('chat')
@ApiBearerAuth('access-token')
@Controller('chat')
@UseGuards(AuthenticationGuard, AuthorizationGuard)
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    // Get or create direct conversation with another user
    @Post('direct/:userId')
    @ApiOperation({ summary: 'Get or create direct conversation with a user' })
    async getOrCreateDirectConversation(
        @Param('userId') otherUserId: string,
        @CurrentUser() user: any,
    ) {
        return this.chatService.getOrCreateDirectConversation(user.sub, otherUserId);
    }

    // Create a group chat (study group)
    @Post('group')
    @ApiOperation({ summary: 'Create a group chat' })
    async createGroupChat(
        @Body('participants') participantIds: string[],
        @Body('groupName') groupName: string,
        @Body('courseId') courseId: string | undefined,
        @CurrentUser() user: any,
    ) {
        return this.chatService.createGroupChat(user.sub, participantIds, groupName, courseId);
    }

    // Get user's conversations
    @Get('conversations')
    @ApiOperation({ summary: 'Get my conversations' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    async getMyConversations(
        @CurrentUser() user: any,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    ) {
        return this.chatService.getUserConversations(user.sub, page, limit);
    }

    // Get messages in a conversation
    @Get('conversations/:conversationId/messages')
    @ApiOperation({ summary: 'Get messages in a conversation' })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    async getConversationMessages(
        @Param('conversationId') conversationId: string,
        @CurrentUser() user: any,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    ) {
        return this.chatService.getConversationMessages(conversationId, user.sub, page, limit);
    }

    // Send a message
    @Post('conversations/:conversationId/messages')
    @ApiOperation({ summary: 'Send a message' })
    async sendMessage(
        @Param('conversationId') conversationId: string,
        @Body('content') content: string,
        @Body('attachmentUrl') attachmentUrl: string | undefined,
        @CurrentUser() user: any,
    ) {
        return this.chatService.sendMessage(conversationId, user.sub, content, attachmentUrl);
    }

    // Mark messages as read
    @Patch('conversations/:conversationId/read')
    @ApiOperation({ summary: 'Mark all messages in conversation as read' })
    async markAsRead(
        @Param('conversationId') conversationId: string,
        @CurrentUser() user: any,
    ) {
        return this.chatService.markMessagesAsRead(conversationId, user.sub);
    }

    // Get total unread message count
    @Get('unread-count')
    @ApiOperation({ summary: 'Get total unread message count' })
    async getUnreadCount(@CurrentUser() user: any) {
        return this.chatService.getUnreadCount(user.sub);
    }

    // Leave a group conversation
    @Delete('conversations/:conversationId/leave')
    @ApiOperation({ summary: 'Leave a group conversation' })
    async leaveGroup(
        @Param('conversationId') conversationId: string,
        @CurrentUser() user: any,
    ) {
        return this.chatService.leaveGroupConversation(conversationId, user.sub);
    }

    // Add participant to group
    @Post('conversations/:conversationId/participants')
    @ApiOperation({ summary: 'Add a participant to group chat' })
    async addParticipant(
        @Param('conversationId') conversationId: string,
        @Body('userId') newParticipantId: string,
        @CurrentUser() user: any,
    ) {
        return this.chatService.addParticipantToGroup(conversationId, user.sub, newParticipantId);
    }
}

