import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { GraduationCap, Plus, Search, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { gradesApi, studentsApi, subjectsApi } from "@/lib/api";
import type { RecordGradeRequest } from "@/lib/api/types";

export default function GradesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [gradeLevel, setGradeLevel] = useState<string>("");
  const [performanceRange, setPerformanceRange] = useState<string>("");

  const [formData, setFormData] = useState<RecordGradeRequest>({
    studentId: null,
    subjectId: null,
    semester: 1,
    year: "2024-2025",
    type: "homework",
    score: 0,
    maxScore: 100,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch students
  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ['students-for-grades', searchQuery, gradeLevel],
    queryFn: () => studentsApi.getAll({ search: searchQuery || undefined, grade: gradeLevel && gradeLevel !== 'all' ? gradeLevel : undefined, limit: 50 }),
  });

  // Fetch subjects
  const { data: subjectsData } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectsApi.getAll(),
  });

  // Fetch selected student grades
  const { data: gradesData, isLoading: gradesLoading } = useQuery({
    queryKey: ['student-grades', selectedStudent, performanceRange],
    queryFn: () => gradesApi.getStudentGrades(selectedStudent!, { performanceRange: performanceRange || undefined }),
    enabled: !!selectedStudent,
  });

  // Record grade mutation
  const recordMutation = useMutation({
    mutationFn: (data: RecordGradeRequest) => gradesApi.record(data),
    onSuccess: () => {
      toast({ title: "تم تسجيل الدرجة بنجاح" });
      queryClient.invalidateQueries({ queryKey: ['student-grades', selectedStudent] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      studentId: selectedStudent,
      subjectId: null,
      semester: 1,
      year: "2024-2025",
      type: "homework",
      score: 0,
      maxScore: 100,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("subjectId", formData.subjectId)
    if (formData.studentId == null || formData.subjectId == null) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار الطالب والمادة",
        variant: "destructive",
      });
      return;
    }

    // تحويل null => رقم فعلي
    recordMutation.mutate({
      ...formData,
      studentId: formData.studentId!,
      subjectId: formData.subjectId!,
    });
  };


  const students = studentsData?.data?.students || [];
  const subjects = subjectsData?.data || [];
  const studentGrades = gradesData?.data;

  return (
    <DashboardLayout>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="text-right">
            <h1 className="text-2xl font-bold text-foreground">سجل الدرجات</h1>
            <p className="text-muted-foreground">تسجيل ومتابعة درجات الطلاب</p>
          </div>

          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (open && selectedStudent) {
                setFormData(prev => ({
                  ...prev,
                  studentId: selectedStudent
                }));
              }
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button className="gap-2" disabled={!selectedStudent}>
                <Plus className="w-4 h-4" />
                إضافة درجة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-right">تسجيل درجة جديدة</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>المادة *</Label>
                  <Select
                    value={formData.subjectId}
                    onValueChange={(value) => {
                      console.log(value);
                      setFormData(prev => ({ ...prev, subjectId: value }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المادة" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id.toString()}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>نوع التقييم *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: 'homework' | 'participation' | 'midterm' | 'final' | 'diagnostic' | 'formative' | 'finalTest' | 'semesterGrade') =>
                      setFormData(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="homework">واجب منزلي</SelectItem>
                      <SelectItem value="participation">مشاركة</SelectItem>
                      <SelectItem value="midterm">اختبار نصفي</SelectItem>
                      <SelectItem value="final">اختبار نهائي</SelectItem>
                      <SelectItem value="diagnostic">اختبار تشخيصي</SelectItem>
                      <SelectItem value="formative">اختبار تكويني</SelectItem>
                      <SelectItem value="finalTest">اختبار النهائي</SelectItem>
                      <SelectItem value="semesterGrade">درجة الفصل</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>الفصل الدراسي</Label>
                    <Select
                      value={formData.semester.toString()}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, semester: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">الفصل الأول</SelectItem>
                        <SelectItem value="2">الفصل الثاني</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>السنة الدراسية</Label>
                    <Input
                      value={formData.year}
                      onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                      placeholder="2024-2025"
                      dir="ltr"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>الدرجة</Label>
                    <Input
                      type="number"
                      value={formData.score}
                      onChange={(e) => setFormData(prev => ({ ...prev, score: parseInt(e.target.value) }))}
                      min={0}
                      max={formData.maxScore}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>الدرجة القصوى</Label>
                    <Input
                      type="number"
                      value={formData.maxScore}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxScore: parseInt(e.target.value) }))}
                      min={1}
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    recordMutation.isPending ||
                    formData.studentId == null ||
                    formData.subjectId == null
                  }
                >
                  {recordMutation.isPending ? "جاري الحفظ..." : "حفظ الدرجة"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Students List */}
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <div className="flex items-center justify-end gap-2 mb-4">
            <h3 className="text-lg font-bold text-foreground">الطلاب</h3>
            <User className="w-5 h-5 text-primary" />
          </div>

          <div className="space-y-3 mb-4">
            <Select value={gradeLevel} onValueChange={setGradeLevel}>
              <SelectTrigger>
                <SelectValue placeholder="تصفية حسب الصف" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الصفوف</SelectItem>
                <SelectItem value="الصف الأول">الصف الأول</SelectItem>
                <SelectItem value="الصف الثاني">الصف الثاني</SelectItem>
                <SelectItem value="الصف الثالث">الصف الثالث</SelectItem>
                <SelectItem value="الصف الرابع">الصف الرابع</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative">
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="بحث عن طالب..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>

          {studentsLoading ? (
            <div className="space-y-2">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {students.map((student) => (
                <button
                  key={student.id}
                  onClick={() => {
                    setSelectedStudent(student.id);
                    setFormData(prev => ({ ...prev, studentId: student.id }));
                  }}
                  className={`w-full p-3 rounded-lg text-right transition-colors ${selectedStudent === student.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary/30 hover:bg-secondary/50'
                    }`}
                >
                  <p className="font-medium">{student.name}</p>
                  <p className={`text-xs ${selectedStudent === student.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {student.studentId} - {student.grade}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grades Display */}
        <div className="lg:col-span-2 bg-card rounded-xl p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-3">
              <Select value={performanceRange} onValueChange={setPerformanceRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="تصفية حسب النسبة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع النسب</SelectItem>
                  <SelectItem value="below50">أقل من 50</SelectItem>
                  <SelectItem value="50to69">50-69</SelectItem>
                  <SelectItem value="70andAbove">70 وما فوق</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-foreground">سجل الدرجات</h3>
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
          </div>

          {!selectedStudent ? (
            <div className="text-center py-12">
              <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">اختر طالب لعرض درجاته</p>
            </div>
          ) : gradesLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          ) : studentGrades ? (
            <div>
              {/* Student Info */}
              <div className="bg-secondary/30 rounded-lg p-4 mb-6 text-right">
                <h4 className="font-bold text-foreground">{studentGrades.student.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {studentGrades.student.grade} - {studentGrades.student.class}
                </p>
              </div>

              {/* Summary */}
              {studentGrades.summary && (
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-primary/10 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-primary">{studentGrades.summary.totalPercentage}%</p>
                    <p className="text-xs text-muted-foreground">المعدل العام</p>
                  </div>
                  <div className="bg-success/10 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-success">{studentGrades.summary.gpa}</p>
                    <p className="text-xs text-muted-foreground">GPA</p>
                  </div>
                  <div className="bg-accent/10 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-accent">{studentGrades.summary.rank}</p>
                    <p className="text-xs text-muted-foreground">الترتيب</p>
                  </div>
                  <div className="bg-secondary rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-foreground">{studentGrades.summary.totalStudents}</p>
                    <p className="text-xs text-muted-foreground">إجمالي الطلاب</p>
                  </div>
                </div>
              )}

              {/* Subjects Grades */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-right py-3 px-4 text-muted-foreground font-medium">التقدير</th>
                      <th className="text-right py-3 px-4 text-muted-foreground font-medium">النسبة</th>
                      <th className="text-right py-3 px-4 text-muted-foreground font-medium">المجموع</th>
                      <th className="text-right py-3 px-4 text-muted-foreground font-medium">درجة الفصل</th>
                      <th className="text-right py-3 px-4 text-muted-foreground font-medium">اختبار النهائي</th>
                      <th className="text-right py-3 px-4 text-muted-foreground font-medium">اختبار تكويني</th>
                      <th className="text-right py-3 px-4 text-muted-foreground font-medium">اختبار تشخيصي</th>
                      <th className="text-right py-3 px-4 text-muted-foreground font-medium">النهائي</th>
                      <th className="text-right py-3 px-4 text-muted-foreground font-medium">النصفي</th>
                      <th className="text-right py-3 px-4 text-muted-foreground font-medium">المشاركة</th>
                      <th className="text-right py-3 px-4 text-muted-foreground font-medium">الواجبات</th>
                      <th className="text-right py-3 px-4 text-muted-foreground font-medium">المادة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentGrades.subjects.map((subject, index) => (
                      <tr key={index} className="border-b border-border last:border-0">
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${subject.percentage >= 80 ? 'bg-success/10 text-success' :
                            subject.percentage >= 60 ? 'bg-warning/10 text-warning' :
                              'bg-destructive/10 text-destructive'
                            }`}>
                            {subject.grade}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-foreground font-medium">{subject.percentage}%</td>
                        <td className="py-4 px-4 text-foreground">{subject.total}</td>
                        <td className="py-4 px-4 text-muted-foreground">{subject.semesterGrade || '-'}</td>
                        <td className="py-4 px-4 text-muted-foreground">{subject.finalTest || '-'}</td>
                        <td className="py-4 px-4 text-muted-foreground">{subject.formativeTest || '-'}</td>
                        <td className="py-4 px-4 text-muted-foreground">{subject.diagnosticTest || '-'}</td>
                        <td className="py-4 px-4 text-muted-foreground">{subject.final}</td>
                        <td className="py-4 px-4 text-muted-foreground">{subject.midterm}</td>
                        <td className="py-4 px-4 text-muted-foreground">{subject.participation}</td>
                        <td className="py-4 px-4 text-muted-foreground">{subject.homework}</td>
                        <td className="py-4 px-4 text-foreground font-medium">{subject.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">لا توجد درجات مسجلة لهذا الطالب</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
