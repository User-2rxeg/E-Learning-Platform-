import { Controller, Post, Get, Patch, Delete, Param, Body, Req, UseGuards } from '@nestjs/common';
import { QuizService } from './Quiz.Service';
import { CreateQuizDto, UpdateQuizDto } from '../../DTO/QuizDTO';
import { JwtAuthGuard } from '../../Authentication/Guards/AuthGuard';
import { RolesGuard } from '../../Authentication/Guards/RolesGuard';
import { Roles } from '../../Authentication/Decorators/Roles-Decorator';
import { Request } from 'express';
import { UserRole } from '../../Database/User';

@Controller('quizzes')

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
        return { message: 'Quiz deleted successfully' };
    }
}
