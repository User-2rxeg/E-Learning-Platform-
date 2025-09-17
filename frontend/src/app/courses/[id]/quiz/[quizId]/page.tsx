// src/app/courses/[id]/quiz/[quizId]/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

import { useAuth } from '../../../../../contexts/AuthContext';
import {quizService} from "../../../../../lib/services/quizApi";

// classnames helper
function cn(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(' ');
}

interface Question {
    questionId: string;
    questionText: string;
    choices: string[];
    difficulty: 'easy' | 'medium' | 'hard';
    correctAnswer?: string;
}

interface QuizResponse {
    questionId: string;
    selectedAnswer: string;
}

interface QuizResult {
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
    nextQuestions: Question[];
}

export default function QuizPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const courseId = params.id as string;
    const quizId = params.quizId as string;

    // Quiz State
    const [loading, setLoading] = useState(true);
    const [quizTitle, setQuizTitle] = useState('');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [responses, setResponses] = useState<QuizResponse[]>([]);
    const [selectedAnswer, setSelectedAnswer] = useState<string>('');
    const [timeRemaining, setTimeRemaining] = useState(1800);
    const [quizStarted, setQuizStarted] = useState(false);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
    const [showReview, setShowReview] = useState(false);
    const [adaptiveDifficulty, setAdaptiveDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        fetchQuizData();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [quizId]);

    useEffect(() => {
        if (quizStarted && !quizCompleted && timeRemaining > 0) {
            timerRef.current = setInterval(() => {
                setTimeRemaining(prev => {
                    if (prev <= 1) {
                        handleSubmitQuiz();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [quizStarted, quizCompleted, timeRemaining]);

    const fetchQuizData = async () => {
        try {
            setLoading(true);
            const quiz = await quizService.getQuiz(quizId);    setQuizTitle(quiz.title || 'Quiz');
            setQuestions(quiz.questions.map(q => ({
                ...q,
                correctAnswer: undefined // Don't show answers to client
            })));
            setLoading(false);
        } catch (error) {
            console.error('Error fetching quiz:', error);
            router.push(`/courses/${courseId}`);
        }
    };



    const startQuiz = () => setQuizStarted(true);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswerSelect = (answer: string) => setSelectedAnswer(answer);

    const handleNextQuestion = () => {
        if (selectedAnswer) {
            const newResponse: QuizResponse = {
                questionId: questions[currentQuestionIndex].questionId,
                selectedAnswer,
            };
            setResponses([...responses, newResponse]);

            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
                setSelectedAnswer('');
            } else {
                handleSubmitQuiz();
            }
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
            const prevResponse = responses.find(
                r => r.questionId === questions[currentQuestionIndex - 1].questionId
            );
            setSelectedAnswer(prevResponse?.selectedAnswer || '');
        }
    };

    const handleSubmitQuiz = async () => {
        if (selectedAnswer && !responses.find(r => r.questionId === questions[currentQuestionIndex].questionId)) {
            responses.push({
                questionId: questions[currentQuestionIndex].questionId,
                selectedAnswer,
            });
        }try {
            // ACTUALLY SAVE TO BACKEND
            const result = await quizService.attemptQuiz({
                quizId,
                responses: responses
            });    setQuizResult(result);
            setQuizCompleted(true);    // No need for localStorage anymore
        } catch (error) {
            console.error('Error submitting quiz:', error);
            alert('Failed to submit quiz. Please try again.');
        }
    };// Also update fetchQuizData to get real quiz data:


    const saveQuizProgress = () => {
        const progress = {
            courseId,
            quizId,
            completed: true,
            score: quizResult?.score || 0,
            timestamp: new Date().toISOString(),
        };
        localStorage.setItem(`quiz-progress-${quizId}`, JSON.stringify(progress));
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy':
                return 'quiz-difficultyEasy';
            case 'medium':
                return 'quiz-difficultyMedium';
            case 'hard':
                return 'quiz-difficultyHard';
            default:
                return '';
        }
    };

    const getScoreMessage = (score: number) => {
        if (score >= 90) return { text: 'Excellent!', emoji: '🎉' };
        if (score >= 80) return { text: 'Great Job!', emoji: '🌟' };
        if (score >= 70) return { text: 'Good Work!', emoji: '👍' };
        if (score >= 60) return { text: 'Keep Practicing!', emoji: '💪' };
        return { text: 'Need More Practice', emoji: '📚' };
    };

    if (loading) {
        return (
            <div className="quiz-loadingContainer">
                <div className="quiz-loader" />
                <p>Loading quiz...</p>
            </div>
        );
    }

    /** QUIZ START SCREEN **/
    if (!quizStarted) {
        return (
            <div className="quiz-container">
                <div className="quiz-startScreen">
                    <Link href={`/courses/${courseId}/learn`} className="quiz-backLink">
                        ← Back to Course
                    </Link>

                    <div className="quiz-startCard">
                        <h1 className="quiz-title">{quizTitle}</h1>
                        <div className="quiz-info">
                            <div className="quiz-infoItem">⏱ 30 Minutes</div>
                            <div className="quiz-infoItem">📘 {questions.length} Questions</div>
                            <div className="quiz-infoItem">⚡ Adaptive Difficulty</div>
                        </div>
                        <button onClick={startQuiz} className="quiz-startButton">
                            Start Quiz
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    /** QUIZ COMPLETED SCREEN **/
    if (quizCompleted && quizResult) {
        const scoreMessage = getScoreMessage(quizResult.score);
        return (
            <div className="quiz-container">
                <div className="quiz-resultScreen">
                    <div className="quiz-resultCard">
                        <div className="quiz-scoreCircle">
                            <div className="quiz-scoreAnimation">
                                <span className="quiz-scoreEmoji">{scoreMessage.emoji}</span>
                                <div className="quiz-scoreNumber">{quizResult.score}%</div>
                            </div>
                        </div>
                        <h2 className="quiz-scoreMessage">{scoreMessage.text}</h2>
                    </div>
                    {showReview && <div className="quiz-reviewSection">...</div>}
                </div>
            </div>
        );
    }

    /** QUIZ IN PROGRESS **/
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
        <div className="quiz-container">
            <div className="quiz-quizContainer">
                {/* Quiz Header */}
                <div className="quiz-quizHeader">
                    <div className="quiz-headerLeft">
                        <h2 className="quiz-quizName">{quizTitle}</h2>
                        <span className="quiz-questionCounter">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
                    </div>
                    <div className="quiz-headerRight">
                        <div
                            className={cn('quiz-timer', timeRemaining < 300 && 'quiz-timerWarning')}
                        >
                            <span>{formatTime(timeRemaining)}</span>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="quiz-progressBar">
                    <div className="quiz-progressFill" style={{ width: `${progress}%` }} />
                </div>

                {/* Question Section */}
                <div className="quiz-questionSection">
                    <div className="quiz-questionHeader">
                        <h3 className="quiz-questionText">{currentQuestion.questionText}</h3>
                        <span className={cn('quiz-difficulty', getDifficultyColor(currentQuestion.difficulty))}>
              {currentQuestion.difficulty}
            </span>
                    </div>
                    <div className="quiz-choicesContainer">
                        {currentQuestion.choices.map((choice, index) => (
                            <button
                                key={index}
                                className={cn(
                                    'quiz-choiceButton',
                                    selectedAnswer === choice && 'quiz-choiceSelected'
                                )}
                                onClick={() => handleAnswerSelect(choice)}
                            >
                                <span className="quiz-choiceLabel">{String.fromCharCode(65 + index)}</span>
                                <span className="quiz-choiceText">{choice}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Navigation */}
                <div className="quiz-navigation">
                    <button
                        onClick={handlePreviousQuestion}
                        disabled={currentQuestionIndex === 0}
                        className="quiz-navButton"
                    >
                        Previous
                    </button>

                    {currentQuestionIndex === questions.length - 1 ? (
                        <button
                            onClick={handleSubmitQuiz}
                            disabled={!selectedAnswer}
                            className="quiz-submitButton"
                        >
                            Submit Quiz
                        </button>
                    ) : (
                        <button
                            onClick={handleNextQuestion}
                            disabled={!selectedAnswer}
                            className="quiz-nextButton"
                        >
                            Next
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
