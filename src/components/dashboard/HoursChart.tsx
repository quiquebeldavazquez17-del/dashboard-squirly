import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

type OwnerKey = "squirly" | "quique" | "adri";

interface CategoryFromApi {
  name: string;
  hours: number;
}

interface OwnerFromApi {
  totalHours: number;
  byCategory: CategoryFromApi[];
}

const CATEGORY_COLORS = [
  "hsl(174, 72%, 52%)", // turquesa
  "hsl(262, 60%, 58%)", // morado
  "hsl(38, 92%, 56%)", // amarillo
  "hsl(0, 72%, 56%)", // rojo
  "hsl(210, 60%, 56%)", // azul
  "hsl(320, 65%, 60%)", // rosa
];

interface HoursChartProps {
  owner: OwnerKey;
  onOwnerChange: (owner: OwnerKey) => void;
  clockify?: Record<OwnerKey, OwnerFromApi>;
}

export function HoursChart({ owner, onOwnerChange, clockify }: HoursChartProps) {
  const currentOwner = owner;

  const ownerMetrics = clockify?.[currentOwner];
  const categories = ownerMetrics?.byCategory ?? [];
  const totalHours = ownerMetrics?.totalHours ?? 0;

  const chartData = categories.map((cat, index) => ({
    ...cat,
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
  }));

  return (
    <div className="kpi-card">
      <div className="flex items-center justify-between mb-2">
        <h3 className="section-title">Horas por categoría</h3>
        <select
          value={currentOwner}
          onChange={(e) => {
            const next = e.target.value as OwnerKey;
            onOwnerChange(next);
          }}
          className="bg-muted text-xs text-muted-foreground rounded-md px-2 py-1 border border-border outline-none focus:ring-1 focus:ring-primary cursor-pointer"
        >
          <option value="squirly">Squirly</option>
          <option value="quique">Quique</option>
          <option value="adri">Adri</option>
        </select>
      </div>
      <div className="flex items-center gap-6">
        <div className="relative h-48 w-48 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={3}
                dataKey="hours"
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(220, 18%, 10%)",
                  border: "1px solid hsl(220, 14%, 16%)",
                  borderRadius: "8px",
                  fontSize: 12,
                }}
                labelStyle={{ color: "#ffffff" }}
                itemStyle={{ color: "#ffffff" }}
                formatter={(value: number, _name: string, entry: any) => [
                  `${value}h`,
                  entry?.payload?.name ?? "",
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-semibold text-foreground">
              {totalHours.toFixed(1)}h
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2 flex-1">
          {chartData.map((cat) => (
            <div key={cat.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="text-muted-foreground">{cat.name}</span>
              </div>
              <span className="font-medium text-foreground">{cat.hours}h</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
