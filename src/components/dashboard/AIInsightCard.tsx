import { Lightbulb } from "lucide-react";

interface AIInsightCardProps {
  insight: string;
}

export function AIInsightCard({ insight }: AIInsightCardProps) {
  return (
    <div dir="rtl" className="bg-card rounded-xl p-6 shadow-sm border border-border h-full">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-amber-500" />
        <h3 className="text-lg font-bold text-foreground">تحليل ذكي</h3>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {insight}
      </p>
    </div>
  );
}
