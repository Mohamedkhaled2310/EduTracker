import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { behaviorApi } from "@/lib/api/behavior";
import { AlertCircle, Smile, Frown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BehaviorRecordModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    studentIdCode: string;
    studentName: string;
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

const positiveTypes = [
    "التفوق الأكاديمي",
    "المشاركة الفعالة",
    "مساعدة الزملاء",
    "الانضباط والالتزام",
    "النظافة والترتيب",
    "المبادرة والإبداع",
    "الأخلاق الحميدة",
    "أخرى"
];

export function BehaviorRecordModal({
    open,
    onOpenChange,
    studentIdCode,
    studentName
}: BehaviorRecordModalProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [category, setCategory] = useState<"positive" | "violation">("violation");

    const [violationForm, setViolationForm] = useState({
        type: "",
        severity: "first_degree" as "first_degree" | "second_degree" | "third_degree" | "fourth_degree",
        description: "",
        marksDeducted: 1,
        occurrenceCount: 1,
        behaviorNotes: "",
        isChildProtectionCase: false,
        date: new Date().toISOString().split('T')[0]
    });

    const [positiveForm, setPositiveForm] = useState({
        type: "",
        description: "",
        points: 10,
        date: new Date().toISOString().split('T')[0]
    });

    const violationMutation = useMutation({
        mutationFn: behaviorApi.createViolation,
        onSuccess: () => {
            toast({
                title: "تم بنجاح",
                description: "تم تسجيل المخالفة السلوكية بنجاح",
            });
            queryClient.invalidateQueries({ queryKey: ['violations'] });
            queryClient.invalidateQueries({ queryKey: ['student-violations', studentIdCode] });
            handleClose();
        },
        onError: (error: any) => {
            toast({
                variant: "destructive",
                title: "خطأ",
                description: error.message || "فشل تسجيل المخالفة",
            });
        }
    });

    const positiveMutation = useMutation({
        mutationFn: behaviorApi.createPositiveBehavior,
        onSuccess: () => {
            toast({
                title: "تم بنجاح",
                description: "تم تسجيل السلوك الإيجابي بنجاح",
            });
            queryClient.invalidateQueries({ queryKey: ['positive-behaviors'] });
            queryClient.invalidateQueries({ queryKey: ['student-positive-behaviors', studentIdCode] });
            handleClose();
        },
        onError: (error: any) => {
            toast({
                variant: "destructive",
                title: "خطأ",
                description: error.message || "فشل تسجيل السلوك الإيجابي",
            });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (category === "violation") {
            if (!violationForm.type || !violationForm.description) {
                toast({
                    variant: "destructive",
                    title: "خطأ",
                    description: "الرجاء ملء جميع الحقول المطلوبة",
                });
                return;
            }

            violationMutation.mutate({
                studentIdCode,
                ...violationForm
            });
        } else {
            if (!positiveForm.type || !positiveForm.description) {
                toast({
                    variant: "destructive",
                    title: "خطأ",
                    description: "الرجاء ملء جميع الحقول المطلوبة",
                });
                return;
            }

            positiveMutation.mutate({
                studentIdCode,
                ...positiveForm
            });
        }
    };

    const handleClose = () => {
        setViolationForm({
            type: "",
            severity: "first_degree",
            description: "",
            marksDeducted: 1,
            occurrenceCount: 1,
            behaviorNotes: "",
            isChildProtectionCase: false,
            date: new Date().toISOString().split('T')[0]
        });
        setPositiveForm({
            type: "",
            description: "",
            points: 10,
            date: new Date().toISOString().split('T')[0]
        });
        setCategory("violation");
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                        إضافة سجل سلوكي - {studentName}
                    </DialogTitle>
                </DialogHeader>

                <Tabs value={category} onValueChange={(v) => setCategory(v as "positive" | "violation")}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="violation" className="gap-2">
                            <Frown className="w-4 h-4" />
                            مخالفة سلوكية
                        </TabsTrigger>
                        <TabsTrigger value="positive" className="gap-2">
                            <Smile className="w-4 h-4" />
                            سلوك إيجابي
                        </TabsTrigger>
                    </TabsList>

                    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                        <TabsContent value="violation" className="space-y-4">
                            {/* Violation Form */}
                            <div className="space-y-2">
                                <Label htmlFor="violation-type">نوع المخالفة *</Label>
                                <Select
                                    value={violationForm.type}
                                    onValueChange={(value) => setViolationForm({ ...violationForm, type: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="اختر نوع المخالفة" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {violationTypes.map((type) => (
                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="severity">درجة الخطورة</Label>
                                <Select
                                    value={violationForm.severity}
                                    onValueChange={(value: any) => setViolationForm({ ...violationForm, severity: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="first_degree">الدرجة الأولى</SelectItem>
                                        <SelectItem value="second_degree">الدرجة الثانية</SelectItem>
                                        <SelectItem value="third_degree">الدرجة الثالثة</SelectItem>
                                        <SelectItem value="fourth_degree">الدرجة الرابعة</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="marksDeducted">العلامات المخصومة</Label>
                                    <Input
                                        id="marksDeducted"
                                        type="number"
                                        min="0"
                                        value={violationForm.marksDeducted}
                                        onChange={(e) => setViolationForm({ ...violationForm, marksDeducted: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="occurrenceCount">عدد المرات</Label>
                                    <Input
                                        id="occurrenceCount"
                                        type="number"
                                        min="1"
                                        value={violationForm.occurrenceCount}
                                        onChange={(e) => setViolationForm({ ...violationForm, occurrenceCount: parseInt(e.target.value) || 1 })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="violation-description">الوصف *</Label>
                                <Textarea
                                    id="violation-description"
                                    value={violationForm.description}
                                    onChange={(e) => setViolationForm({ ...violationForm, description: e.target.value })}
                                    placeholder="اكتب وصف المخالفة..."
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="behaviorNotes">ملاحظات تفصيلية</Label>
                                <Textarea
                                    id="behaviorNotes"
                                    value={violationForm.behaviorNotes}
                                    onChange={(e) => setViolationForm({ ...violationForm, behaviorNotes: e.target.value })}
                                    placeholder="ملاحظات إضافية..."
                                    rows={2}
                                />
                            </div>

                            <div className="flex items-center space-x-2 space-x-reverse">
                                <Checkbox
                                    id="childProtection"
                                    checked={violationForm.isChildProtectionCase}
                                    onCheckedChange={(checked) => setViolationForm({ ...violationForm, isChildProtectionCase: checked as boolean })}
                                />
                                <Label htmlFor="childProtection" className="flex items-center gap-2 cursor-pointer">
                                    <AlertCircle className="w-4 h-4 text-destructive" />
                                    حالة حماية طفل
                                </Label>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="violation-date">التاريخ</Label>
                                <Input
                                    id="violation-date"
                                    type="date"
                                    value={violationForm.date}
                                    onChange={(e) => setViolationForm({ ...violationForm, date: e.target.value })}
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="positive" className="space-y-4">
                            {/* Positive Behavior Form */}
                            <div className="space-y-2">
                                <Label htmlFor="positive-type">نوع السلوك الإيجابي *</Label>
                                <Select
                                    value={positiveForm.type}
                                    onValueChange={(value) => setPositiveForm({ ...positiveForm, type: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="اختر نوع السلوك" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {positiveTypes.map((type) => (
                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="positive-description">الوصف *</Label>
                                <Textarea
                                    id="positive-description"
                                    value={positiveForm.description}
                                    onChange={(e) => setPositiveForm({ ...positiveForm, description: e.target.value })}
                                    placeholder="اكتب وصف السلوك الإيجابي..."
                                    rows={4}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="points">النقاط المكتسبة</Label>
                                <Input
                                    id="points"
                                    type="number"
                                    min="1"
                                    value={positiveForm.points}
                                    onChange={(e) => setPositiveForm({ ...positiveForm, points: parseInt(e.target.value) || 10 })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="positive-date">التاريخ</Label>
                                <Input
                                    id="positive-date"
                                    type="date"
                                    value={positiveForm.date}
                                    onChange={(e) => setPositiveForm({ ...positiveForm, date: e.target.value })}
                                />
                            </div>
                        </TabsContent>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={handleClose}>
                                إلغاء
                            </Button>
                            <Button
                                type="submit"
                                disabled={violationMutation.isPending || positiveMutation.isPending}
                            >
                                {(violationMutation.isPending || positiveMutation.isPending) ? "جاري الحفظ..." : "حفظ"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
