import { Controller, Post, Get, Body, Req, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../../Authentication/Guards/AuthGuard';
import { Roles } from '../../Authentication/Decorators/Roles-Decorator';
import { RolesGuard } from '../../Authentication/Guards/RolesGuard';
import { UserRole } from '../../Database/User';
import { Request } from 'express';
import {AttemptQuizDto} from "../../DTO/QuizDTO";
import {QuizAttemptService} from "./Quiz-Attempt.Service";

@Controller('quiz-attempts')

export class QuizAttemptController {
    constructor(private readonly quizAttemptService: QuizAttemptService) {}

    @Roles(UserRole.STUDENT)
    @Post('attempt')
    async attemptQuiz(@Body() attemptQuizDto: AttemptQuizDto, @Req() req: Request) {
        const studentId = (req.user as any).sub;
        return this.quizAttemptService.attemptQuiz(studentId, attemptQuizDto);
    }

    @Roles(UserRole.STUDENT)
    @Get('my-attempts')
    async getMyAttempts(@Req() req: Request) {
        const studentId = (req.user as any).sub;
        return this.quizAttemptService.getAttemptsForStudent(studentId);
    }
}
