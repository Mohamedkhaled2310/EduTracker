import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Users, Check, X, Clock, Save } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { attendanceApi, studentsApi } from "@/lib/api";
import { format } from "date-fns";

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, 'present' | 'absent' | 'late'>>({});
  
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

  return (
    <DashboardLayout>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <Button onClick={handleSaveAttendance} disabled={recordMutation.isPending} className="gap-2">
            <Save className="w-4 h-4" />
            {recordMutation.isPending ? "جاري الحفظ..." : "حفظ الحضور"}
          </Button>
          <div className="text-right">
            <h1 className="text-2xl font-bold text-foreground">سجل الحضور والغياب</h1>
            <p className="text-muted-foreground">تسجيل ومتابعة حضور الطلاب</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl p-6 shadow-sm border border-border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>التاريخ</Label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>الصف</Label>
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger>
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
          <div className="space-y-2">
            <Label>الفصل</Label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الفصل" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="فصل الصف الأول - A">فصل أ</SelectItem>
                <SelectItem value="فصل الصف الأول - B">فصل ب</SelectItem>
                <SelectItem value="فصل الصف الأول - C">فصل ج</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users} label="إجمالي الطلاب" value={students.length.toString()} />
        <StatCard icon={Check} label="حاضر" value={presentCount.toString()} trendType="positive" />
        <StatCard icon={X} label="غائب" value={absentCount.toString()} trendType="negative" />
        <StatCard icon={Clock} label="متأخر" value={lateCount.toString()} trendType="neutral" />
      </div>

      {/* Attendance Table */}
      <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
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
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-right py-3 px-4 text-muted-foreground font-medium">اسم الطالب</th>
                  <th className="text-right py-3 px-4 text-muted-foreground font-medium">الصف</th>
                  <th className="text-right py-3 px-4 text-muted-foreground font-medium">رقم الطالب</th>
                  <th className="text-right py-3 px-4 text-muted-foreground font-medium">وقت الدخول</th>
                  <th className="text-right py-3 px-4 text-muted-foreground font-medium">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {existingAttendance.length > 0 ? (
                  existingAttendance.map((record) => (
                    <tr key={record.id} className="border-b border-border last:border-0">
                      <td className="py-4 px-4 text-foreground font-medium">{record.studentName}</td>
                      <td className="py-4 px-4 text-muted-foreground">{selectedGrade || '-'}</td>
                      <td className="py-4 px-4 text-foreground">{record.studentId}</td>
                      <td className="py-4 px-4 text-muted-foreground">{record.checkInTime || '-'}</td>

                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleStatusChange(record.studentId, 'present')}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                              (attendanceRecords[record.studentId] || record.status) === 'present'
                                ? 'bg-success text-success-foreground'
                                : 'bg-success/10 text-success hover:bg-success/20'
                            }`}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(record.studentId, 'late')}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                              (attendanceRecords[record.studentId] || record.status) === 'late'
                                ? 'bg-warning text-warning-foreground'
                                : 'bg-warning/10 text-warning hover:bg-warning/20'
                            }`}
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(record.studentId, 'absent')}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                              (attendanceRecords[record.studentId] || record.status) === 'absent'
                                ? 'bg-destructive text-destructive-foreground'
                                : 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                            }`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))
                ) : students.length > 0 ? (
                  students.map((student) => (
                    <tr key={student.id} className="border-b border-border last:border-0">
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleStatusChange(student.studentId, 'present')}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                              attendanceRecords[student.studentId] === 'present'
                                ? 'bg-success text-success-foreground'
                                : 'bg-success/10 text-success hover:bg-success/20'
                            }`}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(student.studentId, 'late')}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                              attendanceRecords[student.studentId] === 'late'
                                ? 'bg-warning text-warning-foreground'
                                : 'bg-warning/10 text-warning hover:bg-warning/20'
                            }`}
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(student.studentId, 'absent')}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                              attendanceRecords[student.studentId] === 'absent'
                                ? 'bg-destructive text-destructive-foreground'
                                : 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                            }`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">-</td>
                      <td className="py-4 px-4 text-muted-foreground">{student.grade}</td>
                      <td className="py-4 px-4 text-foreground">{student.studentId}</td>
                      <td className="py-4 px-4 text-foreground font-medium">{student.name}</td>
                    </tr>
                  ))
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
    </DashboardLayout>
  );
}
