import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: string;
  trendType?: "positive" | "negative" | "neutral";
  className?: string;
}

export function StatCard({ icon: Icon, label, value, trend, trendType = "neutral", className }: StatCardProps) {
  return (
    <div dir="rtl" className={cn("bg-card rounded-xl p-6 shadow-sm border border-border animate-fade-in relative", className)}>
      {trend && (
        <span
          className={cn(
            "absolute top-4 left-4 text-xs font-medium px-2 py-1 rounded-full",
            trendType === "positive" && "bg-success/10 text-success",
            trendType === "negative" && "bg-destructive/10 text-destructive",
            trendType === "neutral" && "bg-accent/10 text-accent"
          )}
        >
          {trend}
        </span>
      )}
      <div className="flex flex-col items-start text-left">
        <div className="w-14 h-14 bg-secondary rounded-xl flex items-center justify-center mb-4">
          <Icon className="w-7 h-7 text-primary" />
        </div>
        <p className="text-muted-foreground text-sm mb-2">{label}</p>
        <p className="text-4xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}
