import { useState, useCallback } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { KPICard } from "@/components/dashboard/KPICard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { HoursChart } from "@/components/dashboard/HoursChart";
import { ChurnChart } from "@/components/dashboard/ChurnChart";
import { OperationsChart } from "@/components/dashboard/OperationsChart";
import { MetaAdsChart } from "@/components/dashboard/MetaAdsChart";
import { BreakEvenCard } from "@/components/dashboard/BreakEvenCard";
import { mockKPIs } from "@/lib/mock-data";
import { getCurrentWeek, getWeekByOffset, getCompareRange, formatCompareLabel } from "@/lib/date-utils";
import { TimeView, CompareMode } from "@/lib/types";

const Index = () => {
  const [timeView, setTimeView] = useState<TimeView>("week");
  const [weekOffset, setWeekOffset] = useState(0);
  const [compareMode, setCompareMode] = useState<CompareMode>("prev_week");

  const week = getWeekByOffset(weekOffset);
  const compareRange = getCompareRange({ start: week.start, end: week.end }, compareMode);
  const compareLabel = formatCompareLabel(compareMode, compareRange);

  const handleWeekChange = useCallback((dir: -1 | 1) => {
    setWeekOffset((prev) => prev + dir);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        timeView={timeView}
        onTimeViewChange={setTimeView}
        week={week}
        onWeekChange={handleWeekChange}
        compareMode={compareMode}
        onCompareModeChange={setCompareMode}
        compareLabel={compareLabel}
      />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {mockKPIs.map((kpi, i) => (
            <KPICard key={kpi.label} kpi={kpi} index={i} />
          ))}
        </div>

        {/* Ventas Section */}
        <section>
          <h2 className="section-title">Ventas</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <RevenueChart />
            <MetaAdsChart />
          </div>
        </section>

        {/* Proyecto Section */}
        <section>
          <h2 className="section-title">Proyecto</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <HoursChart />
            <BreakEvenCard />
          </div>
        </section>

        {/* Producto & Operaciones */}
        <section>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div>
              <h2 className="section-title">Producto</h2>
              <ChurnChart />
            </div>
            <div>
              <h2 className="section-title">Operaciones</h2>
              <OperationsChart />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
