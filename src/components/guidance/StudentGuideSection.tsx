import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StudentCard } from "@/components/dashboard/StudentCard";
import { StudentFilters } from "@/components/students/StudentFilters";
import { ClassGroup } from "@/components/students/ClassGroup";
import { StudentProfileModal } from "@/components/students/StudentProfileModal";
import { BehaviorViolationModal } from "./BehaviorViolationModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, Shield, AlertTriangle } from "lucide-react";
import { studentsApi } from "@/lib/api";
import { behaviorApi } from "@/lib/api/behavior";
import { useMemo } from "react";

export function StudentGuideSection() {
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const [selectedGrade, setSelectedGrade] = useState("all");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [showChildProtectionOnly, setShowChildProtectionOnly] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isViolationModalOpen, setIsViolationModalOpen] = useState(false);

    // Fetch students from API
    const { data: studentsData, isLoading: isLoadingStudents } = useQuery({
        queryKey: ['students-guidance', page, searchQuery, selectedGrade, selectedCategory],
        queryFn: () => studentsApi.getAll({
            page,
            limit: 100,
            search: searchQuery,
            status: 'active',
            grade: selectedGrade !== 'all' ? selectedGrade : undefined,
            category: selectedCategory !== 'all' ? selectedCategory : undefined
        }),
        enabled: !showChildProtectionOnly,
    });

    // Fetch child protection violations
    const { data: childProtectionData, isLoading: isLoadingProtection } = useQuery({
        queryKey: ['child-protection-violations'],
        queryFn: () => behaviorApi.getViolations({
            isChildProtectionCase: true,
            limit: 100
        }),
        enabled: showChildProtectionOnly,
    });

    const students = studentsData?.data?.students?.map(student => ({
        id: student.id.toString(),
        name: student.name,
        nameEn: student.studentId,
        studentId: student.studentId,
        status: student.attendanceRate < 90 ? "at-risk" as const : student.behaviorScore > 80 ? "excellent" as const : "needs-support" as const,
        points: student.behaviorScore > 80 ? "5+ النقاط" : "3- النقاط",
        attendance: student.attendanceRate,
        rating: Math.round(student.behaviorScore / 25),
        avatar: student.name.charAt(0),
        grade: student.grade,
        section: student.section,
        classTeacher: student.classTeacher,
    })) || [];

    // Group students by class when filters are active
    const groupedStudents = useMemo(() => {
        if (selectedGrade === 'all' && selectedCategory === 'all') {
            return null;
        }

        const groups = new Map<string, typeof students>();
        students.forEach(student => {
            const key = `${student.grade}-${student.section}`;
            if (!groups.has(key)) {
                groups.set(key, []);
            }
            groups.get(key)!.push(student);
        });

        return Array.from(groups.entries()).map(([key, students]) => ({
            grade: students[0].grade || 'غير محدد',
            section: students[0].section || 'غير محدد',
            classTeacher: students[0].classTeacher || 'غير محدد',
            students
        }));
    }, [students, selectedGrade, selectedCategory]);

    const handleClearFilters = () => {
        setSelectedGrade('all');
        setSelectedCategory('all');
        setShowChildProtectionOnly(false);
        setPage(1);
    };

    const handleStudentClick = (student: any) => {
        setSelectedStudent(student);
        setIsProfileModalOpen(true);
    };

    const handleAddViolation = (student?: any) => {
        if (student) {
            setSelectedStudent(student);
        }
        setIsViolationModalOpen(true);
    };

    const isLoading = showChildProtectionOnly ? isLoadingProtection : isLoadingStudents;

    return (
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="بحث عن طالب..."
                            className="pr-10 w-64"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            disabled={showChildProtectionOnly}
                        />
                    </div>
                    {!showChildProtectionOnly && (
                        <StudentFilters
                            selectedGrade={selectedGrade}
                            selectedCategory={selectedCategory}
                            onGradeChange={setSelectedGrade}
                            onCategoryChange={setSelectedCategory}
                            onClearFilters={handleClearFilters}
                        />
                    )}
                    <Button
                        variant={showChildProtectionOnly ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowChildProtectionOnly(!showChildProtectionOnly)}
                        className="gap-2"
                    >
                        <Shield className="w-4 h-4" />
                        حالات حماية الطفل
                        {showChildProtectionOnly && childProtectionData?.data?.violations && (
                            <span className="bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full text-xs ml-2">
                                {childProtectionData.data.violations.length}
                            </span>
                        )}
                    </Button>
                    {/* <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleAddViolation()}
                        className="gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        تسجيل مخالفة
                    </Button> */}
                </div>
                <h3 className="text-lg font-bold text-foreground">دليل الطلاب</h3>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <Skeleton key={i} className="h-40 rounded-xl" />
                    ))}
                </div>
            ) : showChildProtectionOnly ? (
                // Child Protection Cases View
                <div className="space-y-4">
                    {childProtectionData?.data?.violations && childProtectionData.data.violations.length > 0 ? (
                        <>
                            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
                                <div className="flex items-center gap-2 text-destructive justify-end">
                                    <p className="font-bold">
                                        تم العثور على {childProtectionData.data.violations.length} حالة حماية طفل
                                    </p>
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                            </div>
                            {childProtectionData.data.violations.map((violation, index) => (
                                <div key={violation.id || index} className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-destructive text-destructive-foreground px-3 py-1 rounded text-sm font-medium">
                                                {violation.marksDeducted || 0} علامات
                                            </span>
                                            {violation.occurrenceCount && violation.occurrenceCount > 1 && (
                                                <span className="bg-warning text-warning-foreground px-2 py-1 rounded text-xs">
                                                    تكرر {violation.occurrenceCount} مرات
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-right flex-1 mr-3">
                                            <div className="flex items-center justify-end gap-2 mb-2">
                                                <span className="bg-destructive/20 text-destructive text-xs px-2 py-0.5 rounded">
                                                    حالة حماية طفل
                                                </span>
                                                <span className={`text-xs px-2 py-0.5 rounded ${violation.status === "pending" ? "bg-warning/20 text-warning" : "bg-success/20 text-success"
                                                    }`}>
                                                    {violation.status === "pending" ? "قيد المتابعة" : "تم الحل"}
                                                </span>
                                            </div>
                                            <p className="font-bold text-foreground text-lg">{violation.studentName}</p>
                                            <p className="text-sm text-muted-foreground">رقم الطالب: {violation.studentId}</p>
                                            <p className="text-sm text-accent mt-2">{violation.type}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{violation.description}</p>
                                            {violation.behaviorNotes && (
                                                <div className="mt-3 bg-secondary/50 p-3 rounded">
                                                    <p className="text-xs font-bold text-foreground mb-1">ملاحظات تفصيلية:</p>
                                                    <p className="text-xs text-muted-foreground">{violation.behaviorNotes}</p>
                                                </div>
                                            )}
                                            <div className="flex items-center justify-end gap-4 mt-3 text-xs text-muted-foreground">
                                                <span>التاريخ: {violation.date}</span>
                                                <span>المبلغ: {violation.reportedBy}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                            <p className="text-lg font-bold text-foreground">لا توجد حالات حماية طفل</p>
                            <p className="text-sm text-muted-foreground mt-2">لم يتم تسجيل أي حالات حماية طفل حتى الآن</p>
                        </div>
                    )}
                </div>
            ) : groupedStudents ? (
                <div className="space-y-4">
                    {groupedStudents.map((group, index) => (
                        <ClassGroup
                            key={`${group.grade}-${group.section}-${index}`}
                            grade={group.grade}
                            section={group.section}
                            classTeacher={group.classTeacher}
                            students={group.students}
                            onStudentClick={handleStudentClick}
                        />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {students.map((student) => (
                        <StudentCard
                            key={student.id}
                            student={student}
                            onClick={() => handleStudentClick(student)}
                        />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {!showChildProtectionOnly && studentsData?.data?.pagination && studentsData.data.pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                    >
                        السابق
                    </Button>
                    <span className="flex items-center px-4 text-sm text-muted-foreground">
                        صفحة {page} من {studentsData.data.pagination.totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === studentsData.data.pagination.totalPages}
                        onClick={() => setPage(p => p + 1)}
                    >
                        التالي
                    </Button>
                </div>
            )}

            {/* Student Profile Modal */}
            <StudentProfileModal
                student={selectedStudent}
                open={isProfileModalOpen}
                onOpenChange={setIsProfileModalOpen}
            />

            {/* Behavior Violation Modal */}
            <BehaviorViolationModal
                open={isViolationModalOpen}
                onOpenChange={setIsViolationModalOpen}
                studentIdCode={selectedStudent?.studentId}
                studentName={selectedStudent?.name}
            />
        </div>
    );
}
