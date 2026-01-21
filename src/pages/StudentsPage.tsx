import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { StudentCard } from "@/components/dashboard/StudentCard";
import { StudentProfileModal } from "@/components/students/StudentProfileModal";
import { ParentCommunication } from "@/components/students/ParentCommunication";
import { StudentFilters } from "@/components/students/StudentFilters";
import { ClassGroup } from "@/components/students/ClassGroup";
import { Users, Smile, AlertCircle, MessageCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { studentsApi } from "@/lib/api";
import { behaviorApi } from "@/lib/api/behavior";




type TabType = "overview" | "directory" | "communication";

export default function StudentsPage() {




  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Fetch students from API
  const { data: studentsData, isLoading } = useQuery({
    queryKey: ['students', page, searchQuery, selectedGrade, selectedCategory],
    queryFn: () => studentsApi.getAll({
      page,
      limit: 100,
      search: searchQuery,
      status: 'active',
      grade: selectedGrade !== 'all' ? selectedGrade : undefined,
      category: selectedCategory !== 'all' ? selectedCategory : undefined
    }),
  });



  const { data: positiveData } = useQuery({
    queryKey: ["positive-behavior"],
    queryFn: () => behaviorApi.getPositiveBehaviors(),
  });

  const positiveBehaviors =
    positiveData?.data?.map(item => ({
      name: item.studentName,
      type: item.type,
      desc: item.description,
      date: item.date,
      currentScore: `+${item.currentScore}`,
    })) || [];

  const { data: violationsData } = useQuery({
    queryKey: ["violations"],
    queryFn: () =>
      behaviorApi.getViolations({
        limit: 5,
        status: "pending",
      }),
  });

  const violations =
    violationsData?.data?.violations.map(v => ({
      name: v.studentName,
      type: v.type,
      desc: v.description,
      date: v.date,
      reporter: v.reportedBy,
      status: v.status === "pending" ? "مفتوح" : "مغلق",
      currentScore: v.severity === "high" ? "-3" : "-1",
    })) || [];


  const students = studentsData?.data?.students?.map(student => ({
    id: student.id.toString(),
    name: student.name,
    nameEn: student.studentId,
    studentId: student.studentId,
    status: student.attendanceRate < 90 ? "at-risk" as const : student.behaviorScore > 80 ? "excellent" as const : "needs-support" as const,
    points: student.behaviorScore > 80 ? "5+ النقاط" : "3- النقاط",
    attendance: student.attendanceRate,
    rating: Math.round(student.behaviorScore / 25),
    avatar: student.name.charAt(0),
    grade: student.grade,
    section: student.section,
    classTeacher: student.classTeacher,
  })) || [];

  // Group students by class when filters are active
  const groupedStudents = useMemo(() => {
    if (selectedGrade === 'all' && selectedCategory === 'all') {
      return null; // Don't group if no filters
    }

    const groups = new Map<string, typeof students>();
    students.forEach(student => {
      const key = `${student.grade}-${student.section}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(student);
    });

    return Array.from(groups.entries()).map(([key, students]) => ({
      grade: students[0].grade || 'غير محدد',
      section: students[0].section || 'غير محدد',
      classTeacher: students[0].classTeacher || 'غير محدد',
      students
    }));
  }, [students, selectedGrade, selectedCategory]);

  const handleClearFilters = () => {
    setSelectedGrade('all');
    setSelectedCategory('all');
    setPage(1);
  };

  const handleStudentClick = (student: any) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <div className="flex items-center justify-start gap-3 mb-2">
          <h1 className="text-2xl font-bold text-foreground text-right">لوحة شؤون الطلبة</h1>
        </div>
        <p className="text-muted-foreground text-right">
          متابعة السلوك والحضور - بإشراف: <span className="text-accent">البازية البلوشي</span>
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 justify-end">
        <Button
          variant={activeTab === "communication" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("communication")}
        >
          تواصل أولياء الأمور
        </Button>
        <Button
          variant={activeTab === "directory" ? "default" : "secondary"}
          size="sm"
          onClick={() => setActiveTab("directory")}
        >
          دليل الطلاب
        </Button>
        <Button
          variant={activeTab === "overview" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("overview")}
        >
          نظرة عامة
        </Button>
      </div>

      {/* Stats - Always visible */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users} label="إجمالي الطلاب" value={studentsData?.data?.pagination?.total?.toString() || "0"} trend="0.5%-" trendType="negative" />
        <StatCard icon={Smile} label="السلوكيات الإيجابية" value="24" trend="pts 120+" trendType="positive" />
        <StatCard icon={AlertCircle} label="المخالفات السلوكية" value={violationsData?.data?.stats?.pending?.toString() || "0"} trend={`الإجمالي ${violationsData?.data?.stats?.total || 0}`} trendType="negative" />
        <StatCard icon={MessageCircle} label="الرسائل" value="2" />
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Positive Behaviors */}
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <div className="flex items-center justify-between mb-4">
              <span className="bg-success/10 text-success px-3 py-1 rounded-full text-sm font-medium">24</span>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-foreground">السلوكيات الإيجابية</h3>
                <Smile className="w-5 h-5 text-success" />
              </div>
            </div>
            <div className="space-y-3">
              {positiveBehaviors.map((behavior, index) => (
                <div key={index} className="bg-success/5 border border-success/20 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <span className="bg-success text-success-foreground px-2 py-1 rounded text-xs font-medium">1</span>
                    <div className="text-right flex-1 mr-3">
                      <p className="font-bold text-foreground">{behavior.name}</p>
                      <p className="text-sm text-accent">{behavior.type}</p>
                      <p className="text-xs text-muted-foreground">{behavior.desc}</p>
                      <p className="text-xs text-accent mt-1">{behavior.date}</p>
                    </div>
                  </div>
                  <p className="text-success font-bold text-right mt-2">{behavior.currentScore}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Violations */}
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <div className="flex items-center justify-between mb-4">
              <span className="bg-destructive/10 text-destructive px-3 py-1 rounded-full text-sm font-medium">12</span>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-foreground">المخالفات السلوكية</h3>
                <AlertCircle className="w-5 h-5 text-destructive" />
              </div>
            </div>
            <div className="space-y-3">
              {violations.map((violation, index) => (
                <div key={index} className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <span className="bg-destructive text-destructive-foreground px-2 py-1 rounded text-xs font-medium">1</span>
                    <div className="text-right flex-1 mr-3">
                      <div className="flex items-center justify-end gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded ${violation.status === "مفتوح" ? "bg-warning/20 text-warning" : "bg-destructive/20 text-destructive"}`}>
                          {violation.status}
                        </span>
                        <span className="text-destructive font-bold">{violation.currentScore}</span>
                      </div>
                      <p className="font-bold text-foreground">{violation.name}</p>
                      <p className="text-sm text-accent">{violation.type}</p>
                      <p className="text-xs text-muted-foreground">{violation.desc}</p>
                      <p className="text-xs text-accent mt-1">{violation.date} - {violation.reporter}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "communication" && (
        <ParentCommunication />
      )}

      {/* Students Directory - Shows for both overview and directory tabs */}
      {(activeTab === "overview" || activeTab === "directory") && (
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="بحث عن طالب..."
                  className="pr-10 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <StudentFilters
                selectedGrade={selectedGrade}
                selectedCategory={selectedCategory}
                onGradeChange={setSelectedGrade}
                onCategoryChange={setSelectedCategory}
                onClearFilters={handleClearFilters}
              />
            </div>
            <h3 className="text-lg font-bold text-foreground">دليل الطلاب</h3>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-xl" />
              ))}
            </div>
          ) : groupedStudents ? (
            <div className="space-y-4">
              {groupedStudents.map((group, index) => (
                <ClassGroup
                  key={`${group.grade}-${group.section}-${index}`}
                  grade={group.grade}
                  section={group.section}
                  classTeacher={group.classTeacher}
                  students={group.students}
                  onStudentClick={handleStudentClick}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {students.map((student) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  onClick={() => handleStudentClick(student)}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {studentsData?.data?.pagination && studentsData.data.pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                السابق
              </Button>
              <span className="flex items-center px-4 text-sm text-muted-foreground">
                صفحة {page} من {studentsData.data.pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === studentsData.data.pagination.totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                التالي
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Student Profile Modal */}
      <StudentProfileModal
        student={selectedStudent}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </DashboardLayout>
  );
}
