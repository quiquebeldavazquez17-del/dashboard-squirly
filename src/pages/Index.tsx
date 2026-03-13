import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { KPICard } from "@/components/dashboard/KPICard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { HoursChart } from "@/components/dashboard/HoursChart";
import { ChurnChart } from "@/components/dashboard/ChurnChart";
import { OperationsChart } from "@/components/dashboard/OperationsChart";
import { MetaAdsChart } from "@/components/dashboard/MetaAdsChart";
import { mockKPIs } from "@/lib/mock-data";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, format, eachDayOfInterval, addDays, addMonths, addWeeks } from "date-fns";
import { es } from "date-fns/locale";
import {
  getWeekByOffset,
  getCompareRange,
  formatCompareLabel,
} from "@/lib/date-utils";
import { TimeView, CompareMode, DateRange, WeekInfo } from "@/lib/types";

type OwnerKey = "squirly" | "quique" | "adri";

interface CategoryFromApi {
  name: string;
  hours: number;
}

interface OwnerFromApi {
  totalHours: number;
  byCategory: CategoryFromApi[];
}

interface MetricsResponse {
  clockify: Record<OwnerKey, OwnerFromApi>;
}

interface GoogleSheetRow {
  id: string;
  tipo: string;
  nombre: string;
  fecha: string;
  notas: string;
}

interface GoogleSheetsResponse {
  rows: GoogleSheetRow[];
}

interface SupabaseMetricsResponse {
  totalUsers: number;
  dailyActiveUsers: number;
  recurringUsers: number;
  loyalUsers: number;
}

function formatLocalDateTime(date: Date, endOfDay = false) {
  const d = new Date(date);

  if (endOfDay) {
    d.setHours(23, 59, 59, 999);
  } else {
    d.setHours(0, 0, 0, 0);
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

const fetchMetrics = async (start: Date, end: Date): Promise<MetricsResponse> => {
  const startParam = formatLocalDateTime(start, false);
  const endParam = formatLocalDateTime(end, true);

  const url = `/api/metrics?start=${encodeURIComponent(
    startParam
  )}&end=${encodeURIComponent(endParam)}`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Failed to fetch metrics");
  }

  return (await res.json()) as MetricsResponse;
};

const fetchGoogleSheets = async (): Promise<GoogleSheetsResponse> => {
  const res = await fetch("/api/google-sheets");

  if (!res.ok) {
    throw new Error("Failed to fetch Google Sheets");
  }

  return (await res.json()) as GoogleSheetsResponse;
};

const fetchSupabaseMetrics = async (start: Date, end: Date): Promise<SupabaseMetricsResponse> => {
  const startParam = formatLocalDateTime(start, false);
  const endParam = formatLocalDateTime(end, true);

  const url = `/api/supabase-metrics?start=${encodeURIComponent(
    startParam
  )}&end=${encodeURIComponent(endParam)}`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Failed to fetch Supabase metrics");
  }

  return (await res.json()) as SupabaseMetricsResponse;
};

function isDateInRange(dateStr: string, start: Date, end: Date) {
  if (!dateStr) return false;

  const rowDate = new Date(dateStr);
  if (Number.isNaN(rowDate.getTime())) return false;

  const startDate = new Date(start);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(end);
  endDate.setHours(23, 59, 59, 999);

  return rowDate >= startDate && rowDate <= endDate;
}

function countByTipo(rows: GoogleSheetRow[], tipo: string) {
  return rows.filter(
    (row) => row.tipo.trim().toUpperCase() === tipo.trim().toUpperCase()
  ).length;
}

const ActivityCard = ({
  title,
  value,
  compareValue,
}: {
  title: string;
  value: number;
  compareValue: number;
}) => {
  const delta = value - compareValue;
  const positive = delta >= 0;

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-4">
      <div className="text-sm text-muted-foreground">{title}</div>
      <div className="mt-2 text-3xl font-semibold">{value}</div>
      <div className="mt-2 text-sm text-muted-foreground">
        Comparado con periodo anterior:{" "}
        <span className={positive ? "text-emerald-600" : "text-red-600"}>
          {positive ? "+" : ""}
          {delta}
        </span>
        {" · "}antes {compareValue}
      </div>
    </div>
  );
};

const Index = () => {
  const [timeView, setTimeView] = useState<TimeView>("week");
  const [offset, setOffset] = useState(0);
  const [compareMode, setCompareMode] = useState<CompareMode>("prev_week");
  const [customRange, setCustomRange] = useState<DateRange | undefined>(undefined);
  const [owner, setOwner] = useState<OwnerKey>("squirly");

  const now = new Date();

  const currentRange = useMemo(() => {
    if (timeView === "today") {
      const refDate = addDays(now, offset);
      return {
        start: startOfDay(refDate),
        end: endOfDay(refDate),
        label: format(refDate, "eeee, d 'de' MMMM", { locale: es })
      };
    }
    if (timeView === "month") {
      const refDate = addMonths(now, offset);
      return {
        start: startOfMonth(refDate),
        end: endOfMonth(refDate),
        label: format(refDate, "MMMM yyyy", { locale: es })
      };
    }
    // Default to week
    const week = getWeekByOffset(offset, now);
    return {
      start: week.start,
      end: week.end,
      label: `Semana ${week.label}`
    };
  }, [timeView, offset, now]);

  const weekInfo: WeekInfo = useMemo(() => ({
    start: currentRange.start,
    end: currentRange.end,
    label: currentRange.label
  }), [currentRange]);


  const compareRange = getCompareRange(
    {
      start: currentRange.start,
      end: currentRange.end,
    },
    compareMode,
    customRange
  );


  const compareLabel = formatCompareLabel(compareMode, compareRange);

  const { data: metrics } = useQuery<MetricsResponse>({
    queryKey: [
      "metrics",
      currentRange.start.toISOString(),
      currentRange.end.toISOString(),
      owner,
    ],
    queryFn: () => fetchMetrics(currentRange.start, currentRange.end),
    staleTime: 30000,
    refetchInterval: 60000,
  });


  const { data: compareMetrics } = useQuery<MetricsResponse>({
    queryKey: [
      "metrics-compare",
      compareRange.start.toISOString(),
      compareRange.end.toISOString(),
      owner,
    ],
    queryFn: () => fetchMetrics(compareRange.start, compareRange.end),
    staleTime: 30000,
    refetchInterval: 60000,
  });

  const { data: sheetsData } = useQuery<GoogleSheetsResponse>({
    queryKey: ["google-sheets"],
    queryFn: fetchGoogleSheets,
    staleTime: 30000,
    refetchInterval: 60000,
  });

  const { data: supabaseMetrics } = useQuery<SupabaseMetricsResponse>({
    queryKey: [
      "supabase-metrics",
      currentRange.start.toISOString(),
      currentRange.end.toISOString(),
    ],
    queryFn: () => fetchSupabaseMetrics(currentRange.start, currentRange.end),
    staleTime: 30000,
    refetchInterval: 60000,
  });

  const clockify = metrics?.clockify;
  const compareClockify = compareMetrics?.clockify;
  const allRows = sheetsData?.rows ?? [];

  const currentRows = useMemo(() => {
    return allRows.filter((row) =>
      isDateInRange(row.fecha, currentRange.start, currentRange.end)
    );
  }, [allRows, currentRange]);


  const previousRows = useMemo(() => {
    return allRows.filter((row) =>
      isDateInRange(row.fecha, compareRange.start, compareRange.end)
    );
  }, [allRows, compareRange]);

  const chartData = useMemo(() => {
    // Generate daily slots for the current range
    const days = eachDayOfInterval({
      start: currentRange.start,
      end: currentRange.end,
    });

    return days.map((day) => {
      const dateStr = format(day, "yyyy-MM-dd");
      const dayLabel = timeView === "today"
        ? format(day, "HH:mm")
        : format(day, "EEE d", { locale: es });

      // Aggregate activities for this day
      const dayRows = currentRows.filter(r => r.fecha === dateStr);

      return {
        label: dayLabel,
        // Revenue/Profit (0 for now)
        revenue: 0,
        profit: 0,
        // Meta Ads (0 for now)
        spend: 0,
        conversions: 0,
        // Churn (0 for now)
        rate: 0,
        // Operations (from commercial activity)
        cv: dayRows.filter(r => r.tipo === "CUSTOMER VISITS").length,
        lv: dayRows.filter(r => r.tipo === "LEARNING VISITS").length,
        eventos: dayRows.filter(r => r.tipo === "EVENTOS").length,
      };
    });
  }, [currentRange, currentRows, timeView]);

  const activityStats = useMemo(() => {
    return {
      total: currentRows.length,
      totalCompare: previousRows.length,

      customerVisits: countByTipo(currentRows, "CUSTOMER VISITS"),
      customerVisitsCompare: countByTipo(previousRows, "CUSTOMER VISITS"),

      eventos: countByTipo(currentRows, "EVENTOS"),
      eventosCompare: countByTipo(previousRows, "EVENTOS"),

      learningVisits: countByTipo(currentRows, "LEARNING VISITS"),
      learningVisitsCompare: countByTipo(previousRows, "LEARNING VISITS"),
    };
  }, [currentRows, previousRows]);

  const kpis = mockKPIs.map((kpi) => {
    const normalizedLabel = kpi.label.trim().toLowerCase();

    if (normalizedLabel === "usuarios totales" && supabaseMetrics) {
      return {
        ...kpi,
        current_value: supabaseMetrics.totalUsers,
        compare_value: 0,
        delta_abs: supabaseMetrics.totalUsers,
        delta_pct: 100,
      };
    }

    if (normalizedLabel === "usuarios recurrentes" && supabaseMetrics) {
      return {
        ...kpi,
        current_value: supabaseMetrics.recurringUsers,
        compare_value: 0,
        delta_abs: supabaseMetrics.recurringUsers,
        delta_pct: 100,
      };
    }

    if (normalizedLabel !== "horas totales" || !clockify) {
      return kpi;
    }

    const currentOwnerMetrics = clockify[owner];
    const compareOwnerMetrics = compareClockify?.[owner];

    if (!currentOwnerMetrics) return kpi;

    const currentValue = currentOwnerMetrics.totalHours;
    const compareValue = compareOwnerMetrics?.totalHours ?? 0;
    const deltaAbs = currentValue - compareValue;
    const deltaPct = compareValue > 0 ? (deltaAbs / compareValue) * 100 : 0;

    return {
      ...kpi,
      current_value: currentValue,
      compare_value: compareValue,
      delta_abs: deltaAbs,
      delta_pct: deltaPct,
      format: "hours" as const,
      sparkline: [
        Math.max(compareValue * 0.9, 0),
        Math.max(compareValue * 0.95, 0),
        compareValue,
        currentValue,
      ],
    };
  });

  const handleOffsetChange = useCallback((dir: -1 | 1) => {
    setOffset((prev) => prev + dir);
  }, []);

  const handleTimeViewChange = (view: TimeView) => {
    setTimeView(view);
    setOffset(0); // Reset offset when changing view to avoid confusion
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        timeView={timeView}
        onTimeViewChange={handleTimeViewChange}
        week={weekInfo}
        onWeekChange={handleOffsetChange}
        compareMode={compareMode}
        onCompareModeChange={setCompareMode}
        compareLabel={compareLabel}
        customRange={customRange}
        onCustomRangeChange={setCustomRange}
      />


      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {kpis.map((kpi, i) => (
            <KPICard key={kpi.label} kpi={kpi} index={i} />
          ))}
        </div>

        <section>
          <h2 className="section-title">Actividad comercial</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            <ActivityCard
              title="Total actividades"
              value={activityStats.total}
              compareValue={activityStats.totalCompare}
            />
            <ActivityCard
              title="Customer Visits"
              value={activityStats.customerVisits}
              compareValue={activityStats.customerVisitsCompare}
            />
            <ActivityCard
              title="Eventos"
              value={activityStats.eventos}
              compareValue={activityStats.eventosCompare}
            />
            <ActivityCard
              title="Learning Visits"
              value={activityStats.learningVisits}
              compareValue={activityStats.learningVisitsCompare}
            />
          </div>
        </section>

        <section>
          <h2 className="section-title">Ventas</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <RevenueChart data={chartData} />
            <MetaAdsChart data={chartData} />
          </div>
        </section>

        <section>
          <h2 className="section-title">Proyecto</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <HoursChart
              owner={owner}
              onOwnerChange={setOwner}
              clockify={clockify}
            />
            <ChurnChart data={chartData} />
          </div>
        </section>

        <section>
          <h2 className="section-title">Operaciones</h2>
          <OperationsChart data={chartData} />
        </section>
      </main >
    </div >
  );
};

export default Index;