import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { Heart, Smile, ClipboardList, AlertTriangle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const atRiskStudents = [
  { id: "1", name: "زايد ناصر المزروعي", nameEn: "ZAYED NASSER AL MAZROUEI", grade: "Grade 1-A", risk: "Low Attendance", avatar: "ز" },
  { id: "2", name: "منصور غانم العامري", nameEn: "MANSOOR GHANEM AL AMERI", grade: "Grade 1-A", risk: "Low Attendance", avatar: "م" },
  { id: "3", name: "إبراهيم مطر العامري", nameEn: "UNDEFINED MATAR AL AMERI", grade: "Grade 1-A", risk: "Low Attendance", avatar: "!" },
  { id: "4", name: "عبدالله حسن النيادي", nameEn: "ABDULLA HASSAN AL NEYADI", grade: "Grade 1-A", risk: "Low Attendance", avatar: "ع" },
];

const behaviorCases = [
  { name: "زايد ناصر المزروعي", type: "إزعاج الحصة", desc: "مقاطعة الدرس بشكل متكرر", status: "قيد المتابعة", note: "تم التحدث مع الطالب وتحويله للأخصائية", count: 1 },
  { name: "زايد ناصر المزروعي", type: "الغياب أو التأخير", desc: "تأخر عن الطابور الصباحي", status: "مفتوح", count: 1 },
  { name: "منصور غانم العامري", type: "إزعاج الحصة", desc: "مقاطعة الدرس بشكل متكرر", status: "قيد المتابعة", note: "تم التحدث مع الطالب وتحويله للأخصائية", count: 1 },
];

export default function GuidancePage() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <div className="flex items-center justify-end gap-3 mb-2">
          <h1 className="text-2xl font-bold text-foreground">لوحة التوجيه والإرشاد</h1>
          <Heart className="w-8 h-8 text-accent" />
        </div>
        <p className="text-muted-foreground text-right">
          الرعاية السلوكية والأكاديمية - بإشراف: <span className="text-accent">البازية البلوشي</span>
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 justify-end">
        <Button variant="outline" size="sm">تواصل أولياء الأمور</Button>
        <Button variant="outline" size="sm">دليل الطلاب</Button>
        <Button variant="default" size="sm">نظرة عامة</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={AlertTriangle} label="الطلاب تحت الملاحظة الأكاديمية" value="6" trend="needs support 12" trendType="negative" />
        <StatCard icon={ClipboardList} label="الطلاب تحت الملاحظة السلوكية" value="12" trend="Active Cases" trendType="neutral" />
        <StatCard icon={Smile} label="خطط التدخل النشطة" value="6" trend="In Progress" trendType="positive" />
        <StatCard icon={Heart} label="السلوكيات الإيجابية" value="24" trend="120+" trendType="positive" />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* At Risk Students */}
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-4">
            <span className="bg-destructive/10 text-destructive px-3 py-1 rounded-full text-sm font-medium">6</span>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-foreground">معرض للخطر</h3>
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
          </div>
          <div className="space-y-3">
            {atRiskStudents.map((student) => (
              <div key={student.id} className="bg-warning/5 border border-warning/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 bg-warning/20 rounded-full flex items-center justify-center">
                    <span className="text-warning font-bold">{student.avatar}</span>
                  </div>
                  <div className="text-right flex-1 mr-3">
                    <p className="font-bold text-foreground">{student.name}</p>
                    <p className="text-xs text-muted-foreground">{student.nameEn}</p>
                    <div className="flex items-center gap-2 justify-end mt-1">
                      <span className="bg-destructive/20 text-destructive text-xs px-2 py-0.5 rounded">{student.risk}</span>
                      <span className="bg-secondary text-muted-foreground text-xs px-2 py-0.5 rounded">{student.grade}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Behavior Cases */}
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-4">
            <span className="bg-warning/10 text-warning px-3 py-1 rounded-full text-sm font-medium">12</span>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-foreground">المخالفات السلوكية (Cases)</h3>
              <ClipboardList className="w-5 h-5 text-warning" />
            </div>
          </div>
          <div className="space-y-3">
            {behaviorCases.map((caseItem, index) => (
              <div key={index} className="bg-secondary/50 border border-border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <span className="bg-destructive text-destructive-foreground px-2 py-1 rounded text-xs font-medium">{caseItem.count}</span>
                  <div className="text-right flex-1 mr-3">
                    <div className="flex items-center justify-end gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded ${caseItem.status === "مفتوح" ? "bg-warning/20 text-warning" : "bg-destructive/20 text-destructive"}`}>
                        {caseItem.status}
                      </span>
                    </div>
                    <p className="font-bold text-foreground">{caseItem.name}</p>
                    <p className="text-sm text-accent">{caseItem.type}</p>
                    <p className="text-xs text-muted-foreground">{caseItem.desc}</p>
                    {caseItem.note && (
                      <p className="text-xs text-muted-foreground mt-2 bg-secondary p-2 rounded">"{caseItem.note}"</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
