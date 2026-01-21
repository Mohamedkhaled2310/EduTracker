import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { studentsApi } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Calendar, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { AttendanceCategory, AttendanceSeverity } from "@/lib/api/types";

const ATTENDANCE_CATEGORIES: { value: AttendanceCategory | "all"; label: string; description: string }[] = [
    { value: "all", label: "جميع الطلاب", description: "عرض جميع الطلاب" },
    { value: "حضور جيد", label: "حضور جيد", description: "طلاب بحضور منتظم" },
    { value: "1-2 تأخيرات", label: "1-2 تأخيرات", description: "طلاب لديهم تأخيرات قليلة" },
    { value: "3 أيام غياب", label: "3 أيام غياب", description: "طلاب غابوا 3 أيام" },
    { value: "غياب متكرر يوم الجمعة", label: "غياب متكرر يوم الجمعة", description: "طلاب يغيبون أيام الجمعة" },
    { value: "أكثر من 5 أيام غياب", label: "أكثر من 5 أيام غياب", description: "طلاب لديهم غياب متكرر" },
    { value: "أكثر من 15 يوم غياب", label: "أكثر من 15 يوم غياب", description: "حالات حرجة تحتاج متابعة" },
];

export function AttendanceCategoryView() {
    const [selectedCategory, setSelectedCategory] = useState<AttendanceCategory | "all">("all");
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch students with attendance data
    const { data: studentsData, isLoading } = useQuery({
        queryKey: ['students-attendance', selectedCategory],
        queryFn: () => studentsApi.getAll({
            limit: 200,
            status: 'active',
            attendanceCategory: selectedCategory !== 'all' ? selectedCategory : undefined
        }),
    });

    const students = studentsData?.data?.students || [];

    // Filter students by search query
    const filteredStudents = useMemo(() => {
        if (!searchQuery) return students;
        return students.filter(s =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.studentId.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [students, searchQuery]);

    // Group students by attendance category
    const groupedByCategory = useMemo(() => {
        const groups = new Map<AttendanceCategory, typeof students>();

        filteredStudents.forEach(student => {
            const category = student.attendanceCategory || 'حضور جيد';
            if (!groups.has(category)) {
                groups.set(category, []);
            }
            groups.get(category)!.push(student);
        });

        return Array.from(groups.entries()).map(([category, students]) => ({
            category,
            students,
            count: students.length
        }));
    }, [filteredStudents]);

    const getSeverityConfig = (severity?: AttendanceSeverity) => {
        const configs = {
            "good": { bg: "bg-green-50", border: "border-green-200", text: "text-green-800", badge: "bg-green-500" },
            "info": { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-800", badge: "bg-blue-500" },
            "warning": { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-800", badge: "bg-orange-500" },
            "critical": { bg: "bg-red-50", border: "border-red-200", text: "text-red-800", badge: "bg-red-500" },
        };
        return configs[severity || "good"];
    };

    const selectedCategoryInfo = ATTENDANCE_CATEGORIES.find(c => c.value === selectedCategory);

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Category Filter */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">فئة الحضور</label>
                        <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as AttendanceCategory | "all")}>
                            <SelectTrigger>
                                <SelectValue placeholder="اختر الفئة" />
                            </SelectTrigger>
                            <SelectContent>
                                {ATTENDANCE_CATEGORIES.map((cat) => (
                                    <SelectItem key={cat.value} value={cat.value}>
                                        <div className="text-right">
                                            <div className="font-medium">{cat.label}</div>
                                            <div className="text-xs text-muted-foreground">{cat.description}</div>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Search */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">بحث</label>
                        <div className="relative">
                            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="ابحث عن طالب..."
                                className="pr-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Category Description */}
                {selectedCategoryInfo && selectedCategory !== "all" && (
                    <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                        <p className="text-sm text-foreground text-right">
                            <span className="font-semibold">{selectedCategoryInfo.label}:</span> {selectedCategoryInfo.description}
                        </p>
                    </div>
                )}
            </div>

            {/* Results */}
            {isLoading ? (
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-32 rounded-xl" />
                    ))}
                </div>
            ) : filteredStudents.length === 0 ? (
                <div className="bg-card rounded-xl p-12 shadow-sm border border-border text-center">
                    <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">لا توجد نتائج</h3>
                    <p className="text-muted-foreground">لم يتم العثور على طلاب في هذه الفئة</p>
                </div>
            ) : selectedCategory === "all" ? (
                // Show grouped by category when "all" is selected
                <div className="space-y-6">
                    {groupedByCategory.map(({ category, students, count }) => {
                        const firstStudent = students[0];
                        const severityConfig = getSeverityConfig(firstStudent?.attendanceSeverity);

                        return (
                            <div key={category} className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                                {/* Category Header */}
                                <div className={cn("p-4 border-b", severityConfig.bg, severityConfig.border)}>
                                    <div className="flex items-center justify-between">
                                        <span className={cn("text-sm font-medium", severityConfig.text)}>
                                            {count} طالب
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <h3 className={cn("text-lg font-bold", severityConfig.text)}>{category}</h3>
                                            <Calendar className={cn("w-5 h-5", severityConfig.text)} />
                                        </div>
                                    </div>
                                </div>

                                {/* Students List */}
                                <div className="divide-y divide-border">
                                    {students.map((student) => (
                                        <div key={student.id} className="p-4 hover:bg-accent/5 transition-colors">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-muted-foreground">{student.studentId}</span>
                                                        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                                                            {student.grade}
                                                        </span>
                                                    </div>
                                                    {student.attendanceStats && (
                                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                            <span>غياب: {student.attendanceStats.absentDays}</span>
                                                            <span>تأخير: {student.attendanceStats.lateDays}</span>
                                                            <span>الجمعة: {student.attendanceStats.fridayAbsences}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <h4 className="font-semibold text-foreground">{student.name}</h4>
                                                    <p className="text-sm text-muted-foreground">{student.section}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                // Show flat list when specific category is selected
                <div className="bg-card rounded-xl shadow-sm border border-border">
                    <div className="p-4 border-b border-border">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">{filteredStudents.length} طالب</span>
                            <h3 className="text-lg font-bold text-foreground">قائمة الطلاب</h3>
                        </div>
                    </div>

                    <div className="divide-y divide-border">
                        {filteredStudents.map((student) => {
                            const severityConfig = getSeverityConfig(student.attendanceSeverity);

                            return (
                                <div key={student.id} className="p-4 hover:bg-accent/5 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-muted-foreground">{student.studentId}</span>
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                                                    {student.grade} - {student.section}
                                                </span>
                                            </div>
                                            {student.attendanceStats && (
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                    <span>إجمالي الأيام: {student.attendanceStats.totalDays}</span>
                                                    <span>غياب: {student.attendanceStats.absentDays}</span>
                                                    <span>تأخير: {student.attendanceStats.lateDays}</span>
                                                    <span>غياب الجمعة: {student.attendanceStats.fridayAbsences}</span>
                                                </div>
                                            )}
                                            {student.attendanceCategory && (
                                                <div className={cn(
                                                    "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border",
                                                    severityConfig.bg,
                                                    severityConfig.text,
                                                    severityConfig.border
                                                )}>
                                                    <Calendar className="w-3 h-3" />
                                                    <span>{student.attendanceCategory}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <h4 className="font-semibold text-foreground text-lg">{student.name}</h4>
                                            <p className="text-sm text-muted-foreground">معدل الحضور: {student.attendanceRate}%</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
