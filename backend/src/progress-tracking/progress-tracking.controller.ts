// backend/progress-tracking/progress-tracking.Controller.ts - NEW CONTROLLER

import { Controller, Post, Get, Param, Body, Req, UseGuards } from '@nestjs/common';


import { UserRole } from '../database/user';
import { Request } from 'express';
import {ProgressTrackingService} from "./progress-tracking.service";
import {Roles} from "../auth/decorators/roles-decorator";
import {AuthenticationGuard} from "../auth/guards/authentication-guard";
import {AuthorizationGuard} from "../auth/guards/authorization-guard";

@Controller('progress')
@UseGuards(AuthenticationGuard, AuthorizationGuard)
export class ProgressTrackingController {
    constructor(private readonly progressService: ProgressTrackingService) {}

    @Roles(UserRole.STUDENT)
    @Post('save')
    async saveProgress(@Body() progressData: any, @Req() req: Request) {
        const studentId = (req.user as any).sub;
        await this.progressService.saveProgress(studentId, progressData);
        return { message: 'progress-tracking saved successfully' };
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
        return this.progressService.getProgressSummary(studentId);
    }
}
