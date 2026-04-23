import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { KPIValue } from "@/lib/types";
import { motion } from "framer-motion";

interface KPICardProps {
  kpi: KPIValue;
  index?: number;
}

function formatValue(value: number, format?: string, prefix?: string): string {
  const p = prefix || "";
  switch (format) {
    case "currency":
      return `${p}${value.toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    case "percent":
      return `${value.toFixed(1)}%`;
    case "hours":
      return `${value.toFixed(1)}h`;
    default:
      return `${p}${value.toLocaleString("es-ES")}`;
  }
}

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function KPICard({ kpi, index = 0 }: KPICardProps) {
  const isPositive = kpi.delta_pct > 0;
  const isNegative = kpi.delta_pct < 0;
  // For churn and CAC, negative delta is good
  const invertedLabels = ["Churn Rate", "CAC"];
  const isInverted = invertedLabels.includes(kpi.label);
  const isGood = isInverted ? isNegative : isPositive;
  const isBad = isInverted ? isPositive : isNegative;

  const sparkData = kpi.sparkline?.map((v, i) => ({ value: v, index: i })) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="kpi-card flex flex-col justify-between gap-3 min-h-[140px]"
    >
      <div className="flex items-start justify-between">
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="kpi-label cursor-help">{kpi.label}</span>
          </TooltipTrigger>
          {kpi.description && (
            <TooltipContent side="top">
              <p className="max-w-xs">{kpi.description}</p>
            </TooltipContent>
          )}
        </Tooltip>
        <div className={`flex items-center gap-1 text-xs font-semibold ${isGood ? "kpi-delta-positive" : isBad ? "kpi-delta-negative" : "kpi-delta-neutral"}`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : isNegative ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
          <span>{isPositive ? "+" : ""}{kpi.delta_pct.toFixed(1)}%</span>
        </div>
      </div>

      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="kpi-value">{formatValue(kpi.current_value, kpi.format, kpi.prefix)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            vs {formatValue(kpi.compare_value, kpi.format, kpi.prefix)}
          </p>
        </div>

        {sparkData.length > 0 && (
          <div className="w-20 h-10 opacity-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkData}>
                <defs>
                  <linearGradient id={`spark-${kpi.label}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={isGood ? "hsl(150, 60%, 48%)" : isBad ? "hsl(0, 72%, 56%)" : "hsl(215, 12%, 50%)"} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={isGood ? "hsl(150, 60%, 48%)" : isBad ? "hsl(0, 72%, 56%)" : "hsl(215, 12%, 50%)"} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={isGood ? "hsl(150, 60%, 48%)" : isBad ? "hsl(0, 72%, 56%)" : "hsl(215, 12%, 50%)"}
                  strokeWidth={1.5}
                  fill={`url(#spark-${kpi.label})`}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </motion.div>
  );
}
