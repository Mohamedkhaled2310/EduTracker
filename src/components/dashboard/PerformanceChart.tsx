import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface PerformanceChartProps {
  data: Array<{
    subject: string;
    value: number;
  }>;
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  return (
    <div dir="rtl" className="bg-card rounded-xl p-6 shadow-sm border border-border">
      <h3 className="text-lg font-bold text-foreground mb-6">الأداء حسب المواد</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            type="number" 
            domain={[0, 100]}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            axisLine={{ stroke: "hsl(var(--border))" }}
          />
          <YAxis 
            type="category" 
            dataKey="subject"
            width={100}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            orientation="right"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              direction: "rtl",
            }}
          />
          <Bar dataKey="value" radius={[4, 0, 0, 4]}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill="hsl(var(--chart-2))" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
