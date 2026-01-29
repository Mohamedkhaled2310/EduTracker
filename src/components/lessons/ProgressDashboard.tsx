import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Clock, Target, TrendingUp, BookOpen, CheckCircle2 } from 'lucide-react';
import { progressApi } from '@/lib/api';
import type { StudentProgress, StudentStats } from '@/lib/api/types';

interface ProgressDashboardProps {
    studentId: string;
    language: 'ar' | 'en';
}

export default function ProgressDashboard({ studentId, language }: ProgressDashboardProps) {
    const [progress, setProgress] = useState<StudentProgress[]>([]);
    const [stats, setStats] = useState<StudentStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [studentId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [progressResponse, statsResponse] = await Promise.all([
                progressApi.getStudentProgress(studentId),
                progressApi.getStudentStats(studentId)
            ]);
            setProgress(progressResponse.data);
            setStats(statsResponse.data);
        } catch (error) {
            console.error('Error fetching progress:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}${language === 'ar' ? 'س' : 'h'} ${mins}${language === 'ar' ? 'د' : 'm'}`;
        }
        return `${mins}${language === 'ar' ? 'د' : 'm'}`;
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">
                        {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                <BookOpen className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    {language === 'ar' ? 'الدروس المكتملة' : 'Completed Lessons'}
                                </p>
                                <p className="text-2xl font-bold">
                                    {stats?.completedLessons || 0}
                                    <span className="text-sm text-muted-foreground font-normal">
                                        {' / '}{stats?.totalLessons || 0}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                                <Trophy className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    {language === 'ar' ? 'متوسط الدرجات' : 'Average Score'}
                                </p>
                                <p className="text-2xl font-bold">{stats?.averageScore.toFixed(1) || 0}%</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                                <Target className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    {language === 'ar' ? 'نسبة الإكمال' : 'Completion Rate'}
                                </p>
                                <p className="text-2xl font-bold">{stats?.completionRate || 0}%</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                                <Clock className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    {language === 'ar' ? 'وقت التعلم' : 'Learning Time'}
                                </p>
                                <p className="text-2xl font-bold">{formatTime(stats?.totalTimeSpent || 0)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Overall Progress */}
            {stats && stats.totalLessons > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>{language === 'ar' ? 'التقدم الإجمالي' : 'Overall Progress'}</CardTitle>
                        <CardDescription>
                            {language === 'ar'
                                ? `أكملت ${stats.completedLessons} من ${stats.totalLessons} دروس`
                                : `Completed ${stats.completedLessons} of ${stats.totalLessons} lessons`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Progress value={Number(stats.completionRate)} className="h-3" />
                    </CardContent>
                </Card>
            )}

            {/* Recent Lessons */}
            <Card>
                <CardHeader>
                    <CardTitle>{language === 'ar' ? 'الدروس الأخيرة' : 'Recent Lessons'}</CardTitle>
                    <CardDescription>
                        {language === 'ar' ? 'آخر الدروس التي عملت عليها' : 'Your most recent lesson activity'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {progress.length === 0 ? (
                        <div className="text-center py-8">
                            <BookOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                            <p className="text-muted-foreground">
                                {language === 'ar' ? 'لم تبدأ أي دروس بعد' : 'No lessons started yet'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {progress.slice(0, 10).map((item) => {
                                const lessonTitle = language === 'ar'
                                    ? item.lesson?.title
                                    : (item.lesson?.titleEn || item.lesson?.title);
                                const isCompleted = item.completedAt !== undefined && item.completedAt !== null;

                                return (
                                    <div key={item.id} className="flex items-center gap-4 p-4 rounded-lg border">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h4 className="font-semibold">{lessonTitle}</h4>
                                                {isCompleted && (
                                                    <Badge className="bg-green-500">
                                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                                        {language === 'ar' ? 'مكتمل' : 'Completed'}
                                                    </Badge>
                                                )}
                                                {item.selectedLevel && (
                                                    <Badge variant="outline">
                                                        {item.selectedLevel === 'high'
                                                            ? (language === 'ar' ? 'عالي' : 'High')
                                                            : item.selectedLevel === 'medium'
                                                                ? (language === 'ar' ? 'متوسط' : 'Medium')
                                                                : (language === 'ar' ? 'ذوي الهمم' : 'Special Needs')}
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground">
                                                        {language === 'ar' ? 'الدرجة' : 'Score'}
                                                    </span>
                                                    <span className="font-medium">{item.score.toFixed(0)}%</span>
                                                </div>
                                                <Progress value={item.score} className="h-2" />

                                                {item.questionsAttempted > 0 && (
                                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                        <span>
                                                            {language === 'ar'
                                                                ? `${item.questionsCorrect} من ${item.questionsAttempted} صحيحة`
                                                                : `${item.questionsCorrect} of ${item.questionsAttempted} correct`}
                                                        </span>
                                                        {item.videoWatched && (
                                                            <span className="flex items-center gap-1">
                                                                <CheckCircle2 className="w-3 h-3" />
                                                                {language === 'ar' ? 'شاهدت الفيديو' : 'Video watched'}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-blue-600">
                                                {item.score.toFixed(0)}%
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {language === 'ar' ? 'النتيجة' : 'Score'}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
