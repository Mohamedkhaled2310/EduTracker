import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { TeacherCard } from "@/components/dashboard/TeacherCard";
import { Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { teachersApi } from "@/lib/api";

export default function TeachersPage() {
  const { data: teachersData, isLoading } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => teachersApi.getAll(),
  });

  const teachers = teachersData?.data?.map(teacher => ({
    id: teacher.id.toString(),
    name: teacher.name,
    role: `${teacher.department} - ${teacher.subjects.join('/')}`,
    avatar: teacher.name.charAt(0),
  })) || [];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <div className="flex items-center justify-end gap-3 mb-2">
          <h1 className="text-2xl font-bold text-foreground">أداء المعلمين</h1>
          <Users className="w-8 h-8 text-primary" />
        </div>
      </div>

      <div className="bg-card rounded-xl p-8 shadow-sm border border-border">
        <h2 className="text-xl font-bold text-foreground mb-6 text-right">أداء المعلمين</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teachers.map((teacher) => (
              <TeacherCard key={teacher.id} teacher={teacher} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
