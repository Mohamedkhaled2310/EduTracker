import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  Heart, 
  Settings, 
  FileText, 
  Bot,
  ChevronLeft,
  ChevronRight,
  Calendar,
  BookOpen,
  Award
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: "لوحة القيادة العامة", path: "/" },
  { icon: Users, label: "أداء المعلمين", path: "/teachers" },
  { icon: GraduationCap, label: "شؤون الطلبة", path: "/students" },
  { icon: Calendar, label: "الحضور والغياب", path: "/attendance" },
  { icon: BookOpen, label: "المواد الدراسية", path: "/subjects" },
  { icon: Award, label: "سجل الدرجات", path: "/grades" },
  { icon: Heart, label: "لوحة التوجيه والإرشاد", path: "/guidance" },
  { icon: Settings, label: "العمليات", path: "/operations" },
  { icon: FileText, label: "التقارير الوزارية", path: "/reports" },
  { icon: Bot, label: "المساعد الذكي", path: "/assistant" },
];

export function AppSidebar({ isOpen, onToggle }: AppSidebarProps) {
  const location = useLocation();

  return (
    <aside
      className={cn(
        "bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300 relative",
        isOpen ? "w-64" : "w-20"
      )}
    >
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3 justify-end">
          {isOpen && (
            <span className="text-xl font-bold text-sidebar-foreground">EduTracker</span>
          )}
          <div className="w-10 h-10 bg-sidebar-primary rounded-full flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-sidebar-primary-foreground" />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 justify-end",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent/50 text-sidebar-foreground/80 hover:text-sidebar-foreground"
              )}
            >
              {isOpen && <span className="font-medium">{item.label}</span>}
              <item.icon className="w-5 h-5 flex-shrink-0" />
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 justify-end">
          {isOpen && (
            <div className="text-right">
              <p className="font-semibold text-sm">البازية البلوشي</p>
              <p className="text-xs text-sidebar-foreground/70">مديرة المدرسة</p>
            </div>
          )}
          <div className="w-10 h-10 bg-sidebar-primary rounded-full flex items-center justify-center">
            <span className="text-sidebar-primary-foreground font-bold">ب</span>
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
      >
        {isOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
}
