// src/app/courses/[id]/quiz/[quizId]/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

import styles from './quiz.module.css';

import {useAuth} from "../../../../../contexts/AuthContext"; // Assuming you have a CSS module for styles

interface Question {
    questionId: string;
    questionText: string;
    choices: string[];
    difficulty: 'easy' | 'medium' | 'hard';
    correctAnswer?: string; // Only available after submission
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
    const [timeRemaining, setTimeRemaining] = useState(1800); // 30 minutes
    const [quizStarted, setQuizStarted] = useState(false);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
    const [showReview, setShowReview] = useState(false);
    const [adaptiveDifficulty, setAdaptiveDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

    // Timer
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        fetchQuizData();

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
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
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [quizStarted, quizCompleted, timeRemaining]);

    const fetchQuizData = async () => {
        try {
            // Fetch quiz data from API
            // const response = await quizService.getQuiz(quizId);

            // Mock data
            setTimeout(() => {
                setQuizTitle('JavaScript Fundamentals');
                setQuestions([
                    {
                        questionId: '1',
                        questionText: 'What is the correct way to declare a variable in JavaScript?',
                        choices: ['var x = 5', 'let x = 5', 'const x = 5', 'All of the above'],
                        difficulty: 'easy'
                    },
                    {
                        questionId: '2',
                        questionText: 'Which method is used to add an element to the end of an array?',
                        choices: ['push()', 'pop()', 'shift()', 'unshift()'],
                        difficulty: 'easy'
                    },
                    {
                        questionId: '3',
                        questionText: 'What does the "this" keyword refer to in JavaScript?',
                        choices: [
                            'The current function',
                            'The global object',
                            'The object that owns the current code',
                            'None of the above'
                        ],
                        difficulty: 'medium'
                    },
                    {
                        questionId: '4',
                        questionText: 'What is a closure in JavaScript?',
                        choices: [
                            'A function that has access to outer function variables',
                            'A way to close a browser window',
                            'A method to end a loop',
                            'A type of error'
                        ],
                        difficulty: 'hard'
                    },
                    {
                        questionId: '5',
                        questionText: 'Which of the following is NOT a primitive data type in JavaScript?',
                        choices: ['String', 'Number', 'Object', 'Boolean'],
                        difficulty: 'easy'
                    }
                ]);
                setLoading(false);
            }, 1000);
        } catch (error) {
            console.error('Error fetching quiz:', error);
            router.push(`/courses/${courseId}`);
        }
    };

    const startQuiz = () => {
        setQuizStarted(true);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswerSelect = (answer: string) => {
        setSelectedAnswer(answer);
    };

    const handleNextQuestion = () => {
        if (selectedAnswer) {
            const newResponse: QuizResponse = {
                questionId: questions[currentQuestionIndex].questionId,
                selectedAnswer
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
            // Load previous answer if exists
            const prevResponse = responses.find(
                r => r.questionId === questions[currentQuestionIndex - 1].questionId
            );
            setSelectedAnswer(prevResponse?.selectedAnswer || '');
        }
    };

    const handleSubmitQuiz = async () => {
        // Add current answer if not saved
        if (selectedAnswer && !responses.find(r => r.questionId === questions[currentQuestionIndex].questionId)) {
            responses.push({
                questionId: questions[currentQuestionIndex].questionId,
                selectedAnswer
            });
        }

        try {
            // Submit quiz to backend
            // const result = await quizService.submitQuiz(quizId, responses);

            // Mock result
            const mockResult: QuizResult = {
                score: 80,
                correctAnswers: 4,
                totalQuestions: 5,
                details: questions.map((q, i) => ({
                    questionId: q.questionId,
                    questionText: q.questionText,
                    correct: i < 4, // Mock: first 4 correct
                    correctAnswer: q.choices[0], // Mock correct answer
                    chosen: responses[i]?.selectedAnswer || '',
                    difficulty: q.difficulty
                })),
                nextDifficulty: 'hard',
                nextQuestions: []
            };

            setQuizResult(mockResult);
            setQuizCompleted(true);

            // Save progress
            saveQuizProgress();
        } catch (error) {
            console.error('Error submitting quiz:', error);
        }
    };

    const saveQuizProgress = () => {
        const progress = {
            courseId,
            quizId,
            completed: true,
            score: quizResult?.score || 0,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem(`quiz-progress-${quizId}`, JSON.stringify(progress));
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return styles.difficultyEasy;
            case 'medium': return styles.difficultyMedium;
            case 'hard': return styles.difficultyHard;
            default: return '';
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
            <div className={styles.loadingContainer}>
                <div className={styles.loader}></div>
                <p>Loading quiz...</p>
            </div>
        );
    }

    // Quiz Start Screen
    if (!quizStarted) {
        return (
            <div className={styles.container}>
                <div className={styles.startScreen}>
                    <Link href={`/courses/${courseId}/learn`} className={styles.backLink}>
                        ← Back to Course
                    </Link>

                    <div className={styles.startCard}>
                        <div className={styles.quizIcon}>
                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                        </div>

                        <h1 className={styles.quizTitle}>{quizTitle}</h1>

                        <div className={styles.quizInfo}>
                            <div className={styles.infoItem}>
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{questions.length} Questions</span>
                            </div>

                            <div className={styles.infoItem}>
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>30 Minutes</span>
                            </div>

                            <div className={styles.infoItem}>
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <span>Adaptive Difficulty</span>
                            </div>
                        </div>

                        <div className={styles.instructions}>
                            <h3>Instructions:</h3>
                            <ul>
                                <li>Answer all questions within the time limit</li>
                                <li>Questions adapt to your performance level</li>
                                <li>You can navigate between questions</li>
                                <li>Your progress is automatically saved</li>
                            </ul>
                        </div>

                        <button onClick={startQuiz} className={styles.startButton}>
                            Start Quiz
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Quiz Completed Screen
    if (quizCompleted && quizResult) {
        const scoreMessage = getScoreMessage(quizResult.score);

        return (
            <div className={styles.container}>
                <div className={styles.resultScreen}>
                    <div className={styles.resultCard}>
                        <div className={styles.scoreCircle}>
                            <div className={styles.scoreAnimation}>
                                <span className={styles.scoreEmoji}>{scoreMessage.emoji}</span>
                                <div className={styles.scoreNumber}>{quizResult.score}%</div>
                            </div>
                        </div>

                        <h2 className={styles.scoreMessage}>{scoreMessage.text}</h2>

                        <div className={styles.resultStats}>
                            <div className={styles.statItem}>
                                <span className={styles.statLabel}>Correct Answers</span>
                                <span className={styles.statValue}>{quizResult.correctAnswers}/{quizResult.totalQuestions}</span>
                            </div>

                            <div className={styles.statItem}>
                                <span className={styles.statLabel}>Time Taken</span>
                                <span className={styles.statValue}>
                  {formatTime(1800 - timeRemaining)}
                </span>
                            </div>

                            <div className={styles.statItem}>
                                <span className={styles.statLabel}>Next Difficulty</span>
                                <span className={`${styles.statValue} ${getDifficultyColor(quizResult.nextDifficulty)}`}>
                  {quizResult.nextDifficulty.toUpperCase()}
                </span>
                            </div>
                        </div>

                        <div className={styles.resultActions}>
                            <button
                                onClick={() => setShowReview(true)}
                                className={styles.reviewButton}
                            >
                                Review Answers
                            </button>

                            <Link
                                href={`/courses/${courseId}/learn`}
                                className={styles.continueButton}
                            >
                                Continue Learning
                            </Link>
                        </div>

                        {quizResult.nextQuestions.length > 0 && (
                            <div className={styles.recommendedSection}>
                                <h3>Recommended Next Questions</h3>
                                <p>Based on your performance, try these {quizResult.nextDifficulty} questions next time:</p>
                                <button className={styles.tryAgainButton}>
                                    Try Adaptive Questions
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Review Section */}
                    {showReview && (
                        <div className={styles.reviewSection}>
                            <h3>Answer Review</h3>
                            <div className={styles.reviewList}>
                                {quizResult.details.map((detail, index) => (
                                    <div
                                        key={detail.questionId}
                                        className={`${styles.reviewItem} ${detail.correct ? styles.correct : styles.incorrect}`}
                                    >
                                        <div className={styles.reviewHeader}>
                                            <span className={styles.questionNumber}>Question {index + 1}</span>
                                            <span className={getDifficultyColor(detail.difficulty)}>
                        {detail.difficulty}
                      </span>
                                            {detail.correct ? (
                                                <svg className={styles.correctIcon} fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                                                </svg>
                                            ) : (
                                                <svg className={styles.incorrectIcon} fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
                                                </svg>
                                            )}
                                        </div>

                                        <p className={styles.questionText}>{detail.questionText}</p>

                                        <div className={styles.answerDetails}>
                                            <div className={styles.answerRow}>
                                                <span className={styles.answerLabel}>Your Answer:</span>
                                                <span className={detail.correct ? styles.correctAnswer : styles.wrongAnswer}>
                          {detail.chosen || 'Not answered'}
                        </span>
                                            </div>

                                            {!detail.correct && (
                                                <div className={styles.answerRow}>
                                                    <span className={styles.answerLabel}>Correct Answer:</span>
                                                    <span className={styles.correctAnswer}>{detail.correctAnswer}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Quiz In Progress
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
        <div className={styles.container}>
            <div className={styles.quizContainer}>
                {/* Quiz Header */}
                <div className={styles.quizHeader}>
                    <div className={styles.headerLeft}>
                        <h2 className={styles.quizName}>{quizTitle}</h2>
                        <span className={styles.questionCounter}>
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
                    </div>

                    <div className={styles.headerRight}>
                        <div className={`${styles.timer} ${timeRemaining < 300 ? styles.timerWarning : ''}`}>
                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{formatTime(timeRemaining)}</span>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className={styles.progressBar}>
                    <div
                        className={styles.progressFill}
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>

                {/* Question Section */}
                <div className={styles.questionSection}>
                    <div className={styles.questionHeader}>
                        <h3 className={styles.questionText}>{currentQuestion.questionText}</h3>
                        <span className={`${styles.difficulty} ${getDifficultyColor(currentQuestion.difficulty)}`}>
              {currentQuestion.difficulty}
            </span>
                    </div>

                    <div className={styles.choicesContainer}>
                        {currentQuestion.choices.map((choice, index) => (
                            <button
                                key={index}
                                className={`${styles.choiceButton} ${selectedAnswer === choice ? styles.choiceSelected : ''}`}
                                onClick={() => handleAnswerSelect(choice)}
                            >
                <span className={styles.choiceLabel}>
                  {String.fromCharCode(65 + index)}
                </span>
                                <span className={styles.choiceText}>{choice}</span>
                                {selectedAnswer === choice && (
                                    <svg className={styles.selectedIcon} fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Navigation */}
                <div className={styles.navigation}>
                    <button
                        onClick={handlePreviousQuestion}
                        disabled={currentQuestionIndex === 0}
                        className={styles.navButton}
                    >
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M15 19l-7-7 7-7" />
                        </svg>
                        Previous
                    </button>

                    {currentQuestionIndex === questions.length - 1 ? (
                        <button
                            onClick={handleSubmitQuiz}
                            disabled={!selectedAnswer && !responses.find(r => r.questionId === currentQuestion.questionId)}
                            className={styles.submitButton}
                        >
                            Submit Quiz
                        </button>
                    ) : (
                        <button
                            onClick={handleNextQuestion}
                            disabled={!selectedAnswer}
                            className={styles.nextButton}
                        >
                            Next
                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Question Navigator */}
                <div className={styles.questionNavigator}>
                    <h4>Question Navigator</h4>
                    <div className={styles.navigatorGrid}>
                        {questions.map((q, index) => {
                            const isAnswered = responses.find(r => r.questionId === q.questionId);
                            const isCurrent = index === currentQuestionIndex;

                            return (
                                <button
                                    key={q.questionId}
                                    onClick={() => {
                                        if (selectedAnswer) {
                                            setResponses([...responses, {
                                                questionId: currentQuestion.questionId,
                                                selectedAnswer
                                            }]);
                                        }
                                        setCurrentQuestionIndex(index);
                                        const existingResponse = responses.find(r => r.questionId === q.questionId);
                                        setSelectedAnswer(existingResponse?.selectedAnswer || '');
                                    }}
                                    className={`${styles.navigatorItem} 
                    ${isCurrent ? styles.navigatorCurrent : ''} 
                    ${isAnswered ? styles.navigatorAnswered : ''}`}
                                >
                                    {index + 1}
                                </button>
                            );
                        })}
                    </div>

                    <div className={styles.navigatorLegend}>
                        <div className={styles.legendItem}>
                            <span className={styles.legendDot}></span>
                            <span>Not Visited</span>
                        </div>
                        <div className={styles.legendItem}>
                            <span className={`${styles.legendDot} ${styles.legendAnswered}`}></span>
                            <span>Answered</span>
                        </div>
                        <div className={styles.legendItem}>
                            <span className={`${styles.legendDot} ${styles.legendCurrent}`}></span>
                            <span>Current</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}