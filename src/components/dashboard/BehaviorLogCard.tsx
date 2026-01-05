import { Star } from "lucide-react";

interface BehaviorEntry {
  id: string;
  date: string;
  studentName: string;
  action: string;
  teacherName: string;
  type: "positive" | "negative";
}

interface BehaviorLogCardProps {
  entries: BehaviorEntry[];
}

export function BehaviorLogCard({ entries }: BehaviorLogCardProps) {
  return (
    <div dir="rtl" className="bg-card rounded-xl p-6 shadow-sm border border-border h-full">
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-5 h-5 text-amber-500" />
        <h3 className="text-lg font-bold text-foreground">سجل السلوك اليومي</h3>
      </div>
      <div className="space-y-3 max-h-[300px] overflow-y-auto">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="p-3 bg-secondary/30 rounded-lg flex items-start justify-between gap-3"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm text-foreground">
                  {entry.studentName}
                </span>
                {entry.type === "positive" ? (
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                ) : (
                  <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full" />
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{entry.action}</p>
              <p className="text-xs text-accent mt-1">{entry.teacherName}</p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {entry.date}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
