import {BadRequestException, Body, Controller, DefaultValuePipe, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors} from '@nestjs/common';
import {CourseService} from './Course.Service';
import {CourseDTO, FeedbackDto, ModuleDto, UpdateCourseDto} from '../DTO/CourseDTO';
import {Throttle} from '@nestjs/throttler';
import {Request} from 'express';
import {JwtAuthGuard} from "../Authentication/Guards/AuthGuard";
import {RolesGuard} from "../Authentication/Guards/RolesGuard";
import {Roles} from "../Authentication/Decorators/Roles-Decorator";
import {UserRole} from "../Database/User";
import {FileInterceptor} from "@nestjs/platform-express";
import {CurrentUser} from "../Authentication/Decorators/Current-User";
import {JwtPayload} from "../Authentication/Interfaces/JWT-Payload.Interface";
import {fileFilter, limits, storage} from "../src/multer.config";

@Controller('courses')
 // Global Guard for all Course routes
export class CourseController {
    constructor(private readonly courseService: CourseService) {
    }

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

    // in src/Course/Course.Controller.ts
    @Get('search')
    async searchCourses(
        @Query('title') title?: string,
        @Query('instructorName') instructorName?: string,
        @Query('tag') tag?: string,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
    ) {
        return this.courseService.searchCourses({title, instructorName, tag, page, limit});
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

    @Roles(UserRole.STUDENT)
    @Post(':id/feedback')
   // @Throttle( 60) // 1 request per minute per IP
    async addFeedback(
      @Param('id') courseId: string,
    @Body() feedbackDto: FeedbackDto,
    @Req() req: Request
     ) {
     const studentId = (req.user as any).sub;
    if (feedbackDto.rating < 1 || feedbackDto.rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }
     await this.courseService.addFeedback(courseId, feedbackDto, studentId);
    return { message: 'Feedback added successfully' };
    }


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


    @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
    @Post(':courseId/modules/:moduleIndex/resources/upload')
    @UseInterceptors(FileInterceptor('file', {
        storage,
        fileFilter,
        limits,
    }))
    async uploadResource(
        @Param('courseId') courseId: string,
        @Param('moduleIndex') moduleIndexStr: string,
        @UploadedFile() file: Express.Multer.File,
        @CurrentUser() user: JwtPayload,
        @Req() req: Request,
    ) {
        if (!file) throw new BadRequestException('No file uploaded');

        const base = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;
        const fileUrl = `${base}/uploads/${file.filename}`; // backticks!
        const moduleIndex = parseInt(moduleIndexStr, 10);
        if (Number.isNaN(moduleIndex)) throw new BadRequestException('moduleIndex must be a number');

        return this.courseService.addUploadedResource({
            courseId,
            moduleIndex,
            fileUrl,
            mimetype: file.mimetype,
            filename: file.originalname,
            size: file.size,
            requester: { sub: user.sub, role: user.role as UserRole },
        });
    }

    // ---- Add link resource (no file)
    @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
    @Post(':courseId/modules/:moduleIndex/resources/link')
    async addLinkResource(
        @Param('courseId') courseId: string,
        @Param('moduleIndex') moduleIndexStr: string,
        @Body('url') url: string,
        @CurrentUser() user: JwtPayload,
    ) {
        if (!url) throw new BadRequestException('url is required');
        const moduleIndex = parseInt(moduleIndexStr, 10);
        if (Number.isNaN(moduleIndex)) throw new BadRequestException('moduleIndex must be a number');

        return this.courseService.addLinkResource({
            courseId,
            moduleIndex,
            url,
            requester: { sub: user.sub, role: user.role as UserRole },
        });
    }

    // ---- List resources for a module
    @Get(':courseId/modules/:moduleIndex/resources')
    async listResources(
        @Param('courseId') courseId: string,
        @Param('moduleIndex') moduleIndexStr: string,
    ) {
        const moduleIndex = parseInt(moduleIndexStr, 10);
        return this.courseService.listResources(courseId, moduleIndex);
    }

    // ---- Get single resource metadata
    @Get(':courseId/modules/:moduleIndex/resources/:resourceId')
    async getResource(
        @Param('courseId') courseId: string,
        @Param('moduleIndex') moduleIndexStr: string,
        @Param('resourceId') resourceId: string,
    ) {
        const moduleIndex = parseInt(moduleIndexStr, 10);
        return this.courseService.getResource(courseId, moduleIndex, resourceId);
    }

    // ---- Delete resource
    @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
    @Delete(':courseId/modules/:moduleIndex/resources/:resourceId')
    async deleteResource(
        @Param('courseId') courseId: string,
        @Param('moduleIndex') moduleIndexStr: string,
        @Param('resourceId') resourceId: string,
        @CurrentUser() user: JwtPayload,
    ) {
        const moduleIndex = parseInt(moduleIndexStr, 10);
        return this.courseService.deleteResource({
            courseId,
            moduleIndex,
            resourceId,
            requester: { sub: user.sub, role: user.role as UserRole },
        });
    }
    // Add to CourseController
    @Get('enrolled')
    @Roles(UserRole.STUDENT)
    async getEnrolledCourses(@CurrentUser() user: JwtPayload) {
        const studentId = user.sub;
        return this.courseService.getEnrolledCourses(studentId);
    }
}

