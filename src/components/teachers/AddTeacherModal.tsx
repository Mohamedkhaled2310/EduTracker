import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { teachersApi } from "@/lib/api";
import { Loader2 } from "lucide-react";
import type { CreateTeacherRequest } from "@/lib/api/types";
import { useToast } from "@/hooks/use-toast";

interface AddTeacherModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddTeacherModal({ open, onOpenChange }: AddTeacherModalProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<CreateTeacherRequest>({
        name: "",
        department: "",
        phone: "",
        email: "",
        qualification: "",
        specialization: "",
        joinDate: new Date().toISOString().split('T')[0],
        subjects: [],
        classes: []
    });

    const createMutation = useMutation({
        mutationFn: (data: CreateTeacherRequest) => teachersApi.create(data),
        onSuccess: () => {
            toast({
                title: "تم إضافة المعلم",
                description: "تم إضافة المعلم بنجاح",
            });
            queryClient.invalidateQueries({ queryKey: ['teachers'] });
            onOpenChange(false);
            setFormData({
                name: "",
                department: "",
                phone: "",
                email: "",
                qualification: "",
                specialization: "",
                joinDate: new Date().toISOString().split('T')[0],
                subjects: [],
                classes: []
            });
        },
        onError: () => {
            toast({
                title: "خطأ",
                description: "فشل في إضافة المعلم",
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
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0">
                <div className="bg-primary p-6 text-primary-foreground">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-right">
                            إضافة معلم جديد
                        </DialogTitle>
                    </DialogHeader>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[70vh]">
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="text-right">
                                <Label htmlFor="name" className="text-right block mb-2">
                                    الاسم الكامل *
                                </Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="text-right"
                                    placeholder="أدخل اسم المعلم"
                                />
                            </div>

                            <div className="text-right">
                                <Label htmlFor="department" className="text-right block mb-2">
                                    القسم *
                                </Label>
                                <Input
                                    id="department"
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    required
                                    className="text-right"
                                    placeholder="مثال: الرياضيات"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="text-right">
                                <Label htmlFor="email" className="text-right block mb-2">
                                    البريد الإلكتروني *
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    className="text-left"
                                    placeholder="teacher@example.com"
                                />
                            </div>

                            <div className="text-right">
                                <Label htmlFor="phone" className="text-right block mb-2">
                                    رقم الهاتف *
                                </Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                    className="text-left"
                                    placeholder="+966 50 123 4567"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="text-right">
                                <Label htmlFor="qualification" className="text-right block mb-2">
                                    المؤهل العلمي *
                                </Label>
                                <Input
                                    id="qualification"
                                    value={formData.qualification}
                                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                                    required
                                    className="text-right"
                                    placeholder="مثال: بكالوريوس"
                                />
                            </div>

                            <div className="text-right">
                                <Label htmlFor="specialization" className="text-right block mb-2">
                                    التخصص *
                                </Label>
                                <Input
                                    id="specialization"
                                    value={formData.specialization}
                                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                    required
                                    className="text-right"
                                    placeholder="مثال: رياضيات"
                                />
                            </div>
                        </div>

                        <div className="text-right">
                            <Label htmlFor="joinDate" className="text-right block mb-2">
                                تاريخ الالتحاق *
                            </Label>
                            <Input
                                id="joinDate"
                                type="date"
                                value={formData.joinDate}
                                onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                                required
                                className="text-right"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 justify-start mt-6 pt-4 border-t border-border">
                        <Button type="submit" disabled={createMutation.isPending}>
                            {createMutation.isPending && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
                            إضافة المعلم
                        </Button>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            إلغاء
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
