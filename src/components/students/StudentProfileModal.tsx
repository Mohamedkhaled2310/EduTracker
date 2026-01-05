import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { X, User, Clock, BookOpen, Star, TrendingDown, TrendingUp, Edit, Plus, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { attendanceApi } from "@/lib/api/attendance";
import { behaviorApi } from "@/lib/api/behavior";
import { gradesApi } from "@/lib/api/grades";
import type { AttendanceHistory, StudentGrades, BehaviorViolation, PositiveBehavior } from "@/lib/api/types";

interface Student {
  id: string;
  name: string;
  nameEn: string;
  studentId: string;
  status: "excellent" | "needs-support" | "at-risk";
  points: string;
  attendance: number;
  rating: number;
  avatar: string;
  grade?: string;
  section?: string;
}

interface AttendanceRecord {
  date: string;
  status: "حاضر" | "غائب" | "متأخر";
  note?: string;
}

interface BehaviorRecord {
  type: string;
  description: string;
  date: string;
  points: string;
  status: string;
  isPositive: boolean;
}

interface SubjectGrade {
  subject: string;
  teacher: string;
  grade: number;
}

interface StudentProfileModalProps {
  student: Student | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudentProfileModal({ student, open, onOpenChange }: StudentProfileModalProps) {
  const [activeTab, setActiveTab] = useState("profile");

  // API data state
  const [attendanceData, setAttendanceData] = useState<AttendanceHistory | null>(null);
  const [gradesData, setGradesData] = useState<StudentGrades | null>(null);
  const [violations, setViolations] = useState<BehaviorViolation[]>([]);
  const [positiveBehaviors, setPositiveBehaviors] = useState<PositiveBehavior[]>([]);

  // Loading states
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [loadingBehavior, setLoadingBehavior] = useState(false);

  // Error states
  const [attendanceError, setAttendanceError] = useState<string | null>(null);
  const [gradesError, setGradesError] = useState<string | null>(null);
  const [behaviorError, setBehaviorError] = useState<string | null>(null);

  // Fetch attendance data
  useEffect(() => {
    if (!student || !open) return;

    const fetchAttendance = async () => {
      setLoadingAttendance(true);
      setAttendanceError(null);
      try {
        const response = await attendanceApi.getStudentHistory(student.id);
        setAttendanceData(response.data);
      } catch (error) {
        console.error("Failed to fetch attendance:", error);
        setAttendanceError("فشل تحميل سجل الحضور");
      } finally {
        setLoadingAttendance(false);
      }
    };

    fetchAttendance();
  }, [student, open]);

  // Fetch grades data
  useEffect(() => {
    if (!student || !open) return;

    const fetchGrades = async () => {
      setLoadingGrades(true);
      setGradesError(null);
      try {
        const response = await gradesApi.getStudentGrades(student.id);
        setGradesData(response.data);
      } catch (error) {
        console.error("Failed to fetch grades:", error);
        setGradesError("فشل تحميل الدرجات");
      } finally {
        setLoadingGrades(false);
      }
    };

    fetchGrades();
  }, [student, open]);

  // Fetch behavior data
  useEffect(() => {
    if (!student || !open) return;

    const fetchBehavior = async () => {
      setLoadingBehavior(true);
      setBehaviorError(null);
      try {
        // Fetch violations
        const violationsResponse = await behaviorApi.getViolations();
        const studentViolations = violationsResponse.data.violations.filter(
          v => v.studentId === student.id
        );
        setViolations(studentViolations);

        // Fetch positive behaviors
        const positiveResponse = await behaviorApi.getPositiveBehaviors();
        const studentPositive = positiveResponse.data.filter(
          p => p.studentId === student.id
        );
        setPositiveBehaviors(studentPositive);
      } catch (error) {
        console.error("Failed to fetch behavior:", error);
        setBehaviorError("فشل تحميل السلوك");
      } finally {
        setLoadingBehavior(false);
      }
    };

    fetchBehavior();
  }, [student, open]);

  if (!student) return null;

  // Helper function to translate attendance status
  const translateAttendanceStatus = (status: string): "حاضر" | "غائب" | "متأخر" => {
    const statusMap: Record<string, "حاضر" | "غائب" | "متأخر"> = {
      "present": "حاضر",
      "absent": "غائب",
      "late": "متأخر"
    };
    return statusMap[status] || "حاضر";
  };

  // Helper function to map severity to points
  const severityToPoints = (severity: string): number => {
    const pointsMap: Record<string, number> = {
      "low": -1,
      "medium": -2,
      "high": -3
    };
    return pointsMap[severity] || -1;
  };

  const statusConfig = {
    "excellent": { label: "متفوق / منتظم", bg: "bg-success/10", text: "text-success", border: "border-success/30" },
    "needs-support": { label: "يحتاج لدعم", bg: "bg-warning/10", text: "text-warning", border: "border-warning/30" },
    "at-risk": { label: "معرض للخطر", bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/30" },
  };

  const status = statusConfig[student.status];

  const getAttendanceStatusStyle = (status: string) => {
    switch (status) {
      case "حاضر": return "bg-success/10 text-success";
      case "غائب": return "bg-destructive/10 text-destructive";
      case "متأخر": return "bg-warning/10 text-warning";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 80) return "text-success";
    if (grade >= 60) return "text-warning";
    return "text-destructive";
  };

  // Calculate behavior points from API data
  const negativePoints = violations.reduce((sum, v) => sum + severityToPoints(v.severity), 0);
  const positivePoints = positiveBehaviors.reduce((sum, p) => sum + (p.currentScore || 0), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0">
        {/* Header */}
        <div className="bg-primary p-6 text-primary-foreground relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-4 text-primary-foreground hover:bg-primary-foreground/20"
            onClick={() => onOpenChange(false)}
          >
            <X className="w-5 h-5" />
          </Button>

          <div className="flex items-center gap-4 justify-end">
            <div className="text-right">
              <h2 className="text-xl font-bold">{student.name}</h2>
              <p className="text-primary-foreground/80 text-sm">{student.nameEn}</p>
              <div className="flex items-center gap-2 mt-2 justify-end">
                <Badge variant="outline" className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">
                  {student.points}
                </Badge>
                <Badge className={cn("border", status.bg, status.text, status.border)}>
                  {status.label}
                </Badge>
                <Badge variant="outline" className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">
                  {student.studentId}
                </Badge>
              </div>
            </div>
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center">
              <span className="text-primary font-bold text-2xl">{student.avatar}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="w-full justify-end bg-muted/50 rounded-none border-b border-border px-4">
            <TabsTrigger value="behavior" className="gap-2 data-[state=active]:bg-background">
              <Star className="w-4 h-4" />
              السلوك والملاحظات
            </TabsTrigger>
            <TabsTrigger value="attendance" className="gap-2 data-[state=active]:bg-background">
              <Clock className="w-4 h-4" />
              سجل الحضور
            </TabsTrigger>
            <TabsTrigger value="academic" className="gap-2 data-[state=active]:bg-background">
              <BookOpen className="w-4 h-4" />
              الأداء الأكاديمي
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2 data-[state=active]:bg-background">
              <User className="w-4 h-4" />
              الملف الشخصي
            </TabsTrigger>
          </TabsList>

          <div className="p-6 overflow-y-auto max-h-[50vh]">
            {/* Profile Tab */}
            <TabsContent value="profile" className="mt-0">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-muted/30 rounded-xl p-5 border border-border">
                  <h3 className="text-right font-bold text-foreground mb-4">الملف الشخصي</h3>
                  <div className="space-y-3 text-right">
                    <div className="flex justify-between">
                      <span className="font-medium">{student.grade || "1"}</span>
                      <span className="text-muted-foreground">الصف</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">{student.section || "A"}</span>
                      <span className="text-muted-foreground">الشعبة</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">{student.studentId}</span>
                      <span className="text-muted-foreground">الرقم</span>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-xl p-5 border border-border">
                  <h3 className="text-right font-bold text-foreground mb-4">Summary</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Attendance</span>
                      <span className="text-primary font-bold">{student.attendance}%</span>
                    </div>
                    <Progress value={student.attendance} className="h-2" />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Attendance Tab */}
            <TabsContent value="attendance" className="mt-0">
              <div className="flex items-center justify-between mb-4">
                <Button variant="outline" size="sm" className="gap-2">
                  <Edit className="w-4 h-4" />
                  تعديل
                </Button>
                <h3 className="text-lg font-bold text-foreground">سجل الحضور</h3>
              </div>

              {loadingAttendance ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : attendanceError ? (
                <div className="text-center py-12 text-destructive">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                  <p>{attendanceError}</p>
                </div>
              ) : attendanceData && attendanceData.records.length > 0 ? (
                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="py-3 px-4 text-right text-sm font-medium text-muted-foreground">الملاحظة</th>
                        <th className="py-3 px-4 text-center text-sm font-medium text-muted-foreground">الحالة</th>
                        <th className="py-3 px-4 text-right text-sm font-medium text-muted-foreground">التاريخ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceData.records.map((record, index) => {
                        const translatedStatus = translateAttendanceStatus(record.status);
                        return (
                          <tr key={index} className="border-t border-border">
                            <td className="py-3 px-4 text-right text-sm text-muted-foreground">
                              {record.notes || "-"}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <Badge className={getAttendanceStatusStyle(translatedStatus)}>
                                {translatedStatus}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-right text-sm">{record.date}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="w-8 h-8 mx-auto mb-2" />
                  <p>لا توجد سجلات حضور</p>
                </div>
              )}
            </TabsContent>

            {/* Academic Performance Tab */}
            <TabsContent value="academic" className="mt-0">
              <h3 className="text-lg font-bold text-foreground text-right mb-4">الأداء الأكاديمي</h3>

              {loadingGrades ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : gradesError ? (
                <div className="text-center py-12 text-destructive">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                  <p>{gradesError}</p>
                </div>
              ) : gradesData && gradesData.subjects.length > 0 ? (
                <div className="space-y-4">
                  <div className="bg-muted/30 rounded-xl p-4 border border-border">
                    <h4 className="font-bold text-foreground text-right mb-4">المواد الدراسية</h4>
                    <div className="space-y-3">
                      {gradesData.subjects.map((subject, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className={cn("font-bold", getGradeColor(subject.percentage))}>{subject.percentage}%</span>
                          <div className="text-right">
                            <p className="font-medium text-foreground">{subject.name}</p>
                            <p className="text-xs text-muted-foreground">الدرجة: {subject.grade}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {gradesData.summary && (
                    <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <p className="text-sm text-muted-foreground">المعدل التراكمي</p>
                          <p className="text-2xl font-bold text-primary">{gradesData.summary.gpa}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">الترتيب</p>
                          <p className="text-2xl font-bold text-primary">{gradesData.summary.rank}/{gradesData.summary.totalStudents}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="w-8 h-8 mx-auto mb-2" />
                  <p>لا توجد درجات متاحة</p>
                </div>
              )}
            </TabsContent>

            {/* Behavior Tab */}
            <TabsContent value="behavior" className="mt-0">
              <div className="flex items-center justify-between mb-4">
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  إضافة سجل جديد
                </Button>
                <h3 className="text-lg font-bold text-foreground">السلوك والملاحظات</h3>
              </div>

              {loadingBehavior ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : behaviorError ? (
                <div className="text-center py-12 text-destructive">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                  <p>{behaviorError}</p>
                </div>
              ) : (
                <>
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-success/10 rounded-xl p-4 border border-success/20 text-center">
                      <TrendingUp className="w-5 h-5 text-success mx-auto mb-2" />
                      <p className="text-2xl font-bold text-success">+{positivePoints}</p>
                      <p className="text-sm text-success">السلوكيات الإيجابية</p>
                    </div>
                    <div className="bg-destructive/10 rounded-xl p-4 border border-destructive/20 text-center">
                      <TrendingDown className="w-5 h-5 text-destructive mx-auto mb-2" />
                      <p className="text-2xl font-bold text-destructive">{negativePoints}</p>
                      <p className="text-sm text-destructive">المخالفات السلوكية</p>
                    </div>
                  </div>

                  {/* Records */}
                  {violations.length === 0 && positiveBehaviors.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Star className="w-8 h-8 mx-auto mb-2" />
                      <p>لا توجد سجلات سلوكية</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Positive Behaviors */}
                      {positiveBehaviors.map((record, index) => (
                        <div
                          key={`positive-${index}`}
                          className="rounded-xl p-4 border bg-success/5 border-success/20"
                        >
                          <div className="flex items-start justify-between">
                            <div className="text-left">
                              <span className="font-bold text-lg text-success">
                                +{record.currentScore || 0}
                              </span>
                              <p className="text-xs text-muted-foreground">{record.date}</p>
                            </div>
                            <div className="text-right flex-1 mr-4">
                              <div className="flex items-center justify-end gap-2">
                                <Star className="w-4 h-4 text-success" />
                                <h4 className="font-bold text-foreground">{record.type}</h4>
                              </div>
                              <p className="text-sm text-muted-foreground">{record.description}</p>
                              <p className="text-xs text-muted-foreground mt-2">بواسطة: {record.awardedBy}</p>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Violations */}
                      {violations.map((record, index) => {
                        const points = severityToPoints(record.severity);
                        const statusLabel = record.status === "pending" ? "مفتوح" : "محلول";
                        return (
                          <div
                            key={`violation-${index}`}
                            className="rounded-xl p-4 border bg-destructive/5 border-destructive/20"
                          >
                            <div className="flex items-start justify-between">
                              <div className="text-left">
                                <span className="font-bold text-lg text-destructive">
                                  {points}
                                </span>
                                <p className="text-xs text-muted-foreground">{record.date}</p>
                              </div>
                              <div className="text-right flex-1 mr-4">
                                <div className="flex items-center justify-end gap-2">
                                  <AlertCircle className="w-4 h-4 text-destructive" />
                                  <h4 className="font-bold text-foreground">{record.type}</h4>
                                </div>
                                <p className="text-sm text-muted-foreground">{record.description}</p>
                                <div className="flex items-center gap-2 justify-end mt-2">
                                  <Badge variant="outline" className={cn(
                                    record.status === "pending" ? "bg-warning/10 text-warning border-warning/30" : "bg-success/10 text-success border-success/30"
                                  )}>
                                    {statusLabel}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">الحالة:</span>
                                </div>
                                {record.action && (
                                  <p className="text-xs text-muted-foreground mt-2">{record.action}</p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">بواسطة: {record.reportedBy}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer */}
        <div className="p-4 border-t border-border flex gap-3 justify-start">
          <Button variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button>
          <Button>حفظ التغييرات</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
