import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ClipboardList, Plus, Search, Target, TrendingUp, CheckCircle2, AlertCircle, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OperationalGoal {
  id: string;
  title: string;
  pillar: string;
  targetPercentage: number;
  currentPercentage: number;
  owner: string;
  deadline: string;
  status: "completed" | "in_progress" | "delayed";
}

const initialGoals: OperationalGoal[] = [
  {
    id: "1",
    title: "رفع نسبة التحصيل الدراسي في المواد الأساسية بمعدل 5%",
    pillar: "التميز الأكاديمي",
    targetPercentage: 100,
    currentPercentage: 92,
    owner: "أ. فاطمة الشامسي",
    deadline: "2026-06-15",
    status: "in_progress"
  },
  {
    id: "2",
    title: "تطبيق نظام الدروس الذكية والتحول الرقمي بنسبة 100%",
    pillar: "التحول الرقمي الذكي",
    targetPercentage: 100,
    currentPercentage: 100,
    owner: "أ. محمد الكعبي",
    deadline: "2026-05-30",
    status: "completed"
  },
  {
    id: "3",
    title: "تنفيذ 10 ورش عمل للتطوير المهني والارتقاء بأداء المعلمين",
    pillar: "التطوير المهني",
    targetPercentage: 10,
    currentPercentage: 8,
    owner: "أ. هند العامري",
    deadline: "2026-06-20",
    status: "in_progress"
  },
  {
    id: "4",
    title: "تعزيز شراكات أولياء الأمور وتفعيل مجالس الأمهات بنسبة 90%",
    pillar: "الشراكة المجتمعية",
    targetPercentage: 100,
    currentPercentage: 75,
    owner: "أ. اليازية المهيري",
    deadline: "2026-06-10",
    status: "in_progress"
  },
  {
    id: "5",
    title: "تطوير بيئة التعلم المدرسي وتحديث المختبرات العلمية",
    pillar: "البيئة المدرسية",
    targetPercentage: 100,
    currentPercentage: 40,
    owner: "أ. سعيد الكتبي",
    deadline: "2026-07-01",
    status: "delayed"
  }
];

export default function OperationalPlanPage() {
  const [goals, setGoals] = useState<OperationalGoal[]>(initialGoals);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPillar, setFilterPillar] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    pillar: "التميز الأكاديمي",
    currentPercentage: 0,
    targetPercentage: 100,
    owner: "",
    deadline: "",
    status: "in_progress" as "completed" | "in_progress" | "delayed"
  });

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.owner || !formData.deadline) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    const newGoal: OperationalGoal = {
      id: Date.now().toString(),
      title: formData.title,
      pillar: formData.pillar,
      currentPercentage: Number(formData.currentPercentage),
      targetPercentage: Number(formData.targetPercentage),
      owner: formData.owner,
      deadline: formData.deadline,
      status: formData.currentPercentage >= formData.targetPercentage ? "completed" : formData.status
    };

    setGoals(prev => [newGoal, ...prev]);
    setIsDialogOpen(false);
    setFormData({
      title: "",
      pillar: "التميز الأكاديمي",
      currentPercentage: 0,
      targetPercentage: 100,
      owner: "",
      deadline: "",
      status: "in_progress"
    });

    toast({
      title: "تم إضافة الهدف بنجاح",
      description: "تم إدراج الهدف التشغيلي الجديد في الخطة التشغيلية",
    });
  };

  const filteredGoals = goals.filter(goal => {
    const matchesSearch = goal.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          goal.owner.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPillar = filterPillar === "all" || goal.pillar === filterPillar;
    const matchesStatus = filterStatus === "all" || goal.status === filterStatus;
    return matchesSearch && matchesPillar && matchesStatus;
  });

  // Calculate metrics
  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.status === "completed").length;
  const delayedGoals = goals.filter(g => g.status === "delayed").length;
  const avgProgress = totalGoals > 0 ? Math.round(goals.reduce((acc, g) => acc + (g.currentPercentage / g.targetPercentage * 100), 0) / totalGoals) : 0;

  return (
    <DashboardLayout>
      <div className="mb-8" dir="rtl">
        <div className="flex flex-col gap-3 mb-6">
          <h1 className="text-2xl font-bold text-foreground">الخطة التشغيلية السنوية</h1>
          <p className="text-muted-foreground">متابعة الأهداف الإستراتيجية والمؤشرات التشغيلية لمدرسة المستقبل</p>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  إضافة هدف تشغيلي
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md" dir="rtl">
                <DialogHeader>
                  <DialogTitle className="text-right">إضافة هدف تشغيلي جديد</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddGoal} className="space-y-4 text-right">
                  <div className="space-y-2">
                    <Label>عنوان الهدف التشغيلي *</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="مثال: رفع نسبة جودة التعلم الرقمي..."
                      className="text-right"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>الركيزة الإستراتيجية *</Label>
                    <Select
                      value={formData.pillar}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, pillar: value }))}
                      dir="rtl"
                    >
                      <SelectTrigger className="text-right">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="التميز الأكاديمي">التميز الأكاديمي</SelectItem>
                        <SelectItem value="التحول الرقمي الذكي">التحول الرقمي الذكي</SelectItem>
                        <SelectItem value="التطوير المهني">التطوير المهني</SelectItem>
                        <SelectItem value="الشراكة المجتمعية">الشراكة المجتمعية</SelectItem>
                        <SelectItem value="البيئة Mدرسية">البيئة المدرسية</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>المستهدف الرقمي</Label>
                      <Input
                        type="number"
                        value={formData.targetPercentage}
                        onChange={(e) => setFormData(prev => ({ ...prev, targetPercentage: parseInt(e.target.value) }))}
                        className="text-right"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>الإنجاز الحالي</Label>
                      <Input
                        type="number"
                        value={formData.currentPercentage}
                        onChange={(e) => setFormData(prev => ({ ...prev, currentPercentage: parseInt(e.target.value) }))}
                        className="text-right"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>المسؤول عن التنفيذ *</Label>
                    <Input
                      value={formData.owner}
                      onChange={(e) => setFormData(prev => ({ ...prev, owner: e.target.value }))}
                      placeholder="مثال: أ. هند العامري"
                      className="text-right"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>الحالة</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: "completed" | "in_progress" | "delayed") => setFormData(prev => ({ ...prev, status: value }))}
                        dir="rtl"
                      >
                        <SelectTrigger className="text-right">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                          <SelectItem value="completed">مكتمل</SelectItem>
                          <SelectItem value="delayed">متأخر</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>تاريخ الانجاز المستهدف</Label>
                      <Input
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                        className="text-right"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full mt-4">
                    حفظ الهدف التشغيلي
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6" dir="rtl">
        <StatCard icon={Target} label="إجمالي الأهداف التشغيلية" value={totalGoals.toString()} />
        <StatCard icon={TrendingUp} label="متوسط نسبة الإنجاز" value={`${avgProgress}%`} trendType="positive" />
        <StatCard icon={CheckCircle2} label="أهداف مكتملة بالكامل" value={completedGoals.toString()} trendType="positive" />
        <StatCard icon={AlertCircle} label="أهداف تشغيلية متأخرة" value={delayedGoals.toString()} trendType={delayedGoals > 0 ? "negative" : "neutral"} />
      </div>

      {/* Filters & Direct Search */}
      <div className="bg-card rounded-xl p-6 shadow-sm border border-border mb-6" dir="rtl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-right">
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="بحث عن هدف أو مسؤول..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 text-right"
            />
          </div>

          <Select value={filterPillar} onValueChange={setFilterPillar} dir="rtl">
            <SelectTrigger className="text-right">
              <SelectValue placeholder="تصفية حسب الركيزة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الركائز الإستراتيجية</SelectItem>
              <SelectItem value="التميز الأكاديمي">التميز الأكاديمي</SelectItem>
              <SelectItem value="التحول الرقمي الذكي">التحول الرقمي الذكي</SelectItem>
              <SelectItem value="التطوير المهني">التطوير المهني</SelectItem>
              <SelectItem value="الشراكة المجتمعية">الشراكة المجتمعية</SelectItem>
              <SelectItem value="البيئة المدرسية">البيئة المدرسية</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus} dir="rtl">
            <SelectTrigger className="text-right">
              <SelectValue placeholder="تصفية حسب الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
              <SelectItem value="completed">مكتمل</SelectItem>
              <SelectItem value="delayed">متأخر</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Goals Timeline and Grid */}
      <div className="bg-card rounded-xl p-6 shadow-sm border border-border" dir="rtl">
        <div className="flex items-center justify-end gap-2 mb-6">
          <ClipboardList className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground">خريطة الأهداف والمؤشرات التشغيلية</h3>
        </div>

        {filteredGoals.length > 0 ? (
          <div className="space-y-6">
            {filteredGoals.map((goal) => {
              const progressPercentage = Math.min(100, Math.round((goal.currentPercentage / goal.targetPercentage) * 100));
              return (
                <div key={goal.id} className="p-5 border border-border rounded-xl bg-secondary/10 hover:bg-secondary/20 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 text-right">
                    <div className="flex-1">
                      <div className="flex flex-row-reverse items-center gap-2 flex-wrap mb-1 justify-end">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          goal.status === "completed" ? "bg-success/15 text-success" : 
                          goal.status === "delayed" ? "bg-destructive/15 text-destructive" : 
                          "bg-warning/15 text-warning"
                        }`}>
                          {goal.status === "completed" ? "مكتمل" : 
                           goal.status === "delayed" ? "متأخر" : "قيد التنفيذ"}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {goal.pillar}
                        </span>
                        <h4 className="font-bold text-foreground text-right text-base">{goal.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground text-right">
                        المسؤول عن المتابعة والتنفيذ: <span className="text-foreground font-medium">{goal.owner}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-4 justify-end shrink-0">
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground block">تاريخ الإنجاز</span>
                        <span className="text-sm font-semibold flex items-center gap-1 justify-end">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                          {goal.deadline}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Glassmorphic progress bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span>{progressPercentage}% مكتمل</span>
                      <span>المستهدف: {goal.targetPercentage} | المنجز: {goal.currentPercentage}</span>
                    </div>
                    <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          goal.status === "completed" ? "bg-success" : 
                          goal.status === "delayed" ? "bg-destructive" : 
                          "bg-primary"
                        }`}
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            لا توجد أهداف تشغيلية تطابق خيارات التصفية الحالية.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
