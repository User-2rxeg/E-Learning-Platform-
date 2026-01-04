import  { useState } from 'react';
import { Plus, X, Save, HelpCircle, Trash2, AlertCircle } from 'lucide-react';

export interface QuizQuestion {
    questionId: string;
    questionText: string;
    choices: string[];
    correctAnswer: string;
    difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuizData {
    title: string;
    moduleId: string;
    questions: QuizQuestion[];
    adaptive: boolean;
    timeLimit?: number;
    passingScore?: number;
}

interface QuizCreatorProps {
    moduleId: string;
    moduleTitle: string;
    onSave: (quizData: QuizData) => Promise<void>;
    onCancel: () => void;
    initialData?: QuizData;
}

export const QuizCreator: React.FC<QuizCreatorProps> = ({
                                                            moduleId,
                                                            moduleTitle,
                                                            onSave,
                                                            onCancel,
                                                            initialData
                                                        }) => {
    const [quizData, setQuizData] = useState<QuizData>(
        initialData || {
            title: `${moduleTitle} Quiz`,
            moduleId,
            questions: [],
            adaptive: true,
            timeLimit: 1800, // 30 minutes
            passingScore: 70
        }
    );

    const [currentQuestion, setCurrentQuestion] = useState<Partial<QuizQuestion>>({
        questionText: '',
        choices: ['', '', '', ''],
        correctAnswer: '',
        difficulty: 'medium'
    });

    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);

    const addChoice = () => {
        if (currentQuestion.choices && currentQuestion.choices.length < 6) {
            setCurrentQuestion({
                ...currentQuestion,
                choices: [...currentQuestion.choices, '']
            });
        }
    };

    const updateChoice = (index: number, value: string) => {
        if (currentQuestion.choices) {
            const newChoices = [...currentQuestion.choices];
            newChoices[index] = value;
            setCurrentQuestion({
                ...currentQuestion,
                choices: newChoices
            });
        }
    };

    const removeChoice = (index: number) => {
        if (currentQuestion.choices && currentQuestion.choices.length > 2) {
            const newChoices = currentQuestion.choices.filter((_, i) => i !== index);
            setCurrentQuestion({
                ...currentQuestion,
                choices: newChoices,
                correctAnswer: currentQuestion.correctAnswer === currentQuestion.choices[index]
                    ? ''
                    : currentQuestion.correctAnswer
            });
        }
    };

    const validateCurrentQuestion = (): string[] => {
        const validationErrors: string[] = [];

        if (!currentQuestion.questionText?.trim()) {
            validationErrors.push('Question text is required');
        }

        const validChoices = currentQuestion.choices?.filter(choice => choice.trim()) || [];
        if (validChoices.length < 2) {
            validationErrors.push('At least 2 answer choices are required');
        }

        if (!currentQuestion.correctAnswer?.trim()) {
            validationErrors.push('Correct answer must be selected');
        } else if (!validChoices.includes(currentQuestion.correctAnswer)) {
            validationErrors.push('Correct answer must be one of the provided choices');
        }

        return validationErrors;
    };

    const addQuestion = () => {
        const validationErrors = validateCurrentQuestion();
        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            return;
        }

        const question: QuizQuestion = {
            questionId: Date.now().toString(),
            questionText: currentQuestion.questionText!.trim(),
            choices: currentQuestion.choices!.filter(choice => choice.trim()),
            correctAnswer: currentQuestion.correctAnswer!.trim(),
            difficulty: currentQuestion.difficulty || 'medium'
        };

        setQuizData({
            ...quizData,
            questions: [...quizData.questions, question]
        });

        // Reset form
        setCurrentQuestion({
            questionText: '',
            choices: ['', '', '', ''],
            correctAnswer: '',
            difficulty: 'medium'
        });
        setErrors([]);
    };

    const deleteQuestion = (index: number) => {
        setQuizData({
            ...quizData,
            questions: quizData.questions.filter((_, i) => i !== index)
        });
    };

    const handleSave = async () => {
        if (quizData.questions.length === 0) {
            setErrors(['quiz must have at least one question']);
            return;
        }

        if (!quizData.title.trim()) {
            setErrors(['quiz title is required']);
            return;
        }

        setSaving(true);
        try {
            await onSave(quizData);
        } catch (error) {
            console.error('Error saving quiz:', error);
            setErrors(['Failed to save quiz. Please try again.']);
        } finally {
            setSaving(false);
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'bg-green-100 text-green-700 border-green-200';
            case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'hard': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Create Quiz</h2>
                    <p className="text-sm text-gray-600">Module: {moduleTitle}</p>
                </div>
                <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Error Messages */}
            {errors.length > 0 && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start">
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
                        <div className="flex-1">
                            <h4 className="text-sm font-medium text-red-800">Please fix these issues:</h4>
                            <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                                {errors.map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                {/* quiz Settings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Quiz Title
                        </label>
                        <input
                            type="text"
                            value={quizData.title}
                            onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter quiz title"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Time Limit (minutes)
                        </label>
                        <input
                            type="number"
                            value={quizData.timeLimit ? quizData.timeLimit / 60 : ''}
                            onChange={(e) => setQuizData({
                                ...quizData,
                                timeLimit: parseInt(e.target.value) * 60 || undefined
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="30"
                            min="1"
                            max="180"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Passing Score (%)
                        </label>
                        <input
                            type="number"
                            value={quizData.passingScore || ''}
                            onChange={(e) => setQuizData({
                                ...quizData,
                                passingScore: parseInt(e.target.value) || undefined
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="70"
                            min="0"
                            max="100"
                        />
                    </div>
                </div>

                {/* Adaptive Setting */}
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="adaptive"
                        checked={quizData.adaptive}
                        onChange={(e) => setQuizData({ ...quizData, adaptive: e.target.checked })}
                        className="mr-3"
                    />
                    <div>
                        <label htmlFor="adaptive" className="text-sm font-medium text-gray-900">
                            Enable Adaptive Difficulty
                        </label>
                        <p className="text-xs text-gray-600">
                            Automatically adjust question difficulty based on student performance
                        </p>
                    </div>
                </div>

                {/* Question Creation Form */}
                <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Add Question</h3>

                    <div className="space-y-4">
                        {/* Question Text */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Question Text
                            </label>
                            <textarea
                                value={currentQuestion.questionText || ''}
                                onChange={(e) => setCurrentQuestion({
                                    ...currentQuestion,
                                    questionText: e.target.value
                                })}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter your question here..."
                            />
                        </div>

                        {/* Question Difficulty */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Difficulty Level
                            </label>
                            <select
                                value={currentQuestion.difficulty}
                                onChange={(e) => setCurrentQuestion({
                                    ...currentQuestion,
                                    difficulty: e.target.value as 'easy' | 'medium' | 'hard'
                                })}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>

                        {/* Answer Choices */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Answer Choices
                                </label>
                                <button
                                    onClick={addChoice}
                                    disabled={currentQuestion.choices && currentQuestion.choices.length >= 6}
                                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                                >
                                    <Plus className="w-3 h-3 mr-1" />
                                    Add Choice
                                </button>
                            </div>

                            <div className="space-y-2">
                                {currentQuestion.choices?.map((choice, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="correctAnswer"
                                            checked={currentQuestion.correctAnswer === choice && choice.trim() !== ''}
                                            onChange={() => choice.trim() && setCurrentQuestion({
                                                ...currentQuestion,
                                                correctAnswer: choice
                                            })}
                                            className="mt-1"
                                            disabled={!choice.trim()}
                                        />
                                        <input
                                            type="text"
                                            value={choice}
                                            onChange={(e) => updateChoice(index, e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder={`Choice ${index + 1}`}
                                        />
                                        {currentQuestion.choices && currentQuestion.choices.length > 2 && (
                                            <button
                                                onClick={() => removeChoice(index)}
                                                className="text-red-600 hover:text-red-800 p-1"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={addQuestion}
                            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Question to Quiz
                        </button>
                    </div>
                </div>

                {/* Added Questions List */}
                {quizData.questions.length > 0 && (
                    <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Quiz Questions ({quizData.questions.length})
                        </h3>

                        <div className="space-y-4">
                            {quizData.questions.map((question, index) => (
                                <div key={question.questionId} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-sm font-medium text-gray-900">
                                                    Question {index + 1}
                                                </span>
                                                <span className={`px-2 py-1 text-xs rounded-full border ${getDifficultyColor(question.difficulty)}`}>
                                                    {question.difficulty}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700 mb-3">{question.questionText}</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {question.choices.map((choice, choiceIndex) => (
                                                    <div key={choiceIndex} className={`px-3 py-2 text-xs rounded-lg border ${
                                                        choice === question.correctAnswer
                                                            ? 'bg-green-50 border-green-200 text-green-700'
                                                            : 'bg-gray-50 border-gray-200 text-gray-600'
                                                    }`}>
                                                        {choice === question.correctAnswer && (
                                                            <span className="font-medium">✓ </span>
                                                        )}
                                                        {choice}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => deleteQuestion(index)}
                                            className="ml-4 text-red-600 hover:text-red-800 p-1"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Save Actions */}
                <div className="border-t border-gray-200 pt-6 flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        disabled={saving}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || quizData.questions.length === 0}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                    >
                        {saving ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                Saving Quiz...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Quiz ({quizData.questions.length} questions)
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};