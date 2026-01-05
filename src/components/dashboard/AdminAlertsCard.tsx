import { Bell } from "lucide-react";

interface Notification {
  id: string;
  text: string;
  isNew?: boolean;
}

interface AdminAlertsCardProps {
  notifications: Notification[];
}

export function AdminAlertsCard({ notifications }: AdminAlertsCardProps) {
  return (
    <div dir="rtl" className="bg-card rounded-xl p-6 shadow-sm border border-border h-full">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-bold text-foreground">إشعارات الإدارة</h3>
      </div>
      <div className="space-y-3">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="p-3 bg-secondary/30 rounded-lg flex items-start gap-2"
          >
            {notification.isNew && (
              <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
            )}
            <p className="text-sm text-foreground leading-relaxed">
              {notification.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
