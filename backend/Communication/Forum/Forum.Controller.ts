import { Controller, Post, Patch, Get, Delete, Param, Body, Req, UseGuards, Query } from '@nestjs/common';

import { UserRole } from '../../Database/User';
import { Request } from 'express';
import { CreateForumDto } from '../../DTO/ForumDTO';
import {JwtAuthGuard} from "../../Authentication/Guards/AuthGuard";
import {RolesGuard} from "../../Authentication/Guards/RolesGuard";
import {ForumService} from "./Forum.Service";
import {Roles} from "../../Authentication/Decorators/Roles-Decorator";

@Controller('forums')

export class ForumController {
    constructor(private readonly forumService: ForumService) {}

    // 1. Create Forum
    @Roles(UserRole.INSTRUCTOR)
    @Post()
    async createForum(@Body() createForumDto: CreateForumDto) {
        return this.forumService.createForum(createForumDto);
    }

    // 2. Get Forum by CourseId
    @Get('course/:courseId')
    async getForumByCourseId(@Param('courseId') courseId: string) {
        return this.forumService.getForumByCourse(courseId);
    }

    // 3. Add Thread
    @Roles(UserRole.STUDENT, UserRole.INSTRUCTOR)
    @Post(':forumId/threads')
    async addThread(
        @Param('forumId') forumId: string,
        @Body('title') title: string,
        @Req() req: Request
    ) {
        const userId = (req.user as any).sub;
        return this.forumService.addThread(forumId, title, userId);
    }

    // 4. Add Post to Thread
    @Roles(UserRole.STUDENT, UserRole.INSTRUCTOR)
    @Post(':forumId/threads/:threadId/posts')
    async addPost(
        @Param('forumId') forumId: string,
        @Param('threadId') threadId: string,
        @Body('content') content: string,
        @Req() req: Request
    ) {
        const userId = (req.user as any).sub;
        return this.forumService.addPost(forumId, threadId, content, userId);
    }

    // 5. Like/Unlike Post
    @Patch(':forumId/threads/:threadId/posts/:postId/like')
    async likeOrUnlikePost(
        @Param('forumId') forumId: string,
        @Param('threadId') threadId: string,
        @Param('postId') postId: string,
        @Req() req: Request
    ) {
        const userId = (req.user as any).sub;
        return this.forumService.likeOrUnlikePost(forumId, threadId, postId, userId);
    }

    // 6. Delete Post
    @Delete('course/:courseId/threads/:threadId/posts/:postId')
    async deletePost(
        @Param('courseId') courseId: string,
        @Param('threadId') threadId: string,
        @Param('postId') postId: string,
        @Req() req: Request
    ) {
        const userId = (req.user as any).sub;
        return this.forumService.deletePost(courseId, threadId, postId, userId);
    }

    // 7. Delete Thread
    @Delete(':forumId/threads/:threadId')
    async deleteThread(
        @Param('forumId') forumId: string,
        @Param('threadId') threadId: string,
        @Req() req: Request
    ) {
        const userId = (req.user as any).sub;
        return this.forumService.deleteThread(forumId, threadId, userId);
    }

    // 8. Edit Thread Title
    @Patch(':forumId/threads/:threadId/edit-title')
    async editThreadTitle(
        @Param('forumId') forumId: string,
        @Param('threadId') threadId: string,
        @Body('newTitle') newTitle: string,
        @Req() req: Request
    ) {
        const userId = (req.user as any).sub;
        return this.forumService.editThreadTitle(forumId, threadId, newTitle, userId);
    }

    // 9. Search Threads by Keyword
    @Get(':forumId/threads/search')
    async searchThreads(
        @Param('forumId') forumId: string,
        @Query('keyword') keyword: string
    ) {
        return this.forumService.searchThreads(forumId, keyword);
    }
}