import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { behaviorApi } from "@/lib/api/behavior";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BehaviorViolationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    studentIdCode?: string;
    studentName?: string;
}

const violationTypes = [
    "إزعاج الحصة",
    "الغياب أو التأخير",
    "عدم احترام المعلم",
    "العنف الجسدي",
    "التنمر",
    "استخدام الهاتف",
    "عدم إحضار الأدوات",
    "أخرى"
];

export function BehaviorViolationModal({
    open,
    onOpenChange,
    studentIdCode: initialStudentId,
    studentName: initialStudentName
}: BehaviorViolationModalProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        studentIdCode: initialStudentId || "",
        type: "",
        severity: "first_degree" as "first_degree" | "second_degree" | "third_degree" | "fourth_degree",
        description: "",
        marksDeducted: 1,
        occurrenceCount: 1,
        behaviorNotes: "",
        isChildProtectionCase: false,
        date: new Date().toISOString().split('T')[0]
    });

    const createViolationMutation = useMutation({
        mutationFn: behaviorApi.createViolation,
        onSuccess: () => {
            toast({
                title: "تم تسجيل المخالفة",
                description: "تم تسجيل المخالفة السلوكية بنجاح",
            });
            queryClient.invalidateQueries({ queryKey: ["violations"] });
            queryClient.invalidateQueries({ queryKey: ["students"] });
            onOpenChange(false);
            resetForm();
        },
        onError: (error: any) => {
            toast({
                title: "خطأ",
                description: error.message || "فشل في تسجيل المخالفة",
                variant: "destructive",
            });
        },
    });

    const resetForm = () => {
        setFormData({
            studentIdCode: initialStudentId || "",
            type: "",
            severity: "first_degree",
            description: "",
            marksDeducted: 1,
            occurrenceCount: 1,
            behaviorNotes: "",
            isChildProtectionCase: false,
            date: new Date().toISOString().split('T')[0]
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createViolationMutation.mutate(formData);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-right">
                        <AlertCircle className="w-5 h-5 text-destructive" />
                        تسجيل مخالفة سلوكية
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Student Information */}
                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="studentIdCode">رقم الطالب *</Label>
                            <Input
                                id="studentIdCode"
                                value={formData.studentIdCode}
                                onChange={(e) => setFormData({ ...formData, studentIdCode: e.target.value })}
                                placeholder="أدخل رقم الطالب"
                                required
                                disabled={!!initialStudentId}
                            />
                            {initialStudentName && (
                                <p className="text-sm text-muted-foreground">{initialStudentName}</p>
                            )}
                        </div>
                    </div>

                    {/* Violation Details */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">نوع المخالفة *</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value) => setFormData({ ...formData, type: value })}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="اختر نوع المخالفة" />
                                </SelectTrigger>
                                <SelectContent>
                                    {violationTypes.map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="severity">الخطورة *</Label>
                            <Select
                                value={formData.severity}
                                onValueChange={(value: any) => setFormData({ ...formData, severity: value })}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="first_degree">درجة اولى</SelectItem>
                                    <SelectItem value="second_degree">درجة ثانية</SelectItem>
                                    <SelectItem value="third_degree">درجة ثالثة</SelectItem>
                                    <SelectItem value="fourth_degree">درجة رابعة</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Marks and Occurrence */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="marksDeducted">العلامات المخصومة (1-4) *</Label>
                            <Input
                                id="marksDeducted"
                                type="number"
                                min="0"
                                max="4"
                                value={formData.marksDeducted}
                                onChange={(e) => setFormData({ ...formData, marksDeducted: parseInt(e.target.value) || 0 })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="occurrenceCount">عدد التكرارات *</Label>
                            <Input
                                id="occurrenceCount"
                                type="number"
                                min="1"
                                value={formData.occurrenceCount}
                                onChange={(e) => setFormData({ ...formData, occurrenceCount: parseInt(e.target.value) || 1 })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="date">التاريخ *</Label>
                            <Input
                                id="date"
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">وصف المخالفة *</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="وصف مختصر للمخالفة"
                            rows={2}
                            required
                        />
                    </div>

                    {/* Detailed Behavior Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="behaviorNotes">ملاحظات تفصيلية عن السلوك</Label>
                        <Textarea
                            id="behaviorNotes"
                            value={formData.behaviorNotes}
                            onChange={(e) => setFormData({ ...formData, behaviorNotes: e.target.value })}
                            placeholder="توثيق تفصيلي للسلوك المرتكب، الظروف، والملاحظات الإضافية..."
                            rows={4}
                        />
                    </div>

                    {/* Child Protection Case */}
                    <div className="flex items-center space-x-2 space-x-reverse">
                        <Checkbox
                            id="isChildProtectionCase"
                            checked={formData.isChildProtectionCase}
                            onCheckedChange={(checked) =>
                                setFormData({ ...formData, isChildProtectionCase: checked as boolean })
                            }
                        />
                        <Label
                            htmlFor="isChildProtectionCase"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            حالة حماية الطفل
                        </Label>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                onOpenChange(false);
                                resetForm();
                            }}
                        >
                            إلغاء
                        </Button>
                        <Button
                            type="submit"
                            disabled={createViolationMutation.isPending}
                        >
                            {createViolationMutation.isPending ? "جاري الحفظ..." : "تسجيل المخالفة"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
