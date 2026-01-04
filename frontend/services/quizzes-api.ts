
import apiClient from './api-client';

export interface CreateQuizRequest {
    title?: string;
    moduleId: string;
    questions: {
        questionId?: string;
        questionText: string;
        choices: string[];
        correctAnswer: string;
        difficulty: 'easy' | 'medium' | 'hard';
    }[];
    adaptive: boolean;
    timeLimit?: number;
    passingScore?: number;
}

export interface QuizAttemptRequest {
    quizId: string;
    responses: {
        questionId: string;
        selectedAnswer: string;
    }[];
}

export interface QuizResult {
    message: string;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    details: {
        questionId: string;
        questionText: string;
        correct: boolean;
        correctAnswer: string;
        chosen: string;
        difficulty: string;
    }[];
    nextDifficulty: 'easy' | 'medium' | 'hard';
    nextQuestions: any[];
    attemptId: string;
}

class QuizService {
    async createQuiz(quizData: CreateQuizRequest) {
        try {
            const response = await apiClient.post('/quizzes', quizData);
            return response.data;
        } catch (error) {
            console.error('Error creating quiz:', error);
            throw new Error('Failed to create quiz');
        }
    }

    async getQuiz(quizId: string) {
        try {
            const response = await apiClient.get(`/quizzes/${quizId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching quiz:', error);
            throw new Error('quiz not found');
        }
    }

    async updateQuiz(quizId: string, quizData: Partial<CreateQuizRequest>) {
        try {
            const response = await apiClient.patch(`/quizzes/${quizId}`, quizData);
            return response.data;
        } catch (error) {
            console.error('Error updating quiz:', error);
            throw new Error('Failed to update quiz');
        }
    }

    async deleteQuiz(quizId: string) {
        try {
            await apiClient.delete(`/quizzes/${quizId}`);
        } catch (error) {
            console.error('Error deleting quiz:', error);
            throw new Error('Failed to delete quiz');
        }
    }

    async attemptQuiz(attemptData: QuizAttemptRequest): Promise<QuizResult> {
        try {
            const response = await apiClient.post('/quiz-attempts/attempt', attemptData);
            return response.data;
        } catch (error) {
            console.error('Error submitting quiz attempt:', error);
            throw new Error('Failed to submit quiz');
        }
    }

    async getMyAttempts() {
        try {
            const response = await apiClient.get('/quiz-attempts/my-attempts');
            return response.data;
        } catch (error) {
            console.error('Error fetching quiz attempts:', error);
            throw new Error('Failed to fetch quiz attempts');
        }
    }

    async getQuizzesByModule(moduleId: string) {
        try {
            const response = await apiClient.get(`/quizzes?moduleId=${moduleId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching module quizzes:', error);
            return [];
        }
    }
}

export const quizService = new QuizService();
