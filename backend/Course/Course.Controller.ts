import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Req,
    UseGuards
} from '@nestjs/common';
import {CourseService} from './Course.Service';


import {CourseDTO, FeedbackDto, ModuleDto, UpdateCourseDto} from '../DTO/CourseDTO';
import {Throttle} from '@nestjs/throttler';
import {Request} from 'express';
import {JwtAuthGuard} from "../Authentication/Guards/AuthGuard";
import {RolesGuard} from "../Authentication/Guards/RolesGuard";
import {Roles} from "../Authentication/Decorators/Roles-Decorator";
import {UserRole} from "../Database/User";

@Controller('courses')
 // Global Guard for all Course routes
export class CourseController {
    constructor(private readonly courseService: CourseService) {}

    @Roles(UserRole.INSTRUCTOR)
    @Post()
    async create(@Body() createCourseDto: CourseDTO) {
        return this.courseService.create(createCourseDto);
    }

    @Get()
    async findAll(
        @Query('page') page: string,
        @Query('limit') limit: string
    ) {
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        return this.courseService.findAllPaginated(pageNum, limitNum);
    }

    @Get('search')
    async searchCourses(
        @Query('title') title: string,
        @Query('instructorName') instructorName: string,
        @Query('tag') tag: string
    ) {
        return this.courseService.searchCourses({ title, instructorName, tag });
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.courseService.findOne(id);
    }

    @Roles(UserRole.INSTRUCTOR)
    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
        return this.courseService.update(id, updateCourseDto);
    }

    @Roles(UserRole.INSTRUCTOR)
    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.courseService.remove(id);
    }

    @Roles(UserRole.STUDENT)
    @Patch(':id/enroll')
    async enroll(@Param('id') courseId: string, @Req() req: Request) {
        const studentId = (req.user as any).sub; // Assuming JwtPayload includes sub as userId
        return this.courseService.enrollStudent(courseId, studentId);
    }

    //@Roles(UserRole.STUDENT)
    //@Post(':id/feedback')
    //@Throttle(1, 60) // 1 request per minute per IP
    //async addFeedback(
      //  @Param('id') courseId: string,
        //@Body() feedbackDto: FeedbackDto,
        //@Req() req: Request
   // ) {
       // const studentId = (req.user as any).sub;
        //if (feedbackDto.rating < 1 || feedbackDto.rating > 5) {
          //  throw new BadRequestException('Rating must be between 1 and 5');
        //}
       // await this.courseService.addFeedback(courseId, feedbackDto, studentId);
        //return { message: 'Feedback added successfully' };
    //}


    @Roles(UserRole.INSTRUCTOR)
    @Post(':id/modules')
    async addModule(
        @Param('id') courseId: string,
        @Body() moduleData: ModuleDto
    ) {
        return this.courseService.addModule(courseId, moduleData);
    }

    @Roles(UserRole.INSTRUCTOR)
    @Post(':id/version-history')
    async addVersionHistory(
        @Param('id') courseId: string,
        @Body() versionData: { version: string, changes: string }
    ) {
        return this.courseService.addVersionHistory(courseId, versionData);
    }
}
