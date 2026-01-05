import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Settings } from "lucide-react";

export default function OperationsPage() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <div className="flex items-center justify-end gap-3 mb-2">
          <h1 className="text-2xl font-bold text-foreground">العمليات</h1>
          <Settings className="w-8 h-8 text-primary" />
        </div>
        <p className="text-muted-foreground text-right">إدارة العمليات والإعدادات</p>
      </div>

      <div className="bg-card rounded-xl p-12 shadow-sm border border-border text-center">
        <Settings className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">قسم العمليات</h2>
        <p className="text-muted-foreground">هذا القسم قيد التطوير</p>
      </div>
    </DashboardLayout>
  );
}
