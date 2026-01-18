import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { teachersApi } from "@/lib/api";
import { Loader2, Calendar } from "lucide-react";
import type { CreateSupportRecordRequest, TeacherSupportRecord } from "@/lib/api/types";
import { useToast } from "@/hooks/use-toast";

interface TeacherSupportRecordModalProps {
    teacherId: number | null;
    teacherName: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    supportRecords: TeacherSupportRecord[];
    isLoading: boolean;
}

export function TeacherSupportRecordModal({
    teacherId,
    teacherName,
    open,
    onOpenChange,
    supportRecords,
    isLoading
}: TeacherSupportRecordModalProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<CreateSupportRecordRequest>({
        visitDate: new Date().toISOString().split('T')[0],
        supportPlan: "",
        training: "",
        notes: ""
    });

    const createMutation = useMutation({
        mutationFn: (data: CreateSupportRecordRequest) => {
            if (!teacherId) throw new Error("Teacher ID is required");
            return teachersApi.createSupportRecord(teacherId, data);
        },
        onSuccess: () => {
            toast({
                title: "تم إضافة سجل الدعم",
                description: "تم حفظ سجل الدعم الأكاديمي بنجاح",
            });
            queryClient.invalidateQueries({ queryKey: ['teacher-support-records', teacherId] });
            setFormData({
                visitDate: new Date().toISOString().split('T')[0],
                supportPlan: "",
                training: "",
                notes: ""
            });
        },
        onError: () => {
            toast({
                title: "خطأ",
                description: "فشل في إضافة سجل الدعم",
                variant: "destructive",
            });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(formData);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
                <div className="bg-primary p-6 text-primary-foreground">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-right">
                            سجلات الدعم الأكاديمي - {teacherName}
                        </DialogTitle>
                    </DialogHeader>
                </div>

                <div className="p-6 overflow-y-auto max-h-[70vh]">
                    {/* Add New Record Form */}
                    <div className="bg-muted/30 rounded-xl p-6 border border-border mb-6">
                        <h3 className="text-lg font-bold text-foreground text-right mb-4">
                            إضافة سجل دعم جديد
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="text-right">
                                    <Label htmlFor="visitDate" className="text-right block mb-2">
                                        تاريخ الزيارة الصفية
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="visitDate"
                                            type="date"
                                            value={formData.visitDate}
                                            onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                                            required
                                            className="text-right"
                                        />
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    </div>
                                </div>
                            </div>

                            <div className="text-right">
                                <Label htmlFor="supportPlan" className="text-right block mb-2">
                                    خطة الدعم
                                </Label>
                                <Textarea
                                    id="supportPlan"
                                    value={formData.supportPlan}
                                    onChange={(e) => setFormData({ ...formData, supportPlan: e.target.value })}
                                    required
                                    className="text-right min-h-[100px]"
                                    placeholder="اكتب خطة الدعم المقترحة للمعلم..."
                                />
                            </div>

                            <div className="text-right">
                                <Label htmlFor="training" className="text-right block mb-2">
                                    التدريب
                                </Label>
                                <Textarea
                                    id="training"
                                    value={formData.training}
                                    onChange={(e) => setFormData({ ...formData, training: e.target.value })}
                                    className="text-right min-h-[80px]"
                                    placeholder="التدريبات المقدمة أو الموصى بها..."
                                />
                            </div>

                            <div className="text-right">
                                <Label htmlFor="notes" className="text-right block mb-2">
                                    ملاحظات
                                </Label>
                                <Textarea
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="text-right min-h-[80px]"
                                    placeholder="ملاحظات إضافية..."
                                />
                            </div>

                            <div className="flex gap-3 justify-start">
                                <Button type="submit" disabled={createMutation.isPending}>
                                    {createMutation.isPending && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
                                    حفظ السجل
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* Existing Records */}
                    <div>
                        <h3 className="text-lg font-bold text-foreground text-right mb-4">
                            السجلات السابقة
                        </h3>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : supportRecords.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <p>لا توجد سجلات دعم سابقة</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {supportRecords.map((record) => (
                                    <div
                                        key={record.id}
                                        className="bg-card rounded-xl p-5 border border-border"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="text-left">
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(record.visitDate).toLocaleDateString('ar-EG')}
                                                </p>
                                                {record.createdBy && (
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        بواسطة: {record.createdBy.name}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <h4 className="font-bold text-foreground">زيارة صفية</h4>
                                            </div>
                                        </div>

                                        <div className="space-y-3 text-right">
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground mb-1">
                                                    خطة الدعم:
                                                </p>
                                                <p className="text-sm text-foreground">{record.supportPlan}</p>
                                            </div>

                                            {record.training && (
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground mb-1">
                                                        التدريب:
                                                    </p>
                                                    <p className="text-sm text-foreground">{record.training}</p>
                                                </div>
                                            )}

                                            {record.notes && (
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground mb-1">
                                                        ملاحظات:
                                                    </p>
                                                    <p className="text-sm text-foreground">{record.notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-border flex gap-3 justify-start">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        إغلاق
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
