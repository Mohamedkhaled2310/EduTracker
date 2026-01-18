import { cn } from "@/lib/utils";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Teacher {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

interface TeacherCardProps {
  teacher: Teacher;
  onOpenSupportRecords?: (teacherId: string, teacherName: string) => void;
}

export function TeacherCard({ teacher, onOpenSupportRecords }: TeacherCardProps) {
  return (
    <div dir="rtl" className="bg-card rounded-xl p-4 border border-border hover:shadow-md transition-all hover:border-primary/30">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-lg">{teacher.avatar}</span>
        </div>
        <div className="text-right flex-1">
          <h4 className="font-bold text-foreground">{teacher.name}</h4>
          <p className="text-sm text-accent">{teacher.role}</p>
        </div>
        {onOpenSupportRecords && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenSupportRecords(teacher.id, teacher.name)}
            className="gap-2"
            title="سجلات الدعم"
          >
            <FileText className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
