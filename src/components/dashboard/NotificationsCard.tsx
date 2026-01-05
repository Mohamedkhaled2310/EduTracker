import { Bell } from "lucide-react";

interface Notification {
  id: string;
  text: string;
  isNew?: boolean;
}

interface NotificationsCardProps {
  notifications: Notification[];
}

export function NotificationsCard({ notifications }: NotificationsCardProps) {
  return (
    <div dir="rtl" className="bg-card rounded-xl p-6 shadow-sm border border-border">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-bold text-foreground">إشعارات الإدارة</h3>
      </div>
      <div className="space-y-3">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
          >
            {notification.isNew && (
              <span className="w-2 h-2 bg-destructive rounded-full flex-shrink-0" />
            )}
            <p className="text-sm text-foreground text-right">{notification.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
