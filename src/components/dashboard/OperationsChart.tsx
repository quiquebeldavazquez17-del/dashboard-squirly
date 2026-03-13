import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface OperationsChartProps {
  data?: any[];
}

export function OperationsChart({ data }: OperationsChartProps) {
  return (
    <div className="kpi-card">
      <h3 className="section-title">Clientes · Visitas y Eventos</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 16%)" />
            <XAxis dataKey="label" tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(220, 18%, 10%)",
                border: "1px solid hsl(220, 14%, 16%)",
                borderRadius: "8px",
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="cv" name="Customer Visits" fill="hsl(174, 72%, 52%)" radius={[3, 3, 0, 0]} />
            <Bar dataKey="lv" name="Learning Visits" fill="hsl(262, 60%, 58%)" radius={[3, 3, 0, 0]} />
            <Bar dataKey="eventos" name="Eventos" fill="hsl(38, 92%, 56%)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
