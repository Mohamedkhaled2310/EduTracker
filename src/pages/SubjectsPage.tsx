import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BookOpen, Plus, Pencil, Trash2, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { subjectsApi } from "@/lib/api";
import type { Subject, CreateSubjectRequest } from "@/lib/api/types";

export default function SubjectsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGrade, setFilterGrade] = useState("");
  
  const [formData, setFormData] = useState<CreateSubjectRequest>({
    name: "",
    code: "",
    gradeLevel: "",
    passingGrade: 50,
    status: "active",
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch subjects
  const { data: subjectsData, isLoading } = useQuery({
    queryKey: ['subjects', filterGrade],
    queryFn: () => subjectsApi.getAll({ gradeLevel: filterGrade || undefined }),
  });

  // Create subject mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateSubjectRequest) => subjectsApi.create(data),
    onSuccess: () => {
      toast({ title: "تم إضافة المادة بنجاح" });
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
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

  // Update subject mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateSubjectRequest> }) => 
      subjectsApi.update(id, data),
    onSuccess: () => {
      toast({ title: "تم تحديث المادة بنجاح" });
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
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

  // Delete subject mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => subjectsApi.delete(id),
    onSuccess: () => {
      toast({ title: "تم حذف المادة بنجاح" });
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "لا يمكن حذف المادة",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      gradeLevel: "",
      passingGrade: 50,
      status: "active",
    });
    setEditingSubject(null);
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      code: subject.code,
      gradeLevel: subject.gradeLevel,
      passingGrade: subject.passingGrade,
      status: subject.status,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.code || !formData.gradeLevel) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    if (editingSubject) {
      updateMutation.mutate({ id: editingSubject.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const subjects = subjectsData?.data?.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.code.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                إضافة مادة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-right">
                  {editingSubject ? "تعديل المادة" : "إضافة مادة جديدة"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>اسم المادة *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="الرياضيات"
                  />
                </div>
                <div className="space-y-2">
                  <Label>رمز المادة *</Label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                    placeholder="MATH101"
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label>المرحلة الدراسية *</Label>
                  <Select
                    value={formData.gradeLevel}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, gradeLevel: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المرحلة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="First Grade">الصف الأول</SelectItem>
                      <SelectItem value="Second Grade">الصف الثاني</SelectItem>
                      <SelectItem value="Third Grade">الصف الثالث</SelectItem>
                      <SelectItem value="Fourth Grade">الصف الرابع</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>درجة النجاح</Label>
                  <Input
                    type="number"
                    value={formData.passingGrade}
                    onChange={(e) => setFormData(prev => ({ ...prev, passingGrade: parseInt(e.target.value) }))}
                    min={0}
                    max={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label>الحالة</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: 'active' | 'inactive') => setFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">نشط</SelectItem>
                      <SelectItem value="inactive">غير نشط</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? "جاري الحفظ..." : "حفظ"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          <div className="text-right">
            <h1 className="text-2xl font-bold text-foreground">عالم المعرفة الذكي</h1>
            <p className="text-muted-foreground">إضافة وتعديل المواد الدراسية</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl p-6 shadow-sm border border-border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select value={filterGrade} onValueChange={setFilterGrade}>
            <SelectTrigger>
              <SelectValue placeholder="تصفية حسب المرحلة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المراحل</SelectItem>
              <SelectItem value="First Grade">الصف الأول</SelectItem>
              <SelectItem value="Second Grade">الصف الثاني</SelectItem>
              <SelectItem value="Third Grade">الصف الثالث</SelectItem>
              <SelectItem value="Fourth Grade">الصف الرابع</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="بحث عن مادة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>

        </div>
      </div>

      {/* Subjects Grid */}
      <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
        <div className="flex items-center justify-end gap-2 mb-6">
          <h3 className="text-lg font-bold text-foreground">قائمة المواد</h3>
          <BookOpen className="w-5 h-5 text-primary" />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : subjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((subject) => (
              <div 
                key={subject.id} 
                className="bg-secondary/30 border border-border rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => deleteMutation.mutate(subject.id)}
                      className="w-8 h-8 bg-destructive/10 text-destructive rounded-lg flex items-center justify-center hover:bg-destructive/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(subject)}
                      className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center hover:bg-primary/20 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-right">
                    <h4 className="font-bold text-foreground">{subject.name}</h4>
                    <p className="text-sm text-muted-foreground">{subject.code}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    subject.status === 'active' 
                      ? 'bg-success/10 text-success' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {subject.status === 'active' ? 'نشط' : 'غير نشط'}
                  </span>
                  <div className="text-right">
                    <p className="text-muted-foreground">{subject.gradeLevel}</p>
                    <p className="text-accent">درجة النجاح: {subject.passingGrade}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">لا توجد مواد دراسية</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
