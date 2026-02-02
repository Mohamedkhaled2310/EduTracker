import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Loader2 } from 'lucide-react';
import { lessonsApi } from '@/lib/api';
import type { Lesson, LessonObjective } from '@/lib/api/types';

interface LessonManagementModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    lesson?: Lesson | null;
    subjects: any[];
    onSuccess: () => void;
}

export function LessonManagementModal({ open, onOpenChange, lesson, subjects, onSuccess }: LessonManagementModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        subjectId: '',
        title: '',
        titleEn: '',
        description: '',
        descriptionEn: '',
        videoUrl: '',
        videoDuration: 0, // Changed from 'duration' to 'videoDuration'
        thumbnailUrl: '',
        status: 'draft' as 'draft' | 'published',
        objectives: [] as LessonObjective[], // Changed type annotation
    });

    const [newObjective, setNewObjective] = useState({ ar: '', en: '' });

    useEffect(() => {
        if (lesson) {
            setFormData({
                subjectId: lesson.subjectId,
                title: lesson.title,
                titleEn: lesson.titleEn || '',
                description: lesson.description || '',
                descriptionEn: lesson.descriptionEn || '',
                videoUrl: lesson.videoUrl,
                videoDuration: lesson.videoDuration,
                thumbnailUrl: lesson.thumbnailUrl || '',
                status: lesson.status as 'draft' | 'published',
                objectives: lesson.objectives || [],
            });
        } else {
            // Reset form for new lesson
            setFormData({
                subjectId: '',
                title: '',
                titleEn: '',
                description: '',
                descriptionEn: '',
                videoUrl: '',
                videoDuration: 0,
                thumbnailUrl: '',
                status: 'draft',
                objectives: [],
            });
        }
    }, [lesson, open]);

    const handleAddObjective = () => {
        if (newObjective.ar.trim()) {
            setFormData({
                ...formData,
                objectives: [...formData.objectives, newObjective],
            });
            setNewObjective({ ar: '', en: '' });
        }
    };

    const handleRemoveObjective = (index: number) => {
        setFormData({
            ...formData,
            objectives: formData.objectives.filter((_, i) => i !== index),
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (lesson) {
                // Update existing lesson
                await lessonsApi.updateLesson(lesson.id, formData);
            } else {
                // Create new lesson
                await lessonsApi.createLesson(formData);
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error('Failed to save lesson:', error);
            alert('فشل حفظ الدرس. يرجى المحاولة مرة أخرى.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-right">
                        {lesson ? 'تعديل الدرس' : 'إضافة درس جديد'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Subject Selection */}
                    <div className="space-y-2">
                        <Label className="text-right block">المادة *</Label>
                        <Select value={formData.subjectId} onValueChange={(val) => setFormData({ ...formData, subjectId: val })}>
                            <SelectTrigger>
                                <SelectValue placeholder="اختر المادة" />
                            </SelectTrigger>
                            <SelectContent>
                                {subjects.map((subject) => (
                                    <SelectItem key={subject.id} value={subject.id}>
                                        {subject.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Title (Arabic) */}
                    <div className="space-y-2">
                        <Label className="text-right block">عنوان الدرس (عربي) *</Label>
                        <Input
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="أدخل عنوان الدرس بالعربية"
                            required
                            className="text-right"
                        />
                    </div>

                    {/* Title (English) */}
                    <div className="space-y-2">
                        <Label className="text-right block">عنوان الدرس (إنجليزي)</Label>
                        <Input
                            value={formData.titleEn}
                            onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                            placeholder="Enter lesson title in English"
                        />
                    </div>

                    {/* Description (Arabic) */}
                    <div className="space-y-2">
                        <Label className="text-right block">الوصف (عربي)</Label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="أدخل وصف الدرس بالعربية"
                            className="text-right"
                            rows={3}
                        />
                    </div>

                    {/* Description (English) */}
                    <div className="space-y-2">
                        <Label className="text-right block">الوصف (إنجليزي)</Label>
                        <Textarea
                            value={formData.descriptionEn}
                            onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                            placeholder="Enter lesson description in English"
                            rows={3}
                        />
                    </div>

                    {/* Video URL */}
                    <div className="space-y-2">
                        <Label className="text-right block">رابط الفيديو *</Label>
                        <Input
                            type="url"
                            value={formData.videoUrl}
                            onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                            placeholder="https://example.com/video.mp4"
                            required
                        />
                    </div>

                    {/* Duration */}
                    <div className="space-y-2">
                        <Label className="text-right block">المدة (بالثواني) *</Label>
                        <Input
                            type="number"
                            value={formData.videoDuration}
                            onChange={(e) => setFormData({ ...formData, videoDuration: parseInt(e.target.value) || 0 })}
                            placeholder="600"
                            required
                            min="0"
                        />
                    </div>

                    {/* Thumbnail URL */}
                    <div className="space-y-2">
                        <Label className="text-right block">رابط الصورة المصغرة</Label>
                        <Input
                            type="url"
                            value={formData.thumbnailUrl}
                            onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                            placeholder="https://example.com/thumbnail.jpg"
                        />
                    </div>

                    {/* Objectives */}
                    <div className="space-y-2">
                        <Label className="text-right block">أهداف الدرس</Label>
                        <div className="space-y-2">
                            {formData.objectives.map((obj, index) => (
                                <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveObjective(index)}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                    <div className="flex-1 text-right text-sm">
                                        <p className="font-medium">{obj.ar}</p>
                                        {obj.en && <p className="text-muted-foreground">{obj.en}</p>}
                                    </div>
                                </div>
                            ))}
                            <div className="flex gap-2">
                                <Button type="button" size="sm" onClick={handleAddObjective}>
                                    <Plus className="w-4 h-4" />
                                </Button>
                                <Input
                                    value={newObjective.en}
                                    onChange={(e) => setNewObjective({ ...newObjective, en: e.target.value })}
                                    placeholder="English"
                                    className="flex-1"
                                />
                                <Input
                                    value={newObjective.ar}
                                    onChange={(e) => setNewObjective({ ...newObjective, ar: e.target.value })}
                                    placeholder="عربي"
                                    className="flex-1 text-right"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                        <Label className="text-right block">الحالة *</Label>
                        <Select value={formData.status} onValueChange={(val: 'draft' | 'published') => setFormData({ ...formData, status: val })}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="draft">مسودة</SelectItem>
                                <SelectItem value="published">منشور</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 justify-end pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                            إلغاء
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {lesson ? 'حفظ التعديلات' : 'إضافة الدرس'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
