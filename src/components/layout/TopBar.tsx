import { Globe, ChevronDown,LogOut  } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authApi } from "@/lib/api/auth";
import { useNavigate } from "react-router-dom";

export function TopBar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authApi.logout();
      localStorage.clear();
      navigate("/login");
    } catch (error) {
      console.error("Logout error", error);
      navigate("/login");
    }
  };
  return (
    <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-end gap-3">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" className="gap-2">
          <Globe className="w-4 h-4" />
          English
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-muted-foreground text-sm">
          | تم تسجيل الدخول باسم:
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 font-semibold">
              البازية البلوشي
              <span className="text-muted-foreground">(مديرة المدرسة)</span>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              className="gap-2 text-red-600 cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              تسجيل الخروج
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
