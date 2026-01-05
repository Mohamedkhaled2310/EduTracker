import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface Student {
  id: string;
  name: string;
  nameEn: string;
  studentId: string;
  status: "excellent" | "needs-support" | "at-risk";
  points: string;
  attendance: number;
  rating: number;
  avatar: string;
  grade?: string;
  section?: string;
}

interface StudentCardProps {
  student: Student;
  onClick?: () => void;
}

export function StudentCard({ student, onClick }: StudentCardProps) {
  const statusConfig = {
    "excellent": { label: "متفوق / منتظم", bg: "bg-success/10", text: "text-success" },
    "needs-support": { label: "يحتاج لدعم", bg: "bg-warning/10", text: "text-warning" },
    "at-risk": { label: "معرض للخطر", bg: "bg-destructive/10", text: "text-destructive" },
  };

  const status = statusConfig[student.status];

  return (
    <div 
      dir="rtl"
      className="bg-card rounded-xl p-4 shadow-sm border border-border hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
          <span className="text-primary font-bold text-lg">{student.avatar}</span>
        </div>
        <div className={cn("px-2 py-1 rounded-full text-xs font-medium", status.bg, status.text)}>
          {status.label}
        </div>
      </div>
      
      <div className="text-right">
        <h4 className="font-bold text-foreground mb-1">{student.name}</h4>
        <p className="text-xs text-muted-foreground mb-1">{student.nameEn}</p>
        <p className="text-xs text-accent mb-3">{student.studentId}</p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <span className="text-sm text-muted-foreground">{student.attendance}%</span>
        <div className="flex items-center gap-1 flex-row-reverse">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={cn(
                "w-3 h-3",
                i < student.rating ? "fill-accent text-accent" : "text-muted"
              )}
            />
          ))}
        </div>
      </div>
      
      <p className={cn("text-xs mt-2 text-right", status.text)}>
        {student.points}
      </p>
    </div>
  );
}
