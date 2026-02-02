import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X, Loader2, UserPlus } from "lucide-react";
import { studentsApi } from "@/lib/api/students";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CreateStudentRequest, StudentCategory } from "@/lib/api/types";

interface AddStudentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const GRADES = ["الصف الأول", "الصف الثاني", "الصف الثالث", "الصف الرابع"];
const SECTIONS = ["A", "B", "C", "D"];
const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const STUDENT_CATEGORIES: StudentCategory[] = ["عادي", "اصحاب الهمم", "اصحاب المراسيم", "أبناء المواطنات"];

export function AddStudentModal({ open, onOpenChange }: AddStudentModalProps) {
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState<CreateStudentRequest>({
        name: "",
        grade: "",
        class: "",
        dateOfBirth: "",
        nationality: "",
        address: "",
        academicYear: "2025-2026",
        parentPhone: "",
        parentEmail: "",
        bloodType: "",
        allergies: [],
        conditions: [],
        studentCategory: "عادي",
    });

    const [allergiesInput, setAllergiesInput] = useState("");
    const [conditionsInput, setConditionsInput] = useState("");

    const createMutation = useMutation({
        mutationFn: (data: CreateStudentRequest) => studentsApi.create(data),
        onSuccess: (response) => {
            toast.success("تم إضافة الطالب بنجاح", {
                description: `رقم الطالب: ${response.data.studentId}`,
            });
            queryClient.invalidateQueries({ queryKey: ["students"] });
            handleClose();
        },
        onError: (error: any) => {
            toast.error("فشل إضافة الطالب", {
                description: error.message || "حدث خطأ أثناء إضافة الطالب",
            });
        },
    });

    const handleClose = () => {
        setFormData({
            name: "",
            grade: "",
            class: "",
            dateOfBirth: "",
            nationality: "",
            address: "",
            academicYear: "2025-2026",
            parentPhone: "",
            parentEmail: "",
            bloodType: "",
            allergies: [],
            conditions: [],
            studentCategory: "عادي",
        });
        setAllergiesInput("");
        setConditionsInput("");
        onOpenChange(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Parse allergies and conditions from comma-separated strings
        const allergies = allergiesInput
            .split(",")
            .map(item => item.trim())
            .filter(item => item.length > 0);

        const conditions = conditionsInput
            .split(",")
            .map(item => item.trim())
            .filter(item => item.length > 0);

        const submitData: CreateStudentRequest = {
            ...formData,
            allergies: allergies.length > 0 ? allergies : undefined,
            conditions: conditions.length > 0 ? conditions : undefined,
        };

        createMutation.mutate(submitData);
    };

    const updateField = (field: keyof CreateStudentRequest, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
                <DialogHeader className="bg-primary p-6 text-primary-foreground sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleClose}
                            className="text-primary-foreground hover:bg-primary-foreground/20"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <UserPlus className="w-6 h-6" />
                            إضافة طالب جديد
                        </DialogTitle>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Student Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-foreground text-right border-b pb-2">
                            المعلومات الشخصية
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-right block">
                                    الاسم الكامل <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => updateField("name", e.target.value)}
                                    placeholder="أدخل الاسم الكامل"
                                    required
                                    className="text-right"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dateOfBirth" className="text-right block">
                                    تاريخ الميلاد <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="dateOfBirth"
                                    type="date"
                                    value={formData.dateOfBirth}
                                    onChange={(e) => updateField("dateOfBirth", e.target.value)}
                                    required
                                    className="text-right"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nationality" className="text-right block">
                                    الجنسية <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="nationality"
                                    value={formData.nationality}
                                    onChange={(e) => updateField("nationality", e.target.value)}
                                    placeholder="أدخل الجنسية"
                                    required
                                    className="text-right"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="studentCategory" className="text-right block">
                                    فئة الطالب
                                </Label>
                                <Select
                                    value={formData.studentCategory}
                                    onValueChange={(value) => updateField("studentCategory", value as StudentCategory)}
                                >
                                    <SelectTrigger className="text-right">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {STUDENT_CATEGORIES.map((category) => (
                                            <SelectItem key={category} value={category}>
                                                {category}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address" className="text-right block">
                                العنوان <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                                id="address"
                                value={formData.address}
                                onChange={(e) => updateField("address", e.target.value)}
                                placeholder="أدخل العنوان الكامل"
                                required
                                className="text-right min-h-[80px]"
                            />
                        </div>
                    </div>

                    {/* Academic Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-foreground text-right border-b pb-2">
                            المعلومات الدراسية
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="grade" className="text-right block">
                                    الصف الدراسي <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={formData.grade}
                                    onValueChange={(value) => updateField("grade", value)}
                                    required
                                >
                                    <SelectTrigger className="text-right">
                                        <SelectValue placeholder="اختر الصف" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {GRADES.map((grade) => (
                                            <SelectItem key={grade} value={grade}>
                                                {grade}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="section" className="text-right block">
                                    الشعبة <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={formData.class}
                                    onValueChange={(value) => updateField("class", value)}
                                    required
                                >
                                    <SelectTrigger className="text-right">
                                        <SelectValue placeholder="اختر الشعبة" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SECTIONS.map((section) => (
                                            <SelectItem key={section} value={section}>
                                                {section}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="academicYear" className="text-right block">
                                    السنة الدراسية <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="academicYear"
                                    value={formData.academicYear}
                                    onChange={(e) => updateField("academicYear", e.target.value)}
                                    placeholder="2025-2026"
                                    required
                                    className="text-right"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Parent Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-foreground text-right border-b pb-2">
                            معلومات ولي الأمر
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="parentPhone" className="text-right block">
                                    رقم الهاتف <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="parentPhone"
                                    type="tel"
                                    value={formData.parentPhone}
                                    onChange={(e) => updateField("parentPhone", e.target.value)}
                                    placeholder="05xxxxxxxx"
                                    required
                                    className="text-right"
                                    dir="ltr"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="parentEmail" className="text-right block">
                                    البريد الإلكتروني <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="parentEmail"
                                    type="email"
                                    value={formData.parentEmail}
                                    onChange={(e) => updateField("parentEmail", e.target.value)}
                                    placeholder="parent@example.com"
                                    required
                                    className="text-right"
                                    dir="ltr"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Medical Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-foreground text-right border-b pb-2">
                            المعلومات الطبية
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="bloodType" className="text-right block">
                                    فصيلة الدم <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={formData.bloodType}
                                    onValueChange={(value) => updateField("bloodType", value)}
                                    required
                                >
                                    <SelectTrigger className="text-right">
                                        <SelectValue placeholder="اختر فصيلة الدم" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {BLOOD_TYPES.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="allergies" className="text-right block">
                                    الحساسية (افصل بفاصلة)
                                </Label>
                                <Input
                                    id="allergies"
                                    value={allergiesInput}
                                    onChange={(e) => setAllergiesInput(e.target.value)}
                                    placeholder="مثال: الفول السوداني, البيض"
                                    className="text-right"
                                />
                            </div>

                            <div className="space-y-2 md:col-span-3">
                                <Label htmlFor="conditions" className="text-right block">
                                    الحالات الطبية (افصل بفاصلة)
                                </Label>
                                <Input
                                    id="conditions"
                                    value={conditionsInput}
                                    onChange={(e) => setConditionsInput(e.target.value)}
                                    placeholder="مثال: الربو, السكري"
                                    className="text-right"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-3 justify-start pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={createMutation.isPending}
                        >
                            إلغاء
                        </Button>
                        <Button type="submit" disabled={createMutation.isPending}>
                            {createMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                    جاري الإضافة...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-4 h-4 ml-2" />
                                    إضافة الطالب
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
