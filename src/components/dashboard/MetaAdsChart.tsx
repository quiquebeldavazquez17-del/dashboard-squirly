import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { mockMetaAds } from "@/lib/mock-data";

export function MetaAdsChart() {
  const data = mockMetaAds.map((d) => ({
    ...d,
    cac: d.conversions > 0 ? +(d.spend / d.conversions).toFixed(1) : 0,
    convRate: d.clicks > 0 ? +((d.conversions / d.clicks) * 100).toFixed(1) : 0,
  }));

  return (
    <div className="kpi-card">
      <h3 className="section-title">Meta Ads · Gasto vs Conversiones</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(262, 60%, 58%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(262, 60%, 58%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 16%)" />
            <XAxis dataKey="day" tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(220, 18%, 10%)",
                border: "1px solid hsl(220, 14%, 16%)",
                borderRadius: "8px",
                fontSize: 12,
              }}
            />
            <Area type="monotone" dataKey="spend" name="Gasto (€)" stroke="hsl(262, 60%, 58%)" fill="url(#spendGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="conversions" name="Conversiones" stroke="hsl(174, 72%, 52%)" fill="transparent" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
