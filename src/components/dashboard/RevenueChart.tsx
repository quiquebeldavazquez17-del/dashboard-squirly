import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface RevenueChartProps {
  data?: any[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="kpi-card">
      <h3 className="section-title">Evolución Facturación vs Beneficio</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 16%)" />
            <XAxis dataKey="label" tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
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
            <Bar dataKey="revenue" name="Facturación" fill="hsl(174, 72%, 52%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="profit" name="Beneficio" fill="hsl(262, 60%, 58%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
