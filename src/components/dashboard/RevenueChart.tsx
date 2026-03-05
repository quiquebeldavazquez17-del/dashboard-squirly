import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { mockRevenueWeekly } from "@/lib/mock-data";

export function RevenueChart() {
  return (
    <div className="kpi-card">
      <h3 className="section-title">Facturación Semanal</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={mockRevenueWeekly} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 16%)" />
            <XAxis dataKey="day" tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `€${v}`} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(220, 18%, 10%)",
                border: "1px solid hsl(220, 14%, 16%)",
                borderRadius: "8px",
                fontSize: 12,
              }}
              formatter={(value: number) => [`€${value.toLocaleString()}`, ""]}
            />
            <Legend wrapperStyle={{ fontSize: 11, color: "hsl(215, 12%, 50%)" }} />
            <Bar dataKey="current" name="Esta semana" fill="hsl(174, 72%, 52%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="previous" name="Semana anterior" fill="hsl(220, 14%, 22%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
