import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, CheckCircle2, Clock, BookOpen } from 'lucide-react';
import type { Lesson, StudentProgress } from '@/lib/api/types';

interface LessonCardProps {
    lesson: Lesson;
    progress?: StudentProgress;
    language: 'ar' | 'en';
    onClick: () => void;
}

export default function LessonCard({ lesson, progress, language, onClick }: LessonCardProps) {
    const isCompleted = progress?.completedAt !== undefined && progress?.completedAt !== null;
    const progressPercentage = progress?.score || 0;

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const title = language === 'ar' ? lesson.title : (lesson.titleEn || lesson.title);
    const description = language === 'ar' ? lesson.description : (lesson.descriptionEn || lesson.description);

    return (
        <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={onClick}>
            <CardHeader className="p-0">
                <div className="relative w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg overflow-hidden">
                    {lesson.thumbnailUrl ? (
                        <img
                            src={lesson.thumbnailUrl}
                            alt={title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-16 h-16 text-white opacity-50" />
                        </div>
                    )}

                    {/* Play overlay */}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-white rounded-full p-4">
                            <Play className="w-8 h-8 text-blue-600" fill="currentColor" />
                        </div>
                    </div>

                    {/* Duration badge */}
                    <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDuration(lesson.videoDuration)}
                    </div>

                    {/* Completion badge */}
                    {isCompleted && (
                        <div className="absolute top-2 left-2">
                            <Badge className="bg-green-500 hover:bg-green-600">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                {language === 'ar' ? 'مكتمل' : 'Completed'}
                            </Badge>
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="p-4">
                <h3 className="font-bold text-lg mb-2 line-clamp-2">{title}</h3>
                {description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {description}
                    </p>
                )}

                {progress && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                                {language === 'ar' ? 'التقدم' : 'Progress'}
                            </span>
                            <span className="font-medium">{progressPercentage.toFixed(0)}%</span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />

                        {progress.questionsAttempted > 0 && (
                            <div className="text-xs text-muted-foreground">
                                {language === 'ar'
                                    ? `${progress.questionsCorrect} من ${progress.questionsAttempted} إجابة صحيحة`
                                    : `${progress.questionsCorrect} of ${progress.questionsAttempted} correct`}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>

            <CardFooter className="p-4 pt-0">
                <Button className="w-full" variant={isCompleted ? "outline" : "default"}>
                    {isCompleted ? (
                        <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            {language === 'ar' ? 'مراجعة الدرس' : 'Review Lesson'}
                        </>
                    ) : progress ? (
                        <>
                            <Play className="w-4 h-4 mr-2" />
                            {language === 'ar' ? 'متابعة' : 'Continue'}
                        </>
                    ) : (
                        <>
                            <Play className="w-4 h-4 mr-2" />
                            {language === 'ar' ? 'ابدأ الدرس' : 'Start Lesson'}
                        </>
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}
