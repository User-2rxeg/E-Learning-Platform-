import {
    Controller,
    Get,
    Post,
    Param,
    Body,
    Put,
    Delete,
    NotFoundException
} from '@nestjs/common';

import { CreatePerformanceDto, UpdatePerformanceDto } from '../../dto\'s/performance-dto\'s';
import { Performance } from '../../database/performance';
import {PerformanceService} from "./performance.service";

@Controller('performance')
export class PerformanceController {
    constructor(private readonly performanceService: PerformanceService) {}

    @Post()
    async create(@Body() createDto: CreatePerformanceDto): Promise<Performance> {
        return this.performanceService.create(createDto);
    }

    @Get()
    async findAll(): Promise<Performance[]> {
        return this.performanceService.findAll();
    }

    @Get('student/:studentId')
    async findByStudent(@Param('studentId') studentId: string): Promise<Performance[]> {
        return this.performanceService.findByStudent(studentId);
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Performance> {
        return this.performanceService.findOne(id);
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() updateDto: UpdatePerformanceDto
    ): Promise<Performance> {
        return this.performanceService.update(id, updateDto);
    }

    @Delete(':id')
    async delete(@Param('id') id: string): Promise<{ message: string }> {
        await this.performanceService.delete(id);
        return { message: 'performance record deleted successfully' };
    }
}