import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FileText, Download, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const pendingReports = [
  { title: "التقرير الأسبوعي للأداء الأكاديمي", type: "أسبوعي", date: "2025-05-23", author: "البازية المهيري", status: "pending" },
  { title: "حادث بسيط في الفصل", type: "حادث", date: "2025-05-22", author: "هند العامري", status: "approved" },
];

const adminCirculars = [
  { title: "تحديث سياسة الغياب", date: "20-05-2024", isNew: true },
  { title: "الاستعداد لاختبارات الفصل 3", date: "18-05-2024", isNew: false },
];

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="text-right">
            <h1 className="text-2xl font-bold text-foreground">وحدة التقارير الإدارية</h1>
            <p className="text-muted-foreground">
              متابعة الأداء الأسبوعي واعتماد الطلبات الرسمية
            </p>
          </div>
          <Button className="gap-2">
            <Download className="w-4 h-4" />
            تصدير التقرير الشهري
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Summary */}
        <div className="bg-primary text-primary-foreground rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-6 text-right">ملخص الأداء الأسبوعي</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-primary-foreground/80">متوسط الحضور</span>
              <span className="text-3xl font-bold">96.5%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-primary-foreground/80">الدروس المنجزة</span>
              <span className="text-3xl font-bold">84</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-primary-foreground/80">مخالفات سلوكية</span>
              <span className="text-3xl font-bold text-accent">12</span>
            </div>
          </div>
        </div>

        {/* Pending Reports */}
        <div className="lg:col-span-2 bg-card rounded-xl p-6 shadow-sm border border-border">
          <div className="flex items-center justify-end gap-2 mb-6">
            <h3 className="text-lg font-bold text-foreground">التقارير بانتظار الاعتماد</h3>
            <FileText className="w-5 h-5 text-primary" />
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-right py-3 px-4 text-muted-foreground font-medium">الحالة</th>
                  <th className="text-right py-3 px-4 text-muted-foreground font-medium">المُعد</th>
                  <th className="text-right py-3 px-4 text-muted-foreground font-medium">تاريخ الرفع</th>
                  <th className="text-right py-3 px-4 text-muted-foreground font-medium">النوع</th>
                  <th className="text-right py-3 px-4 text-muted-foreground font-medium">عنوان التقرير</th>
                </tr>
              </thead>
              <tbody>
                {pendingReports.map((report, index) => (
                  <tr key={index} className="border-b border-border last:border-0">
                    <td className="py-4 px-4">
                      {report.status === "pending" ? (
                        <div className="flex gap-2">
                          <button className="w-8 h-8 bg-destructive/10 text-destructive rounded-full flex items-center justify-center hover:bg-destructive/20">
                            <X className="w-4 h-4" />
                          </button>
                          <button className="w-8 h-8 bg-success/10 text-success rounded-full flex items-center justify-center hover:bg-success/20">
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="bg-success/10 text-success px-3 py-1 rounded-full text-sm">معتمد</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-foreground">{report.author}</td>
                    <td className="py-4 px-4 text-muted-foreground">{report.date}</td>
                    <td className="py-4 px-4 text-muted-foreground">{report.type}</td>
                    <td className="py-4 px-4 text-foreground font-medium">{report.title}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Admin Circulars */}
      <div className="mt-6 bg-card rounded-xl p-6 shadow-sm border border-border max-w-md mr-auto">
        <h3 className="text-lg font-bold text-foreground mb-4 text-right">التعاميم الإدارية النشطة</h3>
        <div className="space-y-3">
          {adminCirculars.map((circular, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <span className="text-xs text-accent">تاريخ النشر: {circular.date}</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{circular.title}</span>
                <span className={`w-2 h-2 rounded-full ${circular.isNew ? "bg-destructive" : "bg-success"}`} />
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" className="w-full mt-4">
          + إضافة تعميم جديد
        </Button>
      </div>
    </DashboardLayout>
  );
}
