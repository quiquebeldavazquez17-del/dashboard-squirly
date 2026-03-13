import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ChurnChartProps {
  data?: any[];
}

export function ChurnChart({ data }: ChurnChartProps) {
  return (
    <div className="kpi-card">
      <h3 className="section-title">Evolución Churn Rate</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 16%)" />
            <XAxis dataKey="label" tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(220, 18%, 10%)",
                border: "1px solid hsl(220, 14%, 16%)",
                borderRadius: "8px",
                fontSize: 12,
              }}
              formatter={(value: number) => [`${value}%`, "Churn"]}
            />
            <Line type="monotone" dataKey="rate" stroke="hsl(0, 72%, 56%)" strokeWidth={2} dot={{ fill: "hsl(0, 72%, 56%)", r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
