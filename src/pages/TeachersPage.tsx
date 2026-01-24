import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TeacherCard } from "@/components/dashboard/TeacherCard";
import { TeacherOverviewStats } from "@/components/teachers/TeacherOverviewStats";
import { AddTeacherModal } from "@/components/teachers/AddTeacherModal";
import { TeacherSupportRecordModal } from "@/components/teachers/TeacherSupportRecordModal";
import { ClassManagementModal } from "@/components/teachers/ClassManagementModal";
import { Users, UserPlus, School } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { teachersApi } from "@/lib/api";
import type { TeacherSupportRecord } from "@/lib/api/types";

export default function TeachersPage() {
  const [addTeacherOpen, setAddTeacherOpen] = useState(false);
  const [supportRecordOpen, setSupportRecordOpen] = useState(false);
  const [classManagementOpen, setClassManagementOpen] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
  const [selectedTeacherName, setSelectedTeacherName] = useState("");

  const { data: teachersData, isLoading } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => teachersApi.getAll(),
  });

  const { data: supportRecordsData, isLoading: loadingSupportRecords } = useQuery({
    queryKey: ['teacher-support-records', selectedTeacherId],
    queryFn: () => selectedTeacherId ? teachersApi.getSupportRecords(selectedTeacherId) : Promise.resolve({ success: true, data: [] }),
    enabled: !!selectedTeacherId && supportRecordOpen,
  });

  const teachers = teachersData?.data?.map(teacher => ({
    id: teacher.id.toString(),
    name: teacher.name,
    role: `${teacher.department} - ${teacher.subjects.join('/')}`,
    avatar: teacher.name.charAt(0),
  })) || [];

  const handleOpenSupportRecords = (teacherId: string, teacherName: string) => {
    setSelectedTeacherId(Number(teacherId));
    setSelectedTeacherName(teacherName);
    setSupportRecordOpen(true);
  };

  const handleCloseSupportRecords = () => {
    setSupportRecordOpen(false);
    setSelectedTeacherId(null);
    setSelectedTeacherName("");
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">أداء المعلمين</h1>
            <Users className="w-8 h-8 text-primary" />
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setClassManagementOpen(true)}
              variant="outline"
              className="gap-2"
            >
              <School className="w-5 h-5" />
              إدارة رواد الفصول
            </Button>
            <Button
              onClick={() => setAddTeacherOpen(true)}
              className="gap-2"
            >
              <UserPlus className="w-5 h-5" />
              إضافة معلم
            </Button>
          </div>
        </div>

        {/* Overview Statistics */}
        <TeacherOverviewStats />
      </div>

      <div className="bg-card rounded-xl p-8 shadow-sm border border-border">
        <h2 className="text-xl font-bold text-foreground mb-6 text-right">قائمة المعلمين</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teachers.map((teacher) => (
              <TeacherCard
                key={teacher.id}
                teacher={teacher}
                onOpenSupportRecords={handleOpenSupportRecords}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Teacher Modal */}
      <AddTeacherModal
        open={addTeacherOpen}
        onOpenChange={setAddTeacherOpen}
      />

      {/* Support Records Modal */}
      <TeacherSupportRecordModal
        teacherId={selectedTeacherId}
        teacherName={selectedTeacherName}
        open={supportRecordOpen}
        onOpenChange={handleCloseSupportRecords}
        supportRecords={(supportRecordsData?.data as TeacherSupportRecord[]) || []}
        isLoading={loadingSupportRecords}
      />

      {/* Class Management Modal */}
      <ClassManagementModal
        open={classManagementOpen}
        onOpenChange={setClassManagementOpen}
      />
    </DashboardLayout>
  );
}
