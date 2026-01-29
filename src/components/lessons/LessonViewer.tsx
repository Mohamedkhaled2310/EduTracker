import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle2, BookOpen, Target } from 'lucide-react';
import type { Lesson, StudentProgress } from '@/lib/api/types';
import VideoPlayer from './VideoPlayer';
import QuestionSet from './QuestionSet';
import { progressApi } from '@/lib/api';

interface LessonViewerProps {
    lesson: Lesson;
    language: 'ar' | 'en';
    onComplete: () => void;
    onBack: () => void;
}

export default function LessonViewer({ lesson, language, onComplete, onBack }: LessonViewerProps) {
    const [progress, setProgress] = useState<StudentProgress | null>(null);
    const [showQuestions, setShowQuestions] = useState(false);
    const [videoCompleted, setVideoCompleted] = useState(false);

    useEffect(() => {
        fetchProgress();
    }, [lesson.id]);

    const fetchProgress = async () => {
        try {
            const response = await progressApi.getLessonProgress(lesson.id);
            setProgress(response.data.progress);
            setVideoCompleted(response.data.progress?.videoWatched || false);
        } catch (error) {
            console.error('Error fetching progress:', error);
        }
    };

    const handleVideoComplete = () => {
        setVideoCompleted(true);
    };

    const handleProgressUpdate = (videoProgress: number, watched: boolean) => {
        if (progress) {
            setProgress({ ...progress, videoProgress, videoWatched: watched });
        }
        if (watched) {
            setVideoCompleted(true);
        }
    };

    const handleQuestionsComplete = () => {
        onComplete();
    };

    const title = language === 'ar' ? lesson.title : (lesson.titleEn || lesson.title);
    const description = language === 'ar' ? lesson.description : (lesson.descriptionEn || lesson.description);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={onBack}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {language === 'ar' ? 'العودة' : 'Back'}
                </Button>

                {progress?.completedAt && (
                    <Badge className="bg-green-500">
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        {language === 'ar' ? 'تم الإكمال' : 'Completed'}
                    </Badge>
                )}
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <CardTitle className="text-2xl mb-2">{title}</CardTitle>
                            {description && (
                                <CardDescription className="text-base">{description}</CardDescription>
                            )}
                        </div>
                        <Badge variant="outline" className="ml-4">
                            {lesson.subject?.name}
                        </Badge>
                    </div>
                </CardHeader>

                {lesson.objectives && lesson.objectives.length > 0 && (
                    <CardContent className="border-t">
                        <div className="flex items-start gap-2">
                            <Target className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold mb-2">
                                    {language === 'ar' ? 'أهداف الدرس' : 'Lesson Objectives'}
                                </h3>
                                <ul className="space-y-1">
                                    {lesson.objectives.map((obj, index) => (
                                        <li key={index} className="text-sm text-muted-foreground">
                                            • {language === 'ar' ? obj.ar : (obj.en || obj.ar)}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                )}
            </Card>

            {!showQuestions ? (
                <>
                    <VideoPlayer
                        videoUrl={lesson.videoUrl}
                        lessonId={lesson.id}
                        initialProgress={progress?.videoProgress || 0}
                        onProgressUpdate={handleProgressUpdate}
                        onVideoComplete={handleVideoComplete}
                    />

                    {videoCompleted && (
                        <Card className="border-green-500 bg-green-50 dark:bg-green-950">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                                        <div>
                                            <h3 className="font-semibold text-lg">
                                                {language === 'ar' ? 'أحسنت! أكملت مشاهدة الفيديو' : 'Great! You completed the video'}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {language === 'ar'
                                                    ? 'الآن حان وقت اختبار معلوماتك من خلال الأسئلة التفاعلية'
                                                    : 'Now it\'s time to test your knowledge with interactive questions'}
                                            </p>
                                        </div>
                                    </div>
                                    <Button onClick={() => setShowQuestions(true)} size="lg">
                                        <BookOpen className="w-4 h-4 mr-2" />
                                        {language === 'ar' ? 'ابدأ الأسئلة' : 'Start Questions'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </>
            ) : (
                <QuestionSet
                    lessonId={lesson.id}
                    language={language}
                    onComplete={handleQuestionsComplete}
                    onBack={() => setShowQuestions(false)}
                />
            )}
        </div>
    );
}
