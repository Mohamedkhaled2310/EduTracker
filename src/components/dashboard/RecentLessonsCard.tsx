import { BookOpen } from "lucide-react";

interface RecentLesson {
  title: string;
  subject: string;
  time: string;
}

interface RecentLessonsCardProps {
  lessons: RecentLesson[];
}

export function RecentLessonsCard({ lessons }: RecentLessonsCardProps) {
  return (
    <div dir="rtl" className="bg-card rounded-xl p-6 shadow-sm border border-border h-full">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-bold text-foreground">الدروس الذكية الحديثة</h3>
      </div>
      <div className="space-y-4">
        {lessons.map((lesson, index) => (
          <div key={index} className="p-3 bg-secondary/30 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-medium text-foreground text-sm">{lesson.title}</h4>
              <span className="text-xs text-muted-foreground">{lesson.time}</span>
            </div>
            <p className="text-xs text-accent">{lesson.subject}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
    