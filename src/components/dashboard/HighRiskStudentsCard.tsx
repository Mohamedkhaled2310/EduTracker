import { AlertTriangle, ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface HighRiskStudent {
  id: string;
  name: string;
  grade: string;
  riskLevel: "high" | "medium";
  note: string;
  avatar: string;
}

interface HighRiskStudentsCardProps {
  students: HighRiskStudent[];
}

export function HighRiskStudentsCard({ students }: HighRiskStudentsCardProps) {
  return (
    <div dir="rtl" className="bg-card rounded-xl p-6 shadow-sm border border-border h-full">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-red-500" />
        <h3 className="text-lg font-bold text-foreground">الطلاب المحتاجون للمتابعة</h3>
      </div>
      <div className="space-y-3 max-h-[350px] overflow-y-auto">
        {students.map((student) => (
          <div
            key={student.id}
            className="p-3 bg-secondary/30 rounded-lg flex items-center gap-3"
          >
            <button className="text-muted-foreground hover:text-foreground">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm text-foreground">
                  {student.name}
                </span>
                <Badge variant="destructive" className="text-xs">
                  High Risk
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {student.grade}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                الملاحظة: {student.note}
              </p>
            </div>
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-amber-800 font-bold text-sm">{student.avatar}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
