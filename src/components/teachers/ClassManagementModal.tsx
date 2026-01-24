import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { classesApi, teachersApi } from "@/lib/api";
import { School, UserCheck, X } from "lucide-react";
import type { Class, Teacher } from "@/lib/api/types";

interface ClassManagementModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ClassManagementModal({ open, onOpenChange }: ClassManagementModalProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedTeachers, setSelectedTeachers] = useState<Record<string, string>>({});

    // Fetch all classes
    const { data: classesData, isLoading: loadingClasses } = useQuery({
        queryKey: ['classes'],
        queryFn: () => classesApi.getAll(),
        enabled: open,
    });

    // Fetch all teachers
    const { data: teachersData, isLoading: loadingTeachers } = useQuery({
        queryKey: ['teachers'],
        queryFn: () => teachersApi.getAll(),
        enabled: open,
    });

    // Assign class teacher mutation
    const assignMutation = useMutation({
        mutationFn: ({ classId, teacherId }: { classId: string; teacherId: string }) =>
            classesApi.assignClassTeacher(classId, teacherId),
        onSuccess: () => {
            toast({ title: "تم تعيين رائد الفصل بنجاح" });
            queryClient.invalidateQueries({ queryKey: ['classes'] });
            queryClient.invalidateQueries({ queryKey: ['teachers'] });
        },
        onError: (error) => {
            toast({
                title: "خطأ",
                description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
                variant: "destructive",
            });
        },
    });

    // Remove class teacher mutation
    const removeMutation = useMutation({
        mutationFn: (classId: string) => classesApi.removeClassTeacher(classId),
        onSuccess: () => {
            toast({ title: "تم إزالة رائد الفصل بنجاح" });
            queryClient.invalidateQueries({ queryKey: ['classes'] });
            queryClient.invalidateQueries({ queryKey: ['teachers'] });
        },
        onError: (error) => {
            toast({
                title: "خطأ",
                description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
                variant: "destructive",
            });
        },
    });

    const classes = classesData?.data || [];
    const teachers = teachersData?.data || [];

    // Group classes by grade
    const groupedClasses = classes.reduce((acc, cls) => {
        if (!acc[cls.grade]) {
            acc[cls.grade] = [];
        }
        acc[cls.grade].push(cls);
        return acc;
    }, {} as Record<string, Class[]>);

    const handleAssignTeacher = (classId: string) => {
        const teacherId = selectedTeachers[classId];
        if (teacherId) {
            assignMutation.mutate({ classId, teacherId });
        }
    };

    const handleRemoveTeacher = (classId: string) => {
        removeMutation.mutate(classId);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-right flex items-center justify-end gap-2">
                        <span>إدارة رواد الفصول</span>
                        <School className="w-5 h-5 text-primary" />
                    </DialogTitle>
                </DialogHeader>

                {loadingClasses || loadingTeachers ? (
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-20 rounded-xl" />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {Object.entries(groupedClasses).map(([grade, gradeClasses]) => (
                            <div key={grade} className="space-y-3">
                                <h3 className="text-lg font-bold text-foreground text-right">{grade}</h3>
                                <div className="space-y-2">
                                    {gradeClasses.map((cls) => (
                                        <div
                                            key={cls.id}
                                            className="bg-secondary/30 border border-border rounded-xl p-4"
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-2">
                                                    {cls.classTeacher ? (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleRemoveTeacher(cls.id)}
                                                            disabled={removeMutation.isPending}
                                                            className="text-destructive hover:text-destructive"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleAssignTeacher(cls.id)}
                                                            disabled={!selectedTeachers[cls.id] || assignMutation.isPending}
                                                        >
                                                            <UserCheck className="w-4 h-4 ml-2" />
                                                            تعيين
                                                        </Button>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-4 flex-1">
                                                    <div className="flex-1">
                                                        {cls.classTeacher ? (
                                                            <div className="bg-primary/10 text-primary px-3 py-2 rounded-lg text-sm text-right">
                                                                <p className="font-medium">{cls.classTeacher.name}</p>
                                                                <p className="text-xs opacity-75">{cls.classTeacher.employeeId}</p>
                                                            </div>
                                                        ) : (
                                                            <Select
                                                                value={selectedTeachers[cls.id] || ""}
                                                                onValueChange={(value) =>
                                                                    setSelectedTeachers((prev) => ({
                                                                        ...prev,
                                                                        [cls.id]: value,
                                                                    }))
                                                                }
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="اختر رائد الفصل" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {teachers.map((teacher) => (
                                                                        <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                                                            {teacher.name} ({teacher.employeeId})
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        )}
                                                    </div>

                                                    <div className="text-right min-w-[150px]">
                                                        <p className="font-bold text-foreground">{cls.name}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {cls.studentCount || 0} طالب
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {classes.length === 0 && (
                            <div className="text-center py-12">
                                <School className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">لا توجد فصول دراسية</p>
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
