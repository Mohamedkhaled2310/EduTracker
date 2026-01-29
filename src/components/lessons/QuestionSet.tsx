import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, Lightbulb, ArrowRight, ArrowLeft, Trophy } from 'lucide-react';
import { lessonsApi, progressApi } from '@/lib/api';
import type { Question, QuestionLevel } from '@/lib/api/types';
import LevelSelector from './LevelSelector';

interface QuestionSetProps {
    lessonId: string;
    language: 'ar' | 'en';
    onComplete: () => void;
    onBack: () => void;
}

export default function QuestionSet({ lessonId, language, onComplete, onBack }: QuestionSetProps) {
    const [selectedLevel, setSelectedLevel] = useState<QuestionLevel>('medium');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<any>(null);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [correctAnswer, setCorrectAnswer] = useState<any>(null);
    const [explanation, setExplanation] = useState('');
    const [hintsUsed, setHintsUsed] = useState(0);
    const [showHint, setShowHint] = useState(false);
    const [score, setScore] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [startTime, setStartTime] = useState(Date.now());
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchQuestions();
    }, [selectedLevel]);

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const response = await lessonsApi.getQuestionsByLesson(lessonId, selectedLevel);
            setQuestions(response.data);
            setCurrentQuestionIndex(0);
            setSelectedAnswer(null);
            setShowResult(false);
            setScore(0);
            setCorrectCount(0);
        } catch (error) {
            console.error('Error fetching questions:', error);
        } finally {
            setLoading(false);
        }
    };

    const currentQuestion = questions[currentQuestionIndex];

    const handleSubmitAnswer = async () => {
        if (!selectedAnswer || !currentQuestion) return;

        const timeSpent = Math.floor((Date.now() - startTime) / 1000);

        try {
            const result = await progressApi.submitAnswer({
                questionId: currentQuestion.id,
                studentAnswer: selectedAnswer,
                timeSpent,
                hintsUsed
            });

            setIsCorrect(result.data.isCorrect);
            setCorrectAnswer(result.data.correctAnswer);
            setExplanation(language === 'ar' ? result.data.explanation : result.data.explanationEn || result.data.explanation || '');
            setShowResult(true);

            if (result.data.isCorrect) {
                setScore(score + result.data.points);
                setCorrectCount(correctCount + 1);
            }
        } catch (error) {
            console.error('Error submitting answer:', error);
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer(null);
            setShowResult(false);
            setShowHint(false);
            setHintsUsed(0);
            setStartTime(Date.now());
        } else {
            handleCompleteLesson();
        }
    };

    const handleCompleteLesson = async () => {
        try {
            await progressApi.completeLesson(lessonId, selectedLevel);
            onComplete();
        } catch (error) {
            console.error('Error completing lesson:', error);
        }
    };

    const handleShowHint = () => {
        setShowHint(true);
        setHintsUsed(hintsUsed + 1);
    };

    const getLevelLabel = (level: QuestionLevel) => {
        const labels = {
            high: language === 'ar' ? 'مستوى عالي' : 'High Level',
            medium: language === 'ar' ? 'مستوى متوسط' : 'Medium Level',
            special_needs: language === 'ar' ? 'مستوى ذوي الهمم' : 'Special Needs Level'
        };
        return labels[level];
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">
                        {language === 'ar' ? 'جاري تحميل الأسئلة...' : 'Loading questions...'}
                    </p>
                </CardContent>
            </Card>
        );
    }

    if (questions.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground mb-4">
                        {language === 'ar' ? 'لا توجد أسئلة متاحة لهذا المستوى' : 'No questions available for this level'}
                    </p>
                    <LevelSelector
                        selectedLevel={selectedLevel}
                        onLevelChange={setSelectedLevel}
                        language={language}
                    />
                </CardContent>
            </Card>
        );
    }

    const questionText = language === 'ar' ? currentQuestion.questionText : (currentQuestion.questionTextEn || currentQuestion.questionText);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={onBack}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {language === 'ar' ? 'العودة للفيديو' : 'Back to Video'}
                </Button>
                <Badge variant="outline">{getLevelLabel(selectedLevel)}</Badge>
            </div>

            <LevelSelector
                selectedLevel={selectedLevel}
                onLevelChange={setSelectedLevel}
                language={language}
            />

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                        <CardDescription>
                            {language === 'ar' ? 'سؤال' : 'Question'} {currentQuestionIndex + 1} {language === 'ar' ? 'من' : 'of'} {questions.length}
                        </CardDescription>
                        <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-yellow-600" />
                            <span className="font-semibold">{score} {language === 'ar' ? 'نقطة' : 'points'}</span>
                        </div>
                    </div>
                    <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="h-2" />
                </CardHeader>

                <CardContent className="space-y-6">
                    <div>
                        <CardTitle className="text-xl mb-4">{questionText}</CardTitle>

                        {currentQuestion.questionType === 'multiple_choice' && currentQuestion.options && (
                            <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer} disabled={showResult}>
                                <div className="space-y-3">
                                    {currentQuestion.options.map((option, index) => (
                                        <div
                                            key={index}
                                            className={`flex items-center space-x-2 p-3 rounded-lg border-2 transition-colors ${showResult
                                                ? option.value === correctAnswer || option.value === correctAnswer?.value
                                                    ? 'border-green-500 bg-green-50 dark:bg-green-950'
                                                    : selectedAnswer === option.value
                                                        ? 'border-red-500 bg-red-50 dark:bg-red-950'
                                                        : 'border-gray-200'
                                                : selectedAnswer === option.value
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <RadioGroupItem value={String(option.value)} id={`option-${index}`} />
                                            <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                                                {language === 'ar' ? option.ar : (option.en || option.ar)}
                                            </Label>
                                            {showResult && option.value === correctAnswer && (
                                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                            )}
                                            {showResult && selectedAnswer === option.value && !isCorrect && (
                                                <XCircle className="w-5 h-5 text-red-600" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </RadioGroup>
                        )}

                        {currentQuestion.questionType === 'true_false' && (
                            <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer} disabled={showResult}>
                                <div className="space-y-3">
                                    {[
                                        { value: 'true', label: language === 'ar' ? 'صح' : 'True' },
                                        { value: 'false', label: language === 'ar' ? 'خطأ' : 'False' }
                                    ].map((option) => (
                                        <div
                                            key={option.value}
                                            className={`flex items-center space-x-2 p-3 rounded-lg border-2 transition-colors ${showResult
                                                ? option.value === correctAnswer
                                                    ? 'border-green-500 bg-green-50 dark:bg-green-950'
                                                    : selectedAnswer === option.value
                                                        ? 'border-red-500 bg-red-50 dark:bg-red-950'
                                                        : 'border-gray-200'
                                                : selectedAnswer === option.value
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <RadioGroupItem value={option.value} id={option.value} />
                                            <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                                                {option.label}
                                            </Label>
                                            {showResult && option.value === correctAnswer && (
                                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                            )}
                                            {showResult && selectedAnswer === option.value && !isCorrect && (
                                                <XCircle className="w-5 h-5 text-red-600" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </RadioGroup>
                        )}
                    </div>

                    {showResult && explanation && (
                        <Card className={isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-red-500 bg-red-50 dark:bg-red-950'}>
                            <CardContent className="pt-4">
                                <div className="flex items-start gap-3">
                                    {isCorrect ? (
                                        <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                                    ) : (
                                        <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                                    )}
                                    <div>
                                        <h4 className="font-semibold mb-1">
                                            {isCorrect
                                                ? (language === 'ar' ? 'إجابة صحيحة!' : 'Correct!')
                                                : (language === 'ar' ? 'إجابة خاطئة' : 'Incorrect')}
                                        </h4>
                                        <p className="text-sm">{explanation}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {!showResult && selectedLevel === 'special_needs' && currentQuestion.hints && currentQuestion.hints.length > 0 && (
                        <div>
                            {!showHint ? (
                                <Button variant="outline" onClick={handleShowHint}>
                                    <Lightbulb className="w-4 h-4 mr-2" />
                                    {language === 'ar' ? 'عرض تلميح' : 'Show Hint'}
                                </Button>
                            ) : (
                                <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
                                    <CardContent className="pt-4">
                                        <div className="flex items-start gap-3">
                                            <Lightbulb className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-1" />
                                            <p className="text-sm">
                                                {language === 'ar' ? currentQuestion.hints[0].ar : (currentQuestion.hints[0].en || currentQuestion.hints[0].ar)}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}

                    <div className="flex justify-between pt-4">
                        {!showResult ? (
                            <Button
                                onClick={handleSubmitAnswer}
                                disabled={!selectedAnswer}
                                className="ml-auto"
                            >
                                {language === 'ar' ? 'تحقق من الإجابة' : 'Check Answer'}
                            </Button>
                        ) : (
                            <Button onClick={handleNextQuestion} className="ml-auto">
                                {currentQuestionIndex < questions.length - 1 ? (
                                    <>
                                        {language === 'ar' ? 'السؤال التالي' : 'Next Question'}
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </>
                                ) : (
                                    <>
                                        <Trophy className="w-4 h-4 mr-2" />
                                        {language === 'ar' ? 'إنهاء الدرس' : 'Complete Lesson'}
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                            {language === 'ar' ? 'الإجابات الصحيحة' : 'Correct Answers'}
                        </span>
                        <span className="font-semibold">
                            {correctCount} / {currentQuestionIndex + (showResult ? 1 : 0)}
                        </span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
