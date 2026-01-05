import { TrendingUp } from "lucide-react";

interface TeacherActivity {
  time: string;
  name: string;
  action: string;
  avatar: string;
  avatarColor?: string;
}

interface TeacherActivityCardProps {
  activities: TeacherActivity[];
}

const avatarColors = [
  "bg-blue-100 text-blue-800",
  "bg-pink-100 text-pink-800",
  "bg-amber-100 text-amber-800",
  "bg-green-100 text-green-800",
];

export function TeacherActivityCard({ activities }: TeacherActivityCardProps) {
  return (
    <div dir="rtl" className="bg-card rounded-xl p-6 shadow-sm border border-border h-full">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-bold text-foreground">سجل نشاط المعلمين</h3>
      </div>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${avatarColors[index % avatarColors.length]}`}>
                <span className="text-sm font-bold">{activity.avatar}</span>
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">{activity.name}</p>
                <p className="text-xs text-muted-foreground">{activity.action}</p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">{activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
