import { ChevronLeft, ChevronRight, Settings, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TimeView, CompareMode, WeekInfo } from "@/lib/types";
import { Link } from "react-router-dom";

interface DashboardHeaderProps {
  timeView: TimeView;
  onTimeViewChange: (view: TimeView) => void;
  week: WeekInfo;
  onWeekChange: (direction: -1 | 1) => void;
  compareMode: CompareMode;
  onCompareModeChange: (mode: CompareMode) => void;
  compareLabel: string;
}

const timeViews: { value: TimeView; label: string }[] = [
  { value: "today", label: "Hoy" },
  { value: "week", label: "Semana" },
  { value: "total", label: "Total" },
];

const compareModes: { value: CompareMode; label: string }[] = [
  { value: "prev_week", label: "Sem. anterior" },
  { value: "prev_month_same_range", label: "Mes anterior" },
  { value: "prev_year_same_range", label: "Año anterior" },
  { value: "custom", label: "Personalizado" },
];

export function DashboardHeader({
  timeView,
  onTimeViewChange,
  week,
  onWeekChange,
  compareMode,
  onCompareModeChange,
  compareLabel,
}: DashboardHeaderProps) {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        {/* Top row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">KPI'S SQUIRLY</h1>
          </div>
          <Link to="/settings">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Settings className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Controls row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Time view tabs */}
          <div className="flex items-center bg-muted rounded-lg p-0.5">
            {timeViews.map((tv) => (
              <button
                key={tv.value}
                onClick={() => onTimeViewChange(tv.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  timeView === tv.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tv.label}
              </button>
            ))}
          </div>

          {/* Week selector */}
          {timeView === "week" && (
            <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
              <button onClick={() => onWeekChange(-1)} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1.5 text-xs font-medium text-foreground min-w-[120px] text-center">
                Semana {week.label}
              </span>
              <button onClick={() => onWeekChange(1)} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Compare mode */}
          <div className="flex items-center gap-2">
            <select
              value={compareMode}
              onChange={(e) => onCompareModeChange(e.target.value as CompareMode)}
              className="bg-muted text-xs text-muted-foreground rounded-lg px-3 py-2 border-0 outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              {compareModes.map((cm) => (
                <option key={cm.value} value={cm.value}>{cm.label}</option>
              ))}
            </select>
          </div>

          {/* Compare label */}
          <span className="text-xs text-muted-foreground hidden md:inline">
            Comparando: {compareLabel}
          </span>
        </div>
      </div>
    </header>
  );
}
