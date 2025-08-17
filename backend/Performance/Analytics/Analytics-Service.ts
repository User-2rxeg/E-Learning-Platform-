// src/Analytics/analytics.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {PerformanceDocument} from "../../Database/Performance";
import {QuizAttempt, QuizAttemptDocument} from "../../Database/QuizAttempt";
import {Course, CourseDocument} from "../../Database/Course";
import {User, UserDocument} from "../../Database/User";


@Injectable()
export class AnalyticsService {
    constructor(
        @InjectModel(Performance.name) private readonly perf: Model<PerformanceDocument>,
        @InjectModel(QuizAttempt.name) private readonly attempts: Model<QuizAttemptDocument>,
        @InjectModel(Course.name) private readonly courses: Model<CourseDocument>,
        @InjectModel(User.name) private readonly users: Model<UserDocument>,
    ) {}

    // ---------- Student summary ----------
    async studentSummary(studentId: string) {
        const sid = new Types.ObjectId(studentId);

        // Pull all performance docs for the student
        const perfs = await this.perf.find({ studentId: sid }).lean().exec();

        // Aggregate quiz attempts for averages & recent activity
        const attempts = await this.attempts
            .find({ studentId: sid })
            .select('score createdAt quizId')
            .sort({ createdAt: -1 })
            .lean().exec();

        const courseCount = perfs.length;
        const avgScore =
            attempts.length ? Math.round(attempts.reduce((a, b) => a + (b.score || 0), 0) / attempts.length) : 0;

        // Simple completion (mean of per-course progress, clamp to 0..100)
        const completionPct =
            courseCount ? Math.round(perfs.reduce((a, p) => a + (p.progress || 0), 0) / courseCount) : 0;

        // Recent activity: last 7 and 30 days
        const now = Date.now();
        const days = (d: number) => now - d * 24 * 60 * 60 * 1000;
        const last7 = attempts.filter(a => (a as any).createdAt?.getTime?.() > days(7)).length;
        const last30 = attempts.filter(a => (a as any).createdAt?.getTime?.() > days(30)).length;

        // Per-course breakdown: title, progress, last score
        const byCourse = await Promise.all(
            perfs.map(async p => {
                const c = await this.courses.findById(p.courseId).select('title').lean();
                const lastScore =
                    attempts.find(a => String(a.quizId) && p.scores?.some(s => String(s.quizId) === String(a.quizId)))?.score ??
                    (p.scores?.[p.scores.length - 1]?.score ?? null);
                return {
                    courseId: String(p.courseId),
                    courseTitle: c?.title ?? '(unknown)',
                    progress: Math.round(p.progress || 0),
                    lastScore,
                    lastActiveAt: p.lastUpdated ?? null,
                };
            })
        );

        return {
            studentId,
            completionPct,
            avgScore,
            recentActivity: { attemptsLast7Days: last7, attemptsLast30Days: last30 },
            courses: byCourse,
            attemptsCount: attempts.length,
        };
    }

    // ---------- Instructor course report ----------
    async instructorCourseReport(instructorId: string, courseId: string) {
        const iid = new Types.ObjectId(instructorId);
        const cid = new Types.ObjectId(courseId);

        const course = await this.courses.findOne({ _id: cid, instructorId: iid }).lean();
        if (!course) return { error: 'Course not found or not owned by instructor' };

        const enrollCount = (course.studentsEnrolled || []).length;

        // Attempts on quizzes that belong to this course's modules (by quizId in Performance.scores)
        const perfDocs = await this.perf.find({ courseId: cid }).lean().exec();

        const studentIds = perfDocs.map(p => p.studentId);
        const attempts = await this.attempts
            .find({ studentId: { $in: studentIds } })
            .select('score createdAt quizId')
            .lean().exec();

        const avgScore =
            attempts.length ? Math.round(attempts.reduce((a, b) => a + (b.score || 0), 0) / attempts.length) : 0;

        // Engagement = sum of durations from engagementLog
        const engagementMinutes = Math.round(
            perfDocs.reduce((sum, p) => sum + (p.engagementLog || []).reduce((s, e) => s + (e.duration || 0), 0), 0)
        );

        // Completion = mean of progress for this course
        const completionPct =
            perfDocs.length ? Math.round(perfDocs.reduce((s, p) => s + (p.progress || 0), 0) / perfDocs.length) : 0;

        // Difficulty trend (if you set quizStats.lastDifficulty)
        const difficultyCounts = { easy: 0, medium: 0, hard: 0 };
        perfDocs.forEach(p => {
            (p.quizStats || []).forEach(qs => {
                if (qs.lastDifficulty && (qs.lastDifficulty as any) in difficultyCounts) {
                    (difficultyCounts as any)[qs.lastDifficulty]++;
                }
            });
        });

        return {
            course: { id: String(course._id), title: course.title },
            enrollment: enrollCount,
            attempts: attempts.length,
            avgScore,
            completionPct,
            engagementMinutes,
            difficultyMix: difficultyCounts,
        };
    }

    toCSV(rows: any[]): string {
        if (!rows || rows.length === 0) return '';

        // Union of keys across all rows
        const headers = Array.from(new Set(rows.flatMap(r => Object.keys(r ?? {}))));

        const escapeCell = (val: any): string => {
            if (val === null || val === undefined) return '';
            const s = String(val);


            if (/[,"\n]/.test(s)) {
                // Double any existing quotes
                return `"${s.replace(/"/g, `""`)}"`;
        }
        return s;
    };

    const lines: string[] = [];
    lines.push(headers.join(','));
    for (const row of rows) {
    lines.push(headers.map(h => escapeCell(row[h])).join(','));
}
return lines.join('\n');
}

}
