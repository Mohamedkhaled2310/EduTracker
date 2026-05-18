import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Users, Check, X, Clock, Save, ListFilter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { attendanceApi, studentsApi } from "@/lib/api";
import { format } from "date-fns";
import { AttendanceCategoryView } from "@/components/attendance/AttendanceCategoryView";

type TabType = "record" | "categories";

// Helper to convert section letter/name to section number
const getSectionNumber = (section: string) => {
  if (!section) return '';
  const clean = section.trim().toUpperCase();
  if (clean === 'A' || clean === 'أ' || clean.endsWith('- A') || clean.endsWith('- أ') || clean.endsWith('A') || clean.endsWith('- 1') || clean.endsWith('1')) return '1';
  if (clean === 'B' || clean === 'ب' || clean.endsWith('- B') || clean.endsWith('- ب') || clean.endsWith('B') || clean.endsWith('- 2') || clean.endsWith('2')) return '2';
  if (clean === 'C' || clean === 'ج' || clean.endsWith('- C') || clean.endsWith('- ج') || clean.endsWith('C') || clean.endsWith('- 3') || clean.endsWith('3')) return '3';
  if (clean === 'D' || clean === 'د' || clean.endsWith('- D') || clean.endsWith('- د') || clean.endsWith('D') || clean.endsWith('- 4') || clean.endsWith('4')) return '4';
  return section;
};

// Helper to get Arabic name of the day of the week
const getArabicDayName = (dateString: string) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const day = date.getDay();
    const days = [
      'الأحد',
      'الاثنين',
      'الثلاثاء',
      'الأربعاء',
      'الخميس',
      'الجمعة',
      'السبت'
    ];
    return days[day];
  } catch (e) {
    return '';
  }
};

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState<TabType>("record");
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, 'present' | 'absent' | 'late'>>({});
  
  // Interactive Filters
  const [dayOfWeekFilter, setDayOfWeekFilter] = useState(() => getArabicDayName(format(new Date(), 'yyyy-MM-dd')));
  const [statusFilter, setStatusFilter] = useState("all");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch attendance for selected date
  const { data: attendanceData, isLoading: attendanceLoading } = useQuery({
    queryKey: ['attendance', selectedDate, selectedGrade, selectedClass],
    queryFn: () => attendanceApi.get({
      date: selectedDate,
      grade: selectedGrade || undefined,
      class: selectedClass || undefined
    }),
    enabled: !!selectedDate,
  });

  // Fetch students for the class
  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ['students-for-attendance', selectedGrade],
    queryFn: () => studentsApi.getAll({ grade: selectedGrade || undefined, limit: 100 }),
  });

  // Record attendance mutation
  const recordMutation = useMutation({
    mutationFn: (records: { studentId: string; status: 'present' | 'absent' | 'late' }[]) =>
      attendanceApi.record({
        date: selectedDate,
        records: records.map(r => ({
          studentId: r.studentId,
          status: r.status,
        })),
      }),
    onSuccess: (data) => {
      toast({
        title: "تم تسجيل الحضور بنجاح",
        description: `تم تسجيل ${data.data.totalRecorded} طالب`,
      });
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSaveAttendance = () => {
    const records = Object.entries(attendanceRecords).map(([studentId, status]) => ({
      studentId,
      status,
    }));

    if (records.length === 0) {
      toast({
        title: "تنبيه",
        description: "يرجى تحديد حالة الحضور لطالب واحد على الأقل",
        variant: "destructive",
      });
      return;
    }

    recordMutation.mutate(records);
  };

  const existingAttendance = attendanceData?.data || [];
  const students = studentsData?.data?.students || [];

  // Calculate stats from existing attendance
  const presentCount = existingAttendance.filter(r => r.status === 'present').length;
  const absentCount = existingAttendance.filter(r => r.status === 'absent').length;
  const lateCount = existingAttendance.filter(r => r.status === 'late').length;

  // Local filtering for displayed students / attendance based on status filter
  const filteredExistingAttendance = existingAttendance.filter(record => {
    if (statusFilter !== "all") {
      const currentStatus = attendanceRecords[record.studentId] || record.status;
      return currentStatus === statusFilter;
    }
    return true;
  });

  const filteredStudents = students.filter(student => {
    if (statusFilter !== "all") {
      const currentStatus = attendanceRecords[student.studentId];
      return currentStatus === statusFilter;
    }
    return true;
  });

  // Calculate specific student stats
  const getStudentStatsText = (studentId: string) => {
    const student = students.find(s => s.studentId === studentId);
    if (!student || !student.attendanceStats) return '(حضور: 0 | غياب: 0 | تأخير: 0)';
    
    const total = student.attendanceStats.totalDays || 0;
    const absent = student.attendanceStats.absentDays || 0;
    const late = student.attendanceStats.lateDays || 0;
    const present = Math.max(0, total - absent - late);
    
    return `(حضور: ${present} | غياب: ${absent} | تأخير: ${late})`;
  };

  // Interactive handler for Date change (updates Day select automatically)
  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    const dayName = getArabicDayName(newDate);
    setDayOfWeekFilter(dayName);
  };

  // Interactive handler for Day change (calculates date in current week automatically)
  const handleDayChange = (dayName: string) => {
    setDayOfWeekFilter(dayName);
    if (dayName === "all") return;
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const targetDayIndex = days.indexOf(dayName);
    if (targetDayIndex === -1) return;
    
    const today = new Date();
    const currentDayIndex = today.getDay();
    const diff = targetDayIndex - currentDayIndex;
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + diff);
    
    setSelectedDate(format(targetDate, 'yyyy-MM-dd'));
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <div className="flex flex-col md:flex-row-reverse md:items-center justify-between gap-4 mb-4">
          <div className="text-right flex-1">
            <h1 className="text-2xl font-bold text-foreground">سجل الحضور والغياب</h1>
            <p className="text-muted-foreground">تسجيل ومتابعة حضور الطلاب</p>
          </div>
          {activeTab === "record" && (
            <Button onClick={handleSaveAttendance} disabled={recordMutation.isPending} className="gap-2 self-end">
              <Save className="w-4 h-4" />
              {recordMutation.isPending ? "جاري الحفظ..." : "حفظ الحضور"}
            </Button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 justify-end">
          <Button
            variant={activeTab === "categories" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("categories")}
            className="gap-2"
          >
            <ListFilter className="w-4 h-4" />
            سجل الحضور والغياب
          </Button>
          <Button
            variant={activeTab === "record" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("record")}
            className="gap-2"
          >
            <Calendar className="w-4 h-4" />
            تسجيل الحضور
          </Button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "record" ? (
        <>
          {/* Filters - 5-column RTL grid */}
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border mb-6" dir="rtl">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-right">
              {/* Date Filter */}
              <div className="space-y-2">
                <Label className="block text-right">التاريخ</Label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="text-right"
                />
              </div>

              {/* Day Filter */}
              <div className="space-y-2">
                <Label className="block text-right">اليوم</Label>
                <Select value={dayOfWeekFilter} onValueChange={handleDayChange}>
                  <SelectTrigger className="text-right">
                    <SelectValue placeholder="اختر اليوم" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأيام</SelectItem>
                    <SelectItem value="الأحد">الأحد</SelectItem>
                    <SelectItem value="الاثنين">الاثنين</SelectItem>
                    <SelectItem value="الثلاثاء">الثلاثاء</SelectItem>
                    <SelectItem value="الأربعاء">الأربعاء</SelectItem>
                    <SelectItem value="الخميس">الخميس</SelectItem>
                    <SelectItem value="الجمعة">الجمعة</SelectItem>
                    <SelectItem value="السبت">السبت</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Grade Filter */}
              <div className="space-y-2">
                <Label className="block text-right">الصف</Label>
                <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                  <SelectTrigger className="text-right">
                    <SelectValue placeholder="اختر الصف" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="الصف الأول">الصف الأول</SelectItem>
                    <SelectItem value="الصف الثاني">الصف الثاني</SelectItem>
                    <SelectItem value="الصف الثالث">الصف الثالث</SelectItem>
                    <SelectItem value="الصف الرابع">الصف الرابع</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Section Filter */}
              <div className="space-y-2">
                <Label className="block text-right">الفصل</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="text-right">
                    <SelectValue placeholder="اختر الفصل" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="فصل الصف الأول - 1">فصل 1</SelectItem>
                    <SelectItem value="فصل الصف الأول - 2">فصل 2</SelectItem>
                    <SelectItem value="فصل الصف الأول - 3">فصل 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Type Filter */}
              <div className="space-y-2">
                <Label className="block text-right">نوع الحالة</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="text-right">
                    <SelectValue placeholder="تصفية حسب الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="present">حاضر</SelectItem>
                    <SelectItem value="absent">غائب</SelectItem>
                    <SelectItem value="late">متأخر</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Stats - Grid flowing RTL */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6" dir="rtl">
            <StatCard icon={Users} label="إجمالي الطلاب" value={students.length.toString()} />
            <StatCard icon={Check} label="حاضر" value={presentCount.toString()} trendType="positive" />
            <StatCard icon={Clock} label="متأخر" value={lateCount.toString()} trendType="neutral" />
            <StatCard icon={X} label="غائب" value={absentCount.toString()} trendType="negative" />
          </div>

          {/* Attendance Table - dir="rtl" for right-side list and left-side buttons */}
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border" dir="rtl">
            <div className="flex items-center justify-end gap-2 mb-6">
              <h3 className="text-lg font-bold text-foreground">قائمة الطلاب</h3>
              <Calendar className="w-5 h-5 text-primary" />
            </div>

            {attendanceLoading || studentsLoading ? (
              <div className="space-y-4">
                {[...Array(10)].map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-right py-3 px-4 text-muted-foreground font-medium">اسم الطالب</th>
                      <th className="text-right py-3 px-4 text-muted-foreground font-medium">الصف والفصل</th>
                      <th className="text-right py-3 px-4 text-muted-foreground font-medium">رقم الطالب</th>
                      <th className="text-right py-3 px-4 text-muted-foreground font-medium">وقت الدخول</th>
                      <th className="text-right py-3 px-4 text-muted-foreground font-medium">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {existingAttendance.length > 0 ? (
                      filteredExistingAttendance.length > 0 ? (
                        filteredExistingAttendance.map((record) => (
                          <tr key={record.id} className="border-b border-border last:border-0 hover:bg-secondary/10 transition-colors">
                            <td className="py-4 px-4 text-foreground font-medium text-right">{record.studentName}</td>
                            <td className="py-4 px-4 text-muted-foreground text-right">
                              {selectedGrade} {getSectionNumber(selectedClass)}
                            </td>
                            <td className="py-4 px-4 text-foreground text-right">{record.studentId}</td>
                            <td className="py-4 px-4 text-muted-foreground text-right">{record.checkInTime || '-'}</td>

                            <td className="py-4 px-4 text-right">
                              <div className="flex flex-col items-end">
                                <div className="flex gap-2 justify-end">
                                  <button
                                    onClick={() => handleStatusChange(record.studentId, 'present')}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${(attendanceRecords[record.studentId] || record.status) === 'present'
                                        ? 'bg-success text-success-foreground'
                                        : 'bg-success/10 text-success hover:bg-success/20'
                                      }`}
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleStatusChange(record.studentId, 'late')}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${(attendanceRecords[record.studentId] || record.status) === 'late'
                                        ? 'bg-warning text-warning-foreground'
                                        : 'bg-warning/10 text-warning hover:bg-warning/20'
                                      }`}
                                  >
                                    <Clock className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleStatusChange(record.studentId, 'absent')}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${(attendanceRecords[record.studentId] || record.status) === 'absent'
                                        ? 'bg-destructive text-destructive-foreground'
                                        : 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                                      }`}
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                                <span className="text-xs text-muted-foreground mt-1 font-normal block text-right">
                                  {getStudentStatsText(record.studentId)}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-muted-foreground">
                            لا توجد بيانات مطابقة للفلاتر المحددة
                          </td>
                        </tr>
                      )
                    ) : students.length > 0 ? (
                      filteredStudents.length > 0 ? (
                        filteredStudents.map((student) => (
                          <tr key={student.id} className="border-b border-border last:border-0 hover:bg-secondary/10 transition-colors">
                            <td className="py-4 px-4 text-foreground font-medium text-right">{student.name}</td>
                            <td className="py-4 px-4 text-muted-foreground text-right">
                              {student.grade} {getSectionNumber(student.section)}
                            </td>
                            <td className="py-4 px-4 text-foreground text-right">{student.studentId}</td>
                            <td className="py-4 px-4 text-muted-foreground text-right">-</td>
                            <td className="py-4 px-4 text-right">
                              <div className="flex flex-col items-end">
                                <div className="flex gap-2 justify-end">
                                  <button
                                    onClick={() => handleStatusChange(student.studentId, 'present')}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${attendanceRecords[student.studentId] === 'present'
                                        ? 'bg-success text-success-foreground'
                                        : 'bg-success/10 text-success hover:bg-success/20'
                                      }`}
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleStatusChange(student.studentId, 'late')}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${attendanceRecords[student.studentId] === 'late'
                                        ? 'bg-warning text-warning-foreground'
                                        : 'bg-warning/10 text-warning hover:bg-warning/20'
                                      }`}
                                  >
                                    <Clock className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleStatusChange(student.studentId, 'absent')}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${attendanceRecords[student.studentId] === 'absent'
                                        ? 'bg-destructive text-destructive-foreground'
                                        : 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                                      }`}
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                                <span className="text-xs text-muted-foreground mt-1 font-normal block text-right">
                                  {getStudentStatsText(student.studentId)}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-muted-foreground">
                            لا توجد بيانات مطابقة للفلاتر المحددة
                          </td>
                        </tr>
                      )
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-muted-foreground">
                          اختر الصف والفصل لعرض قائمة الطلاب
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <AttendanceCategoryView />
      )}
    </DashboardLayout>
  );
}
