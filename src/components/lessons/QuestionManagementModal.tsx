import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, X, Loader2, Trash2 } from 'lucide-react';
import { lessonsApi } from '@/lib/api';
import type { Question, QuestionLevel, QuestionOption, QuestionHint, CreateQuestionRequest } from '@/lib/api/types';

interface QuestionManagementModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    lessonId: string;
    onSuccess: () => void;
}

export function QuestionManagementModal({ open, onOpenChange, lessonId, onSuccess }: QuestionManagementModalProps) {
    const [loading, setLoading] = useState(false);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState<CreateQuestionRequest>({
        questionText: '',
        questionTextEn: '',
        questionType: 'multiple_choice',
        difficultyLevel: 'medium',
        options: [],
        correctAnswer: '',
        explanation: '',
        explanationEn: '',
        points: 10,
        hints: [],
    });

    const [newOption, setNewOption] = useState<Partial<QuestionOption>>({ value: '', ar: '', en: '' });
    const [newHint, setNewHint] = useState<Partial<QuestionHint>>({ ar: '', en: '' });

    useEffect(() => {
        if (open && lessonId) {
            fetchQuestions();
        }
    }, [open, lessonId]);

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const response = await lessonsApi.getQuestionsByLesson(lessonId);
            setQuestions(response.data);
        } catch (error) {
            console.error('Failed to fetch questions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddOption = () => {
        if (newOption.value && newOption.ar) {
            setFormData({
                ...formData,
                options: [...(formData.options || []), newOption as QuestionOption],
            });
            setNewOption({ value: '', ar: '', en: '' });
        }
    };

    const handleRemoveOption = (index: number) => {
        setFormData({
            ...formData,
            options: formData.options.filter((_, i) => i !== index),
        });
    };

    const handleAddHint = () => {
        if (newHint.ar) {
            setFormData({
                ...formData,
                hints: [...(formData.hints || []), newHint as QuestionHint],
            });
            setNewHint({ ar: '', en: '' });
        }
    };

    const handleRemoveHint = (index: number) => {
        setFormData({
            ...formData,
            hints: formData.hints.filter((_, i) => i !== index),
        });
    };

    const handleEditQuestion = (question: Question) => {
        setEditingQuestion(question);
        setFormData({
            questionText: question.questionText,
            questionTextEn: question.questionTextEn || '',
            questionType: question.questionType,
            difficultyLevel: question.difficultyLevel,
            options: question.options || [],
            correctAnswer: question.correctAnswer,
            explanation: question.explanation || '',
            explanationEn: question.explanationEn || '',
            points: question.points,
            hints: question.hints || [],
        });
        setShowForm(true);
    };

    const handleNewQuestion = () => {
        setEditingQuestion(null);
        setFormData({
            questionText: '',
            questionTextEn: '',
            questionType: 'multiple_choice',
            difficultyLevel: 'medium',
            options: [],
            correctAnswer: '',
            explanation: '',
            explanationEn: '',
            points: 10,
            hints: [],
        });
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingQuestion) {
                await lessonsApi.updateQuestion(editingQuestion.id, formData);
            } else {
                await lessonsApi.createQuestion(lessonId, formData);
            }
            await fetchQuestions();
            setShowForm(false);
            setEditingQuestion(null);
        } catch (error) {
            console.error('Failed to save question:', error);
            alert('فشل حفظ السؤال. يرجى المحاولة مرة أخرى.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteQuestion = async (questionId: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا السؤال؟')) return;

        setLoading(true);
        try {
            await lessonsApi.deleteQuestion(questionId);
            await fetchQuestions();
        } catch (error) {
            console.error('Failed to delete question:', error);
            alert('فشل حذف السؤال.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-right">إدارة الأسئلة</DialogTitle>
                </DialogHeader>

                {!showForm ? (
                    <div className="space-y-4">
                        <Button onClick={handleNewQuestion} className="w-full">
                            <Plus className="w-4 h-4 mr-2" />
                            إضافة سؤال جديد
                        </Button>

                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin" />
                            </div>
                        ) : questions.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <p>لا توجد أسئلة. أضف سؤالاً جديداً للبدء.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {questions.map((question, index) => (
                                    <div key={question.id} className="border rounded-lg p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="ghost" onClick={() => handleDeleteQuestion(question.id)}>
                                                    <Trash2 className="w-4 h-4 text-destructive" />
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => handleEditQuestion(question)}>
                                                    تعديل
                                                </Button>
                                            </div>
                                            <div className="flex-1 text-right mr-4">
                                                <div className="flex items-center gap-2 justify-end mb-2">
                                                    <span className="text-sm text-muted-foreground">#{index + 1}</span>
                                                    <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
                                                        {question.difficultyLevel === 'high' ? 'عالي' : question.difficultyLevel === 'medium' ? 'متوسط' : 'ذوي الهمم'}
                                                    </span>
                                                    <span className="text-xs px-2 py-1 rounded bg-muted">
                                                        {question.questionType === 'multiple_choice' ? 'اختيار متعدد' : 'صح/خطأ'}
                                                    </span>
                                                </div>
                                                <p className="font-medium">{question.questionText}</p>
                                                <p className="text-sm text-muted-foreground mt-1">{question.points} نقطة</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Question Text (Arabic) */}
                        <div className="space-y-2">
                            <Label className="text-right block">نص السؤال (عربي) *</Label>
                            <Textarea
                                value={formData.questionText}
                                onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                                placeholder="أدخل نص السؤال بالعربية"
                                required
                                className="text-right"
                                rows={3}
                            />
                        </div>

                        {/* Question Text (English) */}
                        <div className="space-y-2">
                            <Label className="text-right block">نص السؤال (إنجليزي)</Label>
                            <Textarea
                                value={formData.questionTextEn}
                                onChange={(e) => setFormData({ ...formData, questionTextEn: e.target.value })}
                                placeholder="Enter question text in English"
                                rows={3}
                            />
                        </div>

                        {/* Question Type */}
                        <div className="space-y-2">
                            <Label className="text-right block">نوع السؤال *</Label>
                            <Select value={formData.questionType} onValueChange={(val: 'multiple_choice' | 'true_false') => setFormData({ ...formData, questionType: val })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="multiple_choice">اختيار متعدد</SelectItem>
                                    <SelectItem value="true_false">صح/خطأ</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Difficulty Level */}
                        <div className="space-y-2">
                            <Label className="text-right block">مستوى الصعوبة *</Label>
                            <Select value={formData.difficultyLevel} onValueChange={(val: QuestionLevel) => setFormData({ ...formData, difficultyLevel: val })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="high">عالي</SelectItem>
                                    <SelectItem value="medium">متوسط</SelectItem>
                                    <SelectItem value="special_needs">ذوي الهمم</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Options (for multiple choice) */}
                        {formData.questionType === 'multiple_choice' && (
                            <div className="space-y-2">
                                <Label className="text-right block">الخيارات *</Label>
                                <div className="space-y-2">
                                    {formData.options.map((opt, index) => (
                                        <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveOption(index)}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                            <div className="flex-1 text-right text-sm">
                                                <p className="font-medium">{opt.value}: {opt.ar}</p>
                                                {opt.en && <p className="text-muted-foreground">{opt.en}</p>}
                                            </div>
                                        </div>
                                    ))}
                                    <div className="flex gap-2">
                                        <Button type="button" size="sm" onClick={handleAddOption}>
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                        <Input
                                            value={newOption.en}
                                            onChange={(e) => setNewOption({ ...newOption, en: e.target.value })}
                                            placeholder="English"
                                            className="flex-1"
                                        />
                                        <Input
                                            value={newOption.ar}
                                            onChange={(e) => setNewOption({ ...newOption, ar: e.target.value })}
                                            placeholder="عربي"
                                            className="flex-1 text-right"
                                        />
                                        <Input
                                            value={newOption.value}
                                            onChange={(e) => setNewOption({ ...newOption, value: e.target.value })}
                                            placeholder="a"
                                            className="w-16"
                                            maxLength={1}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Correct Answer */}
                        <div className="space-y-2">
                            <Label className="text-right block">الإجابة الصحيحة *</Label>
                            <Input
                                value={formData.correctAnswer}
                                onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                                placeholder={formData.questionType === 'true_false' ? 'true أو false' : 'a, b, c, etc.'}
                                required
                                className="text-right"
                            />
                        </div>

                        {/* Explanation (Arabic) */}
                        <div className="space-y-2">
                            <Label className="text-right block">التفسير (عربي)</Label>
                            <Textarea
                                value={formData.explanation}
                                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                                placeholder="أدخل تفسير الإجابة بالعربية"
                                className="text-right"
                                rows={2}
                            />
                        </div>

                        {/* Explanation (English) */}
                        <div className="space-y-2">
                            <Label className="text-right block">التفسير (إنجليزي)</Label>
                            <Textarea
                                value={formData.explanationEn}
                                onChange={(e) => setFormData({ ...formData, explanationEn: e.target.value })}
                                placeholder="Enter explanation in English"
                                rows={2}
                            />
                        </div>

                        {/* Points */}
                        <div className="space-y-2">
                            <Label className="text-right block">النقاط *</Label>
                            <Input
                                type="number"
                                value={formData.points}
                                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                                required
                                min="1"
                            />
                        </div>

                        {/* Hints (for special needs) */}
                        {formData.difficultyLevel === 'special_needs' && (
                            <div className="space-y-2">
                                <Label className="text-right block">التلميحات (لذوي الهمم)</Label>
                                <div className="space-y-2">
                                    {formData.hints.map((hint, index) => (
                                        <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemoveHint(index)}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                            <div className="flex-1 text-right text-sm">
                                                <p className="font-medium">{hint.ar}</p>
                                                {hint.en && <p className="text-muted-foreground">{hint.en}</p>}
                                            </div>
                                        </div>
                                    ))}
                                    <div className="flex gap-2">
                                        <Button type="button" size="sm" onClick={handleAddHint}>
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                        <Input
                                            value={newHint.en}
                                            onChange={(e) => setNewHint({ ...newHint, en: e.target.value })}
                                            placeholder="English"
                                            className="flex-1"
                                        />
                                        <Input
                                            value={newHint.ar}
                                            onChange={(e) => setNewHint({ ...newHint, ar: e.target.value })}
                                            placeholder="عربي"
                                            className="flex-1 text-right"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 justify-end pt-4">
                            <Button type="button" variant="outline" onClick={() => setShowForm(false)} disabled={loading}>
                                إلغاء
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                {editingQuestion ? 'حفظ التعديلات' : 'إضافة السؤال'}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
