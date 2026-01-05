import { cn } from "@/lib/utils";

interface Teacher {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

interface TeacherCardProps {
  teacher: Teacher;
}

export function TeacherCard({ teacher }: TeacherCardProps) {
  return (
    <div dir="rtl" className="bg-card rounded-xl p-4 border border-border hover:shadow-md transition-all hover:border-primary/30">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-lg">{teacher.avatar}</span>
        </div>
        <div className="text-right">
          <h4 className="font-bold text-foreground">{teacher.name}</h4>
          <p className="text-sm text-accent">{teacher.role}</p>
        </div>
      </div>
    </div>
  );
}
