// backend/Progress/Progress.Controller.ts - NEW CONTROLLER

import { Controller, Post, Get, Param, Body, Req, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../Authentication/Guards/AuthGuard';
import { RolesGuard } from '../Authentication/Guards/RolesGuard';
import { Roles } from '../Authentication/Decorators/Roles-Decorator';
import { UserRole } from '../Database/User';
import { Request } from 'express';
import {ProgressService} from "./Progress-Service";

@Controller('progress')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProgressController {
    constructor(private readonly progressService: ProgressService) {}

    @Roles(UserRole.STUDENT)
    @Post('save')
    async saveProgress(@Body() progressData: any, @Req() req: Request) {
        const studentId = (req.user as any).sub;
        await this.progressService.saveProgress(studentId, progressData);
        return { message: 'Progress saved successfully' };
    }

    @Roles(UserRole.STUDENT)
    @Get(':courseId')
    async getProgress(@Param('courseId') courseId: string, @Req() req: Request) {
        const studentId = (req.user as any).sub;
        return this.progressService.getProgress(studentId, courseId);
    }

    @Roles(UserRole.STUDENT)
    @Get()
    async getProgressSummary(@Req() req: Request) {
        const studentId = (req.user as any).sub;
        return this.progressService.getStudentProgressSummary(studentId);
    }
}
