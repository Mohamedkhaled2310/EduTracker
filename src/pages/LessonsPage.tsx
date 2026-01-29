import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Play, CheckCircle2, Clock } from 'lucide-react';
import { lessonsApi, progressApi } from '@/lib/api';
import type { Lesson, StudentProgress } from '@/lib/api/types';
import LessonCard from '@/components/lessons/LessonCard';
import LessonViewer from '@/components/lessons/LessonViewer';
import ProgressDashboard from '@/components/lessons/ProgressDashboard';

export default function LessonsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [subjects, setSubjects] = useState<any[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<string>('');
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [progress, setProgress] = useState<StudentProgress[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('lessons');
    const [language, setLanguage] = useState<'ar' | 'en'>('ar');

    // Get current user from auth context
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const studentId = currentUser.studentId || currentUser.id;

    useEffect(() => {
        fetchSubjects();
        if (studentId) {
            fetchProgress();
        }
    }, []);

    useEffect(() => {
        if (selectedSubject) {
            fetchLessons();
        }
    }, [selectedSubject]);

    const fetchSubjects = async () => {
        try {
            // Assuming you have a subjects API
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/subjects`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            setSubjects(data.data || []);
        } catch (error) {
            console.error('Error fetching subjects:', error);
        }
    };

    const fetchLessons = async () => {
        if (!selectedSubject) return;

        setLoading(true);
        try {
            const response = await lessonsApi.getSubjectLessons(selectedSubject, 'published');
            setLessons(response.data);
        } catch (error) {
            console.error('Error fetching lessons:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProgress = async () => {
        try {
            const response = await progressApi.getStudentProgress(studentId);
            setProgress(response.data);
        } catch (error) {
            console.error('Error fetching progress:', error);
        }
    };

    const handleLessonClick = (lesson: Lesson) => {
        setSelectedLesson(lesson);
        setActiveTab('viewer');
    };

    const handleLessonComplete = () => {
        setSelectedLesson(null);
        setActiveTab('lessons');
        fetchProgress();
        fetchLessons();
    };

    const getLessonProgress = (lessonId: string) => {
        return progress.find(p => p.lessonId === lessonId);
    };

    return (
        <div className="container mx-auto p-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2">
                        {language === 'ar' ? 'الدروس الذكية الحديثة' : 'Modern Smart Lessons'}
                    </h1>
                    <p className="text-muted-foreground">
                        {language === 'ar'
                            ? 'تعلم من خلال الفيديوهات التعليمية والأسئلة التفاعلية'
                            : 'Learn through educational videos and interactive questions'}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Select value={language} onValueChange={(val: 'ar' | 'en') => setLanguage(val)}>
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ar">العربية</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="lessons">
                        <BookOpen className="w-4 h-4 mr-2" />
                        {language === 'ar' ? 'الدروس' : 'Lessons'}
                    </TabsTrigger>
                    <TabsTrigger value="viewer" disabled={!selectedLesson}>
                        <Play className="w-4 h-4 mr-2" />
                        {language === 'ar' ? 'عرض الدرس' : 'Lesson Viewer'}
                    </TabsTrigger>
                    <TabsTrigger value="progress">
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        {language === 'ar' ? 'التقدم' : 'Progress'}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="lessons" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>{language === 'ar' ? 'اختر المادة' : 'Select Subject'}</CardTitle>
                            <CardDescription>
                                {language === 'ar'
                                    ? 'اختر المادة لعرض الدروس المتاحة'
                                    : 'Choose a subject to view available lessons'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                                <SelectTrigger>
                                    <SelectValue placeholder={language === 'ar' ? 'اختر المادة' : 'Select a subject'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {subjects.map((subject) => (
                                        <SelectItem key={subject.id} value={subject.id}>
                                            {subject.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>

                    {selectedSubject && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {loading ? (
                                <div className="col-span-full text-center py-12">
                                    <Clock className="w-12 h-12 animate-spin mx-auto mb-4 text-muted-foreground" />
                                    <p className="text-muted-foreground">
                                        {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                                    </p>
                                </div>
                            ) : lessons.length === 0 ? (
                                <div className="col-span-full text-center py-12">
                                    <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                                    <p className="text-muted-foreground">
                                        {language === 'ar' ? 'لا توجد دروس متاحة' : 'No lessons available'}
                                    </p>
                                </div>
                            ) : (
                                lessons.map((lesson) => (
                                    <LessonCard
                                        key={lesson.id}
                                        lesson={lesson}
                                        progress={getLessonProgress(lesson.id)}
                                        language={language}
                                        onClick={() => handleLessonClick(lesson)}
                                    />
                                ))
                            )}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="viewer">
                    {selectedLesson && (
                        <LessonViewer
                            lesson={selectedLesson}
                            language={language}
                            onComplete={handleLessonComplete}
                            onBack={() => {
                                setSelectedLesson(null);
                                setActiveTab('lessons');
                            }}
                        />
                    )}
                </TabsContent>

                <TabsContent value="progress">
                    <ProgressDashboard
                        studentId={studentId}
                        language={language}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
