// Quizzes/Quiz Attempt/Quiz-Attempt.Service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Quiz, QuizDocument } from '../../Database/Quiz';
import { QuizAttempt, QuizAttemptDocument } from '../../Database/QuizAttempt';
import { Performance, PerformanceDocument } from '../../Database/Performance';
import { AttemptQuizDto } from '../../DTO/QuizDTO';

type Difficulty = 'easy'|'medium'|'hard';

@Injectable()
export class QuizAttemptService {
    private readonly ROLLING_WINDOW = 5;
    private readonly NEXT_COUNT = 5;

    constructor(
        @InjectModel(Quiz.name) private readonly quizModel: Model<QuizDocument>,
        @InjectModel(QuizAttempt.name) private readonly quizAttemptModel: Model<QuizAttemptDocument>,
        @InjectModel(Performance.name) private readonly perfModel: Model<PerformanceDocument>,
    ) {}

    private decideNextDifficulty(avg: number): Difficulty {
        if (avg >= 80) return 'hard';
        if (avg >= 50) return 'medium';
        return 'easy';
    }

    private computeAvg(scores: number[]) {
        if (!scores.length) return 0;
        const sum = scores.reduce((a,b)=>a+b, 0);
        return Math.round((sum / scores.length) * 100) / 100;
    }

    private sample<T>(arr: T[], k: number): T[] {
        if (k >= arr.length) return [...arr];
        const picked: T[] = [];
        const used = new Set<number>();
        while (picked.length < k && used.size < arr.length) {
            const i = Math.floor(Math.random() * arr.length);
            if (!used.has(i)) { used.add(i); picked.push(arr[i]); }
        }
        return picked;
    }

    private async getOrCreatePerf(studentId: string, courseId: Types.ObjectId) {
        let perf = await this.perfModel.findOne({ studentId, courseId }).exec();
        if (!perf) {
            perf = await this.perfModel.create({
                studentId: new Types.ObjectId(studentId),
                courseId,
                progress: 0,
                scores: [],
                engagementLog: [],
                quizStats: [], // ensure array exists
            });
        } else if (!Array.isArray(perf.quizStats)) {
            // legacy docs missing the field
            (perf as any).quizStats = [];
        }
        return perf;
    }

    private getOrInitQuizStat(perf: PerformanceDocument, quizId: Types.ObjectId) {
        if (!Array.isArray(perf.quizStats)) (perf as any).quizStats = [];
        let stat = perf.quizStats.find(s => String(s.quizId) === String(quizId)) as any;
        if (!stat) {
            stat = { quizId, recentScores: [], lastDifficulty: 'medium', seenQuestionIds: [] };
            (perf.quizStats as any).push(stat);
        }
        return stat as {
            quizId: Types.ObjectId;
            recentScores: number[];
            lastDifficulty: 'easy'|'medium'|'hard';
            seenQuestionIds: string[];
        };
    }

    async attemptQuiz(studentId: string, attemptQuizDto: AttemptQuizDto) {
        const quiz = await this.quizModel.findById(attemptQuizDto.quizId).exec();
        if (!quiz) throw new NotFoundException('Quiz not found');

        // Grade each response
        const details = attemptQuizDto.responses.map(r => {
            const q = quiz.questions.find(qq => qq.questionId === r.questionId);
           ; if (!q) throw new NotFoundException(`Question not found: ${r.questionId}`)
            const isCorrect = q.correctAnswer === r.selectedAnswer;
            return {
                questionId: r.questionId,
                questionText: q.questionText,
                correct: isCorrect,
                correctAnswer: q.correctAnswer,           // immediate feedback
                chosen: r.selectedAnswer,
                difficulty: q.difficulty,
                // explanation?: add to your schema if you want
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
            // allow repeats or fallback to any questions of that difficulty
            next = pool;
        }
        const nextQuestions = this.sample(next, this.NEXT_COUNT).map(q => ({
            questionId: q.questionId,
            questionText: q.questionText,
            choices: q.choices,
            difficulty: q.difficulty,
        })); // DO NOT include correctAnswer in next batch

        return {
            message: 'Quiz Attempt Submitted',
            score,
            correctAnswers: correctCount,
            totalQuestions: details.length,
            details,                 // per-question feedback
            nextDifficulty,          // 'easy'|'medium'|'hard'
            nextQuestions,           // suggested next items
            attemptId: attempt._id,  // useful for ui
        };
    }

    async getAttemptsForStudent(studentId: string) {
        return this.quizAttemptModel
            .find({ studentId })
            .populate('quizId')
            .sort({ createdAt: -1 })
            .exec();
    }
}