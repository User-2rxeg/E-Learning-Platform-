// backend/Quick-Notes/Quick-Notes.Controller.ts - UPDATED CONTROLLER

import { Controller, Post, Get, Delete, Patch, Param, Body, Req, UseGuards } from '@nestjs/common';
import { QuickNotesService } from './Quick-Notes.Service';
import { JwtAuthGuard } from '../Authentication/Guards/AuthGuard';
import { RolesGuard } from '../Authentication/Guards/RolesGuard';
import { Roles } from '../Authentication/Decorators/Roles-Decorator';
import { UserRole } from '../Database/User';
import { Request } from 'express';

@Controller('notes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QuickNotesController {
    constructor(private readonly quickNotesService: QuickNotesService) {}

    @Roles(UserRole.STUDENT)
    @Post()
    async createNote(@Body() noteData: any, @Req() req: Request) {
        const studentId = (req.user as any).sub;
        return this.quickNotesService.createNote(studentId, noteData);
    }

    @Roles(UserRole.STUDENT)
    @Get(':courseId')
    async getNotesByCourse(@Param('courseId') courseId: string, @Req() req: Request) {
        const studentId = (req.user as any).sub;
        return this.quickNotesService.getNotesByCourse(studentId, courseId);
    }

    @Roles(UserRole.STUDENT)
    @Delete(':noteId')
    async deleteNote(@Param('noteId') noteId: string, @Req() req: Request) {
        const studentId = (req.user as any).sub;
        await this.quickNotesService.deleteNote(studentId, noteId);
        return { message: 'Note deleted successfully' };
    }

    @Roles(UserRole.STUDENT)
    @Patch(':noteId')
    async updateNote(
        @Param('noteId') noteId: string,
        @Body('content') content: string,
        @Req() req: Request
    ) {
        const studentId = (req.user as any).sub;
        return this.quickNotesService.updateNote(studentId, noteId, content);
    }
}