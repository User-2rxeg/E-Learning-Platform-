import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Quiz } from '../../database/quiz';
import { QuizAttempt } from '../../database/quiz-attempt';
import { Performance } from '../../database/performance';
import { User } from '../../database/user';
import { AttemptQuizDto } from '../../dto\'s/quiz-dto\'s';
import { AuditLogService } from '../../audit-log/audit-logging.service';
import { Logs } from '../../audit-log/Logs';
import { MailService } from '../../auth/email/email-service';

type Difficulty = 'easy' | 'medium' | 'hard';

interface QuizQuestion {
    questionId: string;
    questionText: string;
    choices: string[];
    correctAnswer: string;
    difficulty: Difficulty;
}

interface QuizData {
    _id: Types.ObjectId;
    title: string;
    moduleId: Types.ObjectId;
    questions: QuizQuestion[];
    adaptive: boolean;
}

@Injectable()
export class QuizAttemptService {
    private readonly ROLLING_WINDOW = 5;
    private readonly NEXT_COUNT = 5;
    private readonly PASSING_SCORE = 70;

    constructor(
        @InjectModel(Quiz.name) private readonly quizModel: Model<Quiz>,
        @InjectModel(QuizAttempt.name) private readonly quizAttemptModel: Model<QuizAttempt>,
        @InjectModel(Performance.name) private readonly perfModel: Model<Performance>,
        @InjectModel(User.name) private readonly userModel: Model<User>,
        private readonly audit: AuditLogService,
        private readonly mail: MailService,
    ) {}

    private decideNextDifficulty(avg: number): Difficulty {
        if (avg >= 80) return 'hard';
        if (avg >= 50) return 'medium';
        return 'easy';
    }

    private computeAvg(scores: number[]): number {
        if (!scores.length) return 0;
        const sum = scores.reduce((a, b) => a + b, 0);
        return Math.round((sum / scores.length) * 100) / 100;
    }

    private sample<T>(arr: T[], k: number): T[] {
        if (k >= arr.length) return [...arr];
        const picked: T[] = [];
        const used = new Set<number>();
        while (picked.length < k && used.size < arr.length) {
            const i = Math.floor(Math.random() * arr.length);
            if (!used.has(i)) {
                used.add(i);
                picked.push(arr[i]);
            }
        }
        return picked;
    }

    private async getOrCreatePerf(studentId: string, courseId: Types.ObjectId) {
        let perf = await this.perfModel.findOne({
            studentId: new Types.ObjectId(studentId),
            courseId,
        });

        if (!perf) {
            perf = await this.perfModel.create({
                studentId: new Types.ObjectId(studentId),
                courseId,
                progress: 0,
                scores: [],
                engagementLog: [],
                quizStats: [],
            });
        }

        return perf;
    }

    private getOrInitQuizStat(perf: any, quizId: Types.ObjectId) {
        if (!Array.isArray(perf.quizStats)) {
            perf.quizStats = [];
        }

        let stat = perf.quizStats.find((s: any) => String(s.quizId) === String(quizId));

        if (!stat) {
            stat = {
                quizId,
                recentScores: [],
                lastDifficulty: 'medium' as Difficulty,
                seenQuestionIds: [],
            };
            perf.quizStats.push(stat);
        }

        return stat as {
            quizId: Types.ObjectId;
            recentScores: number[];
            lastDifficulty: Difficulty;
            seenQuestionIds: string[];
        };
    }

    async attemptQuiz(studentId: string, attemptQuizDto: AttemptQuizDto) {
        // Fetch quiz with lean for performance, then cast to our interface
        const quizDoc = await this.quizModel.findById(attemptQuizDto.quizId).lean();
        if (!quizDoc) throw new NotFoundException('Quiz not found');

        const quiz = quizDoc as unknown as QuizData;

        // Grade each response
        const details = attemptQuizDto.responses.map(r => {
            const q = quiz.questions.find(qq => qq.questionId === r.questionId);
            if (!q) throw new NotFoundException(`Question not found: ${r.questionId}`);

            const isCorrect = q.correctAnswer === r.selectedAnswer;
            return {
                questionId: r.questionId,
                questionText: q.questionText,
                correct: isCorrect,
                correctAnswer: q.correctAnswer,
                chosen: r.selectedAnswer,
                difficulty: q.difficulty,
            };
        });

        const correctCount = details.filter(d => d.correct).length;
        const score = Math.round((correctCount / details.length) * 100);

        // Save attempt
        const attempt = await this.quizAttemptModel.create({
            quizId: quiz._id,
            studentId: new Types.ObjectId(studentId),
            responses: details.map(d => ({
                questionId: d.questionId,
                selectedAnswer: d.chosen,
                isCorrect: d.correct,
            })),
            score,
            currentDifficulty: quiz.adaptive ? 'medium' : undefined,
        });

        // Update performance: rolling avg & seen list per quiz
        const perf = await this.getOrCreatePerf(studentId, quiz.moduleId);
        const stat = this.getOrInitQuizStat(perf, quiz._id);

        const updatedScores = [...(stat.recentScores ?? []), score].slice(-this.ROLLING_WINDOW);
        const updatedSeen = new Set<string>(stat.seenQuestionIds ?? []);
        details.forEach(d => updatedSeen.add(d.questionId));

        const avg = this.computeAvg(updatedScores);
        const nextDifficulty: Difficulty = quiz.adaptive ? this.decideNextDifficulty(avg) : 'medium';

        stat.recentScores = updatedScores;
        stat.lastDifficulty = nextDifficulty;
        stat.seenQuestionIds = Array.from(updatedSeen);

        await perf.save();

        // Pick next questions (unseen, same difficulty; fallback if insufficient)
        let pool = quiz.questions.filter(q => q.difficulty === nextDifficulty);
        let next = pool.filter(q => !stat.seenQuestionIds.includes(q.questionId));

        if (next.length < this.NEXT_COUNT) {
            next = pool;
        }

        const nextQuestions = this.sample(next, this.NEXT_COUNT).map(q => ({
            questionId: q.questionId,
            questionText: q.questionText,
            choices: q.choices,
            difficulty: q.difficulty,
        }));

        // Audit log quiz attempt
        await this.audit.log(Logs.QUIZ_COMPLETED, studentId, {
            quizId: String(quiz._id),
            quizTitle: quiz.title,
            score,
            correctAnswers: correctCount,
            totalQuestions: details.length,
            passed: score >= this.PASSING_SCORE,
        });

        // Send email with quiz results
        try {
            const student = await this.userModel.findById(studentId).select('email name').lean();
            if (student) {
                await this.mail.sendQuizResultEmail(
                    student.email,
                    student.name || 'Student',
                    quiz.title,
                    correctCount,
                    details.length,
                    score >= this.PASSING_SCORE
                );
            }
        } catch (e) {
            console.error('Failed to send quiz result email:', e);
        }

        return {
            message: 'Quiz Attempt Submitted',
            score,
            correctAnswers: correctCount,
            totalQuestions: details.length,
            passed: score >= this.PASSING_SCORE,
            details,
            nextDifficulty,
            nextQuestions,
            attemptId: attempt._id,
        };
    }

    async getAttemptsForStudent(studentId: string) {
        return this.quizAttemptModel
            .find({ studentId })
            .populate('quizId')
            .sort({ createdAt: -1 })
            .lean();
    }
}