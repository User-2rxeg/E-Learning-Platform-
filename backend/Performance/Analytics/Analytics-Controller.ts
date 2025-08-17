// src/Analytics/analytics.controller.ts
import {Controller, Get, Param, Query, UseGuards, Res, StreamableFile, NotFoundException} from '@nestjs/common';

import { Response } from 'express';
import {JwtAuthGuard} from "../../Authentication/Guards/AuthGuard";
import {RolesGuard} from "../../Authentication/Guards/RolesGuard";
import {AnalyticsService} from "./Analytics-Service";
import {UserRole} from "../../Database/User";
import {Roles} from "../../Authentication/Decorators/Roles-Decorator";

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
    constructor(private readonly svc: AnalyticsService) {}

    // --- Student: own summary (student can view self)
    @Roles(UserRole.STUDENT, UserRole.INSTRUCTOR, UserRole.ADMIN)
    @Get('student/:studentId/summary')
    studentSummary(@Param('studentId') studentId: string) {
        return this.svc.studentSummary(studentId);
    }

    // --- Instructor: course report (instructor/admin only)
    @Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
    @Get('instructor/:instructorId/course/:courseId/report')
    instructorCourse(@Param('instructorId') instructorId: string, @Param('courseId') courseId: string) {
        return this.svc.instructorCourseReport(instructorId, courseId);
    }

    // --- Export student summary as CSV/JSON




@Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
@Get('student/:studentId/summary/export')
async exportStudentNoRes(
    @Param('studentId') studentId: string,
@Query('format') format?: string,
) {
    const summary = await this.svc.studentSummary(studentId);
    const fmt = (format ?? 'json').toLowerCase();

    if (fmt !== 'csv') return summary;

    const rows = [
        { metric: 'completionPct', value: summary.completionPct },
        { metric: 'avgScore', value: summary.avgScore },
        { metric: 'attempts', value: summary.attemptsCount },
        { metric: 'attemptsLast7Days', value: summary.recentActivity?.attemptsLast7Days ?? 0 },
        { metric: 'attemptsLast30Days', value: summary.recentActivity?.attemptsLast30Days ?? 0 },
    ];

    const csv = this.svc.toCSV(rows);
    return new StreamableFile(Buffer.from(csv), {
        type: 'text/csv',
        disposition: 'attachment; filename="student-${studentId}-summary.csv"',
    });
}



@Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
@Get('instructor/:instructorId/course/:courseId/report/export')
async exportInstructorCourse(
    @Param('instructorId') instructorId: string,
@Param('courseId') courseId: string,
@Query('format') format?: string,
) {
    const report = await this.svc.instructorCourseReport(instructorId, courseId);
    if ((report as any)?.error) {
        // throw 404 for Nest to format
        throw new NotFoundException((report as any).error);
    }

    const fmt = (format ?? 'json').toLowerCase();
    if (fmt !== 'csv') return report;

    const {
        enrollment = 0,
        attempts = 0,
        avgScore = 0,
        completionPct = 0,
        engagementMinutes = 0,
        difficultyMix,
    } = (report as any) ?? {};
    const mix = difficultyMix ?? { easy: 0, medium: 0, hard: 0 };

    const rows = [
        { metric: 'enrollment', value: enrollment },
        { metric: 'attempts', value: attempts },
        { metric: 'avgScore', value: avgScore },
        { metric: 'completionPct', value: completionPct },
        { metric: 'engagementMinutes', value: engagementMinutes },
        { metric: 'easy', value: mix.easy },
        { metric: 'medium', value: mix.medium },
        { metric: 'hard', value: mix.hard },
    ];

    const csv = this.svc.toCSV(rows);
    // Return CSV with headers using decorator
    return new StreamableFile(Buffer.from(csv), {
        disposition: `attachment; filename="course-${courseId}-report.csv"`,
        type: `text/csv`,
    });
}
}