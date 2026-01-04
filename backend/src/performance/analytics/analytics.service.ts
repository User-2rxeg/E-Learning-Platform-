
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Performance } from "../../database/performance";
import { QuizAttempt } from "../../database/quiz-attempt";
import { Course } from "../../database/course";
import { User } from "../../database/user";


@Injectable()
export class AnalyticsService {
    constructor(
        @InjectModel(Performance.name) private readonly perf: Model<Performance>,
        @InjectModel(QuizAttempt.name) private readonly attempts: Model<QuizAttempt>,
        @InjectModel(Course.name) private readonly courses: Model<Course>,
        @InjectModel(User.name) private readonly users: Model<User>,
    ) {}

    // ---------- Student summary ----------
    async studentSummary(studentId: string) {
        const sid = new Types.ObjectId(studentId);

        // Pull all performance docs for the student
        const perfs: any[] = await this.perf.find({ studentId: sid }).lean();

        // Aggregate quiz attempts for averages & recent activity
        const attempts: any[] = await this.attempts
            .find({ studentId: sid })
            .select('score createdAt quizId')
            .sort({ createdAt: -1 })
            .lean();

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

        const course: any = await this.courses.findOne({ _id: cid, instructorId: iid }).lean();
        if (!course) return { error: 'Course not found or not owned by instructor' };

        const enrollCount = (course.studentsEnrolled || []).length;

        // Attempts on quizzes that belong to this course's modules (by quizId in performance.scores)
        const perfDocs: any[] = await this.perf.find({ courseId: cid }).lean();

        const studentIds = perfDocs.map(p => p.studentId);
        const attempts: any[] = await this.attempts
            .find({ studentId: { $in: studentIds } })
            .select('score createdAt quizId')
            .lean();

        const avgScore =
            attempts.length ? Math.round(attempts.reduce((a, b) => a + (b.score || 0), 0) / attempts.length) : 0;

        // Engagement = sum of durations from engagementLog
        let engagementMinutes = 0;
        for (const p of perfDocs) {
            const logs = p.engagementLog || [];
            for (const e of logs) {
                engagementMinutes += e.duration || 0;
            }
        }
        engagementMinutes = Math.round(engagementMinutes);

        // Completion = mean of progress for this course
        const completionPct =
            perfDocs.length ? Math.round(perfDocs.reduce((s: number, p: any) => s + (p.progress || 0), 0) / perfDocs.length) : 0;

        // Difficulty trend (if you set quizStats.lastDifficulty)
        const difficultyCounts: Record<string, number> = { easy: 0, medium: 0, hard: 0 };
        for (const p of perfDocs) {
            const stats = p.quizStats || [];
            for (const qs of stats) {
                if (qs.lastDifficulty && qs.lastDifficulty in difficultyCounts) {
                    difficultyCounts[qs.lastDifficulty]++;
                }
            }
        }

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

// Add to AnalyticsService
    async getInstructorDashboard(instructorId: string) {
        const iid = new Types.ObjectId(instructorId);

        // Get all courses by this instructor
        const courses = await this.courses.find({ instructorId: iid }).lean().exec();

        // Calculate total unique students
        const allStudentIds = new Set();
        courses.forEach(course => {
            (course.studentsEnrolled || []).forEach(id => allStudentIds.add(id.toString()));
        });

        // Get course-specific metrics
        const courseEnrollments = courses.map(c => ({
            id: String(c._id),
            title: c.title,
            enrollmentCount: (c.studentsEnrolled || []).length
        }));

        // Get all performance records for these courses
        const courseIds = courses.map(c => c._id);
        const perfDocs = await this.perf.find({ courseId: { $in: courseIds } }).lean().exec();

        // Calculate average completion percentage
        const avgCompletionPct = perfDocs.length
            ? Math.round(perfDocs.reduce((s, p) => s + (p.progress || 0), 0) / perfDocs.length)
            : 0;

        return {
            totalCourses: courses.length,
            totalStudents: allStudentIds.size,
            avgCompletionPct,
            courseEnrollments
        };
    }

}
