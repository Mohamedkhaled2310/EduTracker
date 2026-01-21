import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { AttendanceChart } from "@/components/dashboard/AttendanceChart";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { AdminAlertsCard } from "@/components/dashboard/AdminAlertsCard";
import { BehaviorLogCard } from "@/components/dashboard/BehaviorLogCard";
import { HighRiskStudentsCard } from "@/components/dashboard/HighRiskStudentsCard";
import { AIInsightCard } from "@/components/dashboard/AIInsightCard";
import { TeacherActivityCard } from "@/components/dashboard/TeacherActivityCard";
import { RecentLessonsCard } from "@/components/dashboard/RecentLessonsCard";
import { Users, AlertTriangle, TrendingUp, BookOpen } from "lucide-react";
import { dashboardApi } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";

const notifications = [
  { id: "1", text: "مطلوب اعتماد خطة الأنشطة اللاصفية من المديرة", isNew: true },
  { id: "2", text: "تنبيه: انخفاض مشاركة أولياء الأمور في الصف الأول", isNew: true },
  { id: "3", text: "تذكير: اجتماع مجلس الأمهات يوم الخميس", isNew: true },
];

const behaviorEntries = [
  { id: "1", date: "2025-05-20", studentName: "زايد ناصر المزروعي", action: "مقاطعة الدرس بشكل متكرر", teacherName: "سارة المزروعي", type: "negative" as const },
  { id: "2", date: "2025-05-18", studentName: "زايد ناصر المزروعي", action: "تأخر عن الطابور الصباحي", teacherName: "مي الحمادي", type: "negative" as const },
  { id: "3", date: "2025-05-22", studentName: "يوسف ناصر الشامسي", action: "مساعدة الزملاء في توزيع الكتب", teacherName: "عائشة القبيسي", type: "positive" as const },
  { id: "4", date: "2025-05-22", studentName: "يوسف علي الحمادي", action: "مساعدة الزملاء في توزيع الكتب", teacherName: "عائشة القبيسي", type: "positive" as const },
  { id: "5", date: "2025-05-22", studentName: "يوسف مبارك الشامسي", action: "مساعدة الزملاء في توزيع الكتب", teacherName: "عائشة القبيسي", type: "positive" as const },
];

const highRiskStudents = [
  { id: "1", name: "زايد ناصر المزروعي", grade: "A-1", riskLevel: "high" as const, note: "تدني التحصيل العام", avatar: "ز" },
  { id: "2", name: "منصور غانم العامري", grade: "A-1", riskLevel: "high" as const, note: "تدني التحصيل العام", avatar: "م" },
  { id: "3", name: "إبراهيم مطر العامري", grade: "A-1", riskLevel: "high" as const, note: "تدني التحصيل العام", avatar: "!" },
  { id: "4", name: "عبدالله حسن النيادي", grade: "A-1", riskLevel: "high" as const, note: "تدني التحصيل العام", avatar: "ع" },
];

const teacherActivities = [
  { time: "08:15", name: "سيف المنصوري", action: "رصد درجات لغة عربية", avatar: "س" },
  { time: "08:45", name: "مهرة النيادي", action: "رفع درس حاسوب جديد", avatar: "م" },
  { time: "09:20", name: "ميثاء العامري", action: "تسجيل مخالفة سلوكية", avatar: "م" },
  { time: "10:00", name: "عائشة القبيسي", action: "تقييم نشاط موسيقي", avatar: "ع" },
];

const recentLessons = [
  { title: "دورة حياة النبات", subject: "علوم - مي القبيسي", time: "منذ ساعة" },
  { title: "الجمع البسيط", subject: "رياضيات - مهرة النيادي", time: "منذ 3 ساعات" },
  { title: "حرف الضاد", subject: "لغة عربية - سارة المزروعي", time: "أمس" },
];

const aiInsight = "تُظهر بيانات المدرسة أداءً أكاديمياً وحضوراً جيداً بشكل عام. بمتوسط حضور يومي 96.5% ومتوسط تحصيل أكاديمي 88.2%. ومع ذلك...";

export default function Index() {
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardApi.getStats(),
  });

  const { data: attendanceData, isLoading: attendanceLoading } = useQuery({
    queryKey: ['dashboard-attendance-chart'],
    queryFn: () => dashboardApi.getAttendanceChart('week'),
  });

  const { data: performanceData, isLoading: performanceLoading } = useQuery({
    queryKey: ['dashboard-performance-chart'],
    queryFn: () => dashboardApi.getPerformanceChart('week'),
  });

  const stats = statsData?.data;
  
  const attendanceChartData = useMemo(() => {
    return attendanceData?.data?.map(item => ({
      grade: item.grade,
      value: item.attendance,
    })) || [];
  }, [attendanceData]);

const performanceChartData = useMemo(() => {
  return performanceData?.data?.map(item => ({
    subject: item.subject,
    value: item.average,
  })) || [];
}, [performanceData]);

// console.log("attendanceChartData",attendanceChartData);
  const years = Array.from({ length: 11 }, (_, i) => 2023 + i);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">

          <div className="text-right">
            <h1 className="text-2xl font-bold text-foreground">مدرسة المستقبل - الحلقة الأولى</h1>
            <p className="text-muted-foreground">
              لوحة القيادة المدرسية - بإشراف: <span className="text-accent">البازية البلوشي</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select className="bg-card border border-border rounded-lg px-4 py-2 text-sm">
              <option>Term 1</option>
              <option>Term 2</option>
            </select>
            <select className="bg-card border border-border rounded-lg px-4 py-2 text-sm">
              {years.map((year) => (
                <option key={year} value={year}>
                  {year} - {year + 1}
                </option>
              ))}
            </select>
          </div>

        </div>

        <div className="flex h-2 rounded-full overflow-hidden">
          <div className="bg-red-500 flex-1" />
          <div className="bg-white flex-1" />
          <div className="bg-black flex-1" />
          <div className="bg-success flex-1" />
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statsLoading ? (
          <>
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </>
        ) : (
          <>
            <StatCard icon={Users} label="نسبة الحضور اليومي" value={`${stats?.attendanceRate || 96.5}%`} trend="1.2%-" trendType="negative" />
            <StatCard icon={TrendingUp} label="مستوى التحصيل العام" value={`${stats?.totalStudents ? '88.2' : '88.2'}%`} trend="3.5%+" trendType="positive" />
            <StatCard icon={AlertTriangle} label="حالات التدخل المبكر" value={stats?.behaviorCases?.toString() || "6"} trend="طلاب بحاجة لدعم" trendType="negative" />
            <StatCard icon={BookOpen} label="الدروس الذكية المفعلة" value={stats?.totalTeachers?.toString() || "84"} trend="8+" trendType="positive" />
          </>
        )}
      </div>

<div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">

  <div className="lg:col-span-9 flex flex-col justify-between h-full">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      <div>
        {performanceLoading ? <Skeleton className="h-40 rounded-xl" /> : <PerformanceChart data={performanceChartData} />}
      </div>
      <div>
        {attendanceLoading ? <Skeleton className="h-40 rounded-xl" /> : <AttendanceChart data={attendanceChartData} />}
      </div>
      <div>
        <HighRiskStudentsCard students={highRiskStudents} />
      </div>
      <div>
        <BehaviorLogCard entries={behaviorEntries} />
      </div>
    </div>
  </div>

  <div className="lg:col-span-3 grid grid-cols-1 gap-4">
    <AdminAlertsCard notifications={notifications} />
    <AIInsightCard insight={aiInsight} />
    <TeacherActivityCard activities={teacherActivities} />
    <RecentLessonsCard lessons={recentLessons} />
  </div>
</div>



    </DashboardLayout>
  );
}
