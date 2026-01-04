import { Controller, Post, Get, Patch, Delete, Param, Body, Req, UseGuards } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CreateQuizDto, UpdateQuizDto } from '../../dto\'s/quiz-dto\'s';

import { Request } from 'express';
import { UserRole } from '../../database/user';
import {Roles} from "../../auth/decorators/roles-decorator";
import {AuthenticationGuard} from "../../auth/guards/authentication-guard";
import {AuthorizationGuard} from "../../auth/guards/authorization-guard";

@Controller('quizzes')
@UseGuards(AuthenticationGuard, AuthorizationGuard)
export class QuizController {
    constructor(private readonly quizService: QuizService) {}

    @Roles(UserRole.INSTRUCTOR)
    @Post()
    async create(@Body() createQuizDto: CreateQuizDto) {
        return this.quizService.create(createQuizDto);
    }

    @Get()
    async findAll() {
        return this.quizService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.quizService.findOne(id);
    }

    @Roles(UserRole.INSTRUCTOR)
    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateQuizDto: UpdateQuizDto,
        @Req() req: Request
    ) {
        const userId = (req.user as any).sub;
        return this.quizService.update(id, updateQuizDto, userId);
    }

    @Roles(UserRole.INSTRUCTOR)
    @Delete(':id')
    async remove(@Param('id') id: string, @Req() req: Request) {
        const userId = (req.user as any).sub;
        await this.quizService.remove(id, userId);
        return { message: 'quiz deleted successfully' };
    }

    @Get('module/:moduleId')
    async findByModule(@Param('moduleId') moduleId: string) {
        return this.quizService.findByModuleId(moduleId);
    }
}
