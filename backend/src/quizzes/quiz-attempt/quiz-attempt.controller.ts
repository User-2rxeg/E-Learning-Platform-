import { Controller, Post, Get, Body, Req, UseGuards } from '@nestjs/common';

import { UserRole } from '../../database/user';
import { Request } from 'express';
import {AttemptQuizDto} from "../../dto's/quiz-dto's";
import {QuizAttemptService} from "./quiz-attempt.service";
import {Roles} from "../../auth/decorators/roles-decorator";
import {AuthenticationGuard} from "../../auth/guards/authentication-guard";
import {AuthorizationGuard} from "../../auth/guards/authorization-guard";

@Controller('quiz-attempts')
@UseGuards(AuthenticationGuard, AuthorizationGuard)
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
